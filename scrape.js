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
var promises_1 = require("node:timers/promises");
var textract_1 = require("./textract");
var puppeteer_1 = require("puppeteer");
var sns_1 = require("./sns");
var sendNotification = function (message) { return __awaiter(void 0, void 0, void 0, function () {
    var params, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                params = {
                    Message: message,
                    TopicArn: sns_1.SNS_TOPIC_ARN,
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, sns_1.sns.publish(params).promise()];
            case 2:
                _a.sent();
                console.log("Notification sent successfully.");
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error("Failed to send notification:", error_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
// const WEBSITE = "http://127.0.0.1:5500/";
var WEBSITE = "https://tunisia.blsspainglobal.com/Global/account/login";
var captchaBtnId = "#btnVerify";
var submitLoginId = "#btnSubmit";
var email_id = "[id^=\"UserId\"]";
var password_id = '[id^="Password"]';
var frame_selector = "iframe.k-content-frame";
var code_main_div = '::-p-xpath(//*[@id="captcha-main-div"]/div/div[1])';
var images_main_div = '::-p-xpath(//*[@id="captcha-main-div"]/div/div[2])';
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var browser, page, emailInputs, selectedEmail, _i, emailInputs_1, email, style, displayPropertyofDiv, displayValue, passwordInputs, selectedPassword, _a, passwordInputs_1, password, style, displayPropertyofDiv, displayValue, captchaBtnId, buttonVerify, captchaSolved, submitBtn, submitBtn2;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, puppeteer_1.default.launch({
                    headless: false,
                })];
            case 1:
                browser = _d.sent();
                return [4 /*yield*/, browser.newPage()];
            case 2:
                page = _d.sent();
                // Navigate to the desired URL
                return [4 /*yield*/, page.goto(WEBSITE, { waitUntil: "domcontentloaded", timeout: 120000 })];
            case 3:
                // Navigate to the desired URL
                _d.sent();
                console.log("page loaded");
                // Set up dialog event listener
                page.on("dialog", function (dialog) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                console.log("Dialog type:", dialog.type()); // Type of dialog (alert, confirm, prompt)
                                console.log("Dialog message:", dialog.message()); // Message of the dialog
                                if (!(dialog.type() === "alert")) return [3 /*break*/, 3];
                                console.log("Alert detected. Re-running captcha solver.");
                                return [4 /*yield*/, dialog.accept()];
                            case 1:
                                _a.sent(); // Close the alert
                                return [4 /*yield*/, solveCaptchaWithRetry(page)];
                            case 2:
                                _a.sent(); // Retry solving captcha
                                return [3 /*break*/, 5];
                            case 3: return [4 /*yield*/, dialog.accept()];
                            case 4:
                                _a.sent(); // Accept other dialogs (e.g., confirm, prompt)
                                _a.label = 5;
                            case 5: return [2 /*return*/];
                        }
                    });
                }); });
                return [4 /*yield*/, page.$$(email_id)];
            case 4:
                emailInputs = _d.sent();
                _i = 0, emailInputs_1 = emailInputs;
                _d.label = 5;
            case 5:
                if (!(_i < emailInputs_1.length)) return [3 /*break*/, 10];
                email = emailInputs_1[_i];
                return [4 /*yield*/, email.evaluateHandle(function (el) {
                        return window.getComputedStyle(el.parentElement);
                    })];
            case 6:
                style = _d.sent();
                return [4 /*yield*/, style.getProperty("display")];
            case 7:
                displayPropertyofDiv = _d.sent();
                return [4 /*yield*/, (displayPropertyofDiv === null || displayPropertyofDiv === void 0 ? void 0 : displayPropertyofDiv.jsonValue())];
            case 8:
                displayValue = (_b = (_d.sent())) !== null && _b !== void 0 ? _b : "";
                if (displayValue !== "none") {
                    selectedEmail = email;
                }
                _d.label = 9;
            case 9:
                _i++;
                return [3 /*break*/, 5];
            case 10: return [4 /*yield*/, page.$$(password_id)];
            case 11:
                passwordInputs = _d.sent();
                _a = 0, passwordInputs_1 = passwordInputs;
                _d.label = 12;
            case 12:
                if (!(_a < passwordInputs_1.length)) return [3 /*break*/, 17];
                password = passwordInputs_1[_a];
                return [4 /*yield*/, password.evaluateHandle(function (el) {
                        return window.getComputedStyle(el.parentElement);
                    })];
            case 13:
                style = _d.sent();
                return [4 /*yield*/, style.getProperty("display")];
            case 14:
                displayPropertyofDiv = _d.sent();
                return [4 /*yield*/, (displayPropertyofDiv === null || displayPropertyofDiv === void 0 ? void 0 : displayPropertyofDiv.jsonValue())];
            case 15:
                displayValue = (_c = (_d.sent())) !== null && _c !== void 0 ? _c : "";
                if (displayValue !== "none") {
                    selectedPassword = password;
                }
                _d.label = 16;
            case 16:
                _a++;
                return [3 /*break*/, 12];
            case 17:
                captchaBtnId = "#btnVerify";
                return [4 /*yield*/, page.waitForSelector(captchaBtnId, {
                        timeout: 40000,
                    })];
            case 18:
                buttonVerify = _d.sent();
                return [4 /*yield*/, (buttonVerify === null || buttonVerify === void 0 ? void 0 : buttonVerify.click())];
            case 19:
                _d.sent();
                return [4 /*yield*/, (0, promises_1.setTimeout)(9000)];
            case 20:
                _d.sent();
                return [4 /*yield*/, page.evaluate(function () {
                        window.VerifyRegister();
                    })];
            case 21:
                _d.sent();
                // Wait for the iframe to appear
                return [4 /*yield*/, page.waitForSelector("iframe", { timeout: 60000 })];
            case 22:
                // Wait for the iframe to appear
                _d.sent(); // Adjust selector if necessary
                captchaSolved = false;
                _d.label = 23;
            case 23:
                if (!!captchaSolved) return [3 /*break*/, 27];
                return [4 /*yield*/, solveCaptchaWithRetry(page)];
            case 24:
                captchaSolved = _d.sent();
                if (!!captchaSolved) return [3 /*break*/, 26];
                return [4 /*yield*/, solveCaptchaWithRetry(page)];
            case 25:
                captchaSolved = _d.sent();
                _d.label = 26;
            case 26: return [3 /*break*/, 23];
            case 27: 
            // // await solvaCaptcha(frame);
            // console.log("after solving captcha, we need to type into inputs");
            // Ensure focus on email field before typing
            return [4 /*yield*/, (0, promises_1.setTimeout)(3000)];
            case 28:
                // // await solvaCaptcha(frame);
                // console.log("after solving captcha, we need to type into inputs");
                // Ensure focus on email field before typing
                _d.sent();
                return [4 /*yield*/, (selectedEmail === null || selectedEmail === void 0 ? void 0 : selectedEmail.type("tunis.mirof@gmail.com", { delay: 150 }))];
            case 29:
                _d.sent();
                console.log("finished writing email");
                return [4 /*yield*/, (0, promises_1.setTimeout)(3000)];
            case 30:
                _d.sent();
                // // Ensure focus on password field before typing
                return [4 /*yield*/, (selectedPassword === null || selectedPassword === void 0 ? void 0 : selectedPassword.type("Azerty123456-*", { delay: 200 }))];
            case 31:
                // // Ensure focus on password field before typing
                _d.sent();
                console.log("finished writing password");
                return [4 /*yield*/, (0, promises_1.setTimeout)(3000)];
            case 32:
                _d.sent();
                return [4 /*yield*/, page.$(submitLoginId)];
            case 33:
                submitBtn = _d.sent();
                return [4 /*yield*/, (submitBtn === null || submitBtn === void 0 ? void 0 : submitBtn.click())];
            case 34:
                _d.sent();
                return [4 /*yield*/, (0, promises_1.setTimeout)(10000)];
            case 35:
                _d.sent();
                // Send SNS notification
                return [4 /*yield*/, sendNotification("Login successful! : STEP 1")];
            case 36:
                // Send SNS notification
                _d.sent();
                return [4 /*yield*/, page.goto("https://tunisia.blsspainglobal.com/Global/blsappointment/manageappointment", { waitUntil: "domcontentloaded", timeout: 6000 })];
            case 37:
                _d.sent();
                return [4 /*yield*/, (0, promises_1.setTimeout)(5000)];
            case 38:
                _d.sent();
                return [4 /*yield*/, page.evaluate(function () {
                        window.VerifyCaptcha();
                    })];
            case 39:
                _d.sent();
                return [4 /*yield*/, solveCaptchaWithRetry(page)];
            case 40:
                _d.sent();
                return [4 /*yield*/, (0, promises_1.setTimeout)(15000)];
            case 41:
                _d.sent();
                return [4 /*yield*/, page.$(submitLoginId)];
            case 42:
                submitBtn2 = _d.sent();
                return [4 /*yield*/, (submitBtn2 === null || submitBtn2 === void 0 ? void 0 : submitBtn2.click())];
            case 43:
                _d.sent();
                return [4 /*yield*/, sendNotification("Login successful! : STEP 2")];
            case 44:
                _d.sent();
                return [2 /*return*/];
        }
    });
}); })();
function solvaCaptcha(frame) {
    return __awaiter(this, void 0, void 0, function () {
        var main_code_div, code_child_divs, btnSubmitCaptchaSon, max_z_index, code, _i, _a, div, style, text, zIndex, zIndexValue, _b, imagesDiv, images, emptyArray, _c, images_1, img, style, zProperty, zValue, _d, displayPropertyofDiv, displayValue, sortedArray, captchaSolved, _e, sortedArray_1, img, clickableImg, src, srcValue, base64Image, imgCode, error_2, papa, papaElement, error_3, error_4;
        var _f, _g, _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    if (!frame) {
                        console.log("Iframe content frame not found");
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, (0, promises_1.setTimeout)(8000)];
                case 1:
                    _j.sent();
                    _j.label = 2;
                case 2:
                    _j.trys.push([2, 43, , 44]);
                    // Interact with elements inside the iframe
                    return [4 /*yield*/, (0, promises_1.setTimeout)(8000)];
                case 3:
                    // Interact with elements inside the iframe
                    _j.sent();
                    return [4 /*yield*/, frame.$(code_main_div)];
                case 4:
                    main_code_div = _j.sent();
                    return [4 /*yield*/, (main_code_div === null || main_code_div === void 0 ? void 0 : main_code_div.$$("div"))];
                case 5:
                    code_child_divs = _j.sent();
                    return [4 /*yield*/, frame.$("i#submit")];
                case 6:
                    btnSubmitCaptchaSon = _j.sent();
                    max_z_index = -5;
                    code = "";
                    _i = 0, _a = code_child_divs;
                    _j.label = 7;
                case 7:
                    if (!(_i < _a.length)) return [3 /*break*/, 14];
                    div = _a[_i];
                    return [4 /*yield*/, div.evaluateHandle(function (el) {
                            return window.getComputedStyle(el);
                        })];
                case 8:
                    style = _j.sent();
                    return [4 /*yield*/, div.evaluateHandle(function (el) { return el.textContent; })];
                case 9:
                    text = _j.sent();
                    return [4 /*yield*/, style.getProperty("z-index")];
                case 10:
                    zIndex = _j.sent();
                    _b = Number;
                    return [4 /*yield*/, (zIndex === null || zIndex === void 0 ? void 0 : zIndex.jsonValue())];
                case 11:
                    zIndexValue = _b.apply(void 0, [_j.sent()]);
                    if (!(!isNaN(zIndexValue) && zIndexValue > max_z_index)) return [3 /*break*/, 13];
                    max_z_index = zIndexValue;
                    return [4 /*yield*/, text.jsonValue()];
                case 12:
                    code = (_g = (_f = ((_j.sent()))) === null || _f === void 0 ? void 0 : _f.split(" ").slice(-1)[0]) !== null && _g !== void 0 ? _g : "";
                    _j.label = 13;
                case 13:
                    _i++;
                    return [3 /*break*/, 7];
                case 14:
                    console.log("Code is found ".concat(code));
                    return [4 /*yield*/, frame.$(images_main_div)];
                case 15:
                    imagesDiv = _j.sent();
                    return [4 /*yield*/, (imagesDiv === null || imagesDiv === void 0 ? void 0 : imagesDiv.$$("div"))];
                case 16:
                    images = _j.sent();
                    emptyArray = [];
                    if (!images) return [3 /*break*/, 24];
                    _c = 0, images_1 = images;
                    _j.label = 17;
                case 17:
                    if (!(_c < images_1.length)) return [3 /*break*/, 24];
                    img = images_1[_c];
                    return [4 /*yield*/, img.evaluateHandle(function (el) {
                            return window.getComputedStyle(el);
                        })];
                case 18:
                    style = _j.sent();
                    return [4 /*yield*/, style.getProperty("z-index")];
                case 19:
                    zProperty = _j.sent();
                    _d = Number;
                    return [4 /*yield*/, (zProperty === null || zProperty === void 0 ? void 0 : zProperty.jsonValue())];
                case 20:
                    zValue = _d.apply(void 0, [_j.sent()]);
                    return [4 /*yield*/, style.getProperty("display")];
                case 21:
                    displayPropertyofDiv = _j.sent();
                    return [4 /*yield*/, (displayPropertyofDiv === null || displayPropertyofDiv === void 0 ? void 0 : displayPropertyofDiv.jsonValue())];
                case 22:
                    displayValue = (_h = (_j.sent())) !== null && _h !== void 0 ? _h : "";
                    if (displayValue !== "none") {
                        emptyArray.push({ z: zValue, el: img });
                    }
                    _j.label = 23;
                case 23:
                    _c++;
                    return [3 /*break*/, 17];
                case 24:
                    sortedArray = emptyArray.sort(function (a, b) { return a.z - b.z; }).slice(-9);
                    return [4 /*yield*/, (0, promises_1.setTimeout)(3000)];
                case 25:
                    _j.sent();
                    captchaSolved = false;
                    _e = 0, sortedArray_1 = sortedArray;
                    _j.label = 26;
                case 26:
                    if (!(_e < sortedArray_1.length)) return [3 /*break*/, 37];
                    img = sortedArray_1[_e];
                    return [4 /*yield*/, img.el.$("img")];
                case 27:
                    clickableImg = _j.sent();
                    if (!clickableImg) return [3 /*break*/, 36];
                    return [4 /*yield*/, clickableImg.getProperty("src")];
                case 28:
                    src = _j.sent();
                    return [4 /*yield*/, src.jsonValue()];
                case 29:
                    srcValue = (_j.sent());
                    if (!srcValue.startsWith("data:image")) return [3 /*break*/, 35];
                    base64Image = srcValue.split(",")[1];
                    return [4 /*yield*/, (0, textract_1.analyzeBase64Image)(base64Image)];
                case 30:
                    imgCode = _j.sent();
                    if (!(code === imgCode)) return [3 /*break*/, 34];
                    _j.label = 31;
                case 31:
                    _j.trys.push([31, 33, , 34]);
                    return [4 /*yield*/, clickableImg.evaluate(function (el) { return el.click(); })];
                case 32:
                    _j.sent();
                    captchaSolved = true; // Successfully solved captcha
                    return [3 /*break*/, 34];
                case 33:
                    error_2 = _j.sent();
                    console.log("Error clicking image: ".concat(error_2));
                    return [3 /*break*/, 34];
                case 34: return [3 /*break*/, 36];
                case 35:
                    console.error("Image src is not base64 encoded.");
                    _j.label = 36;
                case 36:
                    _e++;
                    return [3 /*break*/, 26];
                case 37:
                    console.log("Finished with images");
                    if (!btnSubmitCaptchaSon) return [3 /*break*/, 41];
                    _j.label = 38;
                case 38:
                    _j.trys.push([38, 40, , 41]);
                    return [4 /*yield*/, btnSubmitCaptchaSon.evaluateHandle(function (el) { return el.parentElement; })];
                case 39:
                    papa = _j.sent();
                    papaElement = papa.asElement();
                    if (papa && papaElement) {
                        papaElement === null || papaElement === void 0 ? void 0 : papaElement.click();
                        captchaSolved = true; // Successfully submitted captcha
                    }
                    return [3 /*break*/, 41];
                case 40:
                    error_3 = _j.sent();
                    console.log("Error clicking submit button: ".concat(error_3));
                    return [3 /*break*/, 41];
                case 41: return [4 /*yield*/, (0, promises_1.setTimeout)(5000)];
                case 42:
                    _j.sent();
                    return [2 /*return*/, captchaSolved];
                case 43:
                    error_4 = _j.sent();
                    console.error("Error solving captcha:", error_4);
                    return [2 /*return*/, false];
                case 44: return [2 /*return*/];
            }
        });
    });
}
function solveCaptchaWithRetry(page) {
    return __awaiter(this, void 0, void 0, function () {
        var iframeElement, frame, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    console.log("entering solveCaptchaWithRetry");
                    return [4 /*yield*/, page.$(frame_selector)];
                case 1:
                    iframeElement = _a.sent();
                    return [4 /*yield*/, (iframeElement === null || iframeElement === void 0 ? void 0 : iframeElement.contentFrame())];
                case 2:
                    frame = _a.sent();
                    if (!frame) return [3 /*break*/, 4];
                    return [4 /*yield*/, solvaCaptcha(frame)];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    console.log("Iframe content frame not found");
                    return [2 /*return*/, false];
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_5 = _a.sent();
                    console.error("Error solving captcha:", error_5);
                    return [2 /*return*/, false];
                case 7: return [2 /*return*/];
            }
        });
    });
}
