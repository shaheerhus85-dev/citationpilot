'use client'

import { FormEvent, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { AppShell } from '@/components/dashboard/app-shell'
import { FormInput, PageCard, ProtectedRoute, SkeletonBlock } from '@/components/dashboard/ui'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/store'

type ProfileResponse = {
  id: number
  name: string
  email: string
  created_at?: string | null
}

export default function ProfilePage() {
  const { isAuthenticated, hydrated, isBootstrapping } = useAuthStore()
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [name, setName] = useState('')
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    api
      .get('/api/v1/profile/')
      .then((response) => {
        setProfile(response.data)
        setName(response.data.name)
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [hydrated, isAuthenticated])

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSavingProfile(true)
    try {
      const response = await api.put('/api/v1/profile/', { name })
      setProfile(response.data)
      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSavingPassword(true)
    try {
      const response = await api.post('/api/v1/profile/change-password', passwords)
      setPasswords({ current_password: '', new_password: '', confirm_password: '' })
      toast.success(response.data?.message || 'Password changed successfully')
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to change password')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <ProtectedRoute
      isAuthenticated={isAuthenticated}
      hydrated={hydrated}
      isBootstrapping={isBootstrapping}
      fallbackTitle="Loading profile"
      fallbackDescription="Preparing account settings."
    >
      <AppShell title="Profile" subtitle="Edit your display name and securely change your password.">
        {loading ? (
          <div className="space-y-4">
            <SkeletonBlock className="h-72" />
            <SkeletonBlock className="h-80" />
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            <PageCard className="p-6">
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">Account details</h2>
              <form className="mt-6 space-y-5" onSubmit={saveProfile}>
                <FormInput label="Name" value={name} onChange={(event) => setName(event.target.value)} />
                <FormInput label="Email" value={profile?.email || ''} readOnly />
                <FormInput
                  label="Created"
                  value={profile?.created_at ? new Date(profile.created_at).toLocaleString() : ''}
                  readOnly
                />
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingProfile ? 'Saving...' : 'Save'}
                </button>
              </form>
            </PageCard>

            <PageCard className="p-6">
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">Change password</h2>
              <form className="mt-6 space-y-5" onSubmit={changePassword}>
                <FormInput
                  label="Current password"
                  type="password"
                  value={passwords.current_password}
                  onChange={(event) => setPasswords((current) => ({ ...current, current_password: event.target.value }))}
                />
                <FormInput
                  label="New password"
                  type="password"
                  value={passwords.new_password}
                  onChange={(event) => setPasswords((current) => ({ ...current, new_password: event.target.value }))}
                />
                <FormInput
                  label="Confirm password"
                  type="password"
                  value={passwords.confirm_password}
                  onChange={(event) => setPasswords((current) => ({ ...current, confirm_password: event.target.value }))}
                />
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingPassword ? 'Updating...' : 'Update password'}
                </button>
              </form>
            </PageCard>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  )
}
