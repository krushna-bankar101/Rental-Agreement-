import { createClient } from '@supabase/supabase-js';
import { supabaseurl, supabaseKey} from './info';

const supabaseUrl = `https://$sqdunrzdzgvlsjwahiem.supabase.co`;
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZHVucnpkemd2bHNqd2FoaWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNDQyMjcsImV4cCI6MjA3MjgyMDIyN30.Q35mlHbihuBYckIM45A0EY-OishLdEuAbPZSBmBQ6-E";
export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;