import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import GeneratedOutput from '../components/GeneratedOutput'
import { Loader2 } from 'lucide-react'

const LearningPlanGenerator = () => {
  const [targetRole, setTargetRole] = useState('')
  const [currentSkills, setCurrentSkills] = useState('')
  const [duration, setDuration] = useState('4 weeks')
  const [hoursPerDay, setHoursPerDay] = useState('3')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const { getToken } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!targetRole.trim()) return toast.error('Please enter a target role')
    setLoading(true)
    try {
      const { data } = await api.post('/api/ai/learning-plan', { targetRole, currentSkills, duration, hoursPerDay }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) { setResult(data.content); toast.success(data.message) }
      else toast.error(data.message)
    } catch (error) { toast.error(error.message) }
    setLoading(false)
  }

  return (
    <div className='h-full overflow-y-scroll p-6'>
      <h1 className='text-2xl font-bold text-slate-800 mb-1'>Learning Plan Generator</h1>
      <p className='text-slate-500 text-sm mb-6'>Get a personalized roadmap with weekly tasks, projects, and resources</p>

      <form onSubmit={handleSubmit} className='max-w-2xl space-y-5'>
        <div>
          <label className='block text-sm font-medium text-slate-700 mb-1'>Target Role *</label>
          <input type='text' value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
            placeholder='e.g. Frontend Developer, Data Analyst'
            className='w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none' />
        </div>
        <div>
          <label className='block text-sm font-medium text-slate-700 mb-1'>Current Skills</label>
          <textarea value={currentSkills} onChange={(e) => setCurrentSkills(e.target.value)} rows={3}
            placeholder='HTML, CSS, basic JavaScript...'
            className='w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none' />
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>Duration</label>
            <select value={duration} onChange={(e) => setDuration(e.target.value)}
              className='w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 outline-none'>
              <option>2 weeks</option><option>4 weeks</option><option>8 weeks</option><option>12 weeks</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-1'>Hours/Day</label>
            <input type='number' min='1' max='12' value={hoursPerDay} onChange={(e) => setHoursPerDay(e.target.value)}
              className='w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none' />
          </div>
        </div>

        <button type='submit' disabled={loading}
          className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90 disabled:opacity-50'>
          {loading ? <><Loader2 className='h-4 w-4 animate-spin' /> Generating...</> : 'Generate Learning Plan'}
        </button>
      </form>

      {result && (
        <div className='mt-8 max-w-4xl'>
          <GeneratedOutput content={result} title='Your Learning Plan' filename='learning-plan' />
        </div>
      )}
    </div>
  )
}

export default LearningPlanGenerator
