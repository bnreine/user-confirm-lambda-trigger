# user-confirm-lambda-trigger

Node.js AWS CDK app that deploys:

- **CodePipeline** — automated build and deploy from GitHub (stubbed connection details)
- **Cognito User Pool** — with a **PostConfirmation** Lambda trigger
- **Lambda** — copies confirmed user attributes into DynamoDB on sign-up confirmation
- **DynamoDB `users` table** — partition key `userId`

## Prerequisites

- Node.js 20+
- AWS CLI configured (`aws configure` or SSO)
- CDK bootstrapped in your account/region: `npx cdk bootstrap`

For the pipeline, create a **CodeStar Connections** GitHub connection in the AWS Console and note its ARN.

## Configure

Edit `lib/config.js` or set environment variables (see `.env.example`):

| Setting | Description |
|---------|-------------|
| `CDK_DEFAULT_ACCOUNT` | AWS account ID |
| `CDK_DEFAULT_REGION` | AWS region |
| `GITHUB_CONNECTION_ARN` | CodeStar connection ARN |
| `GITHUB_OWNER` | GitHub org or username |
| `GITHUB_REPO` | Repository name |
| `GITHUB_BRANCH` | Branch to deploy (default `main`) |
| `COGNITO_USER_POOL_NAME` | User pool name |

## Install

```bash
npm install
```

## Deploy

### Option A — Pipeline (CI/CD)

Deploys a CodePipeline that synths and deploys the backend on every push:

```bash
npx cdk deploy UserConfirmPipelineStack
```

Push to the configured GitHub branch to trigger a deployment.

### Option B — Backend only (direct deploy)

Skip the pipeline and deploy Cognito + Lambda + DynamoDB directly:

```bash
DEPLOY_BACKEND_ONLY=true npx cdk deploy UserConfirmBackendStack
```

## What happens on user confirmation

When a user confirms sign-up in Cognito, the PostConfirmation Lambda runs and writes a record to the `users` table:

| Field | Source |
|-------|--------|
| `userId` | Cognito `sub` |
| `email` | Cognito `email` |
| `givenName`, `familyName`, etc. | Standard attributes |
| Custom fields | Any `custom:*` attributes |
| `createdAt` / `updatedAt` | Set by Lambda |

Handler: `lambda/post-confirmation/index.js`

## Useful commands

```bash
npm run synth    # CloudFormation templates
npm run diff     # Compare deployed stack with current state
npm run deploy   # Deploy all stacks defined in bin/app.js
```

## Stack outputs

After deploy, note:

- `UserPoolId` — use in your frontend/auth config
- `UserPoolClientId` — app client ID
- `UsersTableName` — DynamoDB table name
- `PostConfirmationFnArn` — Lambda ARN
