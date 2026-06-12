import { responseBody } from "../utils/responseBody.js";
import si from "systeminformation";

export const systemHealthMiddleware = async (req, res) => {
  try {
    // Fetch host metrics concurrently
    const [mem, cpu, os, time] = await Promise.all([
      si.mem(),
      si.currentLoad(),
      si.osInfo(),
      si.time(),
    ]);

    // Build the system information payload
    const systemInfo = {
      status: "UP",
      timestamp: new Date().toISOString(),
      process: {
        pid: process.pid,
        uptime: Math.floor(process.uptime()), // Seconds
        memoryUsage: {
          heapUsed:
            (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + " MB",
          rss: (process.memoryUsage().rss / 1024 / 1024).toFixed(2) + " MB",
        },
      },
      system: {
        platform: os.platform,
        distro: `${os.distro} ${os.release}`,
        systemUptime: time.uptime,
        cpu: {
          cores: cpu.cpus.length,
          currentLoad: cpu.currentLoad.toFixed(1) + "%",
        },
        memory: {
          total: (mem.total / 1024 / 1024 / 1024).toFixed(2) + " GB",
          free: (mem.free / 1024 / 1024 / 1024).toFixed(2) + " GB",
        },
      },
    };

    return res.status(200).send(
      responseBody(false, true, 200, "Health is Okay", {
        systemInfo: systemInfo,
      }),
    );
  } catch (error) {
    return res
      .status(500)
      .send(
        responseBody(
          true,
          false,
          500,
          `Health is not Ok, ${error.message}`,
          {},
        ),
      );
  }
};
