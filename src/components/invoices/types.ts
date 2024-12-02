export interface Invoice {
  id: string;
  number: string;
  companyId: string;
  companyName: string;
  totalAmount: number | null;
  status: 'pending' | 'paid' | 'cancelled' | 'sent';
  dueDate: Date | null;
  createdAt: Date | null;
  services: Array<{
    name: string;
    price: number;
    users: Array<{
      userId: string;
      email: string;
    }>;
  }>;
  customer: {
    companyName: string;
    vatNumber: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    email: string;
  };
} 