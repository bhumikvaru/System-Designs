import { redis } from "./redis-client.js";
import { isAllowed as fixedWindowAllowed } from "./fixed-window.js";
import { slidingWindowAllowed } from "./sliding-window.js";
import { leakyBucketAllowed } from "./leakyBucketAllowed.js";

const USER_ID = "user-123";
const LIMIT = 3;
const WINDOW = 10; // seconds

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function reset() {
  await redis.flushAll();
  console.log("\n--- Redis reset ---\n");
}

/**
 * TEST 1
 * Burst at window boundary
 * Exposes Fixed Window weakness
 */
async function boundaryBurstTest() {
  console.log("=== TEST 1: Boundary Burst ===");
  console.log("Limit = 3 requests / 10 seconds\n");

  // First burst
  for (let i = 1; i <= 3; i++) {
    console.log(
      `Req ${i}`,
      "FW:", await fixedWindowAllowed(USER_ID, LIMIT, WINDOW, redis),
      "SW:", await slidingWindowAllowed(USER_ID, LIMIT, WINDOW, redis),
      "LB:", await leakyBucketAllowed(USER_ID, LIMIT, 1, redis)
    );
  }

  // Cross boundary slightly
  await sleep(200);

  // Second burst
  for (let i = 4; i <= 6; i++) {
    console.log(
      `Req ${i}`,
      "FW:", await fixedWindowAllowed(USER_ID, LIMIT, WINDOW, redis),
      "SW:", await slidingWindowAllowed(USER_ID, LIMIT, WINDOW, redis),
      "LB:", await leakyBucketAllowed(USER_ID, LIMIT, 1, redis)
    );
  }
}

/**
 * TEST 2
 * Smooth traffic
 * Shows Sliding Window fairness
 */
async function smoothTrafficTest() {
  console.log("\n=== TEST 2: Smooth Traffic ===");
  console.log("1 request every 3 seconds\n");

  for (let i = 1; i <= 4; i++) {
    console.log(
      `Req ${i}`,
      "FW:", await fixedWindowAllowed(USER_ID, LIMIT, WINDOW, redis),
      "SW:", await slidingWindowAllowed(USER_ID, LIMIT, WINDOW, redis),
      "LB:", await leakyBucketAllowed(USER_ID, LIMIT, 1, redis)
    );
    await sleep(3000);
  }
}

/**
 * TEST 3
 * Sudden spike
 * Shows Leaky Bucket smoothing
 */
async function suddenSpikeTest() {
  console.log("\n=== TEST 3: Sudden Spike ===");
  console.log("5 instant requests, then wait\n");

  for (let i = 1; i <= 5; i++) {
    console.log(
      `Req ${i}`,
      "FW:", await fixedWindowAllowed(USER_ID, LIMIT, WINDOW, redis),
      "SW:", await slidingWindowAllowed(USER_ID, LIMIT, WINDOW, redis),
      "LB:", await leakyBucketAllowed(USER_ID, LIMIT, 1, redis)
    );
  }

  console.log("\nWaiting 4 seconds for bucket to drain...\n");
  await sleep(4000);

  console.log(
    "After wait",
    "FW:", await fixedWindowAllowed(USER_ID, LIMIT, WINDOW, redis),
    "SW:", await slidingWindowAllowed(USER_ID, LIMIT, WINDOW, redis),
    "LB:", await leakyBucketAllowed(USER_ID, LIMIT, 1, redis)
  );
}

/**
 * RUN ALL TESTS
 */
async function run() {
  await reset();
  await boundaryBurstTest();

  await reset();
  await smoothTrafficTest();

  await reset();
  await suddenSpikeTest();

  process.exit(0);
}

run();
