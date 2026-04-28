import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import GeneratedOutput from '../components/GeneratedOutput'
import { Loader2 } from 'lucide-react'

const POST_TYPES = [
  'Project showcase', 'Certification earned', 'Learning update',
  'Job seeking announcement', 'Skill milestone', 'Event recap'
]

const LinkedInPostGenerator = () => {
  const [postType, setPostType] = useState(POST_TYPES[0])
  const [context, setContext] = useState('')
  const [tone, setTone] = useState('professional')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const { getToken } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!context.trim()) return toast.error('Please enter context for your post')
    setLoading(true)
    try {
      const { data } = await api.post('/api/ai/linkedin-post', { postType, context, tone }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) { setResult(data.content); toast.success(data.message) }
      else toast.error(data.message)
    } catch (error) { toast.error(error.message) }
    setLoading(false)
  }

  return (
    <div className='h-full overflow-y-scroll p-6'>
      <h1 className='text-2xl font-bold text-slate-800 mb-1'>LinkedIn Post Generator</h1>
      <p className='text-slate-500 text-sm mb-6'>Turn your achievements into engaging LinkedIn posts</p>

      <form onSubmit={handleSubmit} className='max-w-2xl space-y-5'>
        <div>
          <label className='block text-sm font-medium text-slate-700 mb-1'>Post Type</label>
          <select value={postType} onChange={(e) => setPostType(e.target.value)}
            className='w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 outline-none'>
            {POST_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className='block text-sm font-medium text-slate-700 mb-1'>Context / Details *</label>
          <textarea value={context} onChange={(e) => setContext(e.target.value)} rows={5} maxLength={5000}
            placeholder='Describe what you achieved, built, or learned...'
            className='w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none' />
        </div>
        <div>
          <label className='block text-sm font-medium text-slate-700 mb-1'>Tone</label>
          <select value={tone} onChange={(e) => setTone(e.target.value)}
            className='w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 outline-none'>
            <option value='professional'>Professional</option>
            <option value='casual'>Casual</option>
            <option value='motivational'>Motivational</option>
            <option value='storytelling'>Storytelling</option>
          </select>
        </div>

        <button type='submit' disabled={loading}
          className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0A66C2] to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90 disabled:opacity-50'>
          {loading ? <><Loader2 className='h-4 w-4 animate-spin' /> Generating...</> : 'Generate Post'}
        </button>
      </form>

      {result && (
        <div className='mt-8 max-w-4xl'>
          <GeneratedOutput content={result} title='LinkedIn Post' filename='linkedin-post' />
        </div>
      )}
    </div>
  )
}

export default LinkedInPostGenerator
