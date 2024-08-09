"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeBase64Image = analyzeBase64Image;
var _a = require("@aws-sdk/client-textract"), TextractClient = _a.TextractClient, DetectDocumentTextCommand = _a.DetectDocumentTextCommand;
// Create a Textract client with explicit credentials
var client = new TextractClient({
    region: "eu-central-1",
    credentials: {
        accessKeyId: "AKIAYBBEQYVYRYR36E7Z",
        secretAccessKey: "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",
    },
});
// Function to analyze base64-encoded image
function analyzeBase64Image(base64Image) {
    return __awaiter(this, void 0, void 0, function () {
        var binaryData, command, response, detectedText, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    binaryData = Buffer.from(base64Image, "base64");
                    command = new DetectDocumentTextCommand({
                        Document: {
                            Bytes: binaryData,
                        },
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, client.send(command)];
                case 2:
                    response = _a.sent();
                    detectedText = void 0;
                    if (response.Blocks) {
                        detectedText = response.Blocks.filter(function (block) { return block.BlockType === "LINE"; }) // Filter lines of text
                            .map(function (block) { return block.Text; }) // Extract text from each line
                            .filter(function (text) { return text; }) // Remove any null or undefined text values
                            .join("");
                    }
                    console.log("Document analyzed successfully:", detectedText);
                    return [2 /*return*/, detectedText];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error analyzing document:", error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
