require("dotenv").config();
const app = require("./app");
const port = process.env.PORT || 3000;
const cron = require("node-cron");
const axios = require("axios");

//Cron to sync /api/sync

// every minute testing * * * * *
// every 3 hours 0 */3 * * *
cron.schedule("0 */3 * * *", async () => {
  console.log("Running scheduled sync task every 6 hours");
  console.log("Current time:", new Date().toLocaleString());

  try {
    // Call your own API endpoint
    const response = await axios.get(`http://localhost:${port}/api/meals/sync`);
    if (response.status !== 200) {
      throw new Error("Failed to sync meals");
    }
    console.log("Sync completed successfully:", response.data);
  } catch (error) {
    console.error("Sync failed:", error.message);
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
  console.log("http://localhost:3000");
});
