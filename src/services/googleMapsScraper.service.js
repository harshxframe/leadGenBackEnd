import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { spawn } from "child_process";

export const runGoogleMapsScraper = async (query, leadLimit) => {
  return new Promise(async (resolve, reject) => {
    try {
      // UNIQUE JOB ID
      const jobId = crypto.randomUUID();

      // PATHS
      const tempDir = path.join(process.cwd(), "temp", jobId);

      const outputDir = path.join(process.cwd(), "gmaps-output", jobId);

      // CREATE FOLDERS
      await fs.mkdir(tempDir, {
        recursive: true,
      });

      await fs.mkdir(outputDir, {
        recursive: true,
      });

      // QUERY FILE
      const queryFilePath = path.join(tempDir, "queries.txt");

      // RESULT FILE
      const resultFilePath = path.join(outputDir, "results.json");

      // WRITE QUERY
      await fs.writeFile(queryFilePath, query);

      // DOCKER COMMAND
      const dockerProcess = spawn("docker", [
        "run",

        "--rm",

        "--platform",
        "linux/amd64",

        "-v",
        "gmaps-playwright-cache:/opt",

        "-v",
        `${queryFilePath}:/queries.txt:ro`,

        "-v",
        `${outputDir}:/out`,

        "gosom/google-maps-scraper",

        "-input",
        "/queries.txt",

        "-json",

        "-results",
        "/out/results.json",

        "-depth",
        String(`${leadLimit}`),

        "-email",

        "-exit-on-inactivity",
        "5m",
      ]);

      console.log("RUNNING SCRAPER...");

      dockerProcess.stdout.on("data", (data) => {
        console.log(`[SCRAPER STDOUT]: ${data.toString()}`);
      });

      dockerProcess.stderr.on("data", (data) => {
        console.log(`[SCRAPER STDERR]: ${data.toString()}`);
      });

      dockerProcess.on("error", (error) => {
        console.log(`[SCRAPER ERROR]: ${error.message}`);

        reject(error);
      });

      dockerProcess.on("close", async (code) => {
        try {
          console.log(`[SCRAPER CLOSED]: Exit code ${code}`);

          // READ RESULTS
          const rawData = await fs.readFile(resultFilePath, "utf-8");

          // PARSE NDJSON
          const parsedData = rawData
            .split("\n")
            .filter((line) => line.trim() !== "")
            .map((line) => {
              try {
                return JSON.parse(line);
              } catch {
                return null;
              }
            })
            .filter(Boolean);

          // CLEANUP
          await fs.rm(tempDir, {
            recursive: true,
            force: true,
          });

          await fs.rm(outputDir, {
            recursive: true,
            force: true,
          });

          resolve(parsedData);
        } catch (e) {
          // CLEANUP EVEN ON ERROR
          await fs.rm(tempDir, {
            recursive: true,
            force: true,
          });

          await fs.rm(outputDir, {
            recursive: true,
            force: true,
          });

          reject(e);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};
