import path from "path";
import fs from "fs-extra";
import xlsx from "xlsx";

const excelFolderPath = path.join(__dirname, "../../csv/parents");
const outputFolderPath = path.join(__dirname, "../../parents");

async function convertXLSXtoJSON(excelFilePath: string, outputFilePath: string) {
  try {
    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    await fs.writeFile(outputFilePath, JSON.stringify(jsonData, null, 2));
    console.log(`Excel file ${excelFilePath} converted to JSON successfully.`);
  } catch (err) {
    console.error(`Error converting ${excelFilePath} to JSON:`, err);
  }
}

export async function convertAllXLSXFiles() {
  try {
    const excelFiles = await fs.readdir(excelFolderPath);
    await fs.ensureDir(outputFolderPath);
    for (const file of excelFiles) {
      if (file.endsWith(".xlsx")) {
        const excelFilePath = path.join(excelFolderPath, file);
        const jsonFilePath = path.join(outputFolderPath, file.replace(".xlsx", ".json"));

        await convertXLSXtoJSON(excelFilePath, jsonFilePath);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}
