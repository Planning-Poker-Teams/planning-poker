#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { InfrastructureStack } from '../lib/infrastructure-stack';

const app = new cdk.App();
new InfrastructureStack(app, 'ProductionStack', {
    stackName: 'planning-poker-web',
    env: {
        region: 'eu-central-1'
    }
});
