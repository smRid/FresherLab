import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { GraduationCap, Menu, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useClerk, useUser } from '@clerk/clerk-react'

const Layout = () => {

  const navigate = useNavigate()
  const [ sidebar, setSidebar ] = useState(false)
  const { isLoaded, user } = useUser()
  const { openSignIn } = useClerk()

  const renderAuthGate = (loading = false) => (
    <div className='min-h-screen bg-[#0D0B1E] flex items-center justify-center px-4'>
      <div className='w-full max-w-md rounded-2xl border border-purple-900/40 bg-[#1A1730] p-8 text-center shadow-2xl shadow-purple-950/30'>
        <div className='mx-auto mb-5 flex w-fit items-center gap-2 text-white'>
          <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600'>
            <GraduationCap className='h-6 w-6' />
          </div>
          <span className='text-2xl font-bold'>FresherLab</span>
        </div>
        <h1 className='text-2xl font-bold text-white mb-2'>{loading ? 'Preparing sign in...' : 'Sign in to continue'}</h1>
        <p className='text-gray-400 mb-6'>Access your FresherLab job preparation workspace.</p>
        <button
          onClick={() => openSignIn()}
          disabled={loading}
          className='w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-3 font-medium text-white shadow-lg shadow-pink-500/25 transition hover:from-pink-400 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {loading ? 'Loading auth...' : 'Sign in'}
        </button>
        <button
          onClick={() => navigate('/')}
          className='mt-3 w-full rounded-xl border border-purple-900/50 px-5 py-3 font-medium text-gray-300 transition hover:border-purple-500/50'
        >
          Back to home
        </button>
      </div>
    </div>
  )

  if (!isLoaded) {
    return renderAuthGate(true)
  }

  return user ? (
      <div className='flex flex-col items-start justify-start h-screen'>
        <nav className='w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200'>
          <button className='flex items-center cursor-pointer' onClick={() => navigate('/')}>
            <div className='flex items-center gap-2 text-slate-900'>
              <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white'>
                <GraduationCap className='h-5 w-5' />
              </div>
              <span className='text-lg font-bold'>FresherLab</span>
            </div>
          </button>
          {
            sidebar ? <X onClick={()=> setSidebar(false)} className='w-6 h-6 text-gray-600 sm:hidden'/>
            : <Menu onClick={()=> setSidebar(true)} className='w-6 h-6 text-gray-600 sm:hidden'/>
          }
        </nav>
        <div className='flex-1 w-full flex h-[calc(100vh-64px)]'>
          <Sidebar sidebar={sidebar} setSidebar={setSidebar}/>
          <div className='flex-1 bg-[#F4F7FB]'>
            <Outlet />
          </div>
        </div>
      </div>
  ) : (
    renderAuthGate()
  ) 
}

export default Layout
