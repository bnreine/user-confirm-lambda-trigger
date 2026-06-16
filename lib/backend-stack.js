const { Stack, Duration, RemovalPolicy, CfnOutput } = require("aws-cdk-lib");
const cognito = require("aws-cdk-lib/aws-cognito");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const lambda = require("aws-cdk-lib/aws-lambda");
const { NodejsFunction } = require("aws-cdk-lib/aws-lambda-nodejs");
const iam = require("aws-cdk-lib/aws-iam");
const path = require("path");

class BackendStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const usersTable = new dynamodb.Table(this, "UsersTable", {
      tableName: "users",
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const postConfirmationFn = new NodejsFunction(this, "PostConfirmationFn", {
      functionName: "user-post-confirmation",
      entry: path.join(__dirname, "../lambda/post-confirmation/index.js"),
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: Duration.seconds(29),
      environment: {
        USERS_TABLE_NAME: usersTable.tableName,
      },
      description:
        "Cognito PostConfirmation trigger — copies confirmed user attributes into the users DynamoDB table.",
    });

    usersTable.grantWriteData(postConfirmationFn);

    // const userPool = new cognito.UserPool(this, 'UserPool', {
    //   userPoolName: config.cognito.userPoolName,
    //   selfSignUpEnabled: true,
    //   signInAliases: config.cognito.signInAliases,
    //   standardAttributes: config.cognito.standardAttributes,
    //   autoVerify: { email: true },
    //   removalPolicy: RemovalPolicy.RETAIN,
    //   lambdaTriggers: {
    //     postConfirmation: postConfirmationFn,
    //   },
    // });

    // const userPoolClient = userPool.addClient('WebClient', {
    //   userPoolClientName: 'web-client',
    //   authFlows: {
    //     userPassword: true,
    //     userSrp: true,
    //   },
    //   generateSecret: false,
    // });

    const userPool = cognito.UserPool.fromUserPoolId(
      this,
      "ImportedUserPool",
      "us-east-1_tZPJJBnoj",
    );

    postConfirmationFn.addPermission("AllowCognitoInvoke", {
      principal: new iam.ServicePrincipal("cognito-idp.amazonaws.com"),
      sourceArn: userPool.userPoolArn,
    });

    // new CfnOutput(this, 'UserPoolId', {
    //   value: userPool.userPoolId,
    //   description: 'Cognito User Pool ID',
    // });

    // new CfnOutput(this, 'UserPoolClientId', {
    //   value: userPoolClient.userPoolClientId,
    //   description: 'Cognito User Pool client ID',
    // });

    new CfnOutput(this, "UsersTableName", {
      value: usersTable.tableName,
      description: "DynamoDB users table name",
    });

    // new CfnOutput(this, 'PostConfirmationFnArn', {
    //   value: postConfirmationFn.functionArn,
    //   description: 'PostConfirmation Lambda ARN',
    // });
  }
}

module.exports = { BackendStack };
