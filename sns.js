"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SNS_TOPIC_ARN = exports.sns = void 0;
var AWS = require("aws-sdk");
exports.sns = new AWS.SNS({
    region: "eu-central-1",
    credentials: {
        accessKeyId: "AKIAYBBEQYVYRYR36E7Z",
        secretAccessKey: "xub1swOiimCR20O8y2F9cn1M7nxjh4eb3+sl1NuU",
    },
    // Replace with your region
});
exports.SNS_TOPIC_ARN = "arn:aws:sns:eu-central-1:551979894129:TextractNotifications";
