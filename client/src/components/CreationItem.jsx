import { useState } from 'react'
import Markdown from 'react-markdown'
import { ChevronDown, ChevronUp, Copy, Download } from 'lucide-react'
import toast from 'react-hot-toast'

const TYPE_LABELS = {
  'resume-review': 'Resume Review',
  'ats-score': 'ATS Score',
  'resume-builder': 'Resume Builder',
  'cover-letter': 'Cover Letter',
  'job-email': 'Job Email',
  'grammar-enhancement': 'Grammar',
  'readme': 'README',
  'job-description-analysis': 'JD Analysis',
  'learning-plan': 'Learning Plan',
  'code-snippet': 'Code Snippet',
  'linkedin-post': 'LinkedIn Post',
  'image': 'Image',
}

const CreationItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false)

  const label = TYPE_LABELS[item.type] || item.type

  const copyContent = async () => {
    await navigator.clipboard.writeText(item.content)
    toast.success('Copied to clipboard')
  }

  const downloadContent = () => {
    const blob = new Blob([item.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${item.type}-${item.id}.txt`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded')
  }

  return (
    <div className='p-4 max-w-5xl text-sm bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-lg'>
      <div onClick={() => setExpanded(!expanded)} className='flex justify-between items-center gap-4 cursor-pointer'>
        <div className='min-w-0'>
          <h2 className='truncate font-medium text-slate-900 dark:text-white'>{item.prompt}</h2>
          <p className='text-gray-500 dark:text-gray-400'>{label} &middot; {new Date(item.created_at).toLocaleDateString()}</p>
        </div>
        <div className='flex items-center gap-2 shrink-0'>
          <span className='bg-[#EFF6FF] dark:bg-blue-900/30 border border-[#BFDBFE] dark:border-blue-800 text-[#1E40AF] dark:text-blue-300 px-3 py-0.5 rounded-full text-xs'>{label}</span>
          {expanded ? <ChevronUp className='h-4 w-4 text-gray-400' /> : <ChevronDown className='h-4 w-4 text-gray-400' />}
        </div>
      </div>
      {expanded && (
        <div className='mt-3'>
          {item.type === 'image' ? (
            <img src={item.content} alt="creation" className='w-full max-w-md rounded' />
          ) : (
            <>
              <div className='flex gap-2 mb-2'>
                <button onClick={copyContent} className='inline-flex items-center gap-1 rounded border border-gray-200 dark:border-gray-700 px-2.5 py-1 text-xs text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800'>
                  <Copy className='h-3 w-3' /> Copy
                </button>
                <button onClick={downloadContent} className='inline-flex items-center gap-1 rounded border border-gray-200 dark:border-gray-700 px-2.5 py-1 text-xs text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800'>
                  <Download className='h-3 w-3' /> Download
                </button>
              </div>
              <div className='max-h-96 overflow-y-auto text-sm text-slate-700 dark:text-gray-300'>
                <div className='reset-tw'>
                  <Markdown>{item.content}</Markdown>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default CreationItem
