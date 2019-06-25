#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { CdkCweExampleStack } from '../lib/cdk-cwe-example-stack';

const app = new cdk.App();
new CdkCweExampleStack(app, 'dev');
