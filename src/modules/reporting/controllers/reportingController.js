const ReportingService = require("../services/reportingService.js");
const StatisticsService = require("../services/statisticsService.js");
const appError = require("../../../shared/utils/appError.js");

class ReportingController {
  async generateReport(req, res, next) {
    try {
      const { start_date, end_date, report_type, format = 'xlsx' } = req.body;

      // Generate the report
      const report = await ReportingService.generateReport({
        start_date,
        end_date,
        report_type,
        format,
        borrower_id: !req.borrower.isAdmin ? req.borrower.id : null,
      });

      // Format the date for the filename
      const formattedDate = [
        "last_month_borrowing",
        "last_month_overdue",
      ].includes(report_type)
        ? new Date().toISOString().split("T")[0]
        : new Date(start_date).toISOString().split("T")[0];

      // Set headers based on format
      if (format.toLowerCase() === 'csv') {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${report_type}-report-${formattedDate}.csv`
        );
      } else {
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${report_type}-report-${formattedDate}.xlsx`
        );
      }
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Pragma", "no-cache");

      return res.send(report);
    } catch (error) {
      console.error(`Error generating report: ${error.message}`);
      console.error(error.stack);

      // If it's already an appError, pass it through, otherwise create a new one
      if (error instanceof appError) {
        return next(error);
      }
      return next(
        new appError(error.message || "Error generating report", 400)
      );
    }
  }

  async getStatistics(req, res, next) {
    try {
      const borrowerId = !req.borrower.isAdmin ? req.borrower.id : null;

      // Get statistics
      const stats = await StatisticsService.getStatistics(borrowerId);

      return res.status(200).json({
        status: "success",
        data: stats,
      });
    } catch (error) {
      console.error(`Error getting statistics: ${error.message}`);

      if (error instanceof appError) {
        return next(error);
      }
      return next(
        new appError(error.message || "Error retrieving statistics", 500)
      );
    }
  }

  async exportLastMonthOverdue(req, res, next) {
    try {
      const { format = 'xlsx' } = req.query;

      const report = await ReportingService.exportLastMonthOverdue(format);

      const formattedDate = new Date().toISOString().split("T")[0];

      // Set headers based on format
      if (format.toLowerCase() === 'csv') {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=last-month-overdue-${formattedDate}.csv`
        );
      } else {
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=last-month-overdue-${formattedDate}.xlsx`
        );
      }
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Pragma", "no-cache");

      return res.send(report);
    } catch (error) {
      console.error(`Error exporting last month overdue: ${error.message}`);
      
      if (error instanceof appError) {
        return next(error);
      }
      return next(
        new appError(error.message || "Error exporting last month overdue", 500)
      );
    }
  }

  async exportLastMonthBorrowing(req, res, next) {
    try {
      const { format = 'xlsx' } = req.query;

      const report = await ReportingService.exportLastMonthBorrowing(format);

      const formattedDate = new Date().toISOString().split("T")[0];

      // Set headers based on format
      if (format.toLowerCase() === 'csv') {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=last-month-borrowing-${formattedDate}.csv`
        );
      } else {
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=last-month-borrowing-${formattedDate}.xlsx`
        );
      }
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Pragma", "no-cache");

      return res.send(report);
    } catch (error) {
      console.error(`Error exporting last month borrowing: ${error.message}`);
      
      if (error instanceof appError) {
        return next(error);
      }
      return next(
        new appError(error.message || "Error exporting last month borrowing", 500)
      );
    }
  }

  async getPeriodAnalytics(req, res, next) {
    try {
      const { start_date, end_date } = req.body;
      const borrowerId = !req.borrower.isAdmin ? req.borrower.id : null;

      const analytics = await ReportingService.generatePeriodAnalytics(
        start_date, 
        end_date, 
        borrowerId
      );

      return res.status(200).json({
        status: "success",
        data: analytics,
      });
    } catch (error) {
      console.error(`Error getting period analytics: ${error.message}`);

      if (error instanceof appError) {
        return next(error);
      }
      return next(
        new appError(error.message || "Error retrieving period analytics", 500)
      );
    }
  }
}

module.exports = new ReportingController();
