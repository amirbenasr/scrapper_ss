import { setTimeout } from "node:timers/promises";

import { analyzeBase64Image } from "./textract";
import * as AWS from "aws-sdk";
import puppeteer from "puppeteer";
import { sns, SNS_TOPIC_ARN } from "./sns";

const sendNotification = async (message: string) => {
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
// const WEBSITE = "http://127.0.0.1:5500/";
const WEBSITE = "https://tunisia.blsspainglobal.com/Global/account/login";

const captchaBtnId = "#btnVerify";
const submitLoginId = "#btnSubmit";

const email_id = `[id^="UserId"]`;
const password_id = '[id^="Password"]';

const frame_selector = "iframe.k-content-frame";
const code_main_div = '::-p-xpath(//*[@id="captcha-main-div"]/div/div[1])';
const images_main_div = '::-p-xpath(//*[@id="captcha-main-div"]/div/div[2])';

(async () => {
  // Launch the browser
  // const browser = await puppeteer.launch({ headless: false });
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  // Navigate to the desired URL
  await page.goto(WEBSITE, { waitUntil: "domcontentloaded", timeout: 120000 });
  console.log("page loaded");
  // Set up dialog event listener
  page.on("dialog", async (dialog: any) => {
    console.log("Dialog type:", dialog.type()); // Type of dialog (alert, confirm, prompt)
    console.log("Dialog message:", dialog.message()); // Message of the dialog

    if (dialog.type() === "alert") {
      console.log("Alert detected. Re-running captcha solver.");
      await dialog.accept(); // Close the alert
      await solveCaptchaWithRetry(page); // Retry solving captcha
    } else {
      await dialog.accept(); // Accept other dialogs (e.g., confirm, prompt)
    }
  });

  const emailInputs = await page.$$(email_id);
  let selectedEmail;
  for (const email of emailInputs) {
    const style = await email.evaluateHandle((el) =>
      window.getComputedStyle(el.parentElement!)
    );
    const displayPropertyofDiv = await style.getProperty("display");
    const displayValue = (await displayPropertyofDiv?.jsonValue()) ?? "";
    if (displayValue !== "none") {
      selectedEmail = email;
    }
  }

  const passwordInputs = await page.$$(password_id);
  let selectedPassword;
  for (const password of passwordInputs) {
    const style = await password.evaluateHandle((el) =>
      window.getComputedStyle(el.parentElement!)
    );
    const displayPropertyofDiv = await style.getProperty("display");
    const displayValue = (await displayPropertyofDiv?.jsonValue()) ?? "";
    if (displayValue !== "none") {
      selectedPassword = password;
    }
  }

  // click on Verify Button to open captcha Window
  const captchaBtnId = "#btnVerify";

  const buttonVerify = await page.waitForSelector(captchaBtnId, {
    timeout: 40000,
  });
  await buttonVerify?.click();

  await setTimeout(9000);
  await page.evaluate(() => {
    (window as any).VerifyRegister();
  });
  // Wait for the iframe to appear
  await page.waitForSelector("iframe", { timeout: 60000 }); // Adjust selector if necessary

  // Solve captcha with retry logic
  // Solve captcha with retry logic
  let captchaSolved = false;
  while (!captchaSolved) {
    captchaSolved = await solveCaptchaWithRetry(page);
    if (!captchaSolved) {
      captchaSolved = await solveCaptchaWithRetry(page);
    }
  }
  // // await solvaCaptcha(frame);
  // console.log("after solving captcha, we need to type into inputs");
  // Ensure focus on email field before typing
  await setTimeout(3000);
  await selectedEmail?.type("tunis.mirof@gmail.com", { delay: 150 });
  console.log("finished writing email");
  await setTimeout(3000);

  // // Ensure focus on password field before typing
  await selectedPassword?.type("Azerty123456-*", { delay: 200 });
  console.log("finished writing password");

  await setTimeout(3000);

  const submitBtn = await page.$(submitLoginId);
  await submitBtn?.click();

  await setTimeout(10000);
  // Send SNS notification
  await sendNotification("Login successful! : STEP 1");

  await page.goto(
    "https://tunisia.blsspainglobal.com/Global/blsappointment/manageappointment",
    { waitUntil: "domcontentloaded", timeout: 6000 }
  );
  await setTimeout(5000);
  await page.evaluate(() => {
    (window as any).VerifyCaptcha();
  });
  await solveCaptchaWithRetry(page);
  await setTimeout(15000);

  const submitBtn2 = await page.$(submitLoginId);
  await submitBtn2?.click();
  await sendNotification("Login successful! : STEP 2");

  //fill forms
})();

async function solvaCaptcha(frame: any | undefined): Promise<boolean> {
  if (!frame) {
    console.log("Iframe content frame not found");
    return false;
  }
  await setTimeout(8000);

  try {
    // Interact with elements inside the iframe
    await setTimeout(8000);

    const main_code_div = await frame.$(code_main_div);
    const code_child_divs = await main_code_div?.$$("div");
    const btnSubmitCaptchaSon = await frame.$("i#submit");

    let max_z_index = -5;
    let code = "";

    for (const div of code_child_divs!) {
      const style = await div.evaluateHandle((el: any) =>
        window.getComputedStyle(el)
      );
      const text = await div.evaluateHandle((el: any) => el.textContent);
      const zIndex = await style.getProperty("z-index");
      const zIndexValue = Number(await zIndex?.jsonValue());

      if (!isNaN(zIndexValue) && zIndexValue > max_z_index) {
        max_z_index = zIndexValue;
        code = ((await text.jsonValue()) as any)?.split(" ").slice(-1)[0] ?? "";
      }
    }
    console.log(`Code is found ${code}`);

    // Find the correct images part
    const imagesDiv = await frame.$(images_main_div);
    const images = await imagesDiv?.$$("div");

    let emptyArray: { z: number; el: any }[] = [];
    if (images) {
      for (const img of images) {
        const style = await img.evaluateHandle((el: any) =>
          window.getComputedStyle(el)
        );
        const zProperty = await style.getProperty("z-index");
        const zValue = Number(await zProperty?.jsonValue());

        const displayPropertyofDiv = await style.getProperty("display");
        const displayValue = (await displayPropertyofDiv?.jsonValue()) ?? "";
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
        const srcValue = (await src.jsonValue()) as string;

        if (srcValue.startsWith("data:image")) {
          const base64Image = srcValue.split(",")[1];
          const imgCode = await analyzeBase64Image(base64Image);

          if (code === imgCode) {
            try {
              await clickableImg.evaluate((el: any) => el.click());
              captchaSolved = true; // Successfully solved captcha
            } catch (error: any) {
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
          (el: any) => el.parentElement
        );
        const papaElement = papa.asElement() as any;
        if (papa && papaElement) {
          papaElement?.click();
          captchaSolved = true; // Successfully submitted captcha
        }
      } catch (error: any) {
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

async function solveCaptchaWithRetry(page: any): Promise<boolean> {
  try {
    console.log("entering solveCaptchaWithRetry");

    // Get the iframe element
    const iframeElement = await page.$(frame_selector);
    const frame = await iframeElement?.contentFrame();

    if (frame) {
      return await solvaCaptcha(frame);
    } else {
      console.log("Iframe content frame not found");
      return false;
    }
  } catch (error) {
    console.error("Error solving captcha:", error);
    return false;
  }
}
