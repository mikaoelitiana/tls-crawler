// For more information, see https://crawlee.dev/
import "dotenv/config";
import { PlaywrightCrawler, ProxyConfiguration, utils } from "crawlee";
import FormData from "form-data";
import fs from "fs";
import fetch from "node-fetch";

const startUrls = ["https://visas-fr.tlscontact.com/visa/mg/mgTNR2fr/home"];

const crawler = new PlaywrightCrawler({
  proxyConfiguration: new ProxyConfiguration({
    proxyUrls: [process.env.PROXY_URL || ""],
  }),
  async requestHandler({ page }) {
    await page.getByText("SE CONNECTER").click();
    await page.locator("#username").fill(process.env.TLS_USERNAME || "");
    await page.locator("#password").fill(process.env.TLS_PASSWORD || "");
    await page.locator("#kc-login").click();
    await page.getByText("VOIR LE GROUPE").click();
    await page.getByText("Prendre rendez-vous").click();
    await page.waitForTimeout(20000);
    await utils.playwright.saveSnapshot(page);
    await uploadPicture();
  },
  headless: false,
});

await crawler.run(startUrls);

async function uploadPicture() {
  try {
    const form = new FormData();
    form.append(
      "picture",
      fs.createReadStream("storage/key_value_stores/default/SNAPSHOT.jpg.jpeg")
    );
    await fetch(process.env.ENDPOINT_URL || "", {
      method: "POST",
      body: form,
    });
  } catch (e) {
    console.error("[Upload Picture]", e);
  }
}
