import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import Card from '../common/Card'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const getAttendanceValue = (student) => {
  const raw =
    student?.attendancePercentage ??
    student?.attendance_pct ??
    student?.attendancePct ??
    student?.attendance ??
    0

  const value = Number(raw)
  return Number.isFinite(value) ? value : 0
}

const AttendanceBarChart = ({ students = [] }) => {
  const ranges = ['Below 50%', '50–60%', '60–75%', '75–85%', 'Above 85%']
  const counts = [0, 0, 0, 0, 0]

  students.forEach((s) => {
    const a = getAttendanceValue(s)
    if (a < 50) counts[0]++
    else if (a < 60) counts[1]++
    else if (a < 75) counts[2]++
    else if (a < 85) counts[3]++
    else counts[4]++
  })

  const total = students.length
  const hasData = total > 0 && counts.some((c) => c > 0)

  const chartData = {
    labels: ranges,
    datasets: [
      {
        label: 'Students',
        data: counts,
        backgroundColor: ['#ef4444', '#f59e0b', '#fbbf24', '#34d399', '#10b981'],
        borderRadius: 10,
        borderSkipped: false,
        maxBarThickness: 48,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        titleColor: '#0f172a',
        bodyColor: '#475569',
        padding: 12,
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed.y || 0
            const pct = total > 0 ? Math.round((value / total) * 100) : 0
            return ` ${value} student${value === 1 ? '' : 's'} (${pct}%)`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#f1f5f9', drawTicks: false },
        ticks: {
          color: '#64748b',
          font: { size: 11, family: 'Inter' },
          padding: 8,
        },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grace: '10%',
        grid: { color: '#f1f5f9', drawTicks: false },
        ticks: {
          color: '#64748b',
          font: { size: 11, family: 'Inter' },
          precision: 0,
          padding: 8,
        },
        border: { display: false },
      },
    },
  }

  return (
    <Card>
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-slate-900">Attendance Distribution</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Student count per attendance range ({total} total)
        </p>
      </div>

      {!hasData ? (
        <div className="h-64 flex items-center justify-center text-sm text-slate-500">
          No attendance data available to plot
        </div>
      ) : (
        <div className="h-64">
          <Bar data={chartData} options={options} />
        </div>
      )}
    </Card>
  )
}

export default AttendanceBarChart