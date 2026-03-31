/**
 * useSync — sincronizare bidirecțională cu Supabase
 * Dacă Supabase nu e configurat → datele rămân local
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseReady } from '../lib/supabase'
import { SEED_PROJECTS, SEED_TASKS, uid } from '../lib/data'

function dbToProject(row, procedures) {
  return {
    id: row.id, name: row.name, certificat: row.certificat || '',
    address: row.address || '', emitent: row.emitent || '',
    dataEmitere: row.data_emitere || '', dataExpirare: row.data_expirare || '',
    status: row.status || 'pending',
    procedures: procedures.filter(p => p.projectId === row.id)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
  }
}

function dbToProcedure(row, docs, comments) {
  return {
    id: row.id, projectId: row.project_id, name: row.name,
    status: row.status || 'pending', deadline: row.deadline || '',
    sort_order: row.sort_order || 0,
    docs: docs.filter(d => d.procedureId === row.id),
    comments: comments.filter(c => c.procedureId === row.id)
      .sort((a, b) => new Date(a.ts) - new Date(b.ts)),
  }
}

function dbToTask(row) {
  return {
    id: row.id, title: row.title, projectId: row.project_id,
    procId: row.proc_id, assignedTo: row.assigned_to,
    assignedBy: row.assigned_by, dueDate: row.due_date || '',
    status: row.status || 'pending', priority: row.priority || 'medium',
  }
}

function dbToMessage(row) {
  return {
    id: row.id, text: row.text, author: row.author,
    ts: row.created_at,
    type: row.type || 'text',          // 'text' | 'task_ref'
    taskId: row.task_id || null,
    taskSnapshot: row.task_snapshot ? JSON.parse(row.task_snapshot) : null,
    reactions: row.reactions ? JSON.parse(row.reactions) : {},
  }
}

export function useSync() {
  const [projects,  setProjects]  = useState(JSON.parse(JSON.stringify(SEED_PROJECTS)))
  const [tasks,     setTasks]     = useState(JSON.parse(JSON.stringify(SEED_TASKS)))
  const [messages,  setMessages]  = useState([])
  const [loading,   setLoading]   = useState(false)
  const [syncing,   setSyncing]   = useState(false)
  const [online,    setOnline]    = useState(isSupabaseReady())

  useEffect(() => { if (isSupabaseReady()) loadAll() }, [])

  // Realtime
  useEffect(() => {
    if (!isSupabaseReady()) return
    const channel = supabase
      .channel('autorizact-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' },   () => loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'procedures' }, () => loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' },   () => loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' },      () => loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => loadMessages())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const loadMessages = useCallback(async () => {
    if (!isSupabaseReady()) return
    const { data } = await supabase.from('chat_messages').select('*').order('created_at')
    if (data) setMessages(data.map(dbToMessage))
  }, [])

  const loadAll = useCallback(async () => {
    if (!isSupabaseReady()) return
    setLoading(true)
    try {
      const [
        { data: dbProjects }, { data: dbProcedures },
        { data: dbDocs },     { data: dbComments },
        { data: dbTasks },    { data: dbMsgs },
      ] = await Promise.all([
        supabase.from('projects').select('*').order('created_at'),
        supabase.from('procedures').select('*').order('sort_order'),
        supabase.from('documents').select('*').order('uploaded_at'),
        supabase.from('comments').select('*').order('created_at'),
        supabase.from('tasks').select('*').order('created_at'),
        supabase.from('chat_messages').select('*').order('created_at'),
      ])

      const docs = (dbDocs || []).map(d => ({
        id: d.id, procedureId: d.procedure_id, projectId: d.project_id,
        name: d.name, size: d.size || 0, storagePath: d.storage_path,
        uploadedBy: d.uploaded_by, uploadedAt: d.uploaded_at,
        url: d.storage_path
          ? supabase.storage.from('documents').getPublicUrl(d.storage_path).data.publicUrl
          : null,
      }))
      const comments = (dbComments || []).map(c => ({
        id: c.id, procedureId: c.procedure_id, projectId: c.project_id,
        text: c.text, author: c.author, voice: c.voice, ts: c.created_at,
      }))
      const procs = (dbProcedures || []).map(pr => dbToProcedure(pr, docs, comments))
      const projs = (dbProjects || []).map(p => dbToProject(p, procs))

      setProjects(projs)
      setTasks((dbTasks || []).map(dbToTask))
      setMessages((dbMsgs || []).map(dbToMessage))
    } catch (err) {
      console.error('Supabase load error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const withSync = fn => async (...args) => {
    setSyncing(true)
    try { await fn(...args) }
    catch (err) { console.error('Sync error:', err) }
    finally { setSyncing(false) }
  }

  // ── Projects ─────────────────────────────────────────────────
  const addProject = withSync(async (data) => {
    const id = uid()
    const initProcs = (data.procedures || []).map((p, i) => ({
      id: uid(), name: p.name, status: 'pending', deadline: '',
      docs: [], comments: [], flagged: false, sortOrder: i,
    }))
    setProjects(ps => [...ps, { ...data, id, status: 'pending', procedures: initProcs }])
    if (isSupabaseReady()) {
      await supabase.from('projects').insert({
        id, name: data.name, certificat: data.certificat,
        address: data.address, emitent: data.emitent,
        data_emitere: data.dataEmitere || null,
        data_expirare: data.dataExpirare || null, status: 'pending',
      })
      if (initProcs.length > 0) {
        await supabase.from('procedures').insert(
          initProcs.map((p, i) => ({
            id: p.id, project_id: id, name: p.name,
            status: 'pending', sort_order: i,
          }))
        )
      }
    }
  })

  const updateProject = withSync(async (projectId, patch) => {
    setProjects(ps => ps.map(p => p.id === projectId ? { ...p, ...patch } : p))
    if (isSupabaseReady()) {
      const dbPatch = { updated_at: new Date().toISOString() }
      if (patch.name) dbPatch.name = patch.name
      if (patch.status) dbPatch.status = patch.status
      if (patch.dataExpirare !== undefined) dbPatch.data_expirare = patch.dataExpirare || null
      await supabase.from('projects').update(dbPatch).eq('id', projectId)
    }
  })

  // ── Procedures ───────────────────────────────────────────────
  const addProcedure = withSync(async (projectId, name) => {
    const id = uid()
    const proj = projects.find(p => p.id === projectId)
    const sortOrder = proj ? proj.procedures.length : 0
    const newPr = { id, projectId, name, status: 'pending', deadline: '', docs: [], comments: [], sort_order: sortOrder }
    setProjects(ps => ps.map(p => p.id === projectId ? { ...p, procedures: [...p.procedures, newPr] } : p))
    if (isSupabaseReady()) {
      await supabase.from('procedures').insert({ id, project_id: projectId, name, status: 'pending', sort_order: sortOrder })
    }
  })

  const updateProcedure = withSync(async (projectId, procId, fn) => {
    let updated
    setProjects(ps => ps.map(p => {
      if (p.id !== projectId) return p
      return { ...p, procedures: p.procedures.map(pr => {
        if (pr.id !== procId) return pr
        updated = fn(pr); return updated
      })}
    }))
    if (isSupabaseReady() && updated) {
      await supabase.from('procedures').update({
        name: updated.name, status: updated.status,
        deadline: updated.deadline || null,
        updated_at: new Date().toISOString(),
      }).eq('id', procId)
    }
  })

  const deleteProcedure = withSync(async (projectId, procId) => {
    setProjects(ps => ps.map(p => p.id !== projectId ? p : {
      ...p, procedures: p.procedures.filter(pr => pr.id !== procId)
    }))
    if (isSupabaseReady()) {
      await supabase.from('procedures').delete().eq('id', procId)
    }
  })

  // ── Comments ─────────────────────────────────────────────────
  const addComment = withSync(async (projectId, procId, text, author, voice = false) => {
    const id = uid()
    const ts = new Date().toISOString()
    const comment = { id, text, author, voice, ts, procedureId: procId }
    setProjects(ps => ps.map(p => p.id !== projectId ? p : {
      ...p, procedures: p.procedures.map(pr => pr.id !== procId ? pr : {
        ...pr, comments: [...pr.comments, comment]
      })
    }))
    if (isSupabaseReady()) {
      await supabase.from('comments').insert({
        id, procedure_id: procId, project_id: projectId,
        text, author, voice, created_at: ts,
      })
    }
  })

  // ── Documents ────────────────────────────────────────────────
  const addDocument = withSync(async (projectId, procId, file) => {
    const id = uid()
    let url = URL.createObjectURL(file)
    let storagePath = null
    if (isSupabaseReady()) {
      storagePath = `${projectId}/${procId}/${id}_${file.name}`
      const { error } = await supabase.storage.from('documents').upload(storagePath, file)
      if (!error) {
        url = supabase.storage.from('documents').getPublicUrl(storagePath).data.publicUrl
      } else { storagePath = null }
    }
    const doc = { id, procedureId: procId, projectId, name: file.name, size: file.size, storagePath, url, uploadedBy: null, uploadedAt: new Date().toISOString() }
    setProjects(ps => ps.map(p => p.id !== projectId ? p : {
      ...p, procedures: p.procedures.map(pr => pr.id !== procId ? pr : { ...pr, docs: [...pr.docs, doc] })
    }))
    if (isSupabaseReady()) {
      await supabase.from('documents').insert({
        id, procedure_id: procId, project_id: projectId,
        name: file.name, size: file.size, storage_path: storagePath, uploaded_by: doc.uploadedBy,
      })
    }
  })

  const deleteDocument = withSync(async (projectId, procId, docId) => {
    const proj = projects.find(p => p.id === projectId)
    const proc = proj?.procedures.find(p => p.id === procId)
    const doc  = proc?.docs.find(d => d.id === docId)
    setProjects(ps => ps.map(p => p.id !== projectId ? p : {
      ...p, procedures: p.procedures.map(pr => pr.id !== procId ? pr : { ...pr, docs: pr.docs.filter(d => d.id !== docId) })
    }))
    if (isSupabaseReady()) {
      await supabase.from('documents').delete().eq('id', docId)
      if (doc?.storagePath) await supabase.storage.from('documents').remove([doc.storagePath])
    }
  })

  // ── Tasks ────────────────────────────────────────────────────
  const addTask = withSync(async (taskData) => {
    const id = uid()
    const task = { ...taskData, id, status: 'pending' }
    setTasks(ts => [...ts, task])
    if (isSupabaseReady()) {
      await supabase.from('tasks').insert({
        id, title: task.title, project_id: task.projectId,
        proc_id: task.procId, assigned_to: task.assignedTo,
        assigned_by: task.assignedBy, due_date: task.dueDate || null,
        status: 'pending', priority: task.priority,
      })
    }
  })

  const updateTaskStatus = withSync(async (taskId, status) => {
    setTasks(ts => ts.map(t => t.id === taskId ? { ...t, status } : t))
    if (isSupabaseReady()) {
      await supabase.from('tasks').update({ status, updated_at: new Date().toISOString() }).eq('id', taskId)
    }
  })

  const updateTask = withSync(async (taskId, patch) => {
    setTasks(ts => ts.map(t => t.id === taskId ? { ...t, ...patch } : t))
    if (isSupabaseReady()) {
      const dbPatch = { updated_at: new Date().toISOString() }
      if (patch.title !== undefined)      dbPatch.title       = patch.title
      if (patch.status !== undefined)     dbPatch.status      = patch.status
      if (patch.priority !== undefined)   dbPatch.priority    = patch.priority
      if (patch.assignedTo !== undefined) dbPatch.assigned_to = patch.assignedTo
      if (patch.dueDate !== undefined)    dbPatch.due_date    = patch.dueDate || null
      await supabase.from('tasks').update(dbPatch).eq('id', taskId)
    }
  })

  const deleteTask = withSync(async (taskId) => {
    setTasks(ts => ts.filter(t => t.id !== taskId))
    if (isSupabaseReady()) {
      await supabase.from('tasks').delete().eq('id', taskId)
    }
  })

  const deleteProject = withSync(async (projectId) => {
    setProjects(ps => ps.filter(p => p.id !== projectId))
    setTasks(ts => ts.filter(t => t.projectId !== projectId))
    if (isSupabaseReady()) {
      await supabase.from('tasks').delete().eq('project_id', projectId)
      await supabase.from('procedures').delete().eq('project_id', projectId)
      await supabase.from('projects').delete().eq('id', projectId)
    }
  })

  // ── Chat Messages ────────────────────────────────────────────
  const sendMessage = withSync(async ({ text, author, type = 'text', taskId = null, taskSnapshot = null }) => {
    const id = uid()
    const ts = new Date().toISOString()
    const msg = { id, text, author, ts, type, taskId, taskSnapshot, reactions: {} }
    setMessages(ms => [...ms, msg])
    if (isSupabaseReady()) {
      await supabase.from('chat_messages').insert({
        id, text, author, type,
        task_id: taskId || null,
        task_snapshot: taskSnapshot ? JSON.stringify(taskSnapshot) : null,
        reactions: '{}',
        created_at: ts,
      })
    }
  })

  const addReaction = withSync(async (msgId, emoji, userId) => {
    setMessages(ms => ms.map(m => {
      if (m.id !== msgId) return m
      const r = { ...m.reactions }
      if (!r[emoji]) r[emoji] = []
      if (r[emoji].includes(userId)) {
        r[emoji] = r[emoji].filter(u => u !== userId)
        if (r[emoji].length === 0) delete r[emoji]
      } else {
        r[emoji] = [...r[emoji], userId]
      }
      return { ...m, reactions: r }
    }))
    if (isSupabaseReady()) {
      const msg = messages.find(m => m.id === msgId)
      if (msg) {
        const r = { ...msg.reactions }
        if (!r[emoji]) r[emoji] = []
        if (r[emoji].includes(userId)) {
          r[emoji] = r[emoji].filter(u => u !== userId)
          if (r[emoji].length === 0) delete r[emoji]
        } else r[emoji] = [...r[emoji], userId]
        await supabase.from('chat_messages').update({ reactions: JSON.stringify(r) }).eq('id', msgId)
      }
    }
  })

  return {
    projects, setProjects,
    tasks, setTasks,
    messages,
    loading, syncing, online,
    addProject, updateProject,
    addProcedure, updateProcedure, deleteProcedure,
    addComment, addDocument, deleteDocument,
    addTask, updateTaskStatus, updateTask, deleteTask, deleteProject,
    sendMessage, addReaction,
    reload: loadAll,
  }
}
