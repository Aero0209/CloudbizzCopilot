'use client';

import React from 'react';
import { Plus } from 'lucide-react';

export function NewTicketButton() {
  return (
    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
      <Plus className="h-4 w-4" />
      Nouveau ticket
    </button>
  );
} 