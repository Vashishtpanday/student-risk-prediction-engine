import { useState, useRef, useEffect } from 'react'
import Sidebar from '../../components/common/Sidebar'
import Navbar from '../../components/common/Navbar'
import { MOCK_STUDENTS } from '../../api/student.api'
import { MessageSquare, Send, Bot, User, Sparkles, Trash2 } from 'lucide-react'
import { DEPARTMENTS } from '../../constants/riskLevels'

const processQuery = (query) => {
  const q = query.toLowerCase().trim()
  if (q.includes('high risk')) {
    const list = MOCK_STUDENTS.filter((s) => s.risk_category === 'High Risk')
    return `Found ${list.length} high risk students:\n${list.map((s, i) => `${i + 1}. ${s.name} (${s.student_id}) — ${s.department}, Sem ${s.semester}, Attendance: ${s.attendance_pct}%`).join('\n')}`
  }
  if (q.includes('moderate risk')) {
    const list = MOCK_STUDENTS.filter((s) => s.risk_category === 'Moderate Risk')
    return `Found ${list.length} moderate risk students:\n${list.map((s, i) => `${i + 1}. ${s.name} (${s.student_id}) — ${s.department}`).join('\n')}`
  }
  if (q.includes('low risk')) {
    const list = MOCK_STUDENTS.filter((s) => s.risk_category === 'Low Risk')
    return `Found ${list.length} low risk students:\n${list.map((s, i) => `${i + 1}. ${s.name} (${s.student_id})`).join('\n')}`
  }
  if (q.includes('attendance')) {
    const list = MOCK_STUDENTS.filter((s) => s.attendance_pct < 75)
    return `${list.length} students have attendance below 75%:\n${list.map((s, i) => `${i + 1}. ${s.name} — ${s.attendance_pct}% (${s.risk_category})`).join('\n')}`
  }
  if (q.includes('ncp')) {
    const list = MOCK_STUDENTS.filter((s) => s.cp_ncp === 'NCP')
    return `${list.length} students have NCP status:\n${list.map((s, i) => `${i + 1}. ${s.name} (${s.department}, Sem ${s.semester})`).join('\n')}`
  }
  if (q.includes('backlog')) {
    const list = MOCK_STUDENTS.filter((s) => s.previous_backlogs > 0)
    return `${list.length} students have previous backlogs:\n${list.map((s, i) => `${i + 1}. ${s.name} — ${s.previous_backlogs} backlog${s.previous_backlogs > 1 ? 's' : ''}`).join('\n')}`
  }
  if (q.includes('intervention') || q.includes('urgent') || q.includes('immediate')) {
    const list = MOCK_STUDENTS.filter((s) => s.risk_category === 'High Risk')
    return `${list.length} students need immediate intervention:\n${list.map((s, i) => `${i + 1}. ${s.name} — Attendance: ${s.attendance_pct}%, Marks: ${s.internal_marks}`).join('\n')}\n\nPlease schedule counselling sessions.`
  }
  if (q.includes('how many') || q.includes('count') || q.includes('total') || q.includes('summary')) {
    const total = MOCK_STUDENTS.length
    const high = MOCK_STUDENTS.filter((s) => s.risk_category === 'High Risk').length
    const mod = MOCK_STUDENTS.filter((s) => s.risk_category === 'Moderate Risk').length
    const low = MOCK_STUDENTS.filter((s) => s.risk_category === 'Low Risk').length
    const ncp = MOCK_STUDENTS.filter((s) => s.cp_ncp === 'NCP').length
    return `📊 Student Summary:\n• Total Students: ${total}\n• High Risk: ${high} (${Math.round((high / total) * 100)}%)\n• Moderate Risk: ${mod} (${Math.round((mod / total) * 100)}%)\n• Low Risk: ${low} (${Math.round((low / total) * 100)}%)\n• NCP Status: ${ncp} students`
  }
  for (const dept of DEPARTMENTS) {
    if (q.includes(dept.toLowerCase())) {
      const list = MOCK_STUDENTS.filter((s) => s.department === dept)
      const high = list.filter((s) => s.risk_category === 'High Risk').length
      return `${dept} Department — ${list.length} students total:\n• High Risk: ${high}\n• Students: ${list.map((s) => s.name).join(', ')}`
    }
  }
  for (let sem = 1; sem <= 8; sem++) {
    if (q.includes(`semester ${sem}`) || q.includes(`sem ${sem}`)) {
      const list = MOCK_STUDENTS.filter((s) => s.semester === sem)
      return `Semester ${sem} — ${list.length} students:\n${list.map((s, i) => `${i + 1}. ${s.name} — ${s.risk_category}`).join('\n')}`
    }
  }
  return `I can help you with:\n• "Show high risk students"\n• "List NCP students"\n• "Students with low attendance"\n• "Who needs immediate intervention"\n• "Show students with backlogs"\n• "Total count / summary"\n• "CSE department students"\n• "Semester 3 students"`
}

const SUGGESTIONS = [
  'Show high risk students', 'Students with low attendance', 'List NCP students',
  'Who needs immediate intervention?', 'Show students with backlogs',
  'Give me a full summary', 'CSE department students', 'Semester 3 students',
]

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Hello! I am your AI Academic Assistant. 👋\n\nI can help you query student performance data, identify at-risk students, and provide insights. Try asking me something!`, time: new Date() },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async (text) => {
    const query = (text || input).trim()
    if (!query) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: query, time: new Date() }])
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400))
    const response = processQuery(query)
    setMessages((prev) => [...prev, { role: 'assistant', text: response, time: new Date() }])
    setLoading(false)
    inputRef.current?.focus()
  }

  const clearChat = () => {
    setMessages([{ role: 'assistant', text: 'Chat cleared. How can I help you?', time: new Date() }])
  }

  const formatTime = (date) => date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col" style={{ height: '100vh' }}>
        <Navbar title="AI Academic Assistant" subtitle="Query student data using natural language" />
        <main className="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <p className="text-xs font-semibold text-slate-700">Quick Queries</p>
              </div>
              <button onClick={clearChat} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
                Clear Chat
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs hover:bg-blue-100 hover:border-blue-300 transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-5 overflow-y-auto space-y-4 shadow-sm">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-slide-up`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-blue-100 border border-blue-200' : 'bg-slate-100 border border-slate-200'}`}>
                  {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-blue-600" /> : <User className="w-4 h-4 text-slate-600" />}
                </div>
                <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'assistant' ? 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-200' : 'bg-blue-600 text-white rounded-tr-none'}`}>
                    {msg.text}
                  </div>
                  <p className="text-xs text-slate-400 px-1">{formatTime(msg.time)}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 bg-blue-100 border border-blue-200 rounded-xl flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-slate-50 border border-slate-200 px-5 py-3.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask about students, risk levels, attendance..."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all pr-12 shadow-sm"
              />
              <MessageSquare className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all flex items-center gap-2 font-medium shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AIAssistant