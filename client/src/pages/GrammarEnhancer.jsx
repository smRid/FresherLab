import { CheckCircle, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import GeneratedOutput from '../components/GeneratedOutput';

const tones = ['Professional', 'Formal', 'Friendly', 'Casual', 'Academic', 'Persuasive', 'Assertive']
const purposes = ['Resume bullet points', 'Cover letter', 'LinkedIn summary', 'Email', 'Project description', 'General']
const enhancementLevels = [
    'Light - Fix grammar only',
    'Medium - Fix grammar and improve clarity',
    'Heavy - Complete rewrite for better readability'
]

const GrammarEnhancer = () => {

    const [formData, setFormData] = useState({
        text: '',
        tone: 'Professional',
        purpose: 'General',
        enhancement_level: 'Medium - Fix grammar and improve clarity'
    })
    const [loading, setLoading] = useState(false)
    const [enhancedText, setEnhancedText] = useState('')

    const { getToken } = useAuth()

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        if (!formData.text.trim()) {
            toast.error('Please enter some text to enhance')
            return
        }

        if (formData.text.trim().length < 5) {
            toast.error('Please enter at least 5 characters')
            return
        }

        try {
            setLoading(true)
            console.log('Sending request with data:', formData);

            const { data } = await api.post('/api/ai/enhance-grammar', formData, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            console.log('Response received:', data);

            if (data.success) {
                setEnhancedText(data.content)
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.error('Request error:', error);
            toast.error(error.response?.data?.message || error.message || 'An error occurred')
        }
        setLoading(false)
    }

    const wordCount = formData.text.trim() ? formData.text.trim().split(/\s+/).filter(word => word.length > 0).length : 0

    return (
        <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
            <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 space-y-4'>
                <div className='flex items-center gap-3'>
                    <CheckCircle className='w-6 text-[#00AD25]' />
                    <h1 className='text-xl font-semibold'>Grammar Enhancer</h1>
                </div>

                <div>
                    <label className='block text-sm font-medium mb-1'>Text to Enhance *</label>
                    <textarea name='text' value={formData.text} onChange={handleInputChange}
                        placeholder='Enter your text here — resume bullets, cover letter, email, LinkedIn summary...'
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AD25] h-32 resize-none text-sm' required />
                    <div className='text-xs text-gray-500 mt-1'>{wordCount} words</div>
                </div>

                <div>
                    <label className='block text-sm font-medium mb-1'>Purpose</label>
                    <select name='purpose' value={formData.purpose} onChange={handleInputChange}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25]'>
                        {purposes.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                    <div>
                        <label className='block text-sm font-medium mb-1'>Tone</label>
                        <select name='tone' value={formData.tone} onChange={handleInputChange}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25]'>
                            {tones.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className='block text-sm font-medium mb-1'>Enhancement Level</label>
                        <select name='enhancement_level' value={formData.enhancement_level} onChange={handleInputChange}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25]'>
                            {enhancementLevels.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                </div>

                <button type='submit' disabled={loading || !formData.text.trim() || formData.text.trim().length < 5}
                    className='w-full py-2.5 bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                    {loading ? <><div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' /> Enhancing...</>
                        : <><Sparkles className='w-4 h-4' /> Enhance Text</>}
                </button>
            </form>

            <div className='w-full max-w-lg'>
                {enhancedText ? (
                    <GeneratedOutput content={enhancedText} title='Enhanced Text' filename='enhanced-text' />
                ) : (
                    <div className='p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 items-center justify-center'>
                        <CheckCircle className='w-9 h-9 text-gray-300' />
                        <p className='mt-3 text-sm text-gray-400'>Enter text and click "Enhance Text" to get started</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default GrammarEnhancer
