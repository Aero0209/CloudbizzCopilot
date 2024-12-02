'use client';

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

export default function DateRangePicker() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  return (
    <div className="relative">
      <div className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer">
        <Calendar className="h-5 w-5 text-gray-500" />
        <span>
          {date?.from ? (
            <>
              {format(date.from, 'PPP', { locale: fr })}
              {date.to && ' - '}
              {date.to && format(date.to, 'PPP', { locale: fr })}
            </>
          ) : (
            'Sélectionner une période'
          )}
        </span>
      </div>
    </div>
  );
} 