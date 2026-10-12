export type Permission =
  | 'VIEW_OWN_TASKS'
  | 'VIEW_ASSIGNED_TASKS'
  | 'VIEW_TEAM_TASKS'
  | 'VIEW_REVIEW_QUEUE'
  | 'CREATE_TASKS'
  | 'ASSIGN_TASKS'
  | 'EDIT_TASKS'
  | 'UPDATE_PROGRESS'
  | 'SUBMIT_FOR_REVIEW'
  | 'SUBMIT_EVIDENCE'
  | 'CONFIGURE_EVIDENCE'
  | 'APPROVE_SUBMISSION'
  | 'REQUEST_CHANGES'
  | 'REJECT_SUBMISSION'
  | 'REASSIGN_TASKS'
  | 'VIEW_TEAM_REPORTS'
  | 'MANAGE_REPORTING';

export type HierarchyRole =
  'Center Head' | 'Project Manager' | 'Research Analyst' | 'Fellow' | 'Intern';

export const ROLE_PERMISSIONS: Record<HierarchyRole, Permission[]> = {
  'Center Head': [
    'VIEW_OWN_TASKS',
    'VIEW_ASSIGNED_TASKS',
    'VIEW_TEAM_TASKS',
    'VIEW_REVIEW_QUEUE',
    'CREATE_TASKS',
    'ASSIGN_TASKS',
    'EDIT_TASKS',
    'UPDATE_PROGRESS',
    'SUBMIT_FOR_REVIEW',
    'SUBMIT_EVIDENCE',
    'CONFIGURE_EVIDENCE',
    'APPROVE_SUBMISSION',
    'REQUEST_CHANGES',
    'REJECT_SUBMISSION',
    'REASSIGN_TASKS',
    'VIEW_TEAM_REPORTS',
    'MANAGE_REPORTING',
  ],
  'Project Manager': [
    'VIEW_OWN_TASKS',
    'VIEW_ASSIGNED_TASKS',
    'VIEW_TEAM_TASKS',
    'VIEW_REVIEW_QUEUE',
    'CREATE_TASKS',
    'ASSIGN_TASKS',
    'EDIT_TASKS',
    'UPDATE_PROGRESS',
    'SUBMIT_FOR_REVIEW',
    'SUBMIT_EVIDENCE',
    'CONFIGURE_EVIDENCE',
    'APPROVE_SUBMISSION',
    'REQUEST_CHANGES',
    'REJECT_SUBMISSION',
    'REASSIGN_TASKS',
    'VIEW_TEAM_REPORTS',
  ],
  'Research Analyst': [
    'VIEW_OWN_TASKS',
    'VIEW_ASSIGNED_TASKS',
    'VIEW_TEAM_TASKS',
    'VIEW_REVIEW_QUEUE',
    'CREATE_TASKS',
    'ASSIGN_TASKS',
    'EDIT_TASKS',
    'UPDATE_PROGRESS',
    'SUBMIT_FOR_REVIEW',
    'SUBMIT_EVIDENCE',
    'CONFIGURE_EVIDENCE',
    'APPROVE_SUBMISSION',
    'REQUEST_CHANGES',
    'REJECT_SUBMISSION',
    'REASSIGN_TASKS',
    'VIEW_TEAM_REPORTS',
  ],
  Fellow: [
    'VIEW_OWN_TASKS',
    'VIEW_ASSIGNED_TASKS',
    'VIEW_TEAM_TASKS',
    'VIEW_REVIEW_QUEUE',
    'UPDATE_PROGRESS',
    'SUBMIT_FOR_REVIEW',
    'SUBMIT_EVIDENCE',
    'APPROVE_SUBMISSION',
    'REQUEST_CHANGES',
    'REJECT_SUBMISSION',
  ],
  Intern: [
    'VIEW_OWN_TASKS',
    'UPDATE_PROGRESS',
    'SUBMIT_FOR_REVIEW',
    'SUBMIT_EVIDENCE',
  ],
};

export interface PermissionUser {
  id: string;
  role: string;
  permissions?: Permission[];
}

export function hasPermission(
  user: PermissionUser | null | undefined,
  permission: Permission
): boolean {
  if (!user) return false;
  if (user.permissions && user.permissions.includes(permission)) {
    return true;
  }
  const rolePermissions = ROLE_PERMISSIONS[user.role as HierarchyRole];
  if (rolePermissions && rolePermissions.includes(permission)) {
    return true;
  }
  // Super Admin bypass if applicable
  if (user.role === 'Super Admin' || user.role === 'Center Head') {
    return true;
  }
  return false;
}
