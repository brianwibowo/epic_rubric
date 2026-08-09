import React from 'react';
import { Outlet, useParams } from 'react-router-dom';

/**
 * MKLayout wraps all pages that live within a Mata Kuliah context.
 * The mkId param is automatically available to all child routes.
 * Sidebar reads useParams().mkId to switch to MK Context navigation.
 */
const MKLayout = () => {
  const { mkId } = useParams();

  return <Outlet />;
};

export default MKLayout;
