import { FileText, Briefcase } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import GeneratedOutput from '../components/GeneratedOutput';

const tones = ['Professional', 'Confident', 'Passionate', 'Friendly', 'Short and direct']
const experienceLevels = ['Fresher', 'Internship', '0-1 Year', '1-2 Years', 'Career Change']

const CoverLetterGenerator = () => {

    const [formData, setFormData] = useState({
        job_title: '',
        company_name: '',
        job_description: '',
        resume_highlights: '',
        candidate_name: '',
        key_achievements: '',
        skills_to_emphasize: '',
        tone: 'Professional',
        experience_level: 'Fresher'
    })
    const [loading, setLoading] = useState(false)
    const [generatedCoverLetter, setGeneratedCoverLetter] = useState('')

    const { getToken } = useAuth()

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        if (!formData.job_title.trim() || !formData.company_name.trim()) {
            toast.error('Please provide at least job title and company name')
            return
        }

        try {
            setLoading(true)

            const { data } = await api.post('/api/ai/generate-cover-letter', formData, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (data.success) {
                setGeneratedCoverLetter(data.content)
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
        setLoading(false)
    }

    return (
        <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
            <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 space-y-4'>
                <div className='flex items-center gap-3'>
                    <Briefcase className='w-6 text-[#00AD25]' />
                    <h1 className='text-xl font-semibold'>Cover Letter Generator</h1>
                </div>

                <div>
                    <label className='block text-sm font-medium mb-1'>Candidate Name</label>
                    <input type='text' name='candidate_name' value={formData.candidate_name} onChange={handleInputChange}
                        placeholder='Your full name' className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25]' />
                </div>

                <div className='grid grid-cols-2 gap-3'>
                    <div>
                        <label className='block text-sm font-medium mb-1'>Job Title *</label>
                        <input type='text' name='job_title' value={formData.job_title} onChange={handleInputChange}
                            placeholder='e.g., Software Engineer' required className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25]' />
                    </div>
                    <div>
                        <label className='block text-sm font-medium mb-1'>Company Name *</label>
                        <input type='text' name='company_name' value={formData.company_name} onChange={handleInputChange}
                            placeholder='e.g., Google' required className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25]' />
                    </div>
                </div>

                <div>
                    <label className='block text-sm font-medium mb-1'>Job Description</label>
                    <textarea name='job_description' value={formData.job_description} onChange={handleInputChange}
                        rows={3} placeholder='Paste the job description...' className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25] resize-none' />
                </div>

                <div>
                    <label className='block text-sm font-medium mb-1'>Resume Highlights / Key Skills</label>
                    <textarea name='resume_highlights' value={formData.resume_highlights} onChange={handleInputChange}
                        rows={3} placeholder='Your relevant skills and experience...' className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25] resize-none' />
                </div>

                <div>
                    <label className='block text-sm font-medium mb-1'>Key Achievements</label>
                    <textarea name='key_achievements' value={formData.key_achievements} onChange={handleInputChange}
                        rows={2} placeholder='Notable achievements, projects, or certifications...' className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25] resize-none' />
                </div>

                <div>
                    <label className='block text-sm font-medium mb-1'>Skills to Emphasize</label>
                    <input type='text' name='skills_to_emphasize' value={formData.skills_to_emphasize} onChange={handleInputChange}
                        placeholder='e.g., React, Node.js, TypeScript' className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25]' />
                </div>

                <div className='grid grid-cols-2 gap-3'>
                    <div>
                        <label className='block text-sm font-medium mb-1'>Experience Level</label>
                        <select name='experience_level' value={formData.experience_level} onChange={handleInputChange}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25]'>
                            {experienceLevels.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className='block text-sm font-medium mb-1'>Tone</label>
                        <select name='tone' value={formData.tone} onChange={handleInputChange}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25]'>
                            {tones.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                <button type='submit' disabled={loading || !formData.job_title.trim() || !formData.company_name.trim()}
                    className='w-full py-2.5 bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                    {loading ? <><div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' /> Generating...</>
                        : <><FileText className='w-4 h-4' /> Generate Cover Letter</>}
                </button>
            </form>

            <div className='w-full max-w-lg'>
                {generatedCoverLetter ? (
                    <GeneratedOutput content={generatedCoverLetter} title='Cover Letter' filename={`${formData.company_name}_cover_letter`} />
                ) : (
                    <div className='p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 items-center justify-center'>
                        <Briefcase className='w-9 h-9 text-gray-300' />
                        <p className='mt-3 text-sm text-gray-400'>Fill the form and click "Generate Cover Letter" to get started</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CoverLetterGenerator
