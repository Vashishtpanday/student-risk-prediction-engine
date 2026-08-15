import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import Card from '../common/Card'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const MarksBarChart = ({ students = [] }) => {
  const ranges = ['Below 30', '30–50', '50–65', '65–80', 'Above 80']
  const counts = [0, 0, 0, 0, 0]
  students.forEach((s) => {
    const m = s.internal_marks
    if (m < 30) counts[0]++
    else if (m < 50) counts[1]++
    else if (m < 65) counts[2]++
    else if (m < 80) counts[3]++
    else counts[4]++
  })

  const chartData = {
    labels: ranges,
    datasets: [
      {
        label: 'Students',
        data: counts,
        backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#34d399', '#10b981'],
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
        ticks: { color: '#64748b', font: { size: 11 }, padding: 8 },
        border: { display: false },
      },
      y: {
        grid: { color: '#f1f5f9', drawTicks: false },
        ticks: { color: '#64748b', font: { size: 11 }, stepSize: 1, padding: 8 },
        border: { display: false },
      },
    },
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">Marks Distribution</h3>
      <p className="text-xs text-slate-500 mb-6">Student count per marks range</p>
      <Bar data={chartData} options={options} />
    </Card>
  )
}

export default MarksBarChart