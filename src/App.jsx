import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import ProjectList from './pages/ProjectList'
import ProjectDetail from './pages/ProjectDetail'
import TasksView from './pages/TasksView'
import Chat from './pages/Chat'
import Resources from './pages/Resources'
import { useSync } from './hooks/useSync'
import { useMobile } from './hooks/useMobile'
import { isOD, USERS } from './lib/data'
import { THEMES, DEFAULT_THEME } from './lib/themes'
import { setTheme } from './components/UI'

export default function App() {
  const [user, setUser]               = useState(Object.values(USERS)[0])
  const [view, setView]               = useState('dashboard')
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [themeId, setThemeId]         = useState(() => localStorage.getItem('autorizact_theme') || DEFAULT_THEME)
  const [lastSeenChat, setLastSeenChat] = useState(() => parseInt(localStorage.getItem('autorizact_chat_seen') || '0'))

  const t = THEMES[themeId] || THEMES[DEFAULT_THEME]
  setTheme(t)
  const isMobile = useMobile()

  const handleChangeTheme = id => {
    setThemeId(id)
    localStorage.setItem('autorizact_theme', id)
  }

  const {
    projects, tasks, messages,
    loading, syncing, online,
    addProject, updateProject,
    addProcedure, updateProcedure, deleteProcedure,
    addComment, addDocument, deleteDocument,
    addTask, updateTaskStatus, updateTask, deleteTask, deleteProject,
    sendMessage, addReaction,
  } = useSync()

  const overdueCount = tasks.filter(tk => isOD(tk.dueDate) && tk.status !== 'completed').length
  const unreadCount  = messages.filter(m => new Date(m.ts).getTime() > lastSeenChat && m.author !== user.id).length

  const openProject = (id, procId = null) => {
    setActiveProjectId(id)
    setActiveProcId(procId)
    setView('project')
  }
  const [activeProcId, setActiveProcId] = useState(null)
  const activeProject = projects.find(p => p.id === activeProjectId)

  const handleSetView = v => {
    setView(v)
    if (v !== 'project') setActiveProjectId(null)
    if (v === 'chat') {
      const now = Date.now()
      setLastSeenChat(now)
      localStorage.setItem('autorizact_chat_seen', String(now))
    }
  }

  useEffect(() => {
    document.body.style.background = t.bg
    document.body.style.color = t.text
  }, [t])

  if (loading) {
    return (
      <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:t.bg, color:t.muted, flexDirection:'column', gap:20 }}>
        <div style={{ position:'relative' }}>
          <div style={{ width:52, height:52, border:`3px solid ${t.border}`, borderRadius:'50%', animation:'spin 1.2s linear infinite' }} />
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>📋</div>
        </div>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:15, fontWeight:700, color:t.sub, marginBottom:4 }}>AutorizAct</div>
          <div style={{ fontSize:13 }}>Se încarcă datele...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:t.bg, color:t.text, fontFamily:"'DM Sans', system-ui, sans-serif" }}>
      <Sidebar
        user={user} view={view} setView={handleSetView}
        overdueCount={overdueCount} unreadCount={unreadCount}
        syncing={syncing} online={online}
        onSwitchUser={setUser}
        themeId={themeId} onChangeTheme={handleChangeTheme}
        t={t}
      />

      <main style={{ flex:1, overflow:view==='chat'?'hidden':'auto', background:t.bg, display:view==='chat'?'flex':'block', flexDirection:'column', paddingBottom: isMobile ? 72 : 0 }}>
        {view==='dashboard' && <Dashboard user={user} projects={projects} tasks={tasks} onOpenProject={openProject} t={t} />}
        {view==='projects' && <ProjectList user={user} projects={projects} onOpen={openProject} onAdd={addProject} onDelete={deleteProject} onEdit={updateProject} t={t} />}
        {view==='project' && activeProject && (
          <ProjectDetail
            key={activeProject.id} user={user} project={activeProject} tasks={tasks}
            initialProcId={activeProcId}
            onBack={() => { setView('projects'); setActiveProcId(null) }}
            onAddProcedure={addProcedure} onUpdateProcedure={updateProcedure} onDeleteProcedure={deleteProcedure}
            onAddComment={addComment} onAddDocument={addDocument}
            onDeleteDocument={deleteDocument} onAddTask={addTask}
            onUpdateTaskStatus={updateTaskStatus} onUpdateTask={updateTask} onDeleteTask={deleteTask} t={t}
          />
        )}
        {view==='tasks' && <TasksView user={user} tasks={tasks} projects={projects} onAddTask={addTask} onUpdateTaskStatus={updateTaskStatus} onUpdateTask={updateTask} onDeleteTask={deleteTask} t={t} />}
        {view==='chat' && <Chat user={user} messages={messages} tasks={tasks} projects={projects} onSend={sendMessage} onReact={addReaction} t={t} />}
        {view==='resources' && <Resources user={user} t={t} />}
      </main>
    </div>
  )
}
