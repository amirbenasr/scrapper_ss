import * as dotenv from "dotenv";
import * as AWS from "aws-sdk";

// Load environment variables from .env file
dotenv.config();

export const sns = new AWS.SNS({
  region: process.env.AWS_REGION, // Use the region from .env
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "", // Use the access key from .env
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "", // Use the secret key from .env
  },
});

export const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN || ""; // Use the SNS Topic ARN from .env
