'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export function Navigation() {
  const { user } = useAuth();

  const handleLoginClick = () => {
    if (user) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <nav>
      {/* ... autres liens ... */}
      <button 
        onClick={handleLoginClick}
        className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
      >
        Mon espace
      </button>
    </nav>
  );
} 