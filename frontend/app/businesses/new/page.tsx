'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { AppShell } from '@/components/dashboard/app-shell'
import { ActionButton, FormInput, FormTextArea, PageCard, ProtectedRoute, SkeletonBlock } from '@/components/dashboard/ui'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { parseError } from '@/lib/utils'

const emptyForm = {
  business_name: '',
  email: '',
  phone: '',
  website: '',
  logo_url: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  country: '',
  postal_code: '',
  category: '',
  description: '',
}

export default function BusinessFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const isEditing = useMemo(() => Boolean(editId), [editId])
  const { isAuthenticated, hydrated, isBootstrapping } = useAuthStore()
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(Boolean(editId))
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!editId || !hydrated || !isAuthenticated) return
    api
      .get(`/businesses/${editId}`)
      .then((response) => {
        const payload = response.data
        setForm({
          business_name: payload.business_name || '',
          email: payload.email || '',
          phone: payload.phone || '',
          website: payload.website || '',
          logo_url: payload.logo_url || '',
          address_line1: payload.address_line1 || '',
          address_line2: payload.address_line2 || '',
          city: payload.city || '',
          state: payload.state || '',
          country: payload.country || '',
          postal_code: payload.postal_code || '',
          category: payload.category || '',
          description: payload.description || '',
        })
      })
      .catch(() => toast.error('Failed to load business profile'))
      .finally(() => setLoading(false))
  }, [editId, hydrated, isAuthenticated])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    try {
      if (isEditing) {
        await api.put(`/businesses/${editId}`, form)
        toast.success('Business updated successfully')
      } else {
        await api.post('/businesses', form)
        toast.success('Business created successfully')
      }
      router.push('/businesses')
    } catch (error) {
      toast.error(parseError(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProtectedRoute
      isAuthenticated={isAuthenticated}
      hydrated={hydrated}
      isBootstrapping={isBootstrapping}
      fallbackTitle="Loading business form"
      fallbackDescription="Preparing your business profile editor."
    >
      <AppShell
        title={isEditing ? 'Edit Business' : 'Add Business'}
        subtitle="Capture clean NAP data once, then reuse it across campaigns and manual queue workflows."
      >
        {loading ? (
          <SkeletonBlock className="h-[520px]" />
        ) : (
          <PageCard className="p-6">
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              {([
                ['business_name', 'Business Name', true],
                ['email', 'Email', false],
                ['phone', 'Phone', false],
                ['website', 'Website', false],
                ['logo_url', 'Logo URL', false],
                ['address_line1', 'Address Line 1', false],
                ['address_line2', 'Address Line 2', false],
                ['city', 'City', false],
                ['state', 'State', false],
                ['country', 'Country', true],
                ['postal_code', 'Postal Code', false],
                ['category', 'Category', true],
              ] as const).map(([field, label, required]) => (
                <FormInput
                  key={field}
                  label={label}
                  value={form[field]}
                  onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                  required={required}
                />
              ))}
              <div className="md:col-span-2">
                <FormTextArea
                  label="Description"
                  rows={5}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                />
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-3">
                <ActionButton type="submit" tone="primary" disabled={submitting}>
                  {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Business'}
                </ActionButton>
                <ActionButton type="button" onClick={() => router.push('/businesses')}>Cancel</ActionButton>
              </div>
            </form>
          </PageCard>
        )}
      </AppShell>
    </ProtectedRoute>
  )
}
