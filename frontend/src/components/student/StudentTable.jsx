import DataTable from 'react-data-table-component'
import Badge from '../common/Badge'
import { Eye, TrendingDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getAttendanceColor, getMarksColor } from '../../utils/riskColor'

const StudentTable = ({ students = [], showActions = false, onRowClick }) => {
  const navigate = useNavigate()

  const getStudentKey = (row) =>
    row._id || row.id || row.studentId || row.student_id || ''

  const handleView = (e, row) => {
    e.preventDefault()
    e.stopPropagation()

    const id = getStudentKey(row)
    if (!id) {
      console.error('Student ID missing for row:', row)
      return
    }

    navigate(`/faculty/students/${encodeURIComponent(id)}`)
  }

  const columns = [
    {
      name: 'Student',
      cell: (row) => {
        const id = row.studentId || row.student_id || row._id || 'N/A'
        return (
          <div className="py-2">
            <p className="font-semibold text-slate-900 text-sm leading-tight">{row.name}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">{id}</p>
          </div>
        )
      },
      sortable: true,
      selector: (row) => row.name,
      minWidth: '170px',
    },
    {
      name: 'Dept',
      selector: (row) => row.department,
      sortable: true,
      width: '90px',
      cell: (row) => (
        <span className="text-xs font-semibold text-slate-700">{row.department}</span>
      ),
    },
    {
      name: 'Sem',
      selector: (row) => row.semester,
      sortable: true,
      width: '80px',
      cell: (row) => <span className="text-xs text-slate-700">Sem {row.semester}</span>,
    },
    {
      name: 'Attendance',
      selector: (row) =>
        parseFloat(row.attendancePercentage ?? row.attendance_pct ?? row.attendancePct ?? 0),
      sortable: true,
      width: '120px',
      cell: (row) => {
        const att = parseFloat(
          row.attendancePercentage ?? row.attendance_pct ?? row.attendancePct ?? 0
        )
        return (
          <div>
            <span className={`text-sm font-bold ${getAttendanceColor(att)}`}>{att}%</span>
            {att < 75 && <TrendingDown className="w-3 h-3 text-red-500 inline ml-1" />}
          </div>
        )
      },
    },
    {
      name: 'Marks',
      selector: (row) =>
        parseFloat(row.internalMarksAverage ?? row.internal_marks ?? row.internalMarks ?? 0),
      sortable: true,
      width: '90px',
      cell: (row) => {
        const marks = parseFloat(
          row.internalMarksAverage ?? row.internal_marks ?? row.internalMarks ?? 0
        )
        return <span className={`text-sm font-bold ${getMarksColor(marks)}`}>{marks}</span>
      },
    },
    {
      name: 'Status',
      selector: (row) => row.cpNcpStatus || row.cp_ncp || row.cpNcp || 'CP',
      width: '90px',
      cell: (row) => {
        const status = row.cpNcpStatus || row.cp_ncp || row.cpNcp || 'CP'
        return (
          <span
            className={`text-xs font-bold ${
              String(status).toUpperCase() === 'CP' ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {status}
          </span>
        )
      },
    },
    {
      name: 'Risk Level',
      selector: (row) =>
        row.latestRiskLevel || row.risk_category || row.riskCategory || 'Low Risk',
      sortable: true,
      cell: (row) => {
        const risk =
          row.latestRiskLevel || row.risk_category || row.riskCategory || 'Low Risk'
        return <Badge risk={risk} />
      },
      minWidth: '140px',
    },
    showActions && {
      name: 'Action',
      cell: (row) => (
        <button
          type="button"
          onClick={(e) => handleView(e, row)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-all"
        >
          <Eye className="w-3 h-3" />
          View
        </button>
      ),
      width: '100px',
      ignoreRowClick: true,
      button: true,
    },
  ].filter(Boolean)

  return (
    <DataTable
      columns={columns}
      data={students}
      pagination
      paginationPerPage={10}
      paginationRowsPerPageOptions={[10, 25, 50, 100, 250]}
      highlightOnHover
      pointerOnHover
      responsive
      onRowClicked={(row) => {
        if (onRowClick) onRowClick(row)
        else handleView({ preventDefault() {}, stopPropagation() {} }, row)
      }}
      noDataComponent={
        <div className="py-16 flex flex-col items-center gap-2">
          <p className="text-slate-600 text-sm font-medium">No matching student records found</p>
          <p className="text-slate-400 text-xs">Try clearing or changing your search filters</p>
        </div>
      }
    />
  )
}

export default StudentTable