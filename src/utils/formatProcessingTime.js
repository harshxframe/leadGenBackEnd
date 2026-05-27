export const formatProcessingTime = (
  createdAt,
  updatedAt,
) => {
  try {
    const start =
      new Date(createdAt).getTime();

    const end =
      new Date(updatedAt).getTime();

    if (
      Number.isNaN(start) ||
      Number.isNaN(end)
    ) {
      return "Unknown";
    }

    const diffMs = end - start;

    const totalSeconds = Math.floor(
      diffMs / 1000,
    );

    const hours = Math.floor(
      totalSeconds / 3600,
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60,
    );

    const seconds =
      totalSeconds % 60;

    // 1h 12m 5s
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }

    // 12m 5s
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }

    // 45s
    return `${seconds}s`;
  } catch (e) {
    return "Unknown";
  }
};