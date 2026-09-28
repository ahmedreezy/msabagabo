import { isSupabaseConfigured, supabase } from '../lib/supabase'

const MAX_HISTORY_MESSAGES = 6

export const assistantAvailable = isSupabaseConfigured

const publicErrorMessage = async (error, data) => {
  if (data?.error) return data.error

  try {
    const response = error?.context
    if (response instanceof Response) {
      const payload = await response.clone().json()
      if (payload?.error) return payload.error
      if (payload?.message && response.status !== 404) return payload.message
    }
  } catch {
    // The platform can return an unreadable network response for a missing function.
  }

  const detail = String(error?.message || '')
  if (/failed to send|failed to fetch|edge function|network/i.test(detail)) {
    return 'Mr. Ssabagabo is not connected to the municipal information service yet. Please contact the council while the service is being configured.'
  }
  return 'The assistant could not answer right now. Please try again shortly.'
}

export const askMrSsabagabo = async (message, history = []) => {
  if (!supabase) throw new Error('The assistant is not configured yet.')

  const safeHistory = history
    .filter((item) => ['user', 'assistant'].includes(item.role) && item.content)
    .slice(-MAX_HISTORY_MESSAGES)
    .map((item) => ({ role: item.role, content: String(item.content).slice(0, 500) }))

  const { data, error } = await supabase.functions.invoke('mr-ssabagabo', {
    body: { message: String(message).trim().slice(0, 500), history: safeHistory },
  })

  if (error) throw new Error(await publicErrorMessage(error, data))
  if (data?.error) throw new Error(data.error)
  if (!data?.answer) throw new Error('The assistant returned an empty response.')
  return data
}
