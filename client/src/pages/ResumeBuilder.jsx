import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import GeneratedOutput from '../components/GeneratedOutput'
import { Loader2 } from 'lucide-react'

const STEPS = ['Personal Info', 'Education & Skills', 'Projects & Links', 'Target Role']

const ResumeBuilder = () => {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', location: '',
    degree: '', college: '', graduationYear: '', skills: '', certifications: '',
    projects: '', githubUrl: '', linkedinUrl: '', portfolioUrl: '',
    targetRole: '', targetCompany: '', summary: ''
  })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const { getToken } = useAuth()

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.fullName || !form.skills || !form.targetRole) return toast.error('Name, Skills and Target Role are required')
    setLoading(true)
    try {
      const { data } = await api.post('/api/ai/resume-builder', form, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) { setResult(data.content); toast.success(data.message) }
      else toast.error(data.message)
    } catch (error) { toast.error(error.message) }
    setLoading(false)
  }

  const input = (label, key, placeholder, type = 'text') => (
    <div>
      <label className='block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1'>{label}</label>
      <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder}
        className='w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none' />
    </div>
  )

  const textarea = (label, key, placeholder, rows = 3) => (
    <div>
      <label className='block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1'>{label}</label>
      <textarea value={form[key]} onChange={set(key)} placeholder={placeholder} rows={rows}
        className='w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none' />
    </div>
  )

  const stepContent = [
    <div key={0} className='space-y-4'>
      {input('Full Name *', 'fullName', 'John Doe')}
      {input('Email', 'email', 'john@example.com', 'email')}
      {input('Phone', 'phone', '+91 9876543210')}
      {input('Location', 'location', 'Mumbai, India')}
    </div>,
    <div key={1} className='space-y-4'>
      {input('Degree', 'degree', 'B.Tech Computer Science')}
      {input('College', 'college', 'ABC University')}
      {input('Graduation Year', 'graduationYear', '2024')}
      {textarea('Skills * (comma-separated)', 'skills', 'React, Node.js, Python, SQL...', 3)}
      {textarea('Certifications', 'certifications', 'AWS Cloud Practitioner, Google Analytics...', 2)}
    </div>,
    <div key={2} className='space-y-4'>
      {textarea('Projects (describe 2-3 projects)', 'projects', 'Project Name — short description, tech stack used...', 5)}
      {input('GitHub URL', 'githubUrl', 'https://github.com/username')}
      {input('LinkedIn URL', 'linkedinUrl', 'https://linkedin.com/in/username')}
      {input('Portfolio URL', 'portfolioUrl', 'https://yourportfolio.com')}
    </div>,
    <div key={3} className='space-y-4'>
      {input('Target Role *', 'targetRole', 'Frontend Developer')}
      {input('Target Company (optional)', 'targetCompany', 'Google')}
      {textarea('Professional Summary (optional)', 'summary', 'Brief summary of your profile...', 3)}
    </div>,
  ]

  return (
    <div className='h-full overflow-y-scroll p-6 text-slate-700 dark:text-gray-300'>
      <h1 className='text-2xl font-bold text-slate-800 dark:text-white mb-1'>AI Resume Builder</h1>
      <p className='text-slate-500 dark:text-gray-400 text-sm mb-6'>Build an ATS-friendly fresher resume step by step</p>

      {/* Stepper */}
      <div className='mb-8 flex gap-2 max-w-2xl'>
        {STEPS.map((s, i) => (
          <button key={i} type='button' onClick={() => setStep(i)}
            className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${i === step ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className='max-w-2xl'>
        {stepContent[step]}

        <div className='mt-6 flex gap-3'>
          {step > 0 && (
            <button type='button' onClick={() => setStep(step - 1)}
              className='rounded-lg border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'>Back</button>
          )}
          {step < STEPS.length - 1 ? (
            <button type='button' onClick={() => setStep(step + 1)}
              className='rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700'>Next</button>
          ) : (
            <button type='submit' disabled={loading}
              className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:opacity-90 disabled:opacity-50'>
              {loading ? <><Loader2 className='h-4 w-4 animate-spin' /> Building...</> : 'Build Resume'}
            </button>
          )}
        </div>
      </form>

      {result && (
        <div className='mt-8 max-w-4xl'>
          <GeneratedOutput content={result} title='Your AI Resume' filename='fresherlab-resume' showPrint />
        </div>
      )}
    </div>
  )
}

export default ResumeBuilder
