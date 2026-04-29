import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import GeneratedOutput from '../components/GeneratedOutput'
import { Loader2 } from 'lucide-react'

const LANGUAGES = ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'Go', 'Rust', 'SQL', 'HTML/CSS', 'Bash']

const CodeSnippetGenerator = () => {
  const [topic, setTopic] = useState('')
  const [language, setLanguage] = useState('JavaScript')
  const [level, setLevel] = useState('beginner')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const { getToken } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!topic.trim()) return toast.error('Please enter a topic or problem')
    setLoading(true)
    try {
      const { data } = await api.post('/api/ai/code-snippet', { topic, language, level }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) { setResult(data.content); toast.success(data.message) }
      else toast.error(data.message)
    } catch (error) { toast.error(error.message) }
    setLoading(false)
  }

  return (
    <div className='h-full overflow-y-scroll p-6 text-slate-700 dark:text-gray-300'>
      <h1 className='text-2xl font-bold text-slate-800 dark:text-white mb-1'>Code Snippet Generator</h1>
      <p className='text-slate-500 dark:text-gray-400 text-sm mb-6'>Generate beginner-friendly code with explanations, tests, and common mistakes</p>

      <form onSubmit={handleSubmit} className='max-w-2xl space-y-5'>
        <div>
          <label className='block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1'>Topic or Problem *</label>
          <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={4} maxLength={2000}
            placeholder='e.g. Reverse a linked list, REST API with Express, Binary search...'
            className='w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none' />
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1'>Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              className='w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300 p-2.5 text-sm focus:border-blue-500 outline-none'>
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1'>Level</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)}
              className='w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300 p-2.5 text-sm focus:border-blue-500 outline-none'>
              <option value='beginner'>Beginner</option>
              <option value='intermediate'>Intermediate</option>
              <option value='advanced'>Advanced</option>
            </select>
          </div>
        </div>

        <button type='submit' disabled={loading}
          className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-gray-800 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90 disabled:opacity-50'>
          {loading ? <><Loader2 className='h-4 w-4 animate-spin' /> Generating...</> : 'Generate Snippet'}
        </button>
      </form>

      {result && (
        <div className='mt-8 max-w-4xl'>
          <GeneratedOutput content={result} title='Code Snippet' filename='code-snippet' />
        </div>
      )}
    </div>
  )
}

export default CodeSnippetGenerator
