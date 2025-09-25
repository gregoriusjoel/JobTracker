'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardContent from './dashboard-content';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}