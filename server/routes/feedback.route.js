const express = require("express");
const router = express.Router();
const { 
    submitFeedback,
    getAllFeedback,
    updateFeedbackStatus
} = require("../controllers/feedback.controller");

router.post("/submitfeedback", submitFeedback);
router.post("/getfeedback", getAllFeedback);
router.put("/updatefeedback", updateFeedbackStatus);

module.exports = router;
