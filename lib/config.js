/**
 * Central place for values you will need to fill in before deploying.
 * Update these placeholders for your AWS account, repo, and Cognito settings.
 */
module.exports = {
  // AWS account / region
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || 'YOUR_AWS_ACCOUNT_ID',
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },

  // CodePipeline source (GitHub via CodeStar Connections)
  pipeline: {
    connectionArn:
      process.env.GITHUB_CONNECTION_ARN ||
      'arn:aws:codestar-connections:us-east-1:YOUR_AWS_ACCOUNT_ID:connection/YOUR_CONNECTION_ID',
    owner: process.env.GITHUB_OWNER || 'YOUR_GITHUB_ORG_OR_USER',
    repo: process.env.GITHUB_REPO || 'YOUR_REPO_NAME',
    branch: process.env.GITHUB_BRANCH || 'main',
  },

  // Cognito User Pool — fill in or override via env at deploy time
  cognito: {
    userPoolName: process.env.COGNITO_USER_POOL_NAME || 'user-confirm-pool',
    // Optional: restrict sign-in to email only
    signInAliases: {
      email: true,
    },
    // Standard attributes you expect on confirmed users
    standardAttributes: {
      email: { required: true, mutable: true },
      givenName: { required: false, mutable: true },
      familyName: { required: false, mutable: true },
    },
    // Add custom attributes here if needed, e.g.:
    // customAttributes: {
    //   tenantId: new cognito.StringAttribute({ mutable: true }),
    // },
  },
};
