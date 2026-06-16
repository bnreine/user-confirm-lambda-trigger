#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { PipelineStack } = require('../lib/pipeline-stack');
const { BackendStack } = require('../lib/backend-stack');
const config = require('../lib/config');

const app = new cdk.App();

/**
 * Deploy the pipeline stack to bootstrap CI/CD:
 *   npx cdk deploy UserConfirmPipelineStack
 *
 * Deploy backend infrastructure directly (local / one-off):
 *   DEPLOY_BACKEND_ONLY=true npx cdk deploy UserConfirmBackendStack
 */
if (process.env.DEPLOY_BACKEND_ONLY === 'true') {
  new BackendStack(app, 'UserConfirmBackendStack', {
    env: config.env,
    description: 'Cognito User Pool, PostConfirmation Lambda, and users DynamoDB table',
  });
} else {
  new PipelineStack(app, 'UserConfirmPipelineStack', {
    env: config.env,
    description: 'CodePipeline that builds and deploys the user-confirm backend',
  });
}
