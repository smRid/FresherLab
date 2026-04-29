import { FileText, Code } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import GeneratedOutput from '../components/GeneratedOutput';

const ReadmeGenerator = () => {

    const [formData, setFormData] = useState({
        project_title: '',
        description: '',
        tech_stack: '',
        installation: '',
        usage: '',
        features: '',
        github_url: '',
        demo_url: '',
        license: 'MIT'
    })
    const [loading, setLoading] = useState(false)
    const [generatedReadme, setGeneratedReadme] = useState('')

    const { getToken } = useAuth()

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        if (!formData.project_title.trim() || !formData.description.trim()) {
            toast.error('Please provide at least project title and description')
            return
        }

        try {
            setLoading(true)

            const { data } = await api.post('/api/ai/generate-readme', formData, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (data.success) {
                setGeneratedReadme(data.content)
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
        <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700 dark:text-gray-300'>
            <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white dark:bg-[#111827] rounded-lg border border-gray-200 dark:border-gray-800 space-y-4'>
                <div className='flex items-center gap-3'>
                    <FileText className='w-6 text-[#00AD25]' />
                    <h1 className='text-xl font-semibold dark:text-white'>README Generator</h1>
                </div>

                <div>
                    <label className='block text-sm font-medium mb-1'>Project Title *</label>
                    <input type='text' name='project_title' value={formData.project_title} onChange={handleInputChange}
                        placeholder='My Awesome Project' required className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25] dark:bg-[#1E293B] dark:text-gray-300' />
                </div>

                <div>
                    <label className='block text-sm font-medium mb-1'>Description *</label>
                    <textarea name='description' value={formData.description} onChange={handleInputChange}
                        rows={3} placeholder='Brief description of what your project does...' required
                        className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25] dark:bg-[#1E293B] dark:text-gray-300 resize-none' />
                </div>

                <div>
                    <label className='block text-sm font-medium mb-1'>Tech Stack</label>
                    <input type='text' name='tech_stack' value={formData.tech_stack} onChange={handleInputChange}
                        placeholder='React, Node.js, MongoDB, Express' className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25] dark:bg-[#1E293B] dark:text-gray-300' />
                </div>

                <div>
                    <label className='block text-sm font-medium mb-1'>Features</label>
                    <textarea name='features' value={formData.features} onChange={handleInputChange}
                        rows={2} placeholder='Key features of your project'
                        className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25] dark:bg-[#1E293B] dark:text-gray-300 resize-none' />
                </div>

                <div>
                    <label className='block text-sm font-medium mb-1'>Installation Instructions</label>
                    <textarea name='installation' value={formData.installation} onChange={handleInputChange}
                        rows={2} placeholder='How to install and setup the project'
                        className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25] dark:bg-[#1E293B] dark:text-gray-300 resize-none' />
                </div>

                <div>
                    <label className='block text-sm font-medium mb-1'>Usage Instructions</label>
                    <textarea name='usage' value={formData.usage} onChange={handleInputChange}
                        rows={2} placeholder='How to use the project after installation'
                        className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25] dark:bg-[#1E293B] dark:text-gray-300 resize-none' />
                </div>

                <div className='grid grid-cols-2 gap-3'>
                    <div>
                        <label className='block text-sm font-medium mb-1'>GitHub URL</label>
                        <input type='url' name='github_url' value={formData.github_url} onChange={handleInputChange}
                            placeholder='https://github.com/...' className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25] dark:bg-[#1E293B] dark:text-gray-300' />
                    </div>
                    <div>
                        <label className='block text-sm font-medium mb-1'>Demo URL</label>
                        <input type='url' name='demo_url' value={formData.demo_url} onChange={handleInputChange}
                            placeholder='https://demo.example.com' className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25] dark:bg-[#1E293B] dark:text-gray-300' />
                    </div>
                </div>

                <div>
                    <label className='block text-sm font-medium mb-1'>License</label>
                    <select name='license' value={formData.license} onChange={handleInputChange}
                        className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00AD25] dark:bg-[#1E293B] dark:text-gray-300'>
                        <option value='MIT'>MIT</option>
                        <option value='Apache 2.0'>Apache 2.0</option>
                        <option value='GPL v3'>GPL v3</option>
                        <option value='BSD 3-Clause'>BSD 3-Clause</option>
                        <option value='None'>None</option>
                    </select>
                </div>

                <button type='submit' disabled={loading || !formData.project_title.trim() || !formData.description.trim()}
                    className='w-full py-2.5 bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                    {loading ? <><div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' /> Generating...</>
                        : <><Code className='w-4 h-4' /> Generate README</>}
                </button>
            </form>

            <div className='w-full max-w-lg'>
                {generatedReadme ? (
                    <GeneratedOutput content={generatedReadme} title='README.md' filename='README' />
                ) : (
                    <div className='p-4 bg-white dark:bg-[#111827] rounded-lg flex flex-col border border-gray-200 dark:border-gray-800 min-h-96 items-center justify-center'>
                        <FileText className='w-9 h-9 text-gray-300' />
                        <p className='mt-3 text-sm text-gray-400'>Fill the form and click "Generate README" to get started</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ReadmeGenerator
