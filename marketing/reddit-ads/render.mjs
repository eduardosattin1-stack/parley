import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import path from 'node:path';
const dir = path.dirname(new URL(import.meta.url).pathname);
const jobs = [
  ['ask', 960, 1200, 1, '4x5-ask-parley'],
  ['present', 960, 1200, 1, '4x5-be-present'],
  ['formats', 1200, 1200, 1, '1x1-notes-fit-occasion'],
  ['decision', 1000, 524, 2, '1.91x1-never-lose-a-decision'],
];
const browser = await chromium.launch();
for (const [name, w, h, dpr, out] of jobs) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
  await page.goto('file://' + path.join(dir, 'src', name + '.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(dir, out + '.png') });
  await page.close();
}
await browser.close();
