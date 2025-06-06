#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AppStack } from '../lib/app-stack';
import * as fs from 'fs';
import * as path from 'path';

// Read application configuration
const appConfigPath = path.join(__dirname, '../appConfig.json');
const appConfig = JSON.parse(fs.readFileSync(appConfigPath, 'utf8'));
const { applicationName } = appConfig;

const app = new cdk.App();

// Deploy API stack first
const apiStack = new AppStack(app, `${applicationName}ApiStack`, {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
  
  applicationName: applicationName,
});
