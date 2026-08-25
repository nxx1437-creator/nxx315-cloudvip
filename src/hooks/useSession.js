import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient.js';

export default function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsTermsAcceptance, setNeedsTermsAcceptance] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  console.log('useSession init'); // 👈 Thêm dòng này

  useEffect(() => {
    console.log('useSession useEffect run'); // 👈 Thêm dòng này

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('getSession result:', session); // 👈 Thêm dòng này
      setSession(session);
      if (session?.user) {
        checkProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('onAuthStateChange:', _event, session); // 👈 Thêm dòng này
        setSession(session);
        if (session?.user) {
          await checkProfile(session.user.id);
        } else {
          setNeedsTermsAcceptance(false);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkProfile = async (userId) => {
    console.log('checkProfile:', userId); // 👈 Thêm dòng này
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('terms_accepted_at, terms_version, is_admin')
        .eq('id', userId)
        .single();

      console.log('Profile data:', data, error); // 👈 Thêm dòng này

      if (error) throw error;

      setIsAdmin(data?.is_admin === true);

      if (data?.is_admin === true) {
        setNeedsTermsAcceptance(false);
        setLoading(false);
        return;
      }

      const CURRENT_TERMS_VERSION = '2026-08-25';
      
      if (!data?.terms_accepted_at || data?.terms_version !== CURRENT_TERMS_VERSION) {
        setNeedsTermsAcceptance(true);
      } else {
        setNeedsTermsAcceptance(false);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      setNeedsTermsAcceptance(true);
    } finally {
      setLoading(false);
    }
  };

  const acceptTerms = async (userId) => {
    if (!userId) return { success: false, error: 'Không có user ID' };

    const { error } = await supabase
      .from('profiles')
      .update({
        terms_accepted_at: new Date().toISOString(),
        terms_version: '2026-08-25'
      })
      .eq('id', userId);

    if (error) {
      console.error('Error accepting terms:', error);
      return { success: false, error: error.message };
    }

    setNeedsTermsAcceptance(false);
    return { success: true };
  };

  return {
    session,
    loading,
    needsTermsAcceptance,
    isAdmin,
    acceptTerms,
    user: session?.user || null
  };
}
