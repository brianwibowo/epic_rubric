// ============================================================
// EPIC e-Rubric v2.0 — RBAC Configuration
// Multi-institutional roles: admin, dosen, guru, mahasiswa, siswa
// ============================================================

import { ROLES, EDUCATOR_ROLES, LEARNER_ROLES } from '@/utils/constants';

export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    manageMK: 'write',
    manageUsers: 'write',
    manageKomponen: 'write',
    configRubric: 'write',
    inputScore: 'write',
    analytics: 'read_all',
    comments: 'write',
    exportReport: true,
    auditLogs: true,
    notifications: true
  },
  [ROLES.DOSEN]: {
    manageMK: 'write_own',
    manageUsers: false,
    manageKomponen: 'write_own',
    configRubric: 'write',
    inputScore: 'write_own',
    analytics: 'read_own',
    comments: 'write',
    exportReport: true,
    auditLogs: false,
    notifications: true
  },
  [ROLES.GURU]: {
    manageMK: 'write_own',
    manageUsers: false,
    manageKomponen: 'write_own',
    configRubric: 'write',
    inputScore: 'write_own',
    analytics: 'read_own',
    comments: 'write',
    exportReport: true,
    auditLogs: false,
    notifications: true
  },
  [ROLES.MAHASISWA]: {
    manageMK: false,
    manageUsers: false,
    manageKomponen: false,
    configRubric: false,
    inputScore: false,
    analytics: 'read_personal',
    comments: 'write_own',
    exportReport: 'personal_pdf',
    auditLogs: false,
    notifications: true
  },
  [ROLES.SISWA]: {
    manageMK: false,
    manageUsers: false,
    manageKomponen: false,
    configRubric: false,
    inputScore: false,
    analytics: 'read_personal',
    comments: 'write_own',
    exportReport: 'personal_pdf',
    auditLogs: false,
    notifications: true
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
  if (typeof perm === 'string') {
    // write implies read
    if (perm.startsWith('write') && level === 'read') return true;
    if (perm === level) return true;
    if (perm.startsWith('read') && level === 'read') return true;
  }
  
  return false;
}

/**
 * Check if user can access a specific MK or Mapel.
 * @param {string} role - User's role
 * @param {string} userId - User's ID
 * @param {Object} mk - Mata Kuliah / Mapel object
 * @param {Array} enrollments - Enrollments
 * @returns {boolean}
 */
export function canAccessMK(role, userId, mk, enrollments = []) {
  if (role === ROLES.ADMIN) return true;
  if (EDUCATOR_ROLES.includes(role) && (mk.dosen_id === userId || mk.guru_id === userId || mk.teacher_id === userId)) return true;
  if (LEARNER_ROLES.includes(role)) {
    return enrollments.some(e => e.student_id === userId && (e.mk_id === mk.id || e.mapel_id === mk.id));
  }
  return false;
}
