import { useEffect, useState, useCallback } from 'react'
import { BarChart3, BriefcaseBusiness, FileSearch, FileText, Gem, Mail, Sparkles } from 'lucide-react'
import { Protect, useAuth } from '@clerk/clerk-react'
import CreationItem from '../components/CreationItem'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

const CAREER_TYPES = [
  'resume-review', 'ats-score', 'resume-builder', 'cover-letter',
  'job-email', 'grammar-enhancement', 'readme',
  'job-description-analysis', 'learning-plan', 'code-snippet', 'linkedin-post'
]

const quickLinks = [
  { to: '/ai/resume-review', label: 'Resume Review', Icon: FileSearch, color: 'from-blue-500 to-purple-600' },
  { to: '/ai/ats-checker', label: 'ATS Checker', Icon: BarChart3, color: 'from-orange-500 to-red-500' },
  { to: '/ai/resume-builder', label: 'Resume Builder', Icon: FileText, color: 'from-green-500 to-emerald-500' },
  { to: '/ai/cover-letter', label: 'Cover Letter', Icon: Mail, color: 'from-indigo-500 to-blue-500' },
]

const Dashboard = () => {

  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()

  const getDashboardData = useCallback(async () => {
    try {
      const { data } = await api.get('/api/user/get-user-creations', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        setCreations(data.creations)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }, [getToken])

  useEffect(() => {
    getDashboardData()
  }, [getDashboardData])

  const [jobCount, setJobCount] = useState(0)

  useEffect(() => {
    const fetchJobCount = async () => {
      try {
        const { data } = await api.get('/api/user/job-applications', {
          headers: { Authorization: `Bearer ${await getToken()}` }
        })
        if (data.success) setJobCount(data.jobs.length)
      } catch { /* silent */ }
    }
    fetchJobCount()
  }, [getToken])

  const careerCreations = creations.filter(c => CAREER_TYPES.includes(c.type))
  const countByType = (type) => creations.filter(c => c.type === type).length

  return (
    <div className='h-full overflow-y-scroll p-6'>
      <h1 className='text-2xl font-bold text-slate-800 mb-1'>Career Dashboard</h1>
      <p className='text-slate-500 text-sm mb-6'>Your AI-powered job preparation progress</p>

      {/* Stats */}
      <div className='flex justify-start gap-4 flex-wrap'>
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Total Generations</p>
            <h2 className='text-xl font-semibold'>{creations.length}</h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center'>
            <Sparkles className='w-5 text-white' />
          </div>
        </div>

        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Resumes Reviewed</p>
            <h2 className='text-xl font-semibold'>{countByType('resume-review')}</h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white flex justify-center items-center'>
            <FileSearch className='w-5 text-white' />
          </div>
        </div>

        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Cover Letters</p>
            <h2 className='text-xl font-semibold'>{countByType('cover-letter')}</h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex justify-center items-center'>
            <Mail className='w-5 text-white' />
          </div>
        </div>

        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Jobs Tracked</p>
            <h2 className='text-xl font-semibold'>{jobCount}</h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex justify-center items-center'>
            <BriefcaseBusiness className='w-5 text-white' />
          </div>
        </div>

        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Active Plan</p>
            <h2 className='text-xl font-semibold'>
              <Protect plan='premium' fallback="Free">Premium</Protect>
            </h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center'>
            <Gem className='w-5 text-white' />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className='mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3'>
        {quickLinks.map(({ to, label, Icon, color }) => (
          <a key={to} href={to} className='flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md'>
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${color} text-white`}>
              <Icon className='h-4 w-4' />
            </div>
            <span className='text-sm font-medium text-slate-700'>{label}</span>
          </a>
        ))}
      </div>

      {/* Recent career creations */}
      {loading ? (
        <div className='flex justify-center items-center h-3/4'>
          <div className='animate-spin rounded-full h-11 w-11 border-t-3 border-purple-500 border-t-transparent'></div>
        </div>
      ) : (
        <div className='space-y-3'>
          <p className='mt-8 mb-4 font-semibold text-slate-700'>Recent AI Outputs</p>
          {careerCreations.length === 0 ? (
            <div className='rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-slate-400'>
              No career outputs yet. Try one of the tools above to get started!
            </div>
          ) : (
            careerCreations.slice(0, 20).map((item) => <CreationItem key={item.id} item={item} />)
          )}
        </div>
      )}
    </div>
  )
}

export default Dashboard
