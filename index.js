const puppeteer = require("puppeteer-core");
const chromium = require("chrome-aws-lambda");
const { setTimeout } = require("node:timers/promises");
const { analyzeBase64Image } = require("./textract");
const AWS = require("aws-sdk");

// AWS SNS Configuration
const sns = new AWS.SNS({
  region: "eu-central-1",
  credentials: {
    accessKeyId: "AKIAYBBEQYVYRYR36E7Z",
    secretAccessKey: "xub1swOiimCR20O8y2F9cn1M7nxjh4eb3+sl1NuU",
  },
  // Replace with your region
});
const SNS_TOPIC_ARN =
  "arn:aws:sns:eu-central-1:551979894129:TextractNotifications";

const sendNotification = async (message) => {
  const params = {
    Message: message,
    TopicArn: SNS_TOPIC_ARN,
  };

  try {
    await sns.publish(params).promise();
    console.log("Notification sent successfully.");
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
};

const WEBSITE = "https://tunisia.blsspainglobal.com/Global/account/login";
const captchaBtnId = "#btnVerify";
const submitLoginId = "#btnSubmit";
const email_id = '[id^="UserId"]';
const password_id = '[id^="Password"]';
const frame_selector = "iframe.k-content-frame";
const code_main_div = '::-p-xpath(//*[@id="captcha-main-div"]/div/div[1])';
const images_main_div = '::-p-xpath(//*[@id="captcha-main-div"]/div/div[2])';

exports.handler = async () => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });
  const page = await browser.newPage();

  try {
    await page.goto(WEBSITE, { waitUntil: "domcontentloaded", timeout: 60000 });
    console.log("Page loaded");

    page.on("dialog", async (dialog) => {
      console.log("Dialog type:", dialog.type());
      console.log("Dialog message:", dialog.message());

      if (dialog.type() === "alert") {
        console.log("Alert detected. Re-running captcha solver.");
        await dialog.accept();
        await solveCaptchaWithRetry(page);
      } else {
        await dialog.accept();
      }
    });

    const emailInputs = await page.$$(email_id);
    let selectedEmail;
    for (const email of emailInputs) {
      const style = await email.evaluateHandle((el) =>
        window.getComputedStyle(el.parentElement)
      );
      const displayPropertyofDiv = await style.getProperty("display");
      const displayValue = (await displayPropertyofDiv.jsonValue()) || "";
      if (displayValue !== "none") {
        selectedEmail = email;
      }
    }

    const passwordInputs = await page.$$(password_id);
    let selectedPassword;
    for (const password of passwordInputs) {
      const style = await password.evaluateHandle((el) =>
        window.getComputedStyle(el.parentElement)
      );
      const displayPropertyofDiv = await style.getProperty("display");
      const displayValue = (await displayPropertyofDiv.jsonValue()) || "";
      if (displayValue !== "none") {
        selectedPassword = password;
      }
    }

    const buttonVerify = await page.waitForSelector(captchaBtnId, {
      timeout: 40000,
    });
    await buttonVerify?.click();

    await setTimeout(9000);
    await page.evaluate(() =>
      window.VerifyRegister ? window.VerifyRegister() : null
    );

    await page.waitForSelector("iframe", { timeout: 60000 });

    let captchaSolved = false;
    while (!captchaSolved) {
      captchaSolved = await solveCaptchaWithRetry(page);
      if (!captchaSolved) {
        console.error("Captcha solving failed. Retrying...");
      }
    }

    await setTimeout(3000);
    await selectedEmail?.type("tunis.mirof@gmail.com", { delay: 150 });
    console.log("Finished writing email");

    await setTimeout(3000);
    await selectedPassword?.type("Azerty123456-*", { delay: 200 });
    console.log("Finished writing password");

    await setTimeout(3000);
    const submitBtn = await page.$(submitLoginId);
    await submitBtn?.click();
    await setTimeout(10000);
    await sendNotification("Login successful! : STEP 1");

    await page.goto(
      "https://tunisia.blsspainglobal.com/Global/blsappointment/manageappointment",
      { waitUntil: "domcontentloaded", timeout: 6000 }
    );
    await setTimeout(5000);
    await page.evaluate(() =>
      window.VerifyCaptcha ? window.VerifyCaptcha() : null
    );
    await solveCaptchaWithRetry(page);
    await setTimeout(15000);
    const buttonVerified = await page.$(captchaBtnId);
    if (buttonVerified) {
      await page.evaluate((button) => button.click(), buttonVerified);
    }
    const submitBtn2 = await page.$(submitLoginId);
    await submitBtn2?.click();
    await sendNotification("Login successful! : STEP 2");
  } catch (error) {
    console.error("Error:", error);
    await sendNotification(`Login failed: ${error.message}`);
  } finally {
    await browser.close();
  }
};

