#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ApiStack } from '../lib/api-stack';

const app = new cdk.App();

const defaultProps = {
  env: {
    region: 'eu-central-1',
  },
};

new ApiStack(app, 'ApiStack', {
  ...defaultProps,
  stackName: 'planning-poker-backend',
  stageName: 'dev',
});
