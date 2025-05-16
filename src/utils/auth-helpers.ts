
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

// Helper function to get the current user
export const getCurrentUser = async (): Promise<User | null> => {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
};

// Helper function to get the current session
export const getCurrentSession = async (): Promise<Session | null> => {
  const { data } = await supabase.auth.getSession();
  return data?.session || null;
};

// Helper function to get user profile 
export const getUserProfile = async (userId: string) => {
  if (!userId) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
};
