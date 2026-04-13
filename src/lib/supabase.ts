import { createClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Fallback values
  const defaultUrl = 'https://bidtlnjfnzdgbuhzjobp.supabase.co';
  const defaultKey = 'sb_publishable_oNtSFQlanO25xuxl3x9sQQ_VgUzGPXZ';

  // Validate envUrl: must be a non-empty string starting with http
  const isValidUrl = (url: any) => typeof url === 'string' && url.trim().length > 0 && url.startsWith('http');

  const finalUrl = isValidUrl(envUrl) ? envUrl : defaultUrl;
  const finalKey = (typeof envKey === 'string' && envKey.trim().length > 0) ? envKey : defaultKey;

  return { url: finalUrl, key: finalKey };
};

const { url, key } = getSupabaseConfig();

export const supabase = createClient(url, key);
