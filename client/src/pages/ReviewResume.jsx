import { FileText, Sparkles } from 'lucide-react';
import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import GeneratedOutput from '../components/GeneratedOutput';

const targetRoles = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'MERN Stack Developer', 'DevOps Engineer', 'QA Engineer',
  'UI/UX Designer', 'Data Analyst', 'Software Engineer', 'Other'
]

const experienceLevels = ['Fresher', 'Internship', '0-1 Year', '1-2 Years']

const ReviewResume = () => {

  const [file, setFile] = useState(null)
  const [targetRole, setTargetRole] = useState('Full Stack Developer')
  const [experienceLevel, setExperienceLevel] = useState('Fresher')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please upload a resume PDF'); return }
    try {
      setLoading(true)
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('target_role', targetRole);
      formData.append('experience_level', experienceLevel);
      if (jobDescription.trim()) formData.append('job_description', jobDescription);

      const { data } = await api.post('/api/ai/resume-review', formData, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })

      if (data.success) {
        setContent(data.content)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      {/* left col */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 space-y-4'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#00DA83]' />
          <h1 className='text-xl font-semibold'>Resume Review</h1>
        </div>

        <div>
          <p className='text-sm font-medium mb-1'>Upload Resume <span className='text-red-500'>*</span></p>
          <input
            onChange={(e) => setFile(e.target.files[0])}
            type="file"
            accept="application/pdf"
            className='w-full p-2 px-3 outline-none text-sm rounded-md border border-gray-300 text-gray-600'
            required
          />
          {file && <p className='mt-1 text-xs text-gray-500'>Selected: {file.name}</p>}
          <p className='text-xs text-gray-400 mt-0.5'>PDF only, max 5MB</p>
        </div>

        <div>
          <p className='text-sm font-medium mb-1'>Target Role <span className='text-red-500'>*</span></p>
          <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
            className='w-full p-2 px-3 text-sm rounded-md border border-gray-300 text-gray-600'>
            {targetRoles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <p className='text-sm font-medium mb-1'>Experience Level <span className='text-red-500'>*</span></p>
          <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}
            className='w-full p-2 px-3 text-sm rounded-md border border-gray-300 text-gray-600'>
            {experienceLevels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div>
          <p className='text-sm font-medium mb-1'>Job Description <span className='text-gray-400 font-normal'>(optional)</span></p>
          <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
            rows={4} placeholder='Paste the target job description for role-specific feedback...'
            className='w-full p-2 px-3 text-sm rounded-md border border-gray-300 text-gray-600 resize-none' />
        </div>

        <button disabled={loading} className='w-full flex justify-center items-center gap-2
        bg-gradient-to-r from-[#00DA83] to-[#009BB3] text-white px-4 py-2
        text-sm rounded-lg cursor-pointer disabled:opacity-60'>
          {loading
            ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
            : <FileText className='w-5' />
          }
          Review Resume
        </button>
      </form>

      {/* Right col */}
      <div className='w-full max-w-lg'>
        {content ? (
          <GeneratedOutput content={content} title='Resume Review Report' filename='resume-review' />
        ) : (
          <div className='p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 items-center justify-center'>
            <FileText className='w-9 h-9 text-gray-300' />
            <p className='mt-3 text-sm text-gray-400'>Upload a resume and click "Review Resume" to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewResume
