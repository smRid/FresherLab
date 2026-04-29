import { useAuth, useClerk, useUser } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { BarChart3, BookOpen, BriefcaseBusiness, Code2, FileSearch, FileText, Github, LayoutDashboard, Linkedin, LogOut, Mail, PenTool, Search, Send } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/ai', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/ai/resume-review', label: 'Resume Review', Icon: FileSearch },
  { to: '/ai/resume-builder', label: 'Resume Builder', Icon: FileText },
  { to: '/ai/ats-checker', label: 'ATS Score Checker', Icon: BarChart3 },
  { to: '/ai/cover-letter', label: 'Cover Letter', Icon: Mail },
  { to: '/ai/job-email-generator', label: 'Job Email Generator', Icon: Send },
  { to: '/ai/grammar-enhancer', label: 'Grammar Enhancer', Icon: PenTool },
  { to: '/ai/job-description-analyzer', label: 'JD Analyzer', Icon: Search },
  { to: '/ai/readme-generator', label: 'README Generator', Icon: Github },
  { to: '/ai/learning-plan', label: 'Learning Plan', Icon: BookOpen },
  { to: '/ai/code-snippet-generator', label: 'Code Snippet', Icon: Code2 },
  { to: '/ai/linkedin-post-generator', label: 'LinkedIn Post', Icon: Linkedin },
  { to: '/ai/job-tracker', label: 'Job Tracker', Icon: BriefcaseBusiness },
];

const Sidebar = ({ sidebar, setSidebar }) => {

  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk()
  const { getToken } = useAuth()
  const [plan, setPlan] = useState('free')

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const { data } = await api.get('/api/stripe/subscription-status', {
          headers: { Authorization: `Bearer ${await getToken()}` }
        })
        if (data.success) setPlan(data.plan)
      } catch { /* silent */ }
    }
    fetchPlan()
  }, [getToken])

  return (
    <div className={`w-64 bg-white dark:bg-[#0F172A] border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between items-center max-sm:absolute top-14 bottom-0 z-20 ${sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out`}>
      <div className='my-7 w-full overflow-y-auto'>
        <div className='px-4 text-sm text-gray-600 dark:text-gray-400 font-medium space-y-1'>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/ai'} onClick={() => setSidebar(false)} className={({ isActive }) => `px-3.5 py-2.5 flex items-center gap-3 rounded-lg ${isActive ? 'bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-white/5'}`}>
              {({ isActive }) => (
                <>
                  <item.Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
      <div className='w-full border-t border-gray-200 dark:border-gray-800 p-4 px-7 flex items-center justify-between gap-2'>
        <div onClick={openUserProfile} className='flex gap-2 items-center cursor-pointer'>
          <img src={user.imageUrl} className='w-8 rounded-full' alt="" />
          <div>
            <h1 className='text-sm font-medium text-slate-800 dark:text-white'>{user.fullName}</h1>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              {plan === 'premium' ? 'Premium' : 'Free'} Plan
            </p>
          </div>
        </div>
        <LogOut onClick={signOut} className='w-4.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition cursor-pointer' />
      </div>
    </div>
  )
}

export default Sidebar
