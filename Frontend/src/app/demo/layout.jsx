'use client';

import React from 'react';
import { DemoProvider } from '@/demo/DemoContext';
import { DemoLayout } from '@/demo/DemoLayout';

export default function DemoRootLayout({ children }) {
  return (
    <DemoProvider>
      <DemoLayout>{children}</DemoLayout>
    </DemoProvider>
  );
}
