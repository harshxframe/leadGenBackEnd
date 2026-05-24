import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { spawn } from "child_process";

export const runGoogleMapsScraper = async ({
  queries,
  depth,
  concurrency = 1,
  extractEmails = false,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      // UNIQUE JOB ID
      const jobId = crypto.randomUUID();

      // PATHS
      const tempDir = path.join(
        process.cwd(),
        "temp",
        jobId,
      );

      const outputDir = path.join(
        process.cwd(),
        "gmaps-output",
        jobId,
      );

      // CREATE FOLDERS
      await fs.mkdir(tempDir, {
        recursive: true,
      });

      await fs.mkdir(outputDir, {
        recursive: true,
      });

      // QUERY FILE
      const queryFilePath = path.join(
        tempDir,
        "queries.txt",
      );

      // RESULT FILE
      const resultFilePath = path.join(
        outputDir,
        "results.json",
      );

      // MULTI QUERY SUPPORT
      // one query per line
      const queryContent = queries.join("\n");

      // WRITE QUERY FILE
      await fs.writeFile(
        queryFilePath,
        queryContent,
      );

      // DOCKER ARGS
      const dockerArgs = [
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
        String(depth),

        "-c",
        String(concurrency),

        "-exit-on-inactivity",
        "5m",
      ];

      // OPTIONAL EMAIL EXTRACTION
      if (extractEmails) {
        dockerArgs.push("-email");
      }

      // START DOCKER
      const dockerProcess = spawn(
        "docker",
        dockerArgs,
      );

      console.log("RUNNING SCRAPER...");

      // STDOUT
      dockerProcess.stdout.on(
        "data",
        (data) => {
          console.log(
            `[SCRAPER STDOUT]: ${data.toString()}`,
          );
        },
      );

      // STDERR
      dockerProcess.stderr.on(
        "data",
        (data) => {
          console.log(
            `[SCRAPER STDERR]: ${data.toString()}`,
          );
        },
      );

      // PROCESS ERROR
      dockerProcess.on(
        "error",
        async (error) => {
          console.log(
            `[SCRAPER ERROR]: ${error.message}`,
          );

          // CLEANUP
          await fs.rm(tempDir, {
            recursive: true,
            force: true,
          });

          await fs.rm(outputDir, {
            recursive: true,
            force: true,
          });

          reject(error);
        },
      );

      // PROCESS CLOSE
      dockerProcess.on(
        "close",
        async (code) => {
          try {
            console.log(
              `[SCRAPER CLOSED]: Exit code ${code}`,
            );

            // EXIT CODE CHECK
            if (code !== 0) {
              throw new Error(
                `Docker exited with code ${code}`,
              );
            }

            // CHECK RESULT FILE EXISTS
            await fs.access(resultFilePath);

            // READ RESULTS
            const rawData = await fs.readFile(
              resultFilePath,
              "utf-8",
            );

            let parsedData = [];

            // SUPPORT BOTH:
            // JSON ARRAY
            // NDJSON
            try {
              parsedData = JSON.parse(rawData);

              // IF SINGLE OBJECT
              if (
                !Array.isArray(parsedData)
              ) {
                parsedData = [parsedData];
              }
            } catch {
              parsedData = rawData
                .split("\n")
                .filter(
                  (line) =>
                    line.trim() !== "",
                )
                .map((line) => {
                  try {
                    return JSON.parse(line);
                  } catch {
                    return null;
                  }
                })
                .filter(Boolean);
            }

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
            // CLEANUP ON ERROR
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
        },
      );
    } catch (e) {
      reject(e);
    }
  });
};

