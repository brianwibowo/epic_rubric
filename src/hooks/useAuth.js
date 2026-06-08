import { useAuthStore } from '@/stores/authStore';
import { hasPermission } from '@/lib/rbac';

export function useAuth() {
  const { 
    user, 
    profile, 
    isAuthenticated, 
    isLoading, 
    isMock,
    login, 
    logout 
  } = useAuthStore();

  /**
   * Helper to check if user has one of the allowed roles.
   * @param {string|string[]} roles 
   * @returns {boolean}
   */
  const hasRole = (roles) => {
    if (!profile) return false;
    if (Array.isArray(roles)) {
      return roles.includes(profile.role);
    }
    return profile.role === roles;
  };

  /**
   * Helper to check if user has granular permission.
   * @param {string} permission 
   * @param {string} [level='read'] 
   * @returns {boolean}
   */
  const can = (permission, level = 'read') => {
    if (!profile) return false;
    return hasPermission(profile.role, permission, level);
  };

  return {
    user,
    profile,
    isAuthenticated,
    isLoading,
    isMock,
    login,
    logout,
    hasRole,
    can
  };
}
