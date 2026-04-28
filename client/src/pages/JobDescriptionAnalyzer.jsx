import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import GeneratedOutput from '../components/GeneratedOutput'
import { Loader2 } from 'lucide-react'

const JobDescriptionAnalyzer = () => {
  const [jobDescription, setJobDescription] = useState('')
  const [currentSkills, setCurrentSkills] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const { getToken } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!jobDescription.trim()) return toast.error('Please enter a job description')
    setLoading(true)
    try {
      const { data } = await api.post('/api/ai/job-description-analysis', { jobDescription, currentSkills }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) { setResult(data.content); toast.success(data.message) }
      else toast.error(data.message)
    } catch (error) { toast.error(error.message) }
    setLoading(false)
  }

  return (
    <div className='h-full overflow-y-scroll p-6'>
      <h1 className='text-2xl font-bold text-slate-800 mb-1'>Job Description Analyzer</h1>
      <p className='text-slate-500 text-sm mb-6'>Extract skills, ATS keywords, gaps, and project ideas from any JD</p>

      <form onSubmit={handleSubmit} className='max-w-2xl space-y-5'>
        <div>
          <label className='block text-sm font-medium text-slate-700 mb-1'>Job Description *</label>
          <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
            rows={8} maxLength={10000} placeholder='Paste the full job description here...'
            className='w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none' />
        </div>
        <div>
          <label className='block text-sm font-medium text-slate-700 mb-1'>Your Current Skills (optional)</label>
          <textarea value={currentSkills} onChange={(e) => setCurrentSkills(e.target.value)}
            rows={3} placeholder='React, Node.js, Python, SQL...'
            className='w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none' />
        </div>

        <button type='submit' disabled={loading}
          className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90 disabled:opacity-50'>
          {loading ? <><Loader2 className='h-4 w-4 animate-spin' /> Analyzing...</> : 'Analyze JD'}
        </button>
      </form>

      {result && (
        <div className='mt-8 max-w-4xl'>
          <GeneratedOutput content={result} title='JD Analysis' filename='jd-analysis' />
        </div>
      )}
    </div>
  )
}

export default JobDescriptionAnalyzer
