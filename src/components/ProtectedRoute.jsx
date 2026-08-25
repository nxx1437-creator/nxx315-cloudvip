import React from 'react';
import { Navigate } from 'react-router-dom';
import useSession from '../hooks/useSession.js';
import TermsAcceptance from './TermsAcceptance.jsx';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { session, loading, needsTermsAcceptance, acceptTerms, user } = useSession();

  console.log('ProtectedRoute:', { session, loading, needsTermsAcceptance }); // 👈 Thêm dòng này

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-sky-500" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (needsTermsAcceptance) {
    return (
      <TermsAcceptance 
        user={user} 
        onAccept={acceptTerms} 
        loading={loading} 
      />
    );
  }

  return children;
}
