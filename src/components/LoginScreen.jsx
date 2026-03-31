import { USERS } from '../lib/data'
import { Avatar } from './UI'

export default function LoginScreen({ onLogin }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#0F172A',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 24,
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: 440, width: '100%', animation: 'fadeIn 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, background: '#F59E0B', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>📋</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>AutorizAct</div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, letterSpacing: '0.5px' }}>MANAGEMENTUL AUTORIZAȚIILOR</div>
            </div>
          </div>
          <p style={{ color: '#64748B', fontSize: 14, margin: 0 }}>Selectați profilul pentru a continua</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.values(USERS).map(u => (
            <button key={u.id} onClick={() => onLogin(u)}
              style={{
                background: '#1E293B', border: '1px solid #334155',
                borderRadius: 16, padding: '20px 24px',
                display: 'flex', alignItems: 'center', gap: 16,
                cursor: 'pointer', textAlign: 'left', width: '100%',
                color: '#fff', transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = u.bg}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#334155'}>
              <Avatar userId={u.id} size={48} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{u.name}</div>
                <div style={{ fontSize: 12, color: u.role === 'admin' ? u.bg : '#64748B', fontWeight: 500 }}>
                  {u.role === 'admin' ? '🛡 Administrator' : '👤 Utilizator'}
                </div>
              </div>
              <span style={{ color: '#64748B', fontSize: 20 }}>›</span>
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: '#1E3A5F', fontSize: 12, marginTop: 32, fontFamily: "'DM Mono', monospace" }}>
          v1.0 · Blue Line Energy
        </p>
      </div>
    </div>
  )
}