async function solveCaptcha(frame) {
  if (!frame) {
    console.log("Iframe content frame not found");
    return false;
  }
  await setTimeout(8000);

  try {
    await setTimeout(8000);

    const main_code_div = await frame.$(code_main_div);
    const code_child_divs = await main_code_div?.$$("div");
    const btnSubmitCaptchaSon = await frame.$("i#submit");

    let max_z_index = -5;
    let code = "";

    for (const div of code_child_divs) {
      const style = await div.evaluateHandle((el) =>
        window.getComputedStyle(el)
      );
      const text = await div.evaluateHandle((el) => el.textContent);
      const zIndex = await style.getProperty("z-index");
      const zIndexValue = Number(await zIndex.jsonValue());

      if (!isNaN(zIndexValue) && zIndexValue > max_z_index) {
        max_z_index = zIndexValue;
        code = (await text.jsonValue())?.split(" ").slice(-1)[0] || "";
      }
    }
    console.log(`Code is found ${code}`);

    const imagesDiv = await frame.$(images_main_div);
    const images = await imagesDiv?.$$("div");

    let emptyArray = [];
    if (images) {
      for (const img of images) {
        const style = await img.evaluateHandle((el) =>
          window.getComputedStyle(el)
        );
        const zProperty = await style.getProperty("z-index");
        const zValue = Number(await zProperty.jsonValue());

        const displayPropertyofDiv = await style.getProperty("display");
        const displayValue = (await displayPropertyofDiv.jsonValue()) || "";
        if (displayValue !== "none") {
          emptyArray.push({ z: zValue, el: img });
        }
      }
    }

    const sortedArray = emptyArray.sort((a, b) => a.z - b.z).slice(-9);

    await setTimeout(3000);

    let captchaSolved = false;
    for (const img of sortedArray) {
      const clickableImg = await img.el.$("img");
      if (clickableImg) {
        const src = await clickableImg.getProperty("src");
        const srcValue = await src.jsonValue();

        if (srcValue.startsWith("data:image")) {
          const base64Image = srcValue.split(",")[1];
          const imgCode = await analyzeBase64Image(base64Image);

          if (code === imgCode) {
            try {
              await clickableImg.evaluate((el) => el.click());
              captchaSolved = true;
            } catch (error) {
              console.log(`Error clicking image: ${error}`);
            }
          }
        } else {
          console.error("Image src is not base64 encoded.");
        }
      }
    }

    console.log("Finished with images");

    if (btnSubmitCaptchaSon) {
      try {
        const papa = await btnSubmitCaptchaSon.evaluateHandle(
          (el) => el.parentElement
        );
        const papaElement = papa.asElement();
        if (papa && papaElement) {
          papaElement.click();
          captchaSolved = true;
        }
      } catch (error) {
        console.log(`Error clicking submit button: ${error}`);
      }
    }

    await setTimeout(5000);
    return captchaSolved;
  } catch (error) {
    console.error("Error solving captcha:", error);
    return false;
  }
}

async function solveCaptchaWithRetry(page) {
  try {
    console.log("Entering solveCaptchaWithRetry");

    const iframeElement = await page.$(frame_selector);
    const frame = await iframeElement?.contentFrame();

    if (frame) {
      return await solveCaptcha(frame);
    } else {
      console.log("Iframe content frame not found");
      return false;
    }
  } catch (error) {
    console.error("Error solving captcha:", error);
    return false;
  }
}
