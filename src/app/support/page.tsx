'use client';

import React from 'react';
import MasterLayout from '@/components/dashboard/MasterLayout';
import { TicketList } from '@/components/support/TicketList';
import { NewTicketButton } from '@/components/support/NewTicketButton';

export default function SupportPage() {
  return (
    <MasterLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Support Technique</h1>
          <NewTicketButton />
        </div>

        <div className="bg-white rounded-lg shadow">
          <TicketList />
        </div>
      </div>
    </MasterLayout>
  );
} 