const cron = require("node-cron");
const { fetchAndStoreNews, fetchAndStoreHeadlines } = require("../services/news.service");

const scheduleNewsFetching = async () => {

    // try {
    //     console.log("Running news fetching immediately on startup...");
    //     await fetchAndStoreNews();
    //     await fetchAndStoreHeadlines();
    //     console.log("Initial news fetching completed!");
    // } catch (error) {
    //     console.error("Error in initial news fetching:", error.message);
    // }

    cron.schedule("0 */3 * * *", async () => {
        console.log("Fetching news every 3 hours...");
        try {
            await fetchAndStoreNews();
            await fetchAndStoreHeadlines();
            console.log("News fetching and storing completed!");
        } catch (error) {
            console.error("Error in scheduled news fetching:", error.message);
        }
    });
};

module.exports = { scheduleNewsFetching };
