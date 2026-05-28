import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { spawn } from "child_process";
import logger from "../utils/logger.js";

export const runGoogleMapsScraper = async ({
  queries,
  depth,
  concurrency = 1,
  extractEmails = false,
}) => {
  return new Promise(async (resolve, reject) => {
    let settled = false;
    let dockerProcess = null;
    let killFallbackTimeout = null;

    const jobId = crypto.randomUUID();
    const tempDir = path.resolve(process.cwd(), "temp", jobId);
    const outputDir = path.resolve(process.cwd(), "gmaps-output", jobId);
    const queryFilePath = path.resolve(tempDir, "queries.txt");
    const resultFilePath = path.resolve(outputDir, "results.json");

    const cleanup = async () => {
      try {
        if (killFallbackTimeout) clearTimeout(killFallbackTimeout);
      } catch {}
      try {
        if (dockerProcess && !dockerProcess.killed) {
          dockerProcess.kill("SIGKILL");
        }
      } catch {}
      try {
        dockerProcess?.removeAllListeners();
      } catch {}
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch {}
      try {
        await fs.rm(outputDir, { recursive: true, force: true });
      } catch {}
    };

    try {
      if (!Array.isArray(queries) || queries.length === 0) {
        throw new Error("Queries required");
      }

      await fs.mkdir(tempDir, { recursive: true });
      await fs.mkdir(outputDir, { recursive: true });

      const queryContent = queries.join("\n");
      await fs.writeFile(queryFilePath, queryContent, "utf-8");

      const dockerArgs = [
        "run",
        "--rm",
        "--init",
        // Log overhead chota karo taaki VM processes heavily memory block na karein
        "--log-opt", "max-size=1m",
        "-e", `HOME=/tmp/${jobId}`,
        "-v", "gmaps-playwright-cache:/opt",
        "-v", `${queryFilePath}:/queries.txt:ro`,
        "-v", `${outputDir}:/out`,
        "gosom/google-maps-scraper",
        "-input", "/queries.txt",
        "-json",
        "-results", "/out/results.json",
        "-depth", String(depth),
        "-c", String(concurrency),
        "-exit-on-inactivity", "3m", // Official engine baseline requirement
      ];

      if (extractEmails) {
        dockerArgs.push("-email");
      }

      dockerProcess = spawn("docker", dockerArgs, {
        stdio: "ignore",
      });

      logger.info(`[SCRAPER SPAWNED]: Job ${jobId}`);


      // SAFETY NET: Safe side backup fallback timeout
      killFallbackTimeout = setTimeout(
        async () => {
          if (settled) return;
          settled = true;
          logger.error(
            `[TIMEOUT]: Docker daemon hung for Job ${jobId}. Forcing cleanup.`,
          );
          await cleanup();
          reject(new Error("DOCKER_RUN_TIMEOUT"));
        },
        12 * 60 * 1000,
      );

      // PROCESS ERROR
      dockerProcess.on("error", async (error) => {
        if (settled) return;
        settled = true;
        logger.error(`[SCRAPER ERROR]: ${error.message}`);
        await cleanup();
        reject(error);
      });

      // PROCESS EXIT
      dockerProcess.on("exit", async (code) => {
        if (settled) return;

        try {
          console.log(`[SCRAPER CLOSED INSTANTLY]: Exit code ${code}`);

          if (code !== 0 && code !== null) {
            throw new Error(`Docker exited with code ${code}`);
          }

          await new Promise((r) => setTimeout(r, 400));

          await fs.access(resultFilePath);
          const rawData = await fs.readFile(resultFilePath, "utf-8");

          let parsedData = [];

          try {
            parsedData = JSON.parse(rawData);
            if (!Array.isArray(parsedData)) {
              parsedData = [parsedData];
            }
          } catch {
            parsedData = rawData
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
          }

          settled = true;
          resolve(parsedData);
          await cleanup();
        } catch (e) {
          if (settled) return;
          settled = true;
          logger.error("SCRAPER PROCESSING EXCEPTION", { error: e.message });
          await cleanup();
          reject(e);
        }
      });
    } catch (e) {
      if (settled) return;
      settled = true;
      await cleanup();
      reject(e);
    }
  });
};