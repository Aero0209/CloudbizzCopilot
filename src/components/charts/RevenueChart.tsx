'use client';

import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, subDays, subMonths, subYears, eachDayOfInterval, eachMonthOfInterval, eachYearOfInterval, addMonths, addDays, addYears, parse, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export type TimeFrame = '7days' | 'monthly' | 'yearly';

interface RevenueData {
  date: Date;
  amount: number;
  type: TimeFrame;
}

interface RevenueChartProps {
  data: RevenueData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('monthly');

  console.log('RevenueChart data:', data);

  const processData = () => {
    const filteredData = data.filter(d => d.type === timeFrame);
    
    const now = new Date();
    let dates: Date[];
    let format_string: string;

    switch (timeFrame) {
      case '7days':
        dates = eachDayOfInterval({
          start: subDays(now, 7),
          end: addDays(now, 7)
        });
        format_string = 'dd MMM';
        break;
      case 'monthly':
        dates = eachMonthOfInterval({
          start: subMonths(now, 12),
          end: addMonths(now, 12)
        });
        format_string = 'MMM yyyy';
        break;
      case 'yearly':
        dates = eachYearOfInterval({
          start: subYears(now, 4),
          end: addYears(now, 4)
        });
        format_string = 'yyyy';
        break;
    }

    console.log('Dates à afficher:', dates.map(d => format(d, 'yyyy-MM-dd')));

    const labels = dates.map(date => format(date, format_string, { locale: fr }));
    const values = dates.map(date => {
      const matchingData = filteredData.find(d => {
        return format(d.date, format_string) === format(date, format_string);
      });
      return matchingData?.amount || 0;
    });

    return { labels, values };
  };

  const { labels, values } = processData();

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Revenus',
        data: values,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return `Revenus: ${value.toLocaleString('fr-FR')} €`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `${value.toLocaleString('fr-FR')} €`,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Évolution des revenus</h3>
        <select
          className="border rounded-md px-3 py-1.5 text-sm bg-white"
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
        >
          <option value="7days">7 derniers jours</option>
          <option value="monthly">Par mois</option>
          <option value="yearly">Par année</option>
        </select>
      </div>
      <Line options={options as any} data={chartData} />
    </div>
  );
} 