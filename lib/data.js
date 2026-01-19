import fs from "fs";
import path from "path";

export function loadJSON(fileName) {
  const filePath = path.join(process.cwd(), "data", fileName);
  const jsonData = fs.readFileSync(filePath, "utf8");
  return JSON.parse(jsonData);
}
