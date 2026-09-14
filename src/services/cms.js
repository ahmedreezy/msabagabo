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
    return data ?? []
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
