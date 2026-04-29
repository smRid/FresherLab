import { useAuth } from '@clerk/clerk-react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import { Check } from 'lucide-react'

const freeBenefits = [
  '3 resume reviews',
  '3 cover letters',
  '5 grammar enhancements',
  '3 job emails',
  'Basic README generator',
  'Job tracker (20 apps)',
]

const proBenefits = [
  'Unlimited AI tools',
  'ATS score checker',
  'Resume builder export',
  'Learning plans',
  'LinkedIn posts',
  'Unlimited job tracker',
  'Advanced dashboard',
  'Priority support',
]

const Plan = () => {
  const { getToken } = useAuth()

  const handleUpgrade = async () => {
    try {
      const { data } = await api.post('/api/stripe/create-checkout-session', {}, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.message || 'Failed to start checkout')
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div id='pricing' className='py-24 bg-[#0D0B1E]'>
      <div className='max-w-4xl mx-auto px-4 sm:px-8'>
        {/* Section Header */}
        <div className='text-center mb-12'>
          <span className='inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium mb-4'>
            Pricing
          </span>
          <h2 className='text-4xl md:text-5xl font-bold text-white mb-4'>
            Simple, Transparent Pricing
          </h2>
          <p className='text-gray-400 max-w-xl mx-auto text-lg'>
            Choose the plan that fits your job preparation needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className='grid md:grid-cols-2 gap-8 max-w-3xl mx-auto'>
          {/* Free */}
          <div className='rounded-2xl border border-white/10 bg-white/5 p-8'>
            <h3 className='text-xl font-semibold text-white mb-1'>Free</h3>
            <p className='text-gray-400 text-sm mb-4'>Get started with limited access</p>
            <p className='text-4xl font-bold text-white mb-6'>$0<span className='text-base font-normal text-gray-400'>/mo</span></p>
            <ul className='space-y-3 mb-8'>
              {freeBenefits.map(b => (
                <li key={b} className='flex items-center gap-2 text-gray-300 text-sm'>
                  <Check className='h-4 w-4 text-cyan-400 shrink-0' /> {b}
                </li>
              ))}
            </ul>
            <button disabled className='w-full rounded-lg border border-white/20 py-2.5 text-sm font-semibold text-gray-400 cursor-default'>
              Current Plan
            </button>
          </div>

          {/* Pro */}
          <div className='rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-cyan-500/10 to-transparent p-8 relative'>
            <span className='absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full'>POPULAR</span>
            <h3 className='text-xl font-semibold text-white mb-1'>Pro</h3>
            <p className='text-gray-400 text-sm mb-4'>Unlimited access to all tools</p>
            <p className='text-4xl font-bold text-white mb-6'>$9<span className='text-base font-normal text-gray-400'>/mo</span></p>
            <ul className='space-y-3 mb-8'>
              {proBenefits.map(b => (
                <li key={b} className='flex items-center gap-2 text-gray-300 text-sm'>
                  <Check className='h-4 w-4 text-cyan-400 shrink-0' /> {b}
                </li>
              ))}
            </ul>
            <button onClick={handleUpgrade}
              className='w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition'>
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Plan
