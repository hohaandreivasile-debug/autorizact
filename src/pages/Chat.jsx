import { useState, useRef, useEffect } from 'react'
import { Avatar } from '../components/UI'
import { USERS, PRIORITY, STATUS, fmt, fmtTs, dLeft, isOD, uid } from '../lib/data'
import { useVoice } from '../hooks/useVoice'

const REACTIONS = ['👍', '✅', '🔥', '⚠️', '❓', '👀']

// ── WhatsApp helpers ──────────────────────────────────────────────
function buildWaText(task, projects) {
  const proj = projects.find(p => p.id === task.projectId)
  const proc = proj?.procedures?.find(p => p.id === task.procId)
  const assignee = USERS[task.assignedTo]
  const assigner = USERS[task.assignedBy]
  const pr = PRIORITY[task.priority]
  const st = STATUS[task.status]
  const lines = [
    `📋 *AutorizAct — Sarcină*`,
    ``,
    `*${task.title}*`,
    ``,
    `📌 Prioritate: ${pr?.label || task.priority}`,
    `📊 Status: ${st?.label || task.status}`,
    task.dueDate ? `⏰ Termen: ${fmt(task.dueDate)}` : null,
    proj ? `🏗 Proiect: ${proj.name}` : null,
    proc ? `🔧 Procedură: ${proc.name}` : null,
    assignee ? `👤 Asignat: ${assignee.name}` : null,
    assigner ? `✍ De la: ${assigner.name}` : null,
  ].filter(Boolean)
  return lines.join('\n')
}

export function openWhatsApp(text) {
  const encoded = encodeURIComponent(text)
  window.open(`https://wa.me/?text=${encoded}`, '_blank')
}

// ── Task Card in chat ─────────────────────────────────────────────
function TaskCard({ taskSnapshot, projects, onWA, t }) {
  if (!taskSnapshot) return null
  const task = taskSnapshot
  const proj = projects.find(p => p.id === task.projectId)
  const pr   = PRIORITY[task.priority] || PRIORITY.medium
  const st   = STATUS[task.status]     || STATUS.pending
  const days = dLeft(task.dueDate)
  return (
    <div style={{
      background: t.bg, border: `1px solid ${t.border}`,
      borderRadius: 12, padding: '12px 14px', marginTop: 6,
      maxWidth: 320,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 3, height: 36, borderRadius: 2, background: pr.color, flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: t.text, lineHeight: 1.3, marginBottom: 4 }}>{task.title}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}33`, borderRadius: 9999, fontSize: 10, fontWeight: 600, padding: '1px 7px' }}>{st.label}</span>
            {proj && <span style={{ fontSize: 11, color: t.muted }}>· {proj.name}</span>}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Avatar userId={task.assignedTo} size={18} />
          <span style={{ fontSize: 11, color: t.muted }}>{USERS[task.assignedTo]?.name?.split(' ')[0]}</span>
          {task.dueDate && (
            <span style={{ fontSize: 11, fontWeight: 600, color: days !== null && days < 0 ? '#F87171' : days !== null && days <= 3 ? '#FB923C' : t.muted }}>
              · {days !== null && days < 0 ? `${Math.abs(days)}z dep.` : days === 0 ? 'AZI' : days !== null ? `${days}z` : fmt(task.dueDate)}
            </span>
          )}
        </div>
        <button onClick={() => onWA(task)} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: '#25D366', border: 'none', borderRadius: 8,
          padding: '4px 10px', color: '#fff', fontSize: 11,
          fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <span style={{ fontSize: 13 }}>💬</span> WhatsApp
        </button>
      </div>
    </div>
  )
}

// ── Message bubble ────────────────────────────────────────────────
function Bubble({ msg, isMe, user, projects, onReact, onWA, t }) {
  const [showReact, setShowReact] = useState(false)
  const u = USERS[msg.author]
  const totalReactions = Object.entries(msg.reactions || {}).filter(([, users]) => users.length > 0)

  return (
    <div style={{
      display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row',
      alignItems: 'flex-end', gap: 8, marginBottom: 4,
      animation: 'fadeIn 0.2s ease',
    }}>
      {!isMe && <Avatar userId={msg.author} size={28} />}

      <div style={{ maxWidth: '70%', minWidth: 80 }}>
        {!isMe && (
          <div style={{ fontSize: 11, fontWeight: 600, color: u?.bg || t.accent, marginBottom: 3, marginLeft: 4 }}>{u?.name}</div>
        )}

        <div style={{
          background: isMe ? t.accent : t.card,
          color: isMe ? t.accentText : t.text,
          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          padding: '10px 14px',
          border: isMe ? 'none' : `1px solid ${t.border}`,
          position: 'relative',
        }}
          onMouseEnter={() => setShowReact(true)}
          onMouseLeave={() => setShowReact(false)}
        >
          {/* Text */}
          {msg.text && (
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {msg.text}
              {msg.voice && <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>🎤</span>}
            </p>
          )}

          {/* Task card */}
          {msg.type === 'task_ref' && msg.taskSnapshot && (
            <TaskCard taskSnapshot={msg.taskSnapshot} projects={projects} onWA={onWA} t={t} />
          )}

          {/* Timestamp */}
          <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: isMe ? 'left' : 'right', color: isMe ? t.accentText : t.muted }}>
            {fmtTs(msg.ts)}
          </div>

          {/* Reaction picker (hover) */}
          {showReact && (
            <div style={{
              position: 'absolute', [isMe ? 'left' : 'right']: 0, bottom: '100%',
              background: t.card, border: `1px solid ${t.border}`,
              borderRadius: 20, padding: '4px 8px',
              display: 'flex', gap: 4, marginBottom: 4,
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              zIndex: 10, whiteSpace: 'nowrap',
            }}>
              {REACTIONS.map(e => (
                <button key={e} onClick={() => onReact(msg.id, e)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '2px 3px', borderRadius: 8, transition: 'transform 0.1s' }}
                  onMouseEnter={el => el.currentTarget.style.transform = 'scale(1.3)'}
                  onMouseLeave={el => el.currentTarget.style.transform = 'scale(1)'}
                >{e}</button>
              ))}
            </div>
          )}
        </div>

        {/* Reactions row */}
        {totalReactions.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap', justifyContent: isMe ? 'flex-end' : 'flex-start', paddingLeft: isMe ? 0 : 4 }}>
            {totalReactions.map(([emoji, users]) => (
              <button key={emoji} onClick={() => onReact(msg.id, emoji)}
                style={{
                  background: users.includes(user.id) ? `${t.accent}30` : t.bg,
                  border: `1px solid ${users.includes(user.id) ? t.accent : t.border}`,
                  borderRadius: 12, padding: '2px 8px', cursor: 'pointer',
                  fontSize: 12, display: 'flex', alignItems: 'center', gap: 4,
                  color: t.text, fontFamily: 'inherit',
                }}>
                {emoji} <span style={{ fontSize: 11, fontWeight: 600 }}>{users.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Date separator ────────────────────────────────────────────────
function DateSep({ label, t }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 8px' }}>
      <div style={{ flex: 1, height: 1, background: t.border }} />
      <span style={{ fontSize: 11, color: t.muted, fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: t.border }} />
    </div>
  )
}

// ── Task picker modal ─────────────────────────────────────────────
function TaskPicker({ tasks, projects, onSelect, onClose, t }) {
  const [q, setQ] = useState('')
  const filtered = tasks.filter(tk =>
    tk.status !== 'completed' &&
    (tk.title.toLowerCase().includes(q.toLowerCase()) ||
     projects.find(p => p.id === tk.projectId)?.name.toLowerCase().includes(q.toLowerCase()))
  )
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
      <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 20, padding: 24, width: '100%', maxWidth: 460, animation: 'fadeIn 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: t.text }}>Trimite o sarcină în chat</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, fontSize: 20 }}>✕</button>
        </div>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Caută sarcini..."
          style={{ width: '100%', background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, padding: '8px 12px', color: t.text, fontSize: 13, outline: 'none', fontFamily: 'inherit', marginBottom: 12 }} />
        <div style={{ maxHeight: 320, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.length === 0 && <p style={{ color: t.muted, fontSize: 13, textAlign: 'center', padding: 20 }}>Nicio sarcină activă găsită</p>}
          {filtered.map(tk => {
            const proj = projects.find(p => p.id === tk.projectId)
            const pr = PRIORITY[tk.priority] || PRIORITY.medium
            return (
              <button key={tk.id} onClick={() => onSelect(tk)}
                style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 14px', cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 10, alignItems: 'center', fontFamily: 'inherit' }}>
                <div style={{ width: 3, height: 32, borderRadius: 2, background: pr.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 2 }}>{tk.title}</div>
                  <div style={{ fontSize: 11, color: t.muted }}>{proj?.name} {tk.dueDate ? `· ${fmt(tk.dueDate)}` : ''}</div>
                </div>
                <Avatar userId={tk.assignedTo} size={22} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Main Chat component ───────────────────────────────────────────
export default function Chat({ user, messages, tasks, projects, onSend, onReact, t }) {
  const [text, setText]           = useState('')
  const [showTaskPick, setShowTaskPick] = useState(false)
  const endRef  = useRef(null)
  const inputRef = useRef(null)
  const { listening, start, stop } = useVoice(txt => setText(c => c + (c ? ' ' : '') + txt))

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const send = (msgText = text, extra = {}) => {
    const t_ = msgText.trim()
    if (!t_ && !extra.taskSnapshot) return
    onSend({ text: t_, author: user.id, ...extra })
    setText('')
    inputRef.current?.focus()
  }

  const sendTask = (task) => {
    const snapshot = { ...task }
    const waText = buildWaText(task, projects)
    send(`📌 Sarcină: ${task.title}`, { type: 'task_ref', taskId: task.id, taskSnapshot: snapshot })
    setShowTaskPick(false)
  }

  const handleWA = (task) => {
    openWhatsApp(buildWaText(task, projects))
  }

  // Group messages by date
  const grouped = []
  let lastDate = null
  messages.forEach(msg => {
    const d = new Date(msg.ts).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
    if (d !== lastDate) {
      grouped.push({ type: 'date', label: d })
      lastDate = d
    }
    grouped.push({ type: 'msg', msg })
  })

  const online = Object.values(USERS)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: t.bg }}>

      {/* Header */}
      <div style={{ background: t.card, borderBottom: `1px solid ${t.border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>👥</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: t.text }}>AutorizAct — Grup</div>
          <div style={{ fontSize: 12, color: t.muted, display: 'flex', alignItems: 'center', gap: 8 }}>
            {online.map(u => (
              <span key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.green, display: 'inline-block' }} />
                {u.name.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>
        {/* WA group quick button */}
        <button
          onClick={() => {
            const summary = [
              '📋 *AutorizAct — Rezumat Grup*', '',
              ...tasks.filter(tk => tk.status !== 'completed').slice(0, 5).map(tk => {
                const p = PRIORITY[tk.priority]?.label || ''
                return `• [${p}] ${tk.title} → ${USERS[tk.assignedTo]?.name?.split(' ')[0]}`
              }),
            ].join('\n')
            openWhatsApp(summary)
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#25D366', border: 'none', borderRadius: 10, padding: '8px 14px', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          <span style={{ fontSize: 16 }}>💬</span> Rezumat WA
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: t.muted }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>💬</div>
            <p style={{ fontSize: 15, color: t.sub, marginBottom: 4 }}>Niciun mesaj încă</p>
            <p style={{ fontSize: 13 }}>Trimite primul mesaj sau distribuie o sarcină în grup</p>
          </div>
        )}

        {grouped.map((item, i) => {
          if (item.type === 'date') return <DateSep key={`d${i}`} label={item.label} t={t} />
          const msg = item.msg
          const isMe = msg.author === user.id
          return (
            <Bubble
              key={msg.id} msg={msg} isMe={isMe}
              user={user} projects={projects}
              onReact={onReact} onWA={handleWA} t={t}
            />
          )
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ background: t.card, borderTop: `1px solid ${t.border}`, padding: '12px 16px', flexShrink: 0 }}>
        {listening && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '6px 12px', background: 'rgba(167,139,250,0.12)', borderRadius: 8 }}>
            <span style={{ color: '#A78BFA', animation: 'pulse 1s infinite', fontSize: 14 }}>🎤</span>
            <span style={{ color: '#A78BFA', fontSize: 13, fontWeight: 500 }}>Ascult... vorbește acum</span>
            <button onClick={stop} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#A78BFA', fontSize: 13, fontFamily: 'inherit', fontWeight: 600 }}>🛑 Stop</button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <button onClick={() => setShowTaskPick(true)} title="Trimite o sarcină"
              style={{ width: 38, height: 38, borderRadius: 10, background: `${t.accent}20`, border: `1px solid ${t.accent}40`, color: t.accent, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              📌
            </button>
            <button onClick={listening ? stop : start} title="Dictare vocală"
              style={{ width: 38, height: 38, borderRadius: 10, background: listening ? 'rgba(167,139,250,0.2)' : t.bg, border: `1px solid ${listening ? '#A78BFA' : t.border}`, color: listening ? '#A78BFA' : t.muted, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              🎤
            </button>
          </div>

          {/* Text input */}
          <textarea
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
            }}
            placeholder="Scrie un mesaj... (Enter = trimite, Shift+Enter = linie nouă)"
            rows={1}
            style={{
              flex: 1, background: t.bg, border: `1px solid ${t.border}`,
              borderRadius: 12, padding: '10px 14px', color: t.text,
              fontSize: 14, outline: 'none', resize: 'none',
              fontFamily: 'inherit', lineHeight: 1.5,
              maxHeight: 120, overflowY: 'auto',
            }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
          />

          {/* Send */}
          <button
            onClick={() => send()}
            disabled={!text.trim()}
            style={{
              width: 42, height: 42, borderRadius: 12,
              background: text.trim() ? t.accent : t.border,
              border: 'none', color: text.trim() ? t.accentText : t.muted,
              cursor: text.trim() ? 'pointer' : 'default',
              fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 0.15s',
            }}>
            ➤
          </button>
        </div>
      </div>

      {showTaskPick && (
        <TaskPicker tasks={tasks} projects={projects} onSelect={sendTask} onClose={() => setShowTaskPick(false)} t={t} />
      )}
    </div>
  )
}
