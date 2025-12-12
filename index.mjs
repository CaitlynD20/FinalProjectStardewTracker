import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({region: "us-east-2"});
export const handler = async (event) => {
  const bundleId = event.queryStringParameters?.bundleId;

  if (!bundleId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Missing bundleId",
      }),
    };
  }
  try {
    const data = await client.send(new QueryCommand({
      TableName: "BundleItems",
      KeyConditionExpression: "bundleId = :bundleId",
      ExpressionAttributeValues: { ":bundleId": { S: bundleId } }
    }));
    const items = data.Items.map(unmarshall);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
    },
    body: JSON.stringify(items)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error getting bundle items",
        error: error.message,
      }),
    };
    }
};
