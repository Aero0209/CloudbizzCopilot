'use client';

import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface ServiceCardProps {
  name: string;
  description: string;
  basePrice: number;
  selected: boolean;
  selectedDuration: number | null;
  onServiceSelect: () => void;
  onDurationSelect: (duration: number) => void;
}

export default function ServiceCard({
  name,
  description,
  basePrice,
  selected,
  selectedDuration,
  onServiceSelect,
  onDurationSelect
}: ServiceCardProps) {
  const getDiscount = (months: number) => {
    switch (months) {
      case 12: return 10;
      case 24: return 15;
      case 36: return 20;
      default: return 0;
    }
  };

  const getDiscountedPrice = (months: number) => {
    const discount = getDiscount(months);
    return basePrice * (1 - discount / 100);
  };

  return (
    <div 
      className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
        selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
      }`}
      onClick={onServiceSelect}
    >
      <div className="relative">
        {selected && (
          <div className="absolute -top-2 -right-2">
            <CheckCircleIcon className="w-6 h-6 text-blue-500 bg-white rounded-full" />
          </div>
        )}
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-blue-600">
            €{getDiscountedPrice(selectedDuration || 0).toFixed(2)}
          </span>
          <span className="text-gray-500">/mois</span>
        </div>

        <div className="space-y-2">
          {[12, 24, 36].map((months) => (
            <label
              key={months}
              className={`block w-full cursor-pointer ${
                selectedDuration === months ? 'bg-blue-50' : ''
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  selectedDuration === months
                    ? 'border-blue-500'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`duration-${name}`}
                    value={months}
                    checked={selectedDuration === months}
                    onChange={() => onDurationSelect(months)}
                    className="text-blue-600"
                  />
                  <span>{months} mois</span>
                </div>
                <span className="text-green-600">-{getDiscount(months)}%</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

