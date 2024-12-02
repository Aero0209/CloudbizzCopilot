export type ModuleKey = 'billing' | 'ticketing' | 'support' | 'inventory';

export interface SystemModule {
  id: string;
  key: ModuleKey;
  name: string;
  description: string;
  isEnabled: boolean;
  icon: string;
  features: {
    id: string;
    name: string;
    description: string;
    isEnabled: boolean;
  }[];
  requiredRoles: string[];
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModuleSettings {
  billing: {
    requireValidation: boolean;
    autoGenerateInvoices: boolean;
    paymentMethods: string[];
  };
  ticketing: {
    allowClientCreation: boolean;
    autoAssignment: boolean;
    priorities: string[];
  };
  // ... autres modules
} 