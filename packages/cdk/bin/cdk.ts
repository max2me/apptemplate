#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';
import * as fs from 'fs';
import * as path from 'path';

// Read application configuration
const appConfigPath = path.join(__dirname, '../appConfig.json');
const appConfig = JSON.parse(fs.readFileSync(appConfigPath, 'utf8'));
const { applicationName } = appConfig;

const app = new cdk.App();
new CdkStack(app, `${applicationName}Stack`, {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
//   env: { account: '098578355799', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
  
  // Pass applicationName as a property to the stack
  applicationName: applicationName,
});