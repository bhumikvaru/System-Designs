const axios = require("axios");

const serviceCall = async () => {
  try {
    const response = await axios.get("https://dpd.kore.ai/testingflow/");
    console.log("API response received:", response.data[0]);
    return response.data;
  } catch (err) {
    console.error("Error in API call:", err.message);
  }
};

let counter = 0;
// serviceCall();
const fillBucket = (bucketSize) => {
  if (counter < bucketSize) {
    counter++; // Increment the token count one by one until it reaches the bucket size
    console.log("Token added, current tokens available:", counter);
  }
};

const fixedBucket = (bucketSize, refillRate) => {
  fillBucket(bucketSize);
  console.log("Initial bucket filled.");

  setInterval(() => {
    fillBucket(bucketSize);
  }, refillRate * 1000);

  let numOfCall = 50;
  let inProgress = false; // Track if a request is in progress

  //   let allowedflag = false;

  //   setInterval(() => {
  //     allowedflag = true;
  //   }, 1000);

  let attemptApiCall = async () => {
    if (numOfCall > 0 && counter > 0 && !inProgress) {
      inProgress = true;
      console.log(
        "Token consumed, requestid, remaining tokens:",
        numOfCall,
        counter
      );
      await serviceCall();
      counter--;
      numOfCall--;
      console.log("Remaining tokens after consumption:", counter);
      inProgress = false; // Reset the flag

      // Attempt to call again after a delay
      setTimeout(attemptApiCall, 1000);
    } else if (numOfCall == 0) {
      console.log("All requests made");
    } else {
      console.log("No tokens available, waiting...");
      setTimeout(attemptApiCall, 1000);
      setTimeout(attemptApiCall, 1000); // Try again after a delay
    }
  };
  attemptApiCall();
  //put the token in the bucket
};

fixedBucket(5, 2);
