import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export type Profile = {
  id:           string
  role:         'student' | 'teacher' | 'admin' | 'parent'
  first_name:   string | null
  last_name:    string | null
  display_name: string | null
  status:       'active' | 'pending' | 'suspended'
}

export function useUser() {
  const [user,    setUser]    = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(id: string) {
    const { data } = await supabase
      .from('profiles')
      .select('id, role, first_name, last_name, display_name, status')
      .eq('id', id)
      .single()
    setProfile(data as Profile | null)
    setLoading(false)
  }

  return { user, profile, loading }
}
