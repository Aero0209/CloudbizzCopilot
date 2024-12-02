'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Ticket } from '@/types';

export function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const ticketsRef = collection(db, 'tickets');
        const q = query(ticketsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const ticketsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Ticket[];
        setTickets(ticketsData);
      } catch (error) {
        console.error('Erreur lors du chargement des tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="divide-y">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="p-4">
          <h3 className="font-medium">{ticket.title}</h3>
          <p className="text-sm text-gray-500">{ticket.description}</p>
        </div>
      ))}
    </div>
  );
} 