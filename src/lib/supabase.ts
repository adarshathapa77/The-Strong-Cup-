import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface PincodeData {
  id: string;
  pincode: string;
  area: string | null;
  city: string;
  district: string | null;
  state: string;
  state_code: string | null;
  is_serviceable: boolean;
  delivery_days: number;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PincodeSearchRecord {
  id: string;
  search_query: string;
  result_pincode: string | null;
  searched_at: string;
  user_session_id: string | null;
}

export interface Database {
  public: {
    Tables: {
      pincodes: {
        Row: PincodeData;
        Insert: Omit<PincodeData, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PincodeData, 'id' | 'created_at' | 'updated_at'>>;
      };
      pincode_searches: {
        Row: PincodeSearchRecord;
        Insert: Omit<PincodeSearchRecord, 'id' | 'searched_at'>;
        Update: Partial<Omit<PincodeSearchRecord, 'id' | 'searched_at'>>;
      };
    };
  };
}
