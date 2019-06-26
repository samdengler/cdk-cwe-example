#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { CdkCweExampleStack } from '../lib/cdk-cwe-example-stack';
import { CdkCweDeployStack } from '../lib/cdk-cwe-deploy-stack';
import { CodePipelineStack } from '../lib/code-pipeline-stack';

const app = new cdk.App();

new CdkCweDeployStack(app, 'DeployStack', {
  s3Bucket: 'fsd-demo-dev'
});

const devStack = new CdkCweExampleStack(app, 'DevStack', {
  s3Bucket: 'fsd-demo-dev'
});

const prodStack = new CdkCweExampleStack(app, 'ProdStack', {
  s3Bucket: 'fsd-demo-prod'
});

new CodePipelineStack(app, 'CodePipelineStack', {
  lambdaCode: {
    dev: devStack.lambdaCode,
    prod: prodStack.lambdaCode,
  }
});