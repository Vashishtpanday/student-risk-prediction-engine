// src/services/report.service.js
// Report aggregation logic using Mongoose aggregation pipelines.

const Student = require("../models/Student");
const Prediction = require("../models/Prediction");
const AcademicRecord = require("../models/AcademicRecord");

/**
 * Risk distribution grouped by department.
 * Optional filters: semester, academicYear (from AcademicRecord, future use)
 */
const getDepartmentReport = async (filters = {}) => {
  const matchStage = { isActive: true };
  if (filters.semester) matchStage.semester = parseInt(filters.semester, 10);

  const rows = await Student.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { department: "$department", riskLevel: "$latestRiskLevel" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.department": 1, "_id.riskLevel": 1 } },
  ]);

  // Pivot into { department, LOW, MODERATE, HIGH, UNKNOWN, total }
  const map = {};
  for (const row of rows) {
    const dept = row._id.department;
    const risk = row._id.riskLevel;
    if (!map[dept]) {
      map[dept] = { department: dept, LOW: 0, MODERATE: 0, HIGH: 0, UNKNOWN: 0, total: 0 };
    }
    map[dept][risk] = row.count;
    map[dept].total += row.count;
  }

  return Object.values(map).sort((a, b) => a.department.localeCompare(b.department));
};

/**
 * Risk distribution grouped by semester.
 * Optional filters: department
 */
const getSemesterReport = async (filters = {}) => {
  const matchStage = { isActive: true };
  if (filters.department) matchStage.department = new RegExp(filters.department, "i");

  const rows = await Student.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { semester: "$semester", riskLevel: "$latestRiskLevel" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.semester": 1, "_id.riskLevel": 1 } },
  ]);

  const map = {};
  for (const row of rows) {
    const sem = row._id.semester;
    const risk = row._id.riskLevel;
    if (!map[sem]) {
      map[sem] = { semester: sem, LOW: 0, MODERATE: 0, HIGH: 0, UNKNOWN: 0, total: 0 };
    }
    map[sem][risk] = row.count;
    map[sem].total += row.count;
  }

  return Object.values(map).sort((a, b) => a.semester - b.semester);
};

/**
 * Export full student list with latest risk level.
 * Returns raw student documents for the controller to format.
 */
const getExportData = async (filters = {}) => {
  const matchStage = { isActive: true };
  if (filters.department) matchStage.department = new RegExp(filters.department, "i");
  if (filters.semester) matchStage.semester = parseInt(filters.semester, 10);
  if (filters.riskLevel) matchStage.latestRiskLevel = filters.riskLevel.toUpperCase();

  const students = await Student.find(matchStage)
    .sort({ department: 1, semester: 1, name: 1 })
    .select("studentId name email department semester section batch cpNcpStatus attendancePercentage internalMarksAverage latestRiskLevel createdAt")
    .lean();

  return students;
};

/**
 * Convert an array of plain objects to a CSV string.
 */
const toCSV = (data) => {
  if (!data.length) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h] === null || row[h] === undefined ? "" : String(row[h]);
      // Escape commas and quotes
      return val.includes(",") || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
    }).join(",")
  );
  return [headers.join(","), ...rows].join("\r\n");
};

module.exports = { getDepartmentReport, getSemesterReport, getExportData, toCSV };
