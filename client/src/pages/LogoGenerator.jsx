import { Download, Layers, Palette, Sparkles } from 'lucide-react'
import { useState } from 'react'
import axios from "axios"
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const logoStyles = ['Modern', 'Minimalist', 'Vintage', 'Geometric', 'Abstract', 'Corporate', 'Creative', 'Classic']
const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Food & Beverage', 'Real Estate', 'Marketing', 'Construction', 'Entertainment', 'Sports', 'Other']
const typography = ['Sans Serif', 'Serif', 'Rounded', 'Condensed', 'Luxury', 'Playful']

const LogoGenerator = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    industry: 'Technology',
    style: 'Modern',
    colors: '#2563eb, #111827',
    font_style: 'Sans Serif',
    description: '',
    include_icon: true,
    include_typography: true,
    light_dark_variants: true,
    social_versions: true,
    favicon_versions: true,
    editable_layers: true,
    vector_export: true
  })
  const [loading, setLoading] = useState(false)
  const [generatedLogo, setGeneratedLogo] = useState('')
  const [palette, setPalette] = useState([])

  const { getToken } = useAuth()

  const handleInputChange = (key, value) => {
    setFormData((current) => ({ ...current, [key]: value }))
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!formData.company_name.trim()) {
      toast.error('Please enter a company name')
      return
    }

    try {
      setLoading(true)

      const { data } = await axios.post('/api/ai/generate-logo', formData, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })

      if (data.success) {
        setGeneratedLogo(data.content)
        setPalette(data.palette || formData.colors.split(',').map((color) => color.trim()).filter(Boolean))
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
    setLoading(false)
  }

  const downloadLogo = (format = 'png') => {
    if (format === 'svg') {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><image href="${generatedLogo}" width="1024" height="1024"/></svg>`
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${formData.company_name.replace(/\s+/g, '_').toLowerCase()}_logo.svg`
      link.click()
      URL.revokeObjectURL(url)
      return
    }

    const link = document.createElement('a')
    link.href = generatedLogo
    link.download = `${formData.company_name.replace(/\s+/g, '_').toLowerCase()}_logo.png`
    link.target = '_blank'
    link.click()
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-xl p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3 mb-6'>
          <Palette className='w-6 text-[#9234EA]' />
          <h1 className='text-xl font-semibold'>AI Logo Generator</h1>
        </div>

        <label className='block text-sm font-medium mb-2'>Company Name</label>
        <input
          type='text'
          value={formData.company_name}
          onChange={(e) => handleInputChange('company_name', e.target.value)}
          placeholder='Enter your company name'
          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9234EA] focus:border-transparent'
          required
        />

        <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <div>
            <label className='block text-sm font-medium mb-2'>Industry</label>
            <select
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9234EA]'
            >
              {industries.map((industry) => <option key={industry} value={industry}>{industry}</option>)}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>Logo Style</label>
            <select
              value={formData.style}
              onChange={(e) => handleInputChange('style', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9234EA]'
            >
              {logoStyles.map((style) => <option key={style} value={style}>{style}</option>)}
            </select>
          </div>
        </div>

        <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <div>
            <label className='block text-sm font-medium mb-2'>Brand Colors</label>
            <input
              value={formData.colors}
              onChange={(e) => handleInputChange('colors', e.target.value)}
              placeholder='#2563eb, #111827'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9234EA]'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>Font Pairing</label>
            <select
              value={formData.font_style}
              onChange={(e) => handleInputChange('font_style', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9234EA]'
            >
              {typography.map((style) => <option key={style} value={style}>{style}</option>)}
            </select>
          </div>
        </div>

        <label className='mt-4 block text-sm font-medium mb-2'>Brand Direction</label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder='Describe the brand personality, audience, and symbols to explore'
          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9234EA] h-20 resize-none'
        />

        <div className='mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
          {[
            ['include_icon', 'Icon mark'],
            ['include_typography', 'Typography lockup'],
            ['light_dark_variants', 'Light & dark variants'],
            ['editable_layers', 'Editable layer intent'],
            ['vector_export', 'SVG export'],
            ['social_versions', 'Social versions'],
            ['favicon_versions', 'Favicon versions']
          ].map(([key, label]) => (
            <label key={key} className='flex items-center gap-2'>
              <input
                type='checkbox'
                checked={formData[key]}
                onChange={(e) => handleInputChange(key, e.target.checked)}
                className='accent-purple-600'
              />
              {label}
            </label>
          ))}
        </div>

        <button
          type='submit'
          disabled={loading || !formData.company_name.trim()}
          className='w-full py-2.5 mt-6 bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
        >
          {loading ? (
            <>
              <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
              Generating Logo...
            </>
          ) : (
            <>
              <Sparkles className='w-4 h-4' />
              Generate Logo
            </>
          )}
        </button>
      </form>

      <div className='w-full max-w-2xl p-4 bg-white rounded-lg border border-gray-200 min-h-96'>
        <div className='flex items-center gap-3 mb-4'>
          <Palette className='w-5 h-5 text-[#9234EA]' />
          <h1 className='text-xl font-semibold'>Brand Output</h1>
        </div>

        {!generatedLogo ? (
          <div className='flex-1 flex justify-center items-center min-h-80'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <Palette className='w-9 h-9' />
              <p>Enter brand details and click "Generate Logo" to get started</p>
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='border rounded-lg overflow-hidden bg-gray-50 p-8 text-center'>
              <img src={generatedLogo} alt='Generated Logo' className='max-w-full max-h-72 mx-auto' />
            </div>

            <div className='p-3 bg-gray-50 rounded-lg'>
              <h3 className='font-medium text-sm mb-2 flex items-center gap-2'>
                <Layers className='w-4 h-4' />
                Logo System
              </h3>
              <div className='flex flex-wrap gap-2 mb-3'>
                {palette.map((color) => (
                  <span key={color} className='inline-flex items-center gap-2 text-xs text-gray-600'>
                    <span className='w-5 h-5 rounded border border-gray-200' style={{ backgroundColor: color }} />
                    {color}
                  </span>
                ))}
              </div>
              <p className='text-xs text-gray-600'>Font direction: {formData.font_style}. Variants requested for light/dark, social, and favicon use.</p>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
              <button onClick={() => downloadLogo('png')} className='flex items-center justify-center gap-2 px-4 py-2 bg-[#9234EA] text-white rounded-lg text-sm hover:bg-[#9234EA]/90 transition'>
                <Download className='w-4 h-4' />
                Download PNG
              </button>
              <button onClick={() => downloadLogo('svg')} className='flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition'>
                <Download className='w-4 h-4' />
                Download SVG
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LogoGenerator
