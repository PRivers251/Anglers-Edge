// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../services/supabaseClient';

export const useAuth = () => {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        // Fetch username from auth.users metadata
        const { data: userData, error: userError } = await supabase.auth.getUser();
        let userName = 'User';
        if (!userError && userData.user.user_metadata.username) {
          userName = userData.user.user_metadata.username;
          setUsername(userName);
        }

        // Fetch the user's profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();

        if (profileData) {
          // Profile exists, use its username if auth metadata is missing
          if (!userData.user.user_metadata.username) {
            setUsername(profileData.username || 'User');
          }
        } else if (profileError) {
          console.error('Error fetching profile:', profileError.message);
        }
      } else {
        router.replace('/login');
      }
      setLoading(false);
    };

    initializeAuth();

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        router.replace('/login');
        setLoading(false);
      }
    });
  }, [router]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/login');
    } catch (error) {
      console.error('Logout Error:', error.message);
    }
  };

  return { session, username, loading, handleLogout };
};