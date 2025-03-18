const cron = require("node-cron");
const { sendNewsSummaries } = require("../controllers/news.controller");

const scheduleNewsSummaries = () => {

    cron.schedule("0 8 * * 1", async () => {
        console.log("Running weekly news summary job...");
        try {
            await sendNewsSummaries();
            console.log("Weekly news summary sent successfully.");
        } catch (error) {
            console.error("Error sending weekly news summary:", error.message);
        }
    });
};

module.exports = { scheduleNewsSummaries };
