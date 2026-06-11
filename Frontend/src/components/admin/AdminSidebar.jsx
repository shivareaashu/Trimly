'use client';

import { useState } from 'react';
import { Sidebar } from '../shell/Sidebar.jsx';

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Sidebar
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      scope="admin"
      variant="admin"
    />
  );
}
