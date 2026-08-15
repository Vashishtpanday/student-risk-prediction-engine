import DataTable from 'react-data-table-component'
import Badge from '../common/Badge'
import { Eye, TrendingDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getAttendanceColor, getMarksColor } from '../../utils/riskColor'

const StudentTable = ({ students = [], showActions = false, onRowClick }) => {
  const navigate = useNavigate()

  const columns = [
    {
      name: 'Student',
      cell: (row) => (
        <div className="py-2">
          <p className="font-semibold text-slate-900 text-sm leading-tight">{row.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{row.student_id}</p>
        </div>
      ),
      sortable: true,
      selector: (row) => row.name,
      minWidth: '160px',
    },
    {
      name: 'Dept',
      selector: (row) => row.department,
      sortable: true,
      width: '80px',
      cell: (row) => <span className="text-xs text-slate-700 font-medium">{row.department}</span>,
    },
    {
      name: 'Sem',
      selector: (row) => row.semester,
      sortable: true,
      width: '70px',
      cell: (row) => <span className="text-xs text-slate-700">Sem {row.semester}</span>,
    },
    {
      name: 'Attendance',
      selector: (row) => row.attendance_pct,
      sortable: true,
      width: '115px',
      cell: (row) => (
        <div>
          <span className={`text-sm font-bold ${getAttendanceColor(row.attendance_pct)}`}>
            {row.attendance_pct}%
          </span>
          {row.attendance_pct < 75 && (
            <TrendingDown className="w-3 h-3 text-red-500 inline ml-1" />
          )}
        </div>
      ),
    },
    {
      name: 'Marks',
      selector: (row) => row.internal_marks,
      sortable: true,
      width: '85px',
      cell: (row) => (
        <span className={`text-sm font-bold ${getMarksColor(row.internal_marks)}`}>
          {row.internal_marks}
        </span>
      ),
    },
    {
      name: 'Status',
      selector: (row) => row.cp_ncp,
      width: '80px',
      cell: (row) => (
        <span className={`text-xs font-bold ${row.cp_ncp === 'CP' ? 'text-emerald-600' : 'text-red-600'}`}>
          {row.cp_ncp}
        </span>
      ),
    },
    {
      name: 'Risk Level',
      selector: (row) => row.risk_category,
      sortable: true,
      cell: (row) => <Badge risk={row.risk_category} />,
      minWidth: '130px',
    },
    showActions && {
      name: '',
      cell: (row) => (
        <button
          onClick={() => navigate(`/faculty/students/${row._id}`)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-all"
        >
          <Eye className="w-3 h-3" />
          View
        </button>
      ),
      width: '80px',
      ignoreRowClick: true,
    },
  ].filter(Boolean)

  return (
    <DataTable
      columns={columns}
      data={students}
      pagination
      paginationPerPage={8}
      paginationRowsPerPageOptions={[5, 8, 10, 20]}
      highlightOnHover
      responsive
      onRowClicked={onRowClick}
      noDataComponent={
        <div className="py-16 flex flex-col items-center gap-2">
          <p className="text-slate-600 text-sm font-medium">No students found</p>
          <p className="text-slate-400 text-xs">Try adjusting your filters</p>
        </div>
      }
    />
  )
}

export default StudentTable