import { FileText, Briefcase, Copy, Download } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { api } from '../lib/api';

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
        <div className='h-full overflow-y-auto p-4 text-slate-700 dark:text-gray-300 sm:p-6'>
            <div className='grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(360px,520px)_minmax(420px,1fr)]'>
            <form onSubmit={onSubmitHandler} className='w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#111827] xl:sticky xl:top-6 xl:max-h-[calc(100vh-96px)] xl:overflow-hidden'>
                <div className='max-h-none space-y-5 overflow-y-auto px-1 py-1 xl:max-h-[calc(100vh-128px)]'>
                <div className='flex items-center gap-3'>
                    <Briefcase className='w-6 text-[#00AD25]' />
                    <h1 className='text-xl font-semibold dark:text-white'>Cover Letter Generator</h1>
                </div>

                <div>
                    <label className='block text-sm font-medium mb-1'>Candidate Name</label>
                    <input type='text' name='candidate_name' value={formData.candidate_name} onChange={handleInputChange}
                        placeholder='Your full name' className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00AD25] focus:outline-none focus:ring-2 focus:ring-[#00AD25]/30 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300' />
                </div>

                <div className='grid grid-cols-2 gap-3'>
                    <div>
                        <label className='block text-sm font-medium mb-1'>Job Title *</label>
                        <input type='text' name='job_title' value={formData.job_title} onChange={handleInputChange}
                            placeholder='e.g., Software Engineer' required className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00AD25] focus:outline-none focus:ring-2 focus:ring-[#00AD25]/30 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300' />
                    </div>
                    <div>
                        <label className='block text-sm font-medium mb-1'>Company Name *</label>
                        <input type='text' name='company_name' value={formData.company_name} onChange={handleInputChange}
                            placeholder='e.g., Google' required className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00AD25] focus:outline-none focus:ring-2 focus:ring-[#00AD25]/30 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300' />
                    </div>
                </div>

                <div>
                    <label className='block text-sm font-medium mb-1'>Job Description</label>
                    <textarea name='job_description' value={formData.job_description} onChange={handleInputChange}
                        rows={4} placeholder='Paste the job description...' className='block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00AD25] focus:outline-none focus:ring-2 focus:ring-[#00AD25]/30 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300' />
                </div>

                <div>
                    <label className='block text-sm font-medium mb-1'>Resume Highlights / Key Skills</label>
                    <textarea name='resume_highlights' value={formData.resume_highlights} onChange={handleInputChange}
                        rows={3} placeholder='Your relevant skills and experience...' className='block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00AD25] focus:outline-none focus:ring-2 focus:ring-[#00AD25]/30 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300' />
                </div>

                <div>
                    <label className='block text-sm font-medium mb-1'>Key Achievements</label>
                    <textarea name='key_achievements' value={formData.key_achievements} onChange={handleInputChange}
                        rows={3} placeholder='Notable achievements, projects, or certifications...' className='block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00AD25] focus:outline-none focus:ring-2 focus:ring-[#00AD25]/30 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300' />
                </div>

                <div>
                    <label className='block text-sm font-medium mb-1'>Skills to Emphasize</label>
                    <input type='text' name='skills_to_emphasize' value={formData.skills_to_emphasize} onChange={handleInputChange}
                        placeholder='e.g., React, Node.js, TypeScript' className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00AD25] focus:outline-none focus:ring-2 focus:ring-[#00AD25]/30 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300' />
                </div>

                <div className='grid grid-cols-2 gap-3'>
                    <div>
                        <label className='block text-sm font-medium mb-1'>Experience Level</label>
                        <select name='experience_level' value={formData.experience_level} onChange={handleInputChange}
                            className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00AD25] focus:outline-none focus:ring-2 focus:ring-[#00AD25]/30 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300'>
                            {experienceLevels.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className='block text-sm font-medium mb-1'>Tone</label>
                        <select name='tone' value={formData.tone} onChange={handleInputChange}
                            className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00AD25] focus:outline-none focus:ring-2 focus:ring-[#00AD25]/30 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300'>
                            {tones.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                <button type='submit' disabled={loading || !formData.job_title.trim() || !formData.company_name.trim()}
                    className='w-full py-2.5 bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                    {loading ? <><div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' /> Generating...</>
                        : <><FileText className='w-4 h-4' /> Generate Cover Letter</>}
                </button>
                </div>
            </form>

            <div className='w-full min-w-0 rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#111827] xl:sticky xl:top-6 xl:h-[calc(100vh-96px)] xl:overflow-hidden'>
                {generatedCoverLetter ? (
                    <CoverLetterOutput content={generatedCoverLetter} filename={`${formData.company_name}_cover_letter`} />
                ) : (
                    <div className='m-5 flex min-h-96 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-[#0F172A] xl:min-h-[calc(100vh-138px)]'>
                        <Briefcase className='w-9 h-9 text-gray-300' />
                        <p className='mt-3 text-sm text-gray-400'>Fill the form and click "Generate Cover Letter" to get started</p>
                    </div>
                )}
            </div>
            </div>
        </div>
    )
}

