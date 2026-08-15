import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import Card from '../common/Card'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const AttendanceBarChart = ({ students = [] }) => {
  const ranges = ['Below 50%', '50–60%', '60–75%', '75–85%', 'Above 85%']
  const counts = [0, 0, 0, 0, 0]
  students.forEach((s) => {
    const a = s.attendance_pct
    if (a < 50) counts[0]++
    else if (a < 60) counts[1]++
    else if (a < 75) counts[2]++
    else if (a < 85) counts[3]++
    else counts[4]++
  })

  const chartData = {
    labels: ranges,
    datasets: [
      {
        label: 'Students',
        data: counts,
        backgroundColor: ['#ef4444', '#f59e0b', '#fbbf24', '#34d399', '#10b981'],
        borderRadius: 10,
        borderSkipped: false,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        titleColor: '#0f172a',
        bodyColor: '#475569',
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: { color: '#f1f5f9', drawTicks: false },
        ticks: { color: '#64748b', font: { size: 11, family: 'Inter' }, padding: 8 },
        border: { display: false },
      },
      y: {
        grid: { color: '#f1f5f9', drawTicks: false },
        ticks: { color: '#64748b', font: { size: 11, family: 'Inter' }, stepSize: 1, padding: 8 },
        border: { display: false },
      },
    },
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">Attendance Distribution</h3>
      <p className="text-xs text-slate-500 mb-6">Student count per attendance range</p>
      <Bar data={chartData} options={options} />
    </Card>
  )
}

export default AttendanceBarChart