require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

// Load Models
const Student = require('./src/models/Student')
const Faculty = require('./src/models/Faculty')
const Admin = require('./src/models/Admin')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/student_risk_db'

function parseCSV(filePath) {
  if (!fs.existsSync(filePath)) return []
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split(/\r?\n/).filter((line) => line.trim())
  if (lines.length <= 1) return []

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
  const results = []

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].split(',').map((val) => val.trim().replace(/^"|"$/g, ''))
    if (currentLine.length === headers.length) {
      const obj = {}
      headers.forEach((h, idx) => {
        obj[h] = currentLine[idx]
      })
      results.push(obj)
    }
  }
  return results
}

// Automatically match values to Roopa's Mongoose Schema Enums
function matchEnum(val, validEnums, defaultVal) {
  if (!validEnums || validEnums.length === 0) return val
  const str = String(val || '').toLowerCase()

  const exact = validEnums.find((e) => e.toLowerCase() === str)
  if (exact) return exact

  if (str.includes('high')) {
    const match = validEnums.find((e) => e.toLowerCase().includes('high'))
    if (match) return match
  }
  if (str.includes('mod') || str.includes('med')) {
    const match = validEnums.find((e) => e.toLowerCase().includes('mod') || e.toLowerCase().includes('med'))
    if (match) return match
  }
  if (str.includes('low')) {
    const match = validEnums.find((e) => e.toLowerCase().includes('low'))
    if (match) return match
  }
  if (str.includes('ncp')) {
    const match = validEnums.find((e) => e.toLowerCase().includes('ncp'))
    if (match) return match
  }
  if (str.includes('cp')) {
    const match = validEnums.find((e) => e.toLowerCase().includes('cp') && !e.toLowerCase().includes('ncp'))
    if (match) return match
  }

  return validEnums.includes(defaultVal) ? defaultVal : validEnums[0]
}

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB!')

    const hashedPassword = await bcrypt.hash('password123', 10)

    // Dynamically detect Roopa's Schema Enums
    const riskEnums = Student.schema.path('latestRiskLevel')?.enumValues || []
    const cpNcpEnums = Student.schema.path('cpNcpStatus')?.enumValues || []
    console.log('📋 Detected Roopa\'s Schema Enums:')
    console.log('   - latestRiskLevel:', riskEnums)
    console.log('   - cpNcpStatus:', cpNcpEnums)

    // 1. Seed Faculty User
    await Faculty.deleteMany({})
    await Faculty.create({
      facultyId: 'FAC001',
      name: 'Dr. Ramesh Kumar',
      email: 'faculty@college.edu',
      password: hashedPassword,
      passwordHash: hashedPassword,
      department: 'CSE',
      role: 'faculty',
    })
    console.log('👤 Faculty created: faculty@college.edu')

    // 2. Seed Admin User
    await Admin.deleteMany({})
    await Admin.create({
      adminId: 'ADM001',
      name: 'Admin User',
      email: 'admin@college.edu',
      password: hashedPassword,
      passwordHash: hashedPassword,
      department: 'Administration',
      role: 'admin',
    })
    console.log('👤 Admin created: admin@college.edu')

    // 3. Load 1,000 Students from CSV dataset
    const csvPath = path.join(__dirname, '../data-ai/dataset/processed/student_data_cleaned.csv')
    const jsonPath = path.join(__dirname, '../frontend/src/data/students.json')

    let rawStudents = parseCSV(csvPath)

    if (rawStudents.length === 0 && fs.existsSync(jsonPath)) {
      rawStudents = require(jsonPath)
    }

    await Student.deleteMany({})

    if (rawStudents.length > 0) {
      const formattedStudents = rawStudents.map((s, idx) => {
        const idNum = String(idx + 1).padStart(4, '0')
        const studentIdVal = s.student_id || s.studentId || `STU${idNum}`
        const emailVal = idx === 0 ? 'student@college.edu' : (s.email || `student${idx + 1}@college.edu`)

        const att = parseFloat(s.attendance_pct || s.attendancePct || s.attendancePercentage || 75)
        const marks = parseFloat(s.internal_marks || s.internalMarks || s.internalMarksAverage || 65)
        const rawStatus = s.cp_ncp || s.cpNcp || s.cpNcpStatus || 'CP'
        const backlogs = parseInt(s.previous_backlogs || s.previousBacklogs || 0)
        const rawRisk = s.risk_category || s.riskCategory || s.latestRiskLevel || 'Low Risk'

        const mappedRisk = matchEnum(rawRisk, riskEnums, 'Low Risk')
        const mappedStatus = matchEnum(rawStatus, cpNcpEnums, 'CP')

        return {
          studentId: studentIdVal,
          student_id: studentIdVal,
          name: s.name || `Student ${idx + 1}`,
          email: emailVal,
          password: hashedPassword,
          passwordHash: hashedPassword,
          department: s.department || 'CSE',
          semester: parseInt(s.semester || 3),

          attendancePercentage: att,
          attendancePct: att,
          attendance_pct: att,

          internalMarksAverage: marks,
          internalMarks: marks,
          internal_marks: marks,

          cpNcpStatus: mappedStatus,
          cpNcp: mappedStatus,
          cp_ncp: mappedStatus,

          previousBacklogs: backlogs,
          previous_backlogs: backlogs,

          latestRiskLevel: mappedRisk,
          riskCategory: mappedRisk,
          risk_category: mappedRisk,

          role: 'student',
          isActive: true,
        }
      })

      await Student.insertMany(formattedStudents)
      console.log(`🎓 Inserted ${formattedStudents.length} Students into MongoDB matching schema enums!`)
    }

    console.log('\n🎉 DATABASE RE-SEEDED SUCCESSFULLY!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seedDatabase()