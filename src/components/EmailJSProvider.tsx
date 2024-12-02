'use client';

import { useEffect } from 'react';
import emailjs from '@emailjs/browser';

export default function EmailJSProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) {
      emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY);
    }
  }, []);

  return <>{children}</>;
} 