'use client'

import { AppShell } from '@/components/dashboard/app-shell'
import { PageCard, ProtectedRoute } from '@/components/dashboard/ui'
import { useAuthStore } from '@/lib/store'

export default function SettingsPage() {
  const { isAuthenticated, hydrated, isBootstrapping } = useAuthStore()

  return (
    <ProtectedRoute
      isAuthenticated={isAuthenticated}
      hydrated={hydrated}
      isBootstrapping={isBootstrapping}
      fallbackTitle="Loading settings"
      fallbackDescription="Preparing workspace settings."
    >
      <AppShell title="Settings" subtitle="Workspace-level defaults and operational preferences.">
        <PageCard className="p-6">
          <h2 className="text-xl font-semibold text-slate-950">Environment</h2>
          <p className="mt-2 text-sm text-slate-600">
            Background workers, SMTP, temp email provider, and campaign policies are configured through backend environment variables.
          </p>
        </PageCard>
      </AppShell>
    </ProtectedRoute>
  )
}
