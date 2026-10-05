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

const getMarksValue = (student) => {
  const raw =
    student?.internalMarksAverage ??
    student?.internal_marks ??
    student?.internalMarks ??
    student?.marks ??
    0

  const value = Number(raw)
  return Number.isFinite(value) ? value : 0
}

const MarksBarChart = ({ students = [] }) => {
  const ranges = ['Below 30', '30–50', '50–65', '65–80', 'Above 80']
  const counts = [0, 0, 0, 0, 0]

  students.forEach((s) => {
    const m = getMarksValue(s)
    if (m < 30) counts[0]++
    else if (m < 50) counts[1]++
    else if (m < 65) counts[2]++
    else if (m < 80) counts[3]++
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
        backgroundColor: [
          '#ef4444',
          '#f59e0b',
          '#3b82f6',
          '#34d399',
          '#10b981',
        ],
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
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Marks Distribution</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Student count per internal marks range ({total} total)
          </p>
        </div>
      </div>

      {!hasData ? (
        <div className="h-64 flex items-center justify-center text-sm text-slate-500">
          No marks data available to plot
        </div>
      ) : (
        <div className="h-64">
          <Bar data={chartData} options={options} />
        </div>
      )}

      {/* Quick breakdown under chart */}
      {hasData && (
        <div className="mt-4 grid grid-cols-5 gap-2">
          {ranges.map((label, idx) => (
            <div
              key={label}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-center"
            >
              <p className="text-[10px] text-slate-500 truncate">{label}</p>
              <p className="text-sm font-bold text-slate-800">{counts[idx]}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default MarksBarChart