import { AwsCredentialIdentity, Credentials } from "@aws-sdk/types";
import * as dotenv from "dotenv";

dotenv.config();
const {
  TextractClient,
  DetectDocumentTextCommand,
} = require("@aws-sdk/client-textract");

// Create a Textract client with explicit credentials
const client = new TextractClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  } as AwsCredentialIdentity,
});

// Function to analyze base64-encoded image
export async function analyzeBase64Image(base64Image: string) {
  // Decode base64 string to binary data
  const binaryData = Buffer.from(base64Image, "base64");

  // Create a command to analyze the document
  const command = new DetectDocumentTextCommand({
    Document: {
      Bytes: binaryData,
    },
  });

  try {
    const response = await client.send(command);
    let detectedText;
    if (response.Blocks) {
      detectedText = response.Blocks.filter(
        (block: any) => block.BlockType === "LINE"
      ) // Filter lines of text
        .map((block: any) => block.Text) // Extract text from each line
        .filter((text: any) => text) // Remove any null or undefined text values
        .join("");
    }
    console.log("Document analyzed successfully:", detectedText);
    return detectedText;
  } catch (error) {
    console.error("Error analyzing document:", error);
  }
}
