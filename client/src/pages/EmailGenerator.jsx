import { Mail, Send } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import GeneratedOutput from '../components/GeneratedOutput';

const emailTypes = [
    'Cold outreach', 'Follow-up', 'Thank you', 'Referral request',
    'Internship request', 'Recruiter message', 'Interview availability reply'
]
const emailTones = ['Professional', 'Friendly', 'Formal', 'Persuasive', 'Confident', 'Short and direct']

const EmailGenerator = () => {

    const [formData, setFormData] = useState({
        purpose: 'Cold outreach',
        tone: 'Professional',
        recipient: '',
        job_role: '',
        company: '',
        user_background: '',
        key_points: ''
    })
    const [loading, setLoading] = useState(false)
    const [generatedEmail, setGeneratedEmail] = useState('')

    const { getToken } = useAuth()

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!formData.job_role.trim() || !formData.company.trim()) {
            toast.error('Please provide job role and company'); return
        }
        try {
            setLoading(true)
            const { data } = await api.post('/api/ai/generate-email', formData, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            if (data.success) { setGeneratedEmail(data.content); toast.success(data.message) }
            else { toast.error(data.message) }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
        setLoading(false)
    }

    return (
        <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
            <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 space-y-4'>
                <div className='flex items-center gap-3'>
                    <Mail className='w-6 text-[#00AD25]' />
                    <h1 className='text-xl font-semibold'>Smart Job Email Generator</h1>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                    <div>
                        <label className='block text-sm font-medium mb-1'>Email Type</label>
                        <select name='purpose' value={formData.purpose} onChange={handleInputChange}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25]'>
                            {emailTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className='block text-sm font-medium mb-1'>Tone</label>
                        <select name='tone' value={formData.tone} onChange={handleInputChange}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25]'>
                            {emailTones.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className='block text-sm font-medium mb-1'>Recruiter / Company Name</label>
                    <input type='text' name='recipient' value={formData.recipient} onChange={handleInputChange}
                        placeholder='e.g., John Doe, HR Manager' className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25]' />
                </div>

                <div className='grid grid-cols-2 gap-3'>
                    <div>
                        <label className='block text-sm font-medium mb-1'>Job Role *</label>
                        <input type='text' name='job_role' value={formData.job_role} onChange={handleInputChange}
                            placeholder='e.g., Frontend Developer' required className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25]' />
                    </div>
                    <div>
                        <label className='block text-sm font-medium mb-1'>Company *</label>
                        <input type='text' name='company' value={formData.company} onChange={handleInputChange}
                            placeholder='e.g., Google' required className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25]' />
                    </div>
                </div>

                <div>
                    <label className='block text-sm font-medium mb-1'>Your Background</label>
                    <textarea name='user_background' value={formData.user_background} onChange={handleInputChange}
                        rows={3} placeholder='Your skills, experience, and why you are a fit...'
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25] resize-none' />
                </div>

                <div>
                    <label className='block text-sm font-medium mb-1'>Key Points</label>
                    <textarea name='key_points' value={formData.key_points} onChange={handleInputChange}
                        rows={2} placeholder='Main points to cover in the email'
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25] resize-none' />
                </div>

                <button type='submit' disabled={loading || !formData.job_role.trim() || !formData.company.trim()}
                    className='w-full py-2.5 bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                    {loading ? <><div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' /> Generating...</>
                        : <><Send className='w-4 h-4' /> Generate Email</>}
                </button>
            </form>

            <div className='w-full max-w-lg'>
                {generatedEmail ? (
                    <GeneratedOutput content={generatedEmail} title='Job Email' filename='job-email' />
                ) : (
                    <div className='p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 items-center justify-center'>
                        <Mail className='w-9 h-9 text-gray-300' />
                        <p className='mt-3 text-sm text-gray-400'>Fill the form and click "Generate Email" to get started</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default EmailGenerator
