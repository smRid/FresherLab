import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import GeneratedOutput from '../components/GeneratedOutput'
import { Loader2 } from 'lucide-react'

const targetRoles = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'MERN Stack Developer', 'DevOps Engineer', 'QA Engineer',
  'UI/UX Designer', 'Data Analyst', 'Software Engineer', 'Other'
]
const experienceLevels = ['Fresher', 'Internship', '0-1 Year', '1-2 Years']

const AtsScoreChecker = () => {
  const [resumeFile, setResumeFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [targetRole, setTargetRole] = useState('Full Stack Developer')
  const [experienceLevel, setExperienceLevel] = useState('Fresher')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const { getToken } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!resumeFile) return toast.error('Please upload a resume PDF')
    if (!jobDescription.trim()) return toast.error('Please enter a job description')
    if (resumeFile.size > 5 * 1024 * 1024) return toast.error('Resume must be under 5MB')

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('resume', resumeFile)
      formData.append('jobDescription', jobDescription)
      formData.append('target_role', targetRole)
      formData.append('experience_level', experienceLevel)

      const { data } = await api.post('/api/ai/ats-score', formData, {
        headers: { Authorization: `Bearer ${await getToken()}`, 'Content-Type': 'multipart/form-data' }
      })
      if (data.success) {
        setResult(data.content)
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  return (
    <div className='h-full overflow-y-scroll p-6'>
      <h1 className='text-2xl font-bold text-slate-800 mb-1'>ATS Score Checker</h1>
      <p className='text-slate-500 text-sm mb-6'>Compare your resume against a job description to find keyword gaps</p>

      <form onSubmit={handleSubmit} className='max-w-2xl space-y-5'>
        <div>
          <label className='block text-sm font-medium text-slate-700 mb-1'>Upload Resume (PDF, max 5MB)</label>
          <input type='file' accept='.pdf' onChange={(e) => setResumeFile(e.target.files[0])}
            className='block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100' />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>Target Role</label>
            <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
              className='w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none'>
              {targetRoles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>Experience Level</label>
            <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}
              className='w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none'>
              {experienceLevels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-slate-700 mb-1'>Job Description</label>
          <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
            rows={8} maxLength={10000} placeholder='Paste the full job description here...'
            className='w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none' />
        </div>

        <button type='submit' disabled={loading}
          className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90 disabled:opacity-50'>
          {loading ? <><Loader2 className='h-4 w-4 animate-spin' /> Analyzing...</> : 'Check ATS Score'}
        </button>
      </form>

      {result && (
        <div className='mt-8 max-w-4xl'>
          <GeneratedOutput content={result} title='ATS Score Report' filename='ats-score-report' />
        </div>
      )}
    </div>
  )
}

export default AtsScoreChecker
