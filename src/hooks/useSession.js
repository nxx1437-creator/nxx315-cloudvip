import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient.js';

export default function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsTermsAcceptance, setNeedsTermsAcceptance] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Lấy session hiện tại
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        checkProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Lắng nghe thay đổi auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
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
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('terms_accepted_at, terms_version, is_admin')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setIsAdmin(data?.is_admin === true);

      // Admin được bypass, không cần xác nhận điều khoản
      if (data?.is_admin === true) {
        setNeedsTermsAcceptance(false);
        setLoading(false);
        return;
      }

      // Kiểm tra đã đồng ý điều khoản chưa
      const CURRENT_TERMS_VERSION = '2026-08-25';
      
      if (!data?.terms_accepted_at || data?.terms_version !== CURRENT_TERMS_VERSION) {
        setNeedsTermsAcceptance(true);
      } else {
        setNeedsTermsAcceptance(false);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      // Nếu chưa có profile, cần tạo và yêu cầu đồng ý
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
