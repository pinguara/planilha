import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials for testing
const supabaseUrl = 'https://bidtlnjfnzdgbuhzjobp.supabase.co';
const supabaseAnonKey = 'sb_publishable_oNtSFQlanO25xuxl3x9sQQ_VgUzGPXZ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
