export type UserRole = 'user' | 'companyowner' | 'partner' | 'employee' | 'master';

export type Permission =
  | 'view_dashboard'
  | 'manage_users'
  | 'invite_users'
  | 'remove_users'
  | 'view_billing'
  | 'manage_billing'
  | 'view_services'
  | 'manage_services'
  | 'view_reports'
  | 'manage_company'
  | 'view_audit_logs'
  | 'manage_clients'
  | 'view_commissions';

export const rolePermissions: Record<UserRole, Permission[]> = {
  master: [
    'view_dashboard',
    'manage_users',
    'invite_users',
    'remove_users',
    'view_billing',
    'manage_billing',
    'view_services',
    'manage_services',
    'view_reports',
    'manage_company',
    'view_audit_logs'
  ],
  partner: [
    'view_dashboard',
    'manage_clients',
    'invite_users',
    'view_billing',
    'view_services',
    'manage_services',
    'view_reports',
    'view_commissions'
  ],
  companyowner: [
    'view_dashboard',
    'manage_users',
    'invite_users',
    'view_billing',
    'manage_billing',
    'view_services',
    'manage_services'
  ],
  employee: [
    'view_dashboard',
    'view_services',
    'manage_clients'
  ],
  user: [
    'view_dashboard',
    'view_services'
  ]
};

export const checkPermission = (userRole: UserRole, permission: Permission): boolean => {
  return rolePermissions[userRole]?.includes(permission) || false;
}; 