"use client"

import Dashboard from '@/views/dashboard'
import { useUserStore } from '@/store/user-store'

export default function DashboardPage() {
  const { dashboardData, isLoadingDashboard, error, fetchDashboard } = useUserStore();

  return <Dashboard data={dashboardData} isLoading={isLoadingDashboard} error={error} fetchDashboard={fetchDashboard} />
}
        