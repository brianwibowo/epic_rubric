import React from 'react';
import { useAuthStore } from '@/stores/authStore';

const RoleGate = ({ children, allow = [], fallback = null }) => {
  const { profile } = useAuthStore();

  if (!profile || !allow.includes(profile.role)) {
    return fallback;
  }

  return <>{children}</>;
};

export default RoleGate;
