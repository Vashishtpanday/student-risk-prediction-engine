// src/controllers/dashboard.controller.js
// Dashboard controller — summary stats and risky students list.

const Student = require("../models/Student");
const Prediction = require("../models/Prediction");
const Faculty = require("../models/Faculty");
const { sendSuccess, sendError } = require("../utils/response.utils");

// ─── GET /api/dashboard/stats ─────────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    // Run all aggregations in parallel
    const [
      totalStudents,
      activeStudents,
      riskDistribution,
      totalFaculty,
      totalPredictions,
      recentPredictions,
      departmentBreakdown,
    ] = await Promise.all([
      // Total students
      Student.countDocuments(),

      // Active students
      Student.countDocuments({ isActive: true }),

      // Risk level distribution (active students only)
      Student.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$latestRiskLevel", count: { $sum: 1 } } },
      ]),

      // Total faculty
      Faculty.countDocuments({ isActive: true }),

      // Total predictions ever made
      Prediction.countDocuments(),

      // Predictions in last 7 days
      Prediction.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),

      // Students per department
      Student.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Normalize risk distribution into flat object
    const riskCounts = { LOW: 0, MODERATE: 0, HIGH: 0, UNKNOWN: 0 };
    for (const r of riskDistribution) {
      if (r._id && riskCounts.hasOwnProperty(r._id)) {
        riskCounts[r._id] = r.count;
      }
    }

    const highRiskCount = riskCounts.HIGH;
    const highRiskPercent =
      activeStudents > 0 ? Math.round((highRiskCount / activeStudents) * 100) : 0;

    return sendSuccess(res, 200, "Dashboard stats fetched.", {
      students: {
        total: totalStudents,
        active: activeStudents,
        inactive: totalStudents - activeStudents,
      },
      riskDistribution: riskCounts,
      highRisk: {
        count: highRiskCount,
        percent: highRiskPercent,
      },
      faculty: {
        total: totalFaculty,
      },
      predictions: {
        total: totalPredictions,
        last7Days: recentPredictions,
      },
      departments: departmentBreakdown.map((d) => ({
        department: d._id,
        studentCount: d.count,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/dashboard/risky ─────────────────────────────────────────────────
// Query: ?riskLevel=HIGH&department=CSE&semester=3&page=1&limit=20
const getRiskyStudents = async (req, res, next) => {
  try {
    const {
      riskLevel = "HIGH",
      department,
      semester,
      page = 1,
      limit = 20,
    } = req.query;

    const validRisks = ["LOW", "MODERATE", "HIGH", "UNKNOWN"];
    if (!validRisks.includes(riskLevel.toUpperCase())) {
      return sendError(res, 400, `Invalid riskLevel. Must be one of: ${validRisks.join(", ")}`);
    }

    const filter = {
      isActive: true,
      latestRiskLevel: riskLevel.toUpperCase(),
    };
    if (department) filter.department = new RegExp(department, "i");
    if (semester) filter.semester = parseInt(semester, 10);

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [students, total] = await Promise.all([
      Student.find(filter)
        .sort({ department: 1, semester: 1, name: 1 })
        .skip(skip)
        .limit(limitNum)
        .select(
          "studentId name email department semester section cpNcpStatus attendancePercentage internalMarksAverage latestRiskLevel"
        )
        .populate("assignedFaculty", "name email facultyId"),
      Student.countDocuments(filter),
    ]);

    return sendSuccess(
      res,
      200,
      `${riskLevel.toUpperCase()} risk students fetched.`,
      students,
      {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        filters: {
          riskLevel: riskLevel.toUpperCase(),
          department: department || null,
          semester: semester ? parseInt(semester, 10) : null,
        },
      }
    );
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardStats, getRiskyStudents };
