import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Action } from '@/types';

interface ActivityLogProps {
  actions: Action[];
}

export default function ActivityLog({ actions }: ActivityLogProps) {
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {actions.map((action, actionIdx) => (
          <li key={action.id}>
            <div className="relative pb-8">
              {actionIdx !== actions.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                      action.type.includes('added') ? 'bg-green-500' :
                      action.type.includes('removed') ? 'bg-red-500' :
                      action.type.includes('updated') ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`}
                  >
                    {/* Icône selon le type d'action */}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500">
                      {action.description}
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    {format(action.createdAt, 'PPp', { locale: fr })}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 