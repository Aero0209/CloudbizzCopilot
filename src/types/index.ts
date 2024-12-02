import { UserRole, Permission } from '@/types/permissions';
export type { UserRole };

export interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

export type ActionType = 
  | 'user_added'
  | 'user_removed'
  | 'service_added'
  | 'service_removed'
  | 'order_created'
  | 'order_updated'
  | 'order_cancelled'
  | 'role_changed';

export interface Action {
  id: string;
  type: ActionType;
  userId: string;
  targetId?: string;
  description: string;
  metadata: any;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: Date;
  read: boolean;
  link?: string;
  metadata?: Record<string, any>;
}

export interface EmployeeStats {
  userId: string;
  servicesUsed: string[];
  lastActive: Date;
  totalLogins: number;
  actionsPerformed: number;
  averageUsageTime: number;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'companyowner' | 'partner' | 'employee' | 'master';
  firstName?: string;
  lastName?: string;
  companyId?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface CompanyService {
  id: string;
  serviceId: string;
  name: string;
  status: 'active' | 'pending' | 'suspended';
  startDate: Date;
  endDate: Date;
  duration: number;
  monthlyPrice: number;
  users: Array<{ userId: string; email: string }>;
  companyId: string;
  category: string;
}

export interface CompanyUser {
  userId: string;
  email: string;
  role: 'owner' | 'employee';
  firstName?: string;
  lastName?: string;
  department?: string;
  joinedAt: Date;
  lastLogin?: Date;
  servicesCount: {
    total: number;
    byCategory: Record<string, number>;
  };
}

export interface BillingHistory {
  id: string;
  date: Date;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
  paymentMethod: 'bank_transfer' | 'sepa' | 'credit_card';
}

export interface CompanyActivity {
  id: string;
  type: 'service_activated' | 'service_deleted' | 'user_added' | 'user_removed' | 'payment_received';
  description: string;
  timestamp: Date;
  companyId: string;
  userId: string;
  userEmail: string;
  metadata?: {
    orderId?: string;
    services?: Array<{
      name: string;
      duration: number;
    }>;
    performedBy?: {
      userId: string;
      email: string;
    };
  };
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  vatNumber: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  ownerId: string;
  users: CompanyUser[];
  services: CompanyService[];
  partner?: {
    id: string;
    name: string;
  };
  billing: {
    frequency: 'monthly' | 'quarterly' | 'yearly';
    method: 'bank_transfer' | 'sepa' | 'credit_card';
    monthlyRevenue: number;
    nextBillingDate: Date;
    history: BillingHistory[];
  };
  activity: CompanyActivity[];
  createdAt: Date;
}

export interface UserService {
  id: string;
  userId: string;
  serviceId: string;
  companyId: string;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'pending' | 'suspended';
  startDate: Date;
  endDate: Date;
  duration: number;
  monthlyPrice: number;
  originalPrice: number;
  discount: number;
  features: string[];
  userEmail: string;
  createdAt: Date;
  lastUpdated: Date;
  createdBy: string;
  updatedBy: string;
  commitment?: {
    hasCommitment: boolean;
    duration: number;
    startDate: Date;
    endDate: Date | null;
  };
  pricing?: {
    basePrice: number;
    discountedPrice: number;
    discount: number;
    total: number;
  };
  users: Array<{
    userId: string;
    email: string;
  }>;
}

export interface Order {
  id: string;
  metadata: {
    status: 'pending' | 'confirmed' | 'rejected';
    createdAt: Date;
    updatedAt?: Date;
  };
  customer: {
    userId: string;
    email: string;
    companyId: string;
    company: {
      name: string;
      vatNumber: string;
      contact: {
        email: string;
        phone: string;
      };
      address: {
        street: string;
        postalCode: string;
        city: string;
      };
    };
  };
  services: Array<{
    id: string;
    name: string;
    category: 'remote-desktop' | 'microsoft-365' | 'accounting';
    basePrice: number;
    duration: number;
    discount: number;
    discountedPrice: number;
    totalPrice: number;
    isMonthly: boolean;
    usersCount: number;
  }>;
  users: Array<{
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  billing: {
    method: 'bank-transfer' | 'sepa' | 'credit-card';
    monthlyBaseTotal: number;
    effectiveMonthlyPrice: number;
    totalAmount: number;
    currency: string;
  };
}

export interface EmailAttachment {
  filename: string;
  content: string;
  encoding: string;
}

export interface Invoice {
  id: string;
  number: string;
  companyId: string;
  companyName: string;
  totalAmount: number | null;
  status: 'pending' | 'paid' | 'cancelled' | 'sent' | 'draft';
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

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  assignedTo?: string;
}

export interface SystemSettings {
  id: string;
  requireServiceValidation: boolean;
  updatedAt: Date;
  updatedBy: string;
}

export interface PDFTemplate {
  id: string;
  name: string;
  type: 'invoice' | 'quote';
  content: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isDefault?: boolean;
} 