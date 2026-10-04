// src/controllers/report.controller.js
// Report controller — department/semester aggregations + CSV/JSON export.

const {
  getDepartmentReport,
  getSemesterReport,
  getExportData,
  toCSV,
} = require("../services/report.service");
const { sendSuccess, sendError } = require("../utils/response.utils");

// ─── GET /api/reports/department ─────────────────────────────────────────────
// Query: ?semester=3
const getDepartmentReportHandler = async (req, res, next) => {
  try {
    const { semester } = req.query;
    const data = await getDepartmentReport({ semester });

    return sendSuccess(res, 200, "Department risk report.", data, {
      filters: { semester: semester || null },
      count: data.length,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/reports/semester ────────────────────────────────────────────────
// Query: ?department=CSE
const getSemesterReportHandler = async (req, res, next) => {
  try {
    const { department } = req.query;
    const data = await getSemesterReport({ department });

    return sendSuccess(res, 200, "Semester risk report.", data, {
      filters: { department: department || null },
      count: data.length,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/reports/export ──────────────────────────────────────────────────
// Query: ?format=csv|json  &department=CSE  &semester=3  &riskLevel=HIGH
const exportReportHandler = async (req, res, next) => {
  try {
    const { format = "json", department, semester, riskLevel } = req.query;

    const data = await getExportData({ department, semester, riskLevel });

    if (format === "csv") {
      const csv = toCSV(data);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="student_risk_report_${Date.now()}.csv"`
      );
      return res.status(200).send(csv);
    }

    // Default: JSON
    return sendSuccess(res, 200, "Student risk export data.", data, {
      filters: { department: department || null, semester: semester || null, riskLevel: riskLevel || null },
      count: data.length,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDepartmentReport: getDepartmentReportHandler,
  getSemesterReport: getSemesterReportHandler,
  exportReport: exportReportHandler,
};
