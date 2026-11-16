const TOTAL_REQUESTS = 10;
const BYTES_IN_MB = 1024 * 1024;

const url = process.argv[2];

if (!url) {
  console.error("Usage: node benchmark.js <url>");
  process.exit(1);
}

const download = async (url, requestNumber) => {
  const startTime = performance.now();

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    // Дожидаемся полного получения тела ответа
    const buffer = await response.arrayBuffer();

    const endTime = performance.now();

    const duration = endTime - startTime;
    const size = buffer.byteLength;

    console.log(
      `Request ${requestNumber}: ${(duration / 1000).toFixed(2)}s | ` +
        `${(size / BYTES_IN_MB).toFixed(2)} MB`
    );

    return { duration, size };
  } catch (error) {
    console.error(`Request ${requestNumber} failed:`, error.message);
    return null;
  }
};

const main = async () => {
  console.log(`Starting benchmark: ${url}`);
  console.log(`Total requests: ${TOTAL_REQUESTS}\n`);

  const results = [];

  for (let i = 1; i <= TOTAL_REQUESTS; i++) {
    const result = await download(url, i);

    if (result) {
      results.push(result);
    }
  }

  if (results.length === 0) {
    console.error("\nAll requests failed.");
    process.exitCode = 1;
    return;
  }

  const totalDuration = results.reduce(
    (sum, result) => sum + result.duration,
    0
  );

  const totalSize = results.reduce((sum, result) => sum + result.size, 0);

  const averageDuration = totalDuration / results.length;
  const totalSeconds = totalDuration / 1000;
  const totalMB = totalSize / BYTES_IN_MB;

  // Общий объём / суммарное время скачивания
  const downloadSpeed = totalMB / totalSeconds;

  console.log("\n========== RESULTS ==========");
  console.log(`Successful requests: ${results.length}/${TOTAL_REQUESTS}`);
  console.log(`Average request time: ${(averageDuration / 1000).toFixed(2)} s`);
  console.log(`Total downloaded: ${totalMB.toFixed(2)} MB`);
  console.log(`Total download time: ${totalSeconds.toFixed(2)} s`);
  console.log(`Average download speed: ${downloadSpeed.toFixed(2)} MB/s`);
  console.log("=============================");
};

main();
