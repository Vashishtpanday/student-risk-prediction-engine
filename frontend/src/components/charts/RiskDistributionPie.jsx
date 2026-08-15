import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import Card from '../common/Card'

ChartJS.register(ArcElement, Tooltip, Legend)

const RiskDistributionPie = ({ data }) => {
  const chartData = {
    labels: ['Low Risk', 'Moderate Risk', 'High Risk'],
    datasets: [
      {
        data: [data?.low || 0, data?.moderate || 0, data?.high || 0],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderColor: ['#ffffff', '#ffffff', '#ffffff'],
        borderWidth: 3,
        hoverOffset: 10,
        hoverBorderWidth: 3,
      },
    ],
  }

  const options = {
    responsive: true,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#475569',
          padding: 20,
          font: { size: 12, family: 'Inter' },
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        titleColor: '#0f172a',
        bodyColor: '#475569',
        padding: 12,
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.parsed} students`,
        },
      },
    },
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">Risk Distribution</h3>
      <p className="text-xs text-slate-500 mb-6">Current semester overview</p>
      <div className="relative">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-10">
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900 leading-none">{data?.total || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Total</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default RiskDistributionPie