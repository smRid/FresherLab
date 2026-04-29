import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import { Loader2, Plus, Trash2, Edit3, X, Search } from 'lucide-react'

const STATUSES = ['Saved', 'Applied', 'Interview', 'Assignment', 'Offer', 'Rejected']
const STATUS_COLORS = {
  Saved: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  Applied: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Interview: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  Assignment: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Offer: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

const emptyForm = { company: '', role: '', status: 'Applied', job_url: '', location: '', salary_range: '', source: '', contact_name: '', contact_email: '', notes: '', follow_up_date: '' }

const JobTracker = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const { getToken } = useAuth()

  const headers = useCallback(async () => ({ Authorization: `Bearer ${await getToken()}` }), [getToken])

  const fetchJobs = useCallback(async () => {
    try {
      const { data } = await api.get('/api/user/job-applications', { headers: await headers() })
      if (data.success) setJobs(data.jobs)
      else toast.error(data.message)
    } catch (e) { toast.error(e.message) }
    setLoading(false)
  }, [headers])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.company || !form.role) return toast.error('Company and role are required')
    setSaving(true)
    try {
      const h = await headers()
      if (editId) {
        const { data } = await api.put(`/api/user/job-applications/${editId}`, form, { headers: h })
        if (data.success) { toast.success('Updated'); fetchJobs(); resetForm() }
        else toast.error(data.message)
      } else {
        const { data } = await api.post('/api/user/job-applications', form, { headers: h })
        if (data.success) { toast.success('Added'); fetchJobs(); resetForm() }
        else toast.error(data.message)
      }
    } catch (e) { toast.error(e.message) }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this application?')) return
    try {
      const { data } = await api.delete(`/api/user/job-applications/${id}`, { headers: await headers() })
      if (data.success) { toast.success('Deleted'); setJobs(jobs.filter(j => j.id !== id)) }
      else toast.error(data.message)
    } catch (e) { toast.error(e.message) }
  }

  const startEdit = (job) => {
    setForm({
      company: job.company, role: job.role, status: job.status,
      job_url: job.job_url || '', location: job.location || '', salary_range: job.salary_range || '',
      source: job.source || '', contact_name: job.contact_name || '', contact_email: job.contact_email || '',
      notes: job.notes || '', follow_up_date: job.follow_up_date ? job.follow_up_date.split('T')[0] : ''
    })
    setEditId(job.id)
    setShowForm(true)
  }

  const resetForm = () => { setForm({ ...emptyForm }); setEditId(null); setShowForm(false) }

  const filtered = jobs
    .filter(j => filter === 'All' || j.status === filter)
    .filter(j => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return j.company.toLowerCase().includes(q) || j.role.toLowerCase().includes(q)
    })

  const statusCounts = STATUSES.reduce((acc, s) => { acc[s] = jobs.filter(j => j.status === s).length; return acc }, {})
  const followUpsDue = jobs.filter(j => j.follow_up_date && new Date(j.follow_up_date) <= new Date()).length

  return (
    <div className='h-full overflow-y-scroll p-6 text-slate-700 dark:text-gray-300'>
      <div className='flex flex-wrap items-center justify-between gap-4 mb-4'>
        <div>
          <h1 className='text-2xl font-bold text-slate-800 dark:text-white'>Job Application Tracker</h1>
          <p className='text-slate-500 dark:text-gray-400 text-sm'>Track your job applications in one place</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }}
          className='inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700'>
          <Plus className='h-4 w-4' /> Add Application
        </button>
      </div>

      {/* Dashboard stat cards */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5'>
        {[
          { label: 'Total Applied', value: statusCounts.Applied || 0, color: 'text-blue-600' },
          { label: 'Interviews', value: statusCounts.Interview || 0, color: 'text-yellow-600' },
          { label: 'Offers', value: statusCounts.Offer || 0, color: 'text-green-600' },
          { label: 'Rejected', value: statusCounts.Rejected || 0, color: 'text-red-500' },
          { label: 'Follow-ups Due', value: followUpsDue, color: 'text-orange-500' },
        ].map(c => (
          <div key={c.label} className='bg-white dark:bg-[#111827] rounded-xl border border-gray-200 dark:border-gray-800 p-3 text-center'>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className='text-xs text-slate-500 mt-0.5'>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className='flex flex-wrap gap-2 mb-5 items-center'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder='Search company or role...'
            className='pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300 text-sm w-56 outline-none focus:border-blue-500' />
        </div>
        <button onClick={() => setFilter('All')}
          className={`rounded-full px-4 py-1.5 text-xs font-medium border transition ${filter === 'All' ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-800 border-slate-800 dark:border-white' : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
          All ({jobs.length})
        </button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium border transition ${filter === s ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-800 border-slate-800 dark:border-white' : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
            {s} ({statusCounts[s] || 0})
          </button>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <form onSubmit={handleSave} className='w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#111827] p-6 shadow-xl space-y-4'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-slate-800 dark:text-white'>{editId ? 'Edit' : 'Add'} Application</h2>
              <button type='button' onClick={resetForm}><X className='h-5 w-5 text-gray-400' /></button>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1'>Company *</label>
                <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder='Google'
                  className='w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300 p-2 text-sm outline-none focus:border-blue-500' />
              </div>
              <div>
                <label className='block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1'>Role *</label>
                <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder='SDE Intern'
                  className='w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300 p-2 text-sm outline-none focus:border-blue-500' />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1'>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className='w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300 p-2 text-sm outline-none focus:border-blue-500'>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className='block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1'>Job URL</label>
                <input value={form.job_url} onChange={e => setForm({ ...form, job_url: e.target.value })} placeholder='https://...'
                  className='w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300 p-2 text-sm outline-none focus:border-blue-500' />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1'>Location</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder='Remote / Bangalore'
                  className='w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300 p-2 text-sm outline-none focus:border-blue-500' />
              </div>
              <div>
                <label className='block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1'>Salary Range</label>
                <input value={form.salary_range} onChange={e => setForm({ ...form, salary_range: e.target.value })} placeholder='3-5 LPA'
                  className='w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300 p-2 text-sm outline-none focus:border-blue-500' />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1'>Source</label>
                <input value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder='LinkedIn / Referral'
                  className='w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300 p-2 text-sm outline-none focus:border-blue-500' />
              </div>
              <div>
                <label className='block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1'>Follow-up Date</label>
                <input type='date' value={form.follow_up_date} onChange={e => setForm({ ...form, follow_up_date: e.target.value })}
                  className='w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300 p-2 text-sm outline-none focus:border-blue-500' />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1'>Contact Name</label>
                <input value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} placeholder='Jane from HR'
                  className='w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300 p-2 text-sm outline-none focus:border-blue-500' />
              </div>
              <div>
                <label className='block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1'>Contact Email</label>
                <input type='email' value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} placeholder='jane@company.com'
                  className='w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300 p-2 text-sm outline-none focus:border-blue-500' />
              </div>
            </div>
            <div>
              <label className='block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1'>Notes</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder='Any extra notes...'
                className='w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300 p-2 text-sm outline-none focus:border-blue-500' />
            </div>
            <button type='submit' disabled={saving}
              className='w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 inline-flex items-center justify-center gap-2'>
              {saving ? <><Loader2 className='h-4 w-4 animate-spin' /> Saving...</> : (editId ? 'Update' : 'Add Application')}
            </button>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className='flex justify-center py-20'>
          <div className='animate-spin rounded-full h-10 w-10 border-t-3 border-purple-500 border-t-transparent' />
        </div>
      ) : filtered.length === 0 ? (
        <div className='rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111827] p-10 text-center text-sm text-slate-400'>
          {jobs.length === 0 ? 'No applications yet. Add your first one!' : 'No applications match this filter.'}
        </div>
      ) : (
        <div className='overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827]'>
          <table className='min-w-full text-sm'>
            <thead className='border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0F172A] text-left text-xs font-medium text-slate-500 dark:text-gray-400'>
              <tr>
                <th className='px-4 py-3'>Company</th>
                <th className='px-4 py-3'>Role</th>
                <th className='px-4 py-3'>Status</th>
                <th className='px-4 py-3'>Location</th>
                <th className='px-4 py-3'>Follow-up</th>
                <th className='px-4 py-3'>Date</th>
                <th className='px-4 py-3 text-right'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
              {filtered.map(job => (
                <tr key={job.id} className='hover:bg-gray-50 dark:hover:bg-white/5'>
                  <td className='px-4 py-3 font-medium text-slate-800 dark:text-white'>
                    {job.job_url ? <a href={job.job_url} target='_blank' rel='noreferrer' className='underline'>{job.company}</a> : job.company}
                  </td>
                  <td className='px-4 py-3 text-slate-600 dark:text-gray-300'>{job.role}</td>
                  <td className='px-4 py-3'>
                    <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium ${STATUS_COLORS[job.status] || ''}`}>{job.status}</span>
                  </td>
                  <td className='px-4 py-3 text-slate-500'>{job.location || '—'}</td>
                  <td className='px-4 py-3 text-slate-500'>
                    {job.follow_up_date ? (
                      <span className={new Date(job.follow_up_date) <= new Date() ? 'text-orange-600 font-medium' : ''}>
                        {new Date(job.follow_up_date).toLocaleDateString()}
                      </span>
                    ) : '—'}
                  </td>
                  <td className='px-4 py-3 text-slate-400'>{new Date(job.created_at).toLocaleDateString()}</td>
                  <td className='px-4 py-3 text-right'>
                    <button onClick={() => startEdit(job)} className='mr-2 text-slate-400 hover:text-blue-600'><Edit3 className='h-4 w-4' /></button>
                    <button onClick={() => handleDelete(job.id)} className='text-slate-400 hover:text-red-600'><Trash2 className='h-4 w-4' /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default JobTracker
