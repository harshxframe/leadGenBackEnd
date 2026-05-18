export function parseJsonItems(obj) {
  const parsedData = obj
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => JSON.parse(line));
  return parsedData;
}
