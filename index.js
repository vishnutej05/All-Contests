const express = require("express");
const axios = require("axios");
const moment = require("moment-timezone");

const app = express();

// Define a route to fetch contests starting from today for specific hosts
app.get("/contests", async (req, res) => {
  try {
    // Make a GET request to the API endpoint using axios
    const response = await axios.get(
      "https://clist.by:443/api/v4/contest/?upcoming=true",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "ApiKey bhargavannaop:83b253f675db5479ac40165b1a9b49d00d5098b4",
        },
      }
    );

    // Check if the request was successful
    if (response.status !== 200) {
      throw new Error("Failed to fetch contest data");
    }

    // Parse the JSON response
    const data = response.data;

    // Define the specific hosts to include
    const allowedHosts = [
      "leetcode.com",
      "hackerrank.com",
      "codeforces.com",
      "codechef.com",
      "spoj.com",
    ];

    // Filter contests to include only the ones hosted by allowed hosts
    const filtered = data.objects.filter((contest) => {
      return allowedHosts.includes(contest.host);
    });

    // Get the current date and time
    const currentDateTime = moment().tz("Asia/Kolkata");

    // Filter contests into current and upcoming arrays
    const currentContests = [];
    const upcomingContests = [];

    filtered.forEach((contest) => {
      const contestStartDateTime = moment.utc(contest.start).tz("Asia/Kolkata");
      const contestEndDateTime = moment.utc(contest.end).tz("Asia/Kolkata");
      if (
        currentDateTime.isBetween(
          contestStartDateTime,
          contestEndDateTime,
          null,
          "[]"
        )
      ) {
        currentContests.push(formatContest(contest));
      } else {
        upcomingContests.push(formatContest(contest));
      }
    });

    // Sort contests based on their start dates
    currentContests.sort((a, b) => {
      return moment.utc(a.start).diff(moment.utc(b.start));
    });

    upcomingContests.sort((a, b) => {
      return moment.utc(a.start).diff(moment.utc(b.start));
    });

    // Send the transformed and sorted contest data as the response
    res.json({
      "Ongoing Contests": currentContests,
      "upcoming Contests": upcomingContests,
    });
  } catch (error) {
    // Handle any errors that occur during the fetch operation
    console.error("Error fetching contests:", error);
    res.status(500).json({
      error: "An error occurred while fetching contests",
    });
  }
});

// Function to format contest data
function formatContest(contest) {
  // Calculate duration in years, months, days, and hours
  const durationSeconds = contest.duration;
  const years = Math.floor(durationSeconds / (365 * 24 * 3600));
  const months = Math.floor(
    (durationSeconds % (365 * 24 * 3600)) / (30 * 24 * 3600)
  );
  const days = Math.floor((durationSeconds % (30 * 24 * 3600)) / (24 * 3600));
  const hours = Math.floor((durationSeconds % (24 * 3600)) / 3600);

  // Construct the formatted duration string
  let formattedDuration = "";
  if (years > 0) {
    formattedDuration += `${years} years `;
  }
  if (months > 0) {
    formattedDuration += `${months} months `;
  }
  if (days > 0) {
    formattedDuration += `${days} days `;
  }
  if (hours > 0) {
    formattedDuration += `${hours} hours`;
  }

  // Format start and end times
  const start = moment
    .utc(contest.start)
    .tz("Asia/Kolkata")
    .format("YYYY-MM-DD HH:mm:ss");
  const end = moment
    .utc(contest.end)
    .tz("Asia/Kolkata")
    .format("YYYY-MM-DD HH:mm:ss");

  return {
    contest: contest.event,
    host: contest.host,
    duration: formattedDuration.trim(),
    start,
    end,
    href: contest.href,
  };
}

// Start the Express server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
