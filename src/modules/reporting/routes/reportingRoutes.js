const express = require("express");
const ReportingController = require("../controllers/reportingController.js");
const authentication = require("../../../shared/middleware/authentication.js");
const validate = require("../../../shared/middleware/validate.js");
const { reportSchema, analyticsSchema } = require("../../../shared/utils/validatorSchemas.js");
const limiter = require("../../../shared/middleware/rateLimiter.js");

const router = express.Router();

// Enhanced rate limiter for report generation (more restrictive)
const reportLimiter = require("express-rate-limit")({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: "Too many report generation requests from this IP, please try again later.",
});

// Standard rate limiter for other endpoints
const standardLimiter = require("express-rate-limit")({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// Generate custom reports (with enhanced rate limiting)
router.post(
  "/generate",
  authentication,
  reportLimiter,
  validate(reportSchema),
  ReportingController.generateReport
);

// Get general statistics
router.get("/statistics", authentication, ReportingController.getStatistics);

// Get period-specific analytics (with rate limiting)
router.post(
  "/analytics",
  authentication,
  standardLimiter,
  validate(analyticsSchema),
  ReportingController.getPeriodAnalytics
);

// Export last month's overdue books
router.get(
  "/export/last-month-overdue",
  authentication,
  ReportingController.exportLastMonthOverdue
);

// Export last month's borrowing processes
router.get(
  "/export/last-month-borrowing",
  authentication,
  ReportingController.exportLastMonthBorrowing
);

module.exports = router;
