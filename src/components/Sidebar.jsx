import { useState } from 'react'
import { USERS } from '../lib/data'
import { THEMES } from '../lib/themes'
import { Avatar, SyncDot } from './UI'
import { useMobile } from '../hooks/useMobile'

const NAV = [
  { id: 'dashboard', label: 'Principal', icon: '🏠' },
  { id: 'projects',  label: 'Proiecte',  icon: '📁' },
  { id: 'tasks',     label: 'Sarcini',   icon: '✅' },
  { id: 'chat',      label: 'Chat',      icon: '💬' },
  { id: 'resources', label: 'Formulare', icon: '📚' },
]

export default function Sidebar({ user, view, setView, overdueCount, unreadCount, syncing, online, onSwitchUser, themeId, onChangeTheme, t }) {
  const [showUsers,  setShowUsers]  = useState(false)
  const [showThemes, setShowThemes] = useState(false)
  const [showMenu,   setShowMenu]   = useState(false)
  const isMobile = useMobile()
  const active = view === 'project' ? 'projects' : view

  // ── MOBILE: bottom nav bar ────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {/* Bottom nav */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          background: t.card, borderTop: `1px solid ${t.border}`,
          display: 'flex', alignItems: 'stretch',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {NAV.map(n => {
            const isAct = active === n.id
            const badge = n.id==='tasks' ? overdueCount : n.id==='chat' ? unreadCount : 0
            return (
              <button key={n.id} onClick={() => { setView(n.id); setShowMenu(false) }}
                style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3, padding:'10px 4px 8px', background:'none', border:'none', cursor:'pointer', color:isAct?t.accent:t.muted, position:'relative', fontFamily:'inherit' }}>
                {isAct && <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:2, background:t.accent, borderRadius:'0 0 2px 2px' }} />}
                <span style={{ fontSize:20, position:'relative' }}>
                  {n.icon}
                  {badge > 0 && <span style={{ position:'absolute', top:-4, right:-6, background:n.id==='tasks'?t.red:t.accent, color:'#fff', borderRadius:99, fontSize:9, fontWeight:800, padding:'1px 5px', minWidth:16, textAlign:'center' }}>{badge}</span>}
                </span>
                <span style={{ fontSize:10, fontWeight:isAct?700:500, letterSpacing:'0.2px' }}>{n.label}</span>
              </button>
            )
          })}
          {/* Menu button */}
          <button onClick={() => setShowMenu(s => !s)}
            style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3, padding:'10px 4px 8px', background:'none', border:'none', cursor:'pointer', color:showMenu?t.accent:t.muted, fontFamily:'inherit' }}>
            <span style={{ fontSize:20 }}><Avatar userId={user.id} size={22} /></span>
            <span style={{ fontSize:10, fontWeight:500 }}>Cont</span>
          </button>
        </div>

        {/* Mobile menu overlay */}
        {showMenu && (
          <div style={{ position:'fixed', inset:0, zIndex:99, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}
            onClick={() => setShowMenu(false)}>
            <div onClick={e => e.stopPropagation()}
              style={{ background:t.card, borderTop:`1px solid ${t.border}`, borderRadius:'20px 20px 0 0', padding:'20px 20px 120px', boxShadow:'0 -8px 40px rgba(0,0,0,0.3)', animation:'fadeIn 0.2s ease' }}>

              {/* Handle */}
              <div style={{ width:40, height:4, background:t.border, borderRadius:99, margin:'0 auto 20px' }} />

              {/* User */}
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:`${t.accent}12`, borderRadius:14, marginBottom:16 }}>
                <Avatar userId={user.id} size={40} />
                <div>
                  <div style={{ fontSize:15, fontWeight:700, color:t.text }}>{user.name}</div>
                  <div style={{ fontSize:12, color:t.muted }}>{user.role==='admin'?'🛡 Administrator':'👤 Utilizator'}</div>
                </div>
                <SyncDot syncing={syncing} online={online} t={t} />
              </div>

              {/* Switch user */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, color:t.muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:8 }}>Schimbă utilizatorul</div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {Object.values(USERS).map(u => (
                    <button key={u.id} onClick={() => { onSwitchUser(u); setShowMenu(false) }}
                      style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:u.id===user.id?`${t.accent}15`:t.bg, border:`1px solid ${u.id===user.id?t.accent:t.border}`, borderRadius:12, cursor:'pointer', fontFamily:'inherit', transition:'background 0.1s' }}>
                      <Avatar userId={u.id} size={28} />
                      <div style={{ flex:1, textAlign:'left' }}>
                        <div style={{ fontSize:13, fontWeight:600, color:u.id===user.id?t.accent:t.text }}>{u.name}</div>
                        <div style={{ fontSize:11, color:t.muted }}>{u.role==='admin'?'🛡 Admin':'👤 Utilizator'}</div>
                      </div>
                      {u.id===user.id && <span style={{ color:t.accent, fontSize:16 }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Themes */}
              <div>
                <div style={{ fontSize:11, color:t.muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:8 }}>Temă</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                  {Object.values(THEMES).map(th => (
                    <button key={th.id} onClick={() => { onChangeTheme(th.id); setShowMenu(false) }}
                      style={{ background:th.card, border:`2px solid ${themeId===th.id?t.accent:th.border}`, borderRadius:12, padding:'10px 8px', cursor:'pointer', textAlign:'left' }}>
                      <div style={{ display:'flex', gap:2, marginBottom:5 }}>
                        {th.preview.map((c,i) => <div key={i} style={{ flex:1, height:6, borderRadius:2, background:c }} />)}
                      </div>
                      <div style={{ fontSize:10, color:th.sub, fontWeight:600 }}>{th.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // ── DESKTOP: side nav ─────────────────────────────────────────
  return (
    <div style={{ width:234, background:t.card, borderRight:`1px solid ${t.border}`, display:'flex', flexDirection:'column', flexShrink:0, boxShadow:`2px 0 12px rgba(0,0,0,0.15)` }}>

      <div style={{ padding:'22px 20px 18px', borderBottom:`1px solid ${t.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, background:t.accentGrad||t.accent, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, boxShadow:`0 4px 12px ${t.accent}44` }}>📋</div>
          <div>
            <div style={{ fontWeight:800, fontSize:16, letterSpacing:'-0.4px', color:t.text }}>AutorizAct</div>
            <div style={{ fontSize:10, color:t.muted, letterSpacing:'0.5px', textTransform:'uppercase' }}>Management</div>
          </div>
        </div>
      </div>

      <nav style={{ padding:'14px 12px', flex:1 }}>
        <div style={{ fontSize:10, color:t.muted, fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', padding:'4px 8px', marginBottom:6 }}>Navigare</div>
        {NAV.map(n => {
          const isAct = active === n.id
          const badge = n.id==='tasks' ? overdueCount : n.id==='chat' ? unreadCount : 0
          return (
            <button key={n.id} onClick={() => setView(n.id)} style={{ width:'100%', display:'flex', alignItems:'center', gap:11, padding:'10px 12px', borderRadius:12, border:'none', background:isAct?`${t.accent}20`:'transparent', color:isAct?t.accent:t.sub, cursor:'pointer', marginBottom:3, fontSize:13.5, fontWeight:isAct?700:400, transition:'all 0.15s', fontFamily:'inherit', position:'relative' }}
              onMouseEnter={e => { if(!isAct){e.currentTarget.style.background=`${t.border}60`;e.currentTarget.style.color=t.text} }}
              onMouseLeave={e => { if(!isAct){e.currentTarget.style.background='transparent';e.currentTarget.style.color=t.sub} }}>
              {isAct && <div style={{ position:'absolute', left:0, top:'20%', width:3, height:'60%', background:t.accent, borderRadius:'0 3px 3px 0' }} />}
              <span style={{ fontSize:17, flexShrink:0 }}>{n.icon}</span>
              <span style={{ flex:1, textAlign:'left' }}>{n.label}</span>
              {badge > 0 && <span style={{ background:n.id==='tasks'?t.red:t.accent, color:'#fff', borderRadius:99, fontSize:10, fontWeight:800, padding:'2px 7px', minWidth:20, textAlign:'center' }}>{badge}</span>}
            </button>
          )
        })}

        <div style={{ height:1, background:t.border, margin:'14px 4px' }} />
        <div style={{ fontSize:10, color:t.muted, fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', padding:'4px 8px', marginBottom:6 }}>Setări</div>

        <button onClick={() => { setShowThemes(s=>!s); setShowUsers(false) }} style={{ width:'100%', display:'flex', alignItems:'center', gap:11, padding:'10px 12px', borderRadius:12, border:'none', background:showThemes?`${t.accent}20`:'transparent', color:showThemes?t.accent:t.sub, cursor:'pointer', fontSize:13.5, fontWeight:showThemes?700:400, transition:'all 0.15s', fontFamily:'inherit', marginBottom:3 }}
          onMouseEnter={e => { if(!showThemes){e.currentTarget.style.background=`${t.border}60`;e.currentTarget.style.color=t.text} }}
          onMouseLeave={e => { if(!showThemes){e.currentTarget.style.background='transparent';e.currentTarget.style.color=t.sub} }}>
          <span style={{ fontSize:17 }}>🎨</span>
          <span style={{ flex:1, textAlign:'left' }}>Temă</span>
          <span style={{ fontSize:11, color:t.muted, fontWeight:500 }}>{THEMES[themeId]?.name?.split(' ')[0]}</span>
        </button>
        {showThemes && (
          <div style={{ margin:'6px 4px 10px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, animation:'fadeIn 0.15s ease' }}>
            {Object.values(THEMES).map(th => (
              <button key={th.id} onClick={() => { onChangeTheme(th.id); setShowThemes(false) }}
                style={{ background:th.card, border:`2px solid ${themeId===th.id?t.accent:th.border}`, borderRadius:12, padding:'10px', cursor:'pointer', textAlign:'left', transition:'all 0.15s', boxShadow:themeId===th.id?`0 0 0 2px ${t.accent}33`:'none' }}>
                <div style={{ display:'flex', gap:3, marginBottom:6 }}>
                  {th.preview.map((c,i) => <div key={i} style={{ flex:1, height:8, borderRadius:3, background:c }} />)}
                </div>
                <div style={{ fontSize:10, color:th.sub, fontWeight:600 }}>{th.name}</div>
              </button>
            ))}
          </div>
        )}
      </nav>

      <div style={{ padding:'12px 14px', borderTop:`1px solid ${t.border}` }}>
        <div style={{ marginBottom:10, padding:'0 4px' }}><SyncDot syncing={syncing} online={online} t={t} /></div>
        <button onClick={() => { setShowUsers(s=>!s); setShowThemes(false) }}
          style={{ width:'100%', background:`${t.accent}12`, border:`1px solid ${t.accent}30`, borderRadius:14, padding:'10px 12px', display:'flex', alignItems:'center', gap:10, cursor:'pointer', color:t.text, fontFamily:'inherit', transition:'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background=`${t.accent}22`}
          onMouseLeave={e => e.currentTarget.style.background=`${t.accent}12`}>
          <Avatar userId={user.id} size={34} />
          <div style={{ flex:1, minWidth:0, textAlign:'left' }}>
            <div style={{ fontSize:13, fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', color:t.text }}>{user.name.split(' ')[0]} {user.name.split(' ')[1]?.[0]}.</div>
            <div style={{ color:t.muted, fontSize:11 }}>{user.role==='admin'?'🛡 Administrator':'👤 Utilizator'}</div>
          </div>
          <span style={{ color:t.muted, fontSize:12, flexShrink:0 }}>{showUsers?'▲':'▼'}</span>
        </button>
        {showUsers && (
          <div style={{ marginTop:8, background:t.bg, border:`1px solid ${t.border}`, borderRadius:14, overflow:'hidden', animation:'fadeIn 0.15s ease', boxShadow:t.shadow }}>
            {Object.values(USERS).map((u,i,arr) => (
              <button key={u.id} onClick={() => { onSwitchUser(u); setShowUsers(false) }}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:u.id===user.id?`${t.accent}15`:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit', borderBottom:i<arr.length-1?`1px solid ${t.border}`:'none', transition:'background 0.1s' }}
                onMouseEnter={e => { if(u.id!==user.id) e.currentTarget.style.background=`${t.border}40` }}
                onMouseLeave={e => { if(u.id!==user.id) e.currentTarget.style.background='transparent' }}>
                <Avatar userId={u.id} size={30} />
                <div style={{ flex:1, textAlign:'left' }}>
                  <div style={{ fontSize:12, fontWeight:600, color:u.id===user.id?t.accent:t.text }}>{u.name}</div>
                  <div style={{ fontSize:10, color:t.muted }}>{u.role==='admin'?'🛡 Admin':'👤 Utilizator'}</div>
                </div>
                {u.id===user.id && <div style={{ width:18, height:18, borderRadius:'50%', background:t.accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:t.accentText, fontWeight:700 }}>✓</div>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
