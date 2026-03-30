'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { AppShell } from '@/components/dashboard/app-shell'
import { ActionButton, FormInput, FormTextArea, PageCard, ProtectedRoute, SkeletonBlock } from '@/components/dashboard/ui'
import api from '@/lib/api'
import { BASE_URL } from '@/lib/env'
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
  const [logoUploading, setLogoUploading] = useState(false)

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

  async function handleLogoUpload(file: File | null) {
    if (!file) return
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      toast.error('Please upload an image file (PNG, JPG, WEBP, SVG)')
      return
    }
    setLogoUploading(true)
    try {
      const payload = new FormData()
      payload.append('logo', file)
      const response = await api.post('/businesses/logo-upload', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setForm((current) => ({ ...current, logo_url: response.data.logo_url || '' }))
      toast.success('Logo uploaded successfully')
    } catch (error) {
      toast.error(parseError(error))
    } finally {
      setLogoUploading(false)
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
                <label className="mb-2 block text-sm font-medium text-slate-700">Business Logo</label>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={(event) => {
                      const nextFile = event.target.files?.[0] || null
                      void handleLogoUpload(nextFile)
                    }}
                    className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Upload PNG/JPG/WEBP/SVG. Max 5MB. Directories that require a brand image will use this file.
                  </p>
                  {logoUploading ? <p className="mt-2 text-sm text-slate-600">Uploading logo...</p> : null}
                  {form.logo_url ? (
                    <div className="mt-3 flex items-center gap-3">
                      <img
                        src={form.logo_url.startsWith('http') ? form.logo_url : `${BASE_URL}${form.logo_url}`}
                        alt="Business logo preview"
                        className="h-14 w-14 rounded-xl border border-slate-200 object-cover"
                      />
                      <span className="text-xs text-slate-500 break-all">{form.logo_url}</span>
                    </div>
                  ) : null}
                </div>
              </div>
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
