import fs from "fs";
import path from "path";

const key = process.argv[2];
const compareKey = process.argv[3];

function getFileNames(dir: fs.PathLike) {
  return fs.readdirSync(dir).filter(function (file) {
    return file.endsWith(".json");
  });
}

function getJsonFromFile(directory: string, fileName: string) {
  return JSON.parse(fs.readFileSync(path.join(directory, fileName), "utf8"));
}

function getAverageFromData(data: any) {
  const sum = {
    "first-contentful-paint": 0,
    "largest-contentful-paint": 0,
    "speed-index": 0,
    "total-blocking-time": 0,
    interactive: 0,
    "cumulative-layout-shift": 0,
    "server-response-time": 0,
    performance: 0,
  };
  data.forEach((item: { [x: string]: number }) => {
    sum["first-contentful-paint"] += item["first-contentful-paint"];
    sum["largest-contentful-paint"] += item["largest-contentful-paint"];
    sum["speed-index"] += item["speed-index"];
    sum["total-blocking-time"] += item["total-blocking-time"];
    sum["interactive"] += item["interactive"];
    sum["cumulative-layout-shift"] += item["cumulative-layout-shift"];
    sum["server-response-time"] += item["server-response-time"];
    sum["performance"] += item["performance"] * 100;
  });
  return {
    "first-contentful-paint": sum["first-contentful-paint"] / data.length,
    "largest-contentful-paint": sum["largest-contentful-paint"] / data.length,
    "speed-index": sum["speed-index"] / data.length,
    "total-blocking-time": sum["total-blocking-time"] / data.length,
    interactive: sum["interactive"] / data.length,
    "cumulative-layout-shift": sum["cumulative-layout-shift"] / data.length,
    "server-response-time": sum["server-response-time"] / data.length,
    performance: sum["performance"] / data.length,
  };
}

function createDataFromFileNames(directory: string, fileNames: string[]) {
  return fileNames.map((fileName) => {
    const json = getJsonFromFile(directory, fileName);
    return {
      "first-contentful-paint":
        json.audits["first-contentful-paint"].numericValue,
      "largest-contentful-paint":
        json.audits["largest-contentful-paint"].numericValue,
      "speed-index": json.audits["speed-index"].numericValue,
      "total-blocking-time": json.audits["total-blocking-time"].numericValue,
      interactive: json.audits["interactive"].numericValue,
      "cumulative-layout-shift":
        json.audits["cumulative-layout-shift"].numericValue,
      "server-response-time": json.audits["server-response-time"].numericValue,
      performance: json.categories["performance"].score,
    };
  });
}

function compareData(
  before: { [x: string]: number },
  after: { [x: string]: number }
) {
  const result: Record<string, number> = {};
  Object.keys(before).forEach((key) => {
    result[key] = after[key] - before[key];
  });
  return result;
}

const reportDir = path.join(__dirname, `../reports/${key}`);
const reportFileNames = getFileNames(reportDir);
const reportData = createDataFromFileNames(reportDir, reportFileNames);
const reportAverage = getAverageFromData(reportData);

console.log(reportDir);
console.table(reportData);
console.log("-------------average-------------");
console.table([reportAverage]);

if (compareKey) {
  const compareReportDir = path.join(__dirname, `../reports/${compareKey}`);
  const compareReportFileNames = getFileNames(compareReportDir);
  const compareReportData = createDataFromFileNames(
    compareReportDir,
    compareReportFileNames
  );
  const compareReportAverage = getAverageFromData(compareReportData);
  console.log("-------------compare-------------");
  console.log(compareReportDir);
  console.table(compareReportData);
  console.log("-------------compare average-------------");
  console.table([compareReportAverage]);

  console.log("-------------diff-------------");
  console.table([compareData(reportAverage, compareReportAverage)]);
}
