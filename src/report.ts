const fs = require("fs");
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");

const key = process.argv[2];
const url = process.argv[3];

if (!fs.existsSync(`reports/${key}`)) {
  fs.mkdirSync(`reports/${key}`, { recursive: true });
}

fs.readdirSync(`reports/${key}`).forEach((file: File) => {
  fs.unlinkSync(`reports/${key}/${file}`);
});

(async () => {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
  const options = {
    logLevel: "info",
    output: "json",
    onlyCategories: ["performance"],
    port: chrome.port,
  };

  for (let i = 1; i <= 10; i++) {
    const runnerResult = await lighthouse(url, options);
    const lhReport = runnerResult.report;
    fs.writeFileSync(`reports/${key}/lhReport_${i}.json`, lhReport);
    console.log(
      "Performance score was",
      runnerResult.lhr.categories.performance.score * 100
    );
  }
  await chrome.kill();
})();
