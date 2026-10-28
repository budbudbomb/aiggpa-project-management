export type Permission =
  | 'VIEW_OWN_TASKS'
  | 'VIEW_ASSIGNED_TASKS'
  | 'VIEW_TEAM_TASKS'
  | 'VIEW_REVIEW_QUEUE'
  | 'CREATE_PROJECT'
  | 'CREATE_SURVEY'
  | 'MANAGE_MASTERS'
  | 'REVIEW_COMPLAINTS'
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
  | 'Center Head'
  | 'Advisor'
  | 'Fellow'
  | 'Intern'
  | 'Field Instructor'
  | 'Research Analyst';

export const ROLE_PERMISSIONS: Record<HierarchyRole, Permission[]> = {
  'Center Head': [
    'CREATE_PROJECT',
    'CREATE_SURVEY',
    'MANAGE_MASTERS',
    'REVIEW_COMPLAINTS',
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
  Advisor: [
    'CREATE_PROJECT',
    'CREATE_SURVEY',
    'MANAGE_MASTERS',
    'REVIEW_COMPLAINTS',
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
  // ── Tier 3 (Same Level): Fellow, Intern, Field Instructor, Research Analyst ──
  // Execution tier: view allocated tasks, fill & submit deliverables, and raise grievances
  Fellow: [
    'VIEW_OWN_TASKS',
    'UPDATE_PROGRESS',
    'SUBMIT_FOR_REVIEW',
    'SUBMIT_EVIDENCE',
  ],
  Intern: [
    'VIEW_OWN_TASKS',
    'UPDATE_PROGRESS',
    'SUBMIT_FOR_REVIEW',
    'SUBMIT_EVIDENCE',
  ],
  'Field Instructor': [
    'VIEW_OWN_TASKS',
    'UPDATE_PROGRESS',
    'SUBMIT_FOR_REVIEW',
    'SUBMIT_EVIDENCE',
  ],
  'Research Analyst': [
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
