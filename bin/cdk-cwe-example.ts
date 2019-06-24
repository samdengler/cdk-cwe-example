#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/cdk');
import { CdkCweExampleStack } from '../lib/cdk-cwe-example-stack';

const app = new cdk.App();
new CdkCweExampleStack(app, 'CdkCweExampleStack');
