'use client';

import AppLayout from '../../layouts/AppLayout.jsx';

export default function SuperAdminLayout({ children }) {
  return (
    <AppLayout scope="superadmin" variant="superadmin">
      {children}
    </AppLayout>
  );
}
