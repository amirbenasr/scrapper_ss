const AWS = require("aws-sdk");

export const sns = new AWS.SNS({
  region: "eu-central-1",
  credentials: {
    accessKeyId: "AKIAYBBEQYVYRYR36E7Z",
    secretAccessKey: "xub1swOiimCR20O8y2F9cn1M7nxjh4eb3+sl1NuU",
  },
  // Replace with your region
});
export const SNS_TOPIC_ARN =
  "arn:aws:sns:eu-central-1:551979894129:TextractNotifications";
