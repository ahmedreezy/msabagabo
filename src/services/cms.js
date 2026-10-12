import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { educationPublicationIssues } from '../lib/educationProfile.js'

const requireClient = () => {
  if (!supabase) throw new Error('Supabase is not configured. Add the required Vite environment variables.')
  return supabase
}

export const cmsAuth = {
  async signIn(email, password) {
    const { data, error } = await requireClient().auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await requireClient().auth.signOut()
    if (error) throw error
  },

  async getSession() {
    if (!isSupabaseConfigured) return null
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  async getProfile(userId) {
    const { data, error } = await requireClient().from('profiles').select('id, full_name, role').eq('id', userId).single()
    if (error) throw error
    return data
  },
}

export const cmsEntries = {
  async list(collection) {
    let query = requireClient()
      .from('cms_entries')
      .select('id, collection, slug, title, payload, status, sort_order, published_at, updated_at, updated_by')
      .order('sort_order', { ascending: true })
      .order('updated_at', { ascending: false })
    if (collection) query = query.eq('collection', collection)
    const { data, error } = await query
    if (error) throw error
    const entries = data ?? []
    if (!entries.length) return entries

    const { data: revisions, error: revisionError } = await requireClient()
      .from('cms_entry_revisions')
      .select('id, entry_id, title, slug, payload, sort_order, review_status, release_key, updated_at')
      .in('entry_id', entries.map((entry) => entry.id))
      .in('review_status', ['draft', 'in_review', 'approved'])
      .order('updated_at', { ascending: false })
    if (revisionError) return entries

    const latestRevision = new Map()
    ;(revisions ?? []).forEach((revision) => { if (!latestRevision.has(revision.entry_id)) latestRevision.set(revision.entry_id, revision) })
    return entries.map((entry) => {
      const revision = latestRevision.get(entry.id)
      if (!revision) return entry
      return {
        ...entry,
        live_status: entry.status,
        revision_id: revision.id,
        review_status: revision.review_status,
        release_key: revision.release_key,
        title: revision.title,
        slug: revision.slug,
        payload: revision.payload,
        sort_order: revision.sort_order,
        status: 'draft',
        updated_at: revision.updated_at,
      }
    })
  },

  async published() {
    if (!isSupabaseConfigured) return []
    const { data, error } = await supabase
      .from('cms_entries')
      .select('id, collection, slug, title, payload, sort_order, published_at')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async save(entry, userId) {
    if (entry.collection === 'departments' && entry.status === 'published' && entry.payload?.educationProfile) {
      const issues = educationPublicationIssues(entry.payload)
      if (issues.length) throw new Error(issues[0])
    }
    const record = {
      collection: entry.collection,
      slug: entry.slug || null,
      title: entry.title,
      payload: entry.payload,
      status: entry.status,
      sort_order: Number(entry.sort_order) || 0,
      published_at: entry.status === 'published' ? entry.published_at || new Date().toISOString() : null,
      updated_by: userId,
    }

    if (entry.id) {
      const { data, error } = await requireClient().from('cms_entries').update(record).eq('id', entry.id).select().single()
      if (error) throw error
      return data
    }

    const { data, error } = await requireClient()
      .from('cms_entries')
      .insert({ ...record, created_by: userId })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async saveRevision(entry, userId) {
    const record = {
      entry_id: entry.id,
      title: entry.title,
      slug: entry.slug || null,
      payload: entry.payload,
      sort_order: Number(entry.sort_order) || 0,
      review_status: entry.payload?.reviewStatus === 'approved' ? 'approved' : 'draft',
      release_key: entry.payload?.contentRelease || null,
      created_by: userId,
      reviewed_by: entry.payload?.reviewStatus === 'approved' ? userId : null,
    }
    let query
    if (entry.revision_id) query = requireClient().from('cms_entry_revisions').update(record).eq('id', entry.revision_id)
    else query = requireClient().from('cms_entry_revisions').insert(record)
    const { data, error } = await query.select().single()
    if (error) throw error
    return { ...entry, ...record, revision_id: data.id, status: 'draft', live_status: entry.live_status || entry.status, updated_at: data.updated_at }
  },

  async publishRevision(revisionId) {
    const { data, error } = await requireClient().rpc('publish_cms_revision', { revision_id: revisionId })
    if (error) throw error
    return data
  },

  async discardRevision(revisionId) {
    const { error } = await requireClient().from('cms_entry_revisions').delete().eq('id', revisionId)
    if (error) throw error
  },

  async publishRelease(releaseKey) {
    const { data, error } = await requireClient().rpc('publish_cms_release', { supplied_release_key: releaseKey })
    if (error) throw error
    return data
  },

  async rollback(entryId) {
    const { data, error } = await requireClient().rpc('rollback_cms_entry', { supplied_entry_id: entryId })
    if (error) throw error
    return data
  },

  async remove(id) {
    const { error } = await requireClient().from('cms_entries').delete().eq('id', id)
    if (error) throw error
  },

  async upload(file, options = {}) {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${extension}`
    const { error } = await requireClient().storage.from('cms-media').upload(path, file, { cacheControl: '3600' })
    if (error) throw error
    return requireClient().storage.from('cms-media').getPublicUrl(path, options.download ? { download: options.download } : undefined).data.publicUrl
  },
}
