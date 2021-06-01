import { chromium } from "playwright";
import coordinates from "./coordinates.js";
import { parse } from "dotenv";
import { readFileSync } from "fs";

const envConfig = parse(readFileSync(".env.local"));

const boundsDiff = [0.036, 0.0138];
const getBounds = (x, y) => {
  return [
    Number(x) - boundsDiff[0],
    Number(y) - boundsDiff[1],
    Number(x) + boundsDiff[0],
    Number(y) + boundsDiff[1],
  ];
};

const getNaverURL = (x, y) => {
  return `https://m.place.naver.com/rest/vaccine?x=${x}&y=${y}&bounds=${getBounds(
    x,
    y
  ).join("%3B")}`;
};

const INTERVAL = envConfig.INTERVAL || 5000;
const NAVER_ID = envConfig.NAVER_ID;
const NAVER_PW = envConfig.NAVER_PW;

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const loginPage = await context.newPage();
  await loginPage.goto("https://nid.naver.com/nidlogin.login");
  await loginPage.fill("#id_area #id", NAVER_ID);
  await loginPage.fill("#pw_area #pw", NAVER_PW);
  await loginPage.click('input.btn_global[type="submit"]');
  await loginPage.waitForNavigation();

  const page = await context.newPage();
  await page.addInitScript({ path: "./browserScript.js" });
  await page.goto(getNaverURL(coordinates[0][0], coordinates[0][1]));

  setInterval(() => {
    console.log(`LOG: running interval every ${INTERVAL}s`);
    coordinates
      .map((coordinate) => {
        return page.evaluate(async (arg) => {
          const [x, y, label] = arg;
          try {
            const res = await getVaccineList(x, y).then((res) => res.json());
            const businesses = res[0].data.rests.businesses.items;
            const filteredBussinesses = businesses
              .filter((b) => b.vaccineQuantity.quantityStatus !== "empty")
              .sort(
                (a, b) =>
                  Number(b.vaccineQuantity.quantity) -
                  Number(a.vaccineQuantity.quantity)
              );
            const businessHasVaccine = filteredBussinesses[0];
            return businessHasVaccine
              ? arg.concat(businessHasVaccine)
              : ["not found", "", label];
          } catch (e) {
            return ["error", e, label];
          }
        }, coordinate);
      })
      .map(async (resultPromise) => {
        const result = await resultPromise;

        if (result[0] !== "error" && result[0] !== "not found") {
          const [x, y, label, business] = result;
          const url = `${getNaverURL(x, y)}`;
          try {
            const vaccinePage = await context.newPage();
            await vaccinePage.goto(url);
            // click check button on the bottom-left
            const isAvailable = await vaccinePage.evaluate(() => {
              const checkButton = document.querySelector(
                '#_list_scroll_container a[role="button"] svg path[d^="M1 16H0V0h12v1H1v14h14V6h1v10H1zm6"]'
              ).parentElement.parentElement;
              if (checkButton) {
                checkButton.click();
                return true;
              }
            });
            // wait for ui to be toggled for available hospital.
            await vaccinePage.waitForTimeout(100);

            if (!isAvailable) {
              return;
            }

            // click and wait for ui to be toggled for current hospital.
            await vaccinePage.click("._ui_control_target");
            await vaccinePage.waitForTimeout(100);

            // click for submit button
            await vaccinePage.evaluate(() => {
              const submitButton = Array.from(
                document.querySelectorAll(
                  'div[role="main"] div[data-nclicks-area-code] a[role="button"]'
                )
              ).find((e) => e.textContent === "접종 예약신청");
              if (submitButton) {
                submitButton.click();
              }
            });
            await vaccinePage.waitForNavigation();
          } catch (e) {
            console.warn(e);
          }
          console.log(label, url);
        } else {
          console.log(result);
        }
      });
  }, INTERVAL * 1000);
})();
