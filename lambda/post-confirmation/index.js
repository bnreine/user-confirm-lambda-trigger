const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.USERS_TABLE_NAME;

/**
 * Cognito PostConfirmation trigger.
 * Runs after a user confirms sign-up and copies pool attributes into DynamoDB.
 *
 * @type {import('aws-lambda').PostConfirmationTriggerHandler}
 */
exports.handler = async (event) => {
  console.log('PostConfirmation event received', JSON.stringify(event, null, 2));

  if (!TABLE_NAME) {
    throw new Error('USERS_TABLE_NAME environment variable is not set');
  }

  const attributes = event.request.userAttributes || {};
  const userId = attributes.sub;

  if (!userId) {
    throw new Error('Missing sub (userId) in Cognito user attributes');
  }

  const item = {
    userId,
    email: attributes.email ?? null,
    emailVerified: attributes.email_verified === 'true',
    phoneNumber: attributes.phone_number ?? null,
    phoneNumberVerified: attributes.phone_number_verified === 'true',
    givenName: attributes.given_name ?? null,
    familyName: attributes.family_name ?? null,
    name: attributes.name ?? null,
    preferredUsername: attributes.preferred_username ?? null,
    cognitoUsername: event.userName,
    userPoolId: event.userPoolId,
    userStatus: event.request?.userAttributes?.['cognito:user_status'] ?? null,
    // Persist any custom attributes (prefixed with custom: in Cognito)
    ...Object.fromEntries(
      Object.entries(attributes)
        .filter(([key]) => key.startsWith('custom:'))
        .map(([key, value]) => [key.replace(/^custom:/, ''), value])
    ),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await client.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    })
  );

  console.log(`Saved user ${userId} to ${TABLE_NAME}`);

  // Must return the event unchanged for Cognito triggers
  return event;
};
