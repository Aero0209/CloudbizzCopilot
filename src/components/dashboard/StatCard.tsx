'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  className?: string;
  iconClassName?: string;
}

export function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  trendUp,
  className = "",
  iconClassName = "text-gray-600"
}: StatCardProps) {
  return (
    <div className={`rounded-xl border p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${iconClassName.replace('text-', 'bg-').replace('600', '100')}`}>
          <Icon className={`w-5 h-5 ${iconClassName}`} />
        </div>
        <div className={`px-2.5 py-0.5 rounded-full text-sm ${
          trendUp ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {trend}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{label}</h3>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
} 