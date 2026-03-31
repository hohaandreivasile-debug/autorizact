import { STATUS, USERS, PRIORITY } from '../lib/data'

export const defaultTheme = {
  bg:'#0F172A', card:'#1E2640', border:'#1E3A5F', cardAlt:'#162035',
  shadow:'0 4px 24px rgba(0,0,0,0.35)',
  text:'#F1F5F9', muted:'#64748B', sub:'#94A3B8',
  accent:'#6366F1', accentText:'#fff',
  accentGrad:'linear-gradient(135deg,#6366F1,#818CF8)',
  green:'#10B981', red:'#EF4444', blue:'#3B82F6',
  orange:'#F59E0B', purple:'#8B5CF6', teal:'#14B8A6',
  statCards:[
    {bg:'linear-gradient(135deg,#6366F1,#4F46E5)',text:'#fff'},
    {bg:'linear-gradient(135deg,#10B981,#059669)',text:'#fff'},
    {bg:'linear-gradient(135deg,#EF4444,#DC2626)',text:'#fff'},
    {bg:'linear-gradient(135deg,#F59E0B,#D97706)',text:'#fff'},
  ],
}

let _theme = defaultTheme
export const setTheme = t => { _theme = t }
export const T = () => _theme
export const A = defaultTheme

// ── Avatar ───────────────────────────────────────────────────────
export function Avatar({ userId, size = 32 }) {
  const u = USERS[userId]
  if (!u) return null
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: u.bg, color: u.tc,
      fontSize: size * 0.36, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, flexShrink: 0,
      boxShadow: `0 0 0 2px ${u.bg}33`,
    }}>{u.initials}</div>
  )
}

// ── Badge ────────────────────────────────────────────────────────
export function Badge({ status }) {
  const s = STATUS[status] || STATUS.pending
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 9999,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.4px',
      whiteSpace: 'nowrap', background: s.bg, color: s.color,
      border: `1px solid ${s.color}44`,
    }}>{s.label}</span>
  )
}

// ── Priority dot ─────────────────────────────────────────────────
export function PriorityDot({ priority, height = 40 }) {
  const p = PRIORITY[priority] || PRIORITY.medium
  return <div style={{ width: 3, height, borderRadius: 99, background: p.color, flexShrink: 0 }} />
}

// ── Form input ───────────────────────────────────────────────────
export function FormInput({ label, textarea, rows = 3, t, ...props }) {
  const th = t || _theme
  const base = {
    width: '100%', background: th.bg,
    border: `1.5px solid ${th.border}`, borderRadius: 10,
    padding: '10px 14px', color: th.text,
    fontSize: 14, outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  }
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{
          display: 'block', color: th.muted, fontSize: 11,
          fontWeight: 700, marginBottom: 6,
          textTransform: 'uppercase', letterSpacing: '0.6px',
        }}>{label}</label>
      )}
      {textarea
        ? <textarea rows={rows} {...props} style={{ ...base, resize: 'none', ...(props.style || {}) }}
            onFocus={e => e.target.style.borderColor = th.accent}
            onBlur={e => e.target.style.borderColor = th.border} />
        : <input {...props} style={{ ...base, ...(props.style || {}) }}
            onFocus={e => e.target.style.borderColor = th.accent}
            onBlur={e => e.target.style.borderColor = th.border} />}
    </div>
  )
}

