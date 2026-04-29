import { useEffect, useState, useCallback } from 'react'
import { BarChart3, BriefcaseBusiness, FileSearch, FileText, Gem, Mail, Sparkles, TrendingUp, ArrowRight } from 'lucide-react'
import { useAuth, useUser } from '@clerk/clerk-react'
import CreationItem from '../components/CreationItem'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

const CAREER_TYPES = [
  'resume-review', 'ats-score', 'resume-builder', 'cover-letter',
  'job-email', 'grammar-enhancement', 'readme',
  'job-description-analysis', 'learning-plan', 'code-snippet', 'linkedin-post'
]

const statCards = [
  { key: 'total', label: 'Total Generations', icon: Sparkles, gradient: 'from-blue-500 to-cyan-400', bgGlow: 'bg-blue-500/10 dark:bg-blue-500/5' },
  { key: 'resume', label: 'Resumes Reviewed', icon: FileSearch, gradient: 'from-violet-500 to-purple-500', bgGlow: 'bg-violet-500/10 dark:bg-violet-500/5' },
  { key: 'cover', label: 'Cover Letters', icon: Mail, gradient: 'from-indigo-500 to-blue-500', bgGlow: 'bg-indigo-500/10 dark:bg-indigo-500/5' },
  { key: 'jobs', label: 'Jobs Tracked', icon: BriefcaseBusiness, gradient: 'from-emerald-500 to-teal-400', bgGlow: 'bg-emerald-500/10 dark:bg-emerald-500/5' },
  { key: 'plan', label: 'Active Plan', icon: Gem, gradient: 'from-pink-500 to-purple-500', bgGlow: 'bg-pink-500/10 dark:bg-pink-500/5' },
]

const quickLinks = [
  { to: '/ai/resume-review', label: 'Resume Review', desc: 'Get AI feedback on your resume', Icon: FileSearch, gradient: 'from-blue-500 to-purple-600' },
  { to: '/ai/ats-checker', label: 'ATS Checker', desc: 'Optimize for applicant tracking', Icon: BarChart3, gradient: 'from-orange-500 to-red-500' },
  { to: '/ai/resume-builder', label: 'Resume Builder', desc: 'Build an ATS-friendly resume', Icon: FileText, gradient: 'from-green-500 to-emerald-500' },
  { to: '/ai/cover-letter', label: 'Cover Letter', desc: 'Generate tailored cover letters', Icon: Mail, gradient: 'from-indigo-500 to-blue-500' },
]

const Dashboard = () => {

  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()
  const { user } = useUser()

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
  const [plan, setPlan] = useState('free')

  useEffect(() => {
    const fetchExtra = async () => {
      try {
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }
        const [jobRes, planRes] = await Promise.all([
          api.get('/api/user/job-applications', { headers }),
          api.get('/api/stripe/subscription-status', { headers }),
        ])
        if (jobRes.data.success) setJobCount(jobRes.data.jobs.length)
        if (planRes.data.success) setPlan(planRes.data.plan)
      } catch { /* silent */ }
    }
    fetchExtra()
  }, [getToken])

  const careerCreations = creations.filter(c => CAREER_TYPES.includes(c.type))
  const countByType = (type) => creations.filter(c => c.type === type).length

  const getStatValue = (key) => {
    switch (key) {
      case 'total': return creations.length
      case 'resume': return countByType('resume-review')
      case 'cover': return countByType('cover-letter')
      case 'jobs': return jobCount
      case 'plan': return plan === 'premium' ? 'Pro' : 'Free'
      default: return 0
    }
  }

  const firstName = user?.firstName || 'there'

  return (
    <div className='h-full overflow-y-auto p-6 md:p-8'>
      {/* Welcome Banner */}
      <div className='mb-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 md:p-8 text-white relative overflow-hidden'>
        <div className='absolute inset-0 opacity-10' style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px'}}></div>
        <div className='relative'>
          <div className='flex items-center gap-2 mb-2'>
            <TrendingUp className='h-5 w-5 text-cyan-300' />
            <span className='text-cyan-200 text-sm font-medium'>Career Dashboard</span>
          </div>
          <h1 className='text-2xl md:text-3xl font-bold mb-1'>Welcome back, {firstName}!</h1>
          <p className='text-blue-100 text-sm md:text-base max-w-lg'>Track your job preparation progress and access all AI-powered career tools from here.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8'>
        {statCards.map(({ key, label, icon: StatIcon, gradient, bgGlow }) => (
          <div key={key} className={`relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 overflow-hidden group hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/20 transition-all duration-300`}>
            <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full ${bgGlow} blur-xl`}></div>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-lg`}>
              <StatIcon className='w-5 h-5 text-white' />
            </div>
            <h3 className='text-2xl font-bold text-slate-900 dark:text-white'>{getStatValue(key)}</h3>
            <p className='text-xs text-slate-500 dark:text-gray-400 mt-0.5'>{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className='mb-8'>
        <h2 className='text-lg font-semibold text-slate-800 dark:text-white mb-4'>Quick Actions</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {quickLinks.map(({ to, label, desc, Icon, gradient }) => (
            <a key={to} href={to} className='group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/20 hover:-translate-y-0.5'>
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white mb-3 shadow-lg`}>
                <Icon className='h-5 w-5' />
              </div>
              <h3 className='text-sm font-semibold text-slate-800 dark:text-white mb-1'>{label}</h3>
              <p className='text-xs text-slate-500 dark:text-gray-400 mb-3'>{desc}</p>
              <span className='inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-cyan-400 group-hover:gap-2 transition-all'>
                Open tool <ArrowRight className='h-3 w-3' />
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Recent career creations */}
      {loading ? (
        <div className='flex justify-center items-center py-20'>
          <div className='animate-spin rounded-full h-10 w-10 border-2 border-purple-500 border-t-transparent'></div>
        </div>
      ) : (
        <div>
          <h2 className='text-lg font-semibold text-slate-800 dark:text-white mb-4'>Recent AI Outputs</h2>
          {careerCreations.length === 0 ? (
            <div className='rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111827] p-12 text-center'>
              <Sparkles className='w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3' />
              <p className='text-sm text-slate-500 dark:text-gray-400'>No career outputs yet. Try one of the tools above to get started!</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {careerCreations.slice(0, 20).map((item) => <CreationItem key={item.id} item={item} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Dashboard