const CoverLetterOutput = ({ content, filename }) => {
    const displayContent = content.replace(/^#\s+Cover Letter\s*/i, '').trim()
    const talkingPointsMatch = displayContent.match(/##\s*Key Talking Points\s*\n([\s\S]*)/i)
    const mainContent = talkingPointsMatch ? displayContent.slice(0, talkingPointsMatch.index).trim() : displayContent
    const talkingPoints = talkingPointsMatch
        ? talkingPointsMatch[1].split('\n').map(line => line.trim().replace(/^[-*•]\s+/, '')).filter(Boolean)
        : []

    const copyContent = async () => {
        await navigator.clipboard.writeText(content)
        toast.success('Copied to clipboard')
    }

    const downloadContent = (extension) => {
        const blob = new Blob([content], { type: extension === 'md' ? 'text/markdown' : 'text/plain' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${filename}.${extension}`
        link.click()
        URL.revokeObjectURL(url)
        toast.success(`Downloaded .${extension}`)
    }

    return (
        <div className='flex h-full min-h-0 flex-col'>
            <div className='flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-3 dark:border-gray-800'>
                <h2 className='text-lg font-semibold text-slate-800 dark:text-white'>Cover Letter</h2>
                <div className='flex flex-wrap gap-2'>
                    <button type='button' onClick={copyContent} className='inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'>
                        <Copy className='h-3.5 w-3.5' /> Copy
                    </button>
                    <button type='button' onClick={() => downloadContent('txt')} className='inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'>
                        <Download className='h-3.5 w-3.5' /> TXT
                    </button>
                    <button type='button' onClick={() => downloadContent('md')} className='inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'>
                        <Download className='h-3.5 w-3.5' /> MD
                    </button>
                </div>
            </div>
            <div className='min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-5 text-sm leading-7 text-slate-700 dark:text-gray-300'>
                <div className='prose prose-sm max-w-none prose-headings:mb-4 prose-headings:mt-6 prose-headings:text-slate-900 prose-h2:text-2xl prose-h2:font-bold prose-p:my-3 prose-ul:my-3 prose-li:my-1 dark:prose-invert dark:prose-headings:text-white'>
                    <ReactMarkdown>{mainContent}</ReactMarkdown>
                </div>
                {talkingPoints.length > 0 && (
                    <section className='mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10'>
                        <h3 className='text-2xl font-bold text-slate-900 dark:text-white'>Key Talking Points</h3>
                        <ul className='mt-4 space-y-3'>
                            {talkingPoints.map((point, index) => (
                                <li key={index} className='flex gap-3 text-sm leading-6 text-slate-700 dark:text-gray-300'>
                                    <span className='mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500' />
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </div>
    )
}

export default CoverLetterGenerator
