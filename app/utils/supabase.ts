import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dfjcaeaaafsgrbfuepye.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmamNhZWFhYWZzZ3JiZnVlcHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxODM0MjMsImV4cCI6MjA1Mzc1OTQyM30.3fw9TpYiPX7lts1In0jNM7-B67es45J0LIPBtcZvqmA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})