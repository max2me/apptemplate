import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as resourcegroups from 'aws-cdk-lib/aws-resourcegroups';

// Extend StackProps to include applicationName
interface CdkStackProps extends cdk.StackProps {
  applicationName: string;
}

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CdkStackProps) {
    super(scope, id, props);

    const { applicationName } = props;
    
    // Create a resource group for the application
    const resourceGroup = new resourcegroups.CfnGroup(this, 'ResourceGroup', {
      name: `Project-${applicationName}`,
      description: `Resources for ${applicationName} application`,
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

    // S3 bucket to host the website
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production
      autoDeleteObjects: true, // NOT recommended for production
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });
    
    // Add Project tag to the bucket
    cdk.Tags.of(websiteBucket).add('Project', applicationName);

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
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

    // Deploy the website files to S3
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('../webapp/dist')],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // Output the CloudFront URL
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'The URL of the website',
    });
  }
}
