import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as resourcegroups from 'aws-cdk-lib/aws-resourcegroups';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as fs from 'fs';
import * as path from 'path';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';

// Extend StackProps to include applicationName
interface AppStackProps extends cdk.StackProps {
    applicationName: string;
}

export class AppStack extends cdk.Stack {
    public readonly apiUrl: string;

    constructor(scope: Construct, id: string, props: AppStackProps) {
        super(scope, id, props);

        const { applicationName } = props;

        // Create CloudWatch Logs role for API Gateway
        const apiGatewayCloudWatchRole = new iam.Role(this, 'ApiGatewayCloudWatchRole', {
            assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonAPIGatewayPushToCloudWatchLogs')
            ]
        });

        // Set the CloudWatch role in API Gateway account settings
        new apigateway.CfnAccount(this, 'ApiGatewayAccount', {
            cloudWatchRoleArn: apiGatewayCloudWatchRole.roleArn
        });

        // Create a resource group for the application
        const resourceGroup = new resourcegroups.CfnGroup(this, 'ResourceGroup', {
            name: `Project-${applicationName}`,
            description: `website`,
            resourceQuery: {
                type: 'TAG_FILTERS_1_0',
                query: {
                    resourceTypeFilters: ['AWS::AllSupported'],
                    tagFilters: [
                        {
                            key: 'Project',
                            values: [applicationName]
                        }
                    ]
                }
            }
        });

        // Create Lambda function that returns current date and time
        const apiFunction = new lambda.Function(this, 'ApiFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'api-handler.handler',
            code: lambda.Code.fromAsset('lib/lambda'),
            timeout: cdk.Duration.seconds(10),
            memorySize: 128,
        });

        // Add Project tag to the Lambda function
        cdk.Tags.of(apiFunction).add('Project', applicationName);

        // Create REST API
        const api = new apigateway.RestApi(this, 'Api', {
            restApiName: `${applicationName}-api`,
            description: 'API for the application',
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS
            },
            deployOptions: {
                stageName: 'prod',
                metricsEnabled: true,
                loggingLevel: apigateway.MethodLoggingLevel.INFO,
                dataTraceEnabled: true,
            }
        });

        // Add Project tag to the API Gateway
        cdk.Tags.of(api).add('Project', applicationName);

        // Add a method to handle requests to the root path
        api.root.addMethod('ANY', new apigateway.LambdaIntegration(apiFunction, {
            proxy: true
        }));

        // Add a catch-all proxy resource that routes all other requests to the Lambda function
        const proxyResource = api.root.addProxy({
            defaultIntegration: new apigateway.LambdaIntegration(apiFunction, {
                proxy: true
            }),
            anyMethod: true
        });

        // Store the API URL for cross-stack reference
        this.apiUrl = api.url;

        // Output the API URL
        new cdk.CfnOutput(this, 'ApiUrl', {
            value: api.url,
            description: 'The URL of the REST API',
            exportName: `${applicationName}-ApiUrl`
        });

        // S3 bucket to host the website
        const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
            removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production
            autoDeleteObjects: true, // NOT recommended for production
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        });

        // Add Project tag to the bucket
        cdk.Tags.of(websiteBucket).add('Project', applicationName);

        // CloudFront distribution with caching disabled
        const distribution = new cloudfront.Distribution(this, 'Distribution', {
            defaultBehavior: {
                origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
                originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
            },
            defaultRootObject: 'index.html',
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                },
            ],
        });

        // Add Project tag to the distribution
        cdk.Tags.of(distribution).add('Project', applicationName);

        // Set removal policy for CloudFront distribution
        (distribution.node.defaultChild as cdk.aws_cloudfront.CfnDistribution).cfnOptions.deletionPolicy = cdk.CfnDeletionPolicy.DELETE;

        // Dynamically load and deploy files from ../webapp/dist
        this.deployWebsiteFiles(websiteBucket, `https://${api.restApiId}.execute-api.${this.region}.amazonaws.com/prod/`);

        // Output the CloudFront URL
        new cdk.CfnOutput(this, 'DistributionDomainName', {
            value: `https://${distribution.distributionDomainName}`,
            description: 'The URL of the website',
        });

        // Output the API URL that was passed from the API stack
        new cdk.CfnOutput(this, 'ApiUrlReference', {
            value: this.apiUrl,
            description: 'The URL of the REST API (from API stack)',
        });
    }


    private deployWebsiteFiles(websiteBucket: s3.Bucket, apiUrl: string): void {
        const distPath = path.resolve('../webapp/dist');

        if (!fs.existsSync(distPath)) {
            console.warn(`Directory ${distPath} does not exist. Skipping website deployment.`);
            return;
        }

        // Get all files recursively from the dist directory
        const files = this.getAllFiles(distPath);
        files.forEach((filePath, index) => {
            const relativePath = path.relative(distPath, filePath);

            console.log(`Creating DeployTimeSubstitutedFile for: ${relativePath}`);

            let isJs = filePath.endsWith(".js");

            // Create a DeployTimeSubstitutedFile for files that need substitution
            const substitutedFile = new s3deploy.DeployTimeSubstitutedFile(this, `SubstitutedFile` + filePath.split('/').slice(-3).join('-'), {
                source: filePath,
                destinationKey: relativePath,
                destinationBucket: websiteBucket,
                substitutions: {
                    'REMOTE_API_URL': apiUrl
                }
            });



        });

    }

    private getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
        const files = fs.readdirSync(dirPath);

        files.forEach((file) => {
            const fullPath = path.join(dirPath, file);
            if (fs.statSync(fullPath).isDirectory()) {
                arrayOfFiles = this.getAllFiles(fullPath, arrayOfFiles);
            } else {
                arrayOfFiles.push(fullPath);
            }
        });

        return arrayOfFiles;
    }
}
