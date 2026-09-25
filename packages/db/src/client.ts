import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';

declare const process: { env: Record<string, string | undefined> };

let supabaseInstance: SupabaseClient<Database> | null = null;

export const getSupabaseClient = (): SupabaseClient<Database> | null => {
  if (supabaseInstance) return supabaseInstance;

  const env = typeof process !== 'undefined' ? process.env : {};
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
  const supabaseKey =
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    env.SUPABASE_ANON_KEY ||
    env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  try {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: true,
      },
    });
    return supabaseInstance;
  } catch (err) {
    console.warn('[RN-DB] Supabase client initialization warning:', err);
    return null;
  }
};
