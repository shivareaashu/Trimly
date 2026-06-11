'use client';

import { useState } from 'react';
import { Sidebar } from '../shell/Sidebar.jsx';

export default function SuperAdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Sidebar
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      scope="superadmin"
      variant="superadmin"
    />
  );
}
