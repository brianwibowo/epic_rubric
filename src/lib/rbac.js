// Role-Based Access Control configuration according to PRD section 2
export const ROLES = {
  ADMIN: 'admin', // Kaprog / Admin
  GURU: 'guru',   // Guru Akuntansi / Evaluator
  SISWA: 'siswa'  // Siswa SMK / User
};

export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    manageUsers: 'write',
    configRubric: 'write',
    inputScore: false,
    analytics: 'read_all', // Read all classes
    exportReport: true,
    auditLogs: true
  },
  [ROLES.GURU]: {
    manageUsers: 'read',
    configRubric: 'write',
    inputScore: 'write',
    analytics: 'read_own', // Read own classes
    exportReport: true,
    auditLogs: false
  },
  [ROLES.SISWA]: {
    manageUsers: false,
    configRubric: false,
    inputScore: false,
    analytics: 'read_personal', // Read personal only
    exportReport: 'personal_pdf', // Export personal PDF only
    auditLogs: false
  }
};

/**
 * Check if a role has permission to perform an action.
 * @param {string} role - The current user's role
 * @param {string} permission - The permission key to check
 * @param {string} [level='read'] - 'read' or 'write' level
 * @returns {boolean}
 */
export function hasPermission(role, permission, level = 'read') {
  if (!role || !PERMISSIONS[role]) return false;
  
  const perm = PERMISSIONS[role][permission];
  if (!perm) return false;
  
  if (perm === true) return true;
  if (perm === 'write' && level === 'read') return true;
  if (perm === level) return true;
  
  return false;
}