// ── Modal ────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, maxWidth = 500, t }) {
  const th = t || _theme
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 24, backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: th.card, border: `1px solid ${th.border}`,
        borderRadius: 20, padding: 32, width: '100%', maxWidth,
        animation: 'fadeIn 0.2s ease', color: th.text,
        boxShadow: th.shadow,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: th.text }}>{title}</h2>
          <button onClick={onClose} style={{
            background: th.bg, border: `1px solid ${th.border}`,
            borderRadius: 8, cursor: 'pointer', color: th.muted,
            width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0,
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Button Row ───────────────────────────────────────────────────
export function BtnRow({ onCancel, onSave, saveLabel = 'Salvează', t }) {
  const th = t || _theme
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
      <button onClick={onCancel} style={{
        flex: 1, background: 'transparent', border: `1.5px solid ${th.border}`,
        color: th.sub, borderRadius: 10, padding: '11px 12px',
        cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: 14,
        transition: 'border-color 0.15s, color 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = th.sub; e.currentTarget.style.color = th.text }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = th.border; e.currentTarget.style.color = th.sub }}>
        Anulare
      </button>
      <button onClick={onSave} style={{
        flex: 1, background: th.accentGrad || th.accent, border: 'none',
        color: th.accentText, borderRadius: 10, padding: '11px 12px',
        cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit', fontSize: 14,
        boxShadow: `0 4px 14px ${th.accent}44`,
        transition: 'opacity 0.15s, transform 0.1s',
      }}
        onMouseEnter={e => { e.currentTarget.style.opacity='0.9'; e.currentTarget.style.transform='translateY(-1px)' }}
        onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)' }}>
        {saveLabel}
      </button>
    </div>
  )
}

// ── Status select ─────────────────────────────────────────────────
export function StatusSelect({ value, onChange, t }) {
  const th = t || _theme
  return (
    <select value={value} onChange={onChange} style={{
      background: th.bg, border: `1.5px solid ${th.border}`,
      color: th.sub, borderRadius: 8, padding: '8px 12px',
      fontSize: 13, cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
    }}>
      {Object.entries(STATUS).map(([k, v]) => (
        <option key={k} value={k}>{v.label}</option>
      ))}
    </select>
  )
}

// ── Sync dot ─────────────────────────────────────────────────────
export function SyncDot({ syncing, online, t }) {
  const th = t || _theme
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: th.muted }}>
      <div style={{
        width: 7, height: 7, borderRadius: '50%',
        background: syncing ? th.orange : online ? th.green : th.red,
        animation: syncing ? 'pulse 1s infinite' : 'none',
        boxShadow: syncing ? `0 0 6px ${th.orange}` : online ? `0 0 6px ${th.green}66` : 'none',
      }} />
      {syncing ? 'Sincronizare...' : online ? 'Sincronizat' : 'Local'}
    </div>
  )
}

// ── Stat Card ────────────────────────────────────────────────────
export function StatCard({ label, value, icon, gradient, t, trend }) {
  const th = t || _theme
  const grad = gradient || th.accentGrad
  return (
    <div style={{
      background: grad, borderRadius: 18, padding: '22px 24px',
      color: '#fff', position: 'relative', overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
    }}>
      <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 72, opacity: 0.12, userSelect: 'none' }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.85, marginBottom: 10, letterSpacing: '0.3px' }}>{label}</div>
      <div style={{ fontSize: 38, fontWeight: 800, lineHeight: 1, letterSpacing: '-1px', marginBottom: 6 }}>{value}</div>
      {trend !== undefined && (
        <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 500 }}>{trend}</div>
      )}
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────
export function SectionHead({ icon, title, count, action, t }) {
  const th = t || _theme
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: `${th.accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: th.text, margin: 0, lineHeight: 1.2 }}>
          {title}
          {count !== undefined && <span style={{ color: th.muted, fontWeight: 500, fontSize: 13, marginLeft: 6 }}>({count})</span>}
        </h2>
      </div>
      {action}
    </div>
  )
}

// ── Card ─────────────────────────────────────────────────────────
export function Card({ children, t, style = {} }) {
  const th = t || _theme
  return (
    <div style={{
      background: th.card, border: `1px solid ${th.border}`,
      borderRadius: 18, padding: 24, boxShadow: th.shadow,
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── Pill button ───────────────────────────────────────────────────
export function PillBtn({ children, onClick, active, t, color, style = {} }) {
  const th = t || _theme
  const c = color || th.accent
  return (
    <button onClick={onClick} style={{
      background: active ? `${c}20` : 'transparent',
      border: `1.5px solid ${active ? c : th.border}`,
      color: active ? c : th.sub, borderRadius: 99,
      padding: '6px 16px', fontSize: 13,
      fontWeight: active ? 700 : 500, cursor: 'pointer',
      fontFamily: 'inherit', transition: 'all 0.15s',
      ...style,
    }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = c; e.currentTarget.style.color = c } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = th.border; e.currentTarget.style.color = th.sub } }}>
      {children}
    </button>
  )
}

// ── Primary button ────────────────────────────────────────────────
export function PrimaryBtn({ children, onClick, t, icon, style = {} }) {
  const th = t || _theme
  return (
    <button onClick={onClick} style={{
      background: th.accentGrad || th.accent, color: th.accentText,
      border: 'none', borderRadius: 12, padding: '10px 20px',
      fontWeight: 700, fontSize: 14, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: `0 4px 14px ${th.accent}44`,
      fontFamily: 'inherit', transition: 'opacity 0.15s, transform 0.1s',
      ...style,
    }}
      onMouseEnter={e => { e.currentTarget.style.opacity='0.9'; e.currentTarget.style.transform='translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)' }}>
      {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
      {children}
    </button>
  )
}
