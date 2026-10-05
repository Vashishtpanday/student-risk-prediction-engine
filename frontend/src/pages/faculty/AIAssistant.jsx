import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import Layout from '../../components/common/Layout'
import { MessageSquare, Send, Bot, User, Sparkles, Trash2 } from 'lucide-react'

const processQuery = async (queryText) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_AI_ASSISTANT_URL || 'http://localhost:5002'}/query`,
      { query: queryText }
    )

    const data = response.data

    if (typeof data === 'string') return data
    if (data.answer) return data.answer
    if (data.response) return data.response
    if (data.message && !data.results) return data.message

    if (Array.isArray(data.results)) {
      if (data.results.length === 0) return `No matching records found for: "${queryText}"`
      return `Found ${data.count || data.results.length} matching student(s):\n\n` +
        data.results
          .map(
            (s, i) =>
              `${i + 1}. ${s.name} (${s.student_id}) — ${s.department}, Sem ${s.semester}, Attendance: ${s.attendance_pct}%, Risk: ${s.risk_category}`
          )
          .join('\n')
    }

    return JSON.stringify(data, null, 2)
  } catch (error) {
    return 'Unable to connect to AI Assistant on port 5002. Ensure assistant_api.py is running with CORS enabled.'
  }
}

const SUGGESTIONS = [
  'Show high risk students',
  'Students with low attendance',
  'List NCP students',
  'Show students with backlogs',
  'Give me a full summary',
]

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your AI Academic Assistant. Ask me about risk, attendance, NCP, or backlogs.',
      time: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const query = (text || input).trim()
    if (!query) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: query, time: new Date() }])
    setLoading(true)

    const response = await processQuery(query)

    setMessages((prev) => [...prev, { role: 'assistant', text: response, time: new Date() }])
    setLoading(false)
    inputRef.current?.focus()
  }

  return (
    <Layout title="AI Academic Assistant" subtitle="Connected to Data-AI service">
      <div className="flex flex-col h-[calc(100vh-140px)] gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-semibold text-slate-700">Quick Queries</p>
            </div>
            <button
              onClick={() =>
                setMessages([
                  { role: 'assistant', text: 'Chat cleared. How can I help you?', time: new Date() },
                ])
              }
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 overflow-y-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${msg.role === 'assistant' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-blue-600" /> : <User className="w-4 h-4 text-slate-600" />}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === 'assistant' ? 'bg-slate-50 border border-slate-200 text-slate-800' : 'bg-blue-600 text-white'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && <p className="text-sm text-slate-500">Thinking...</p>}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about students..."
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="px-4 py-3 bg-blue-600 text-white rounded-xl disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Layout>
  )
}

export default AIAssistant