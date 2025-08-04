const express = require("express");
const axios = require("axios");

const CircuitBreaker = require("opossum");

const app = express();
const port = 3000;

const posts = [
  { id: 1, content: "Hello World!", userId: 1 },
  { id: 2, content: "Learning Circuit Breakers", userId: 1 },
];

const breakerOptions = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 10000,
};

const profileServiceBreaker = new CircuitBreaker(async (userId) => {
  const response = await axios.get(
    `http://localhost:3001/profile/${userId}`
  );
  console.log("here")
  return response.data;
}, breakerOptions);

profileServiceBreaker.fallback(() => ({
  id: null,
  username: "Unknown",
  error: "Profile service unavailable",
}));

profileServiceBreaker.on("open", () => console.log("Circuit breaker opened"));
profileServiceBreaker.on("halfOpen", () =>
  console.log("Circuit breaker half-open")
);
profileServiceBreaker.on("close", () => console.log("Circuit breaker closed"));

app.get("/posts", async (req, res) => {
  const enrichedPosts = await Promise.all(
    posts.map(async (post) => {
      try {
        const profile = await profileServiceBreaker.fire(post.userId);
        return { ...post, profile };
      } catch (error) {
        return {
          ...post,
          profile: {
            id: null,
            username: "Unknown",
            error: "Failed to fetch profile",
          },
        };
      }
    })
  );
  res.json(enrichedPosts);
});
app.listen(port, () => {
  console.log(`Post service running at http://localhost:${port}`);
});
