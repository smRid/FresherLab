import { Download, PlaySquare, Sparkles } from 'lucide-react'
import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const templates = ['Creator Face', 'Product Reveal', 'Tutorial', 'Before/After', 'Gaming', 'Podcast']
const emotions = ['Neutral', 'Excited', 'Surprised', 'Confident', 'Curious']

const YoutubeThumbnailGenerator = () => {
  const [form, setForm] = useState({
    title: '',
    visual_prompt: '',
    template: 'Creator Face',
    emotion: 'Excited',
    text_overlay: '',
    face_emphasis: true,
    high_contrast: true,
    background_effects: true,
    ctr_optimized: true,
    variations: 2
  })
  const [loading, setLoading] = useState(false)
  const [thumbnails, setThumbnails] = useState([])
  const { getToken } = useAuth()

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const { data } = await axios.post('/api/ai/generate-thumbnail', form, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })

      if (data.success) {
        setThumbnails(Array.isArray(data.content) ? data.content : [data.content])
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
    setLoading(false)
  }

  const downloadThumbnail = (url, index) => {
    const link = document.createElement('a')
    link.href = url
    link.download = `youtube-thumbnail-${Date.now()}-${index + 1}.png`
    link.target = '_blank'
    link.click()
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-xl p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3 mb-6'>
          <PlaySquare className='w-6 text-red-600' />
          <h1 className='text-xl font-semibold'>YouTube Thumbnail Generator</h1>
        </div>

        <label className='block text-sm font-medium mb-2'>Video Title</label>
        <input
          value={form.title}
          onChange={(e) => updateForm('title', e.target.value)}
          className='w-full p-2 border border-gray-300 rounded-md text-sm outline-none'
          placeholder='I Tried AI Photo Editing for 30 Days'
          required
        />

        <label className='mt-4 block text-sm font-medium mb-2'>Visual Direction</label>
        <textarea
          value={form.visual_prompt}
          onChange={(e) => updateForm('visual_prompt', e.target.value)}
          rows={3}
          className='w-full p-2 border border-gray-300 rounded-md text-sm outline-none'
          placeholder='Describe the scene, subject, background, props, and mood'
        />

        <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <div>
            <label className='block text-sm font-medium mb-2'>CTR Template</label>
            <select value={form.template} onChange={(e) => updateForm('template', e.target.value)} className='w-full p-2 border border-gray-300 rounded-md text-sm outline-none'>
              {templates.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>Emotion Enhancement</label>
            <select value={form.emotion} onChange={(e) => updateForm('emotion', e.target.value)} className='w-full p-2 border border-gray-300 rounded-md text-sm outline-none'>
              {emotions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>

        <label className='mt-4 block text-sm font-medium mb-2'>Bold Text Overlay</label>
        <input
          value={form.text_overlay}
          onChange={(e) => updateForm('text_overlay', e.target.value)}
          className='w-full p-2 border border-gray-300 rounded-md text-sm outline-none'
          placeholder='AI EDITING CHANGED EVERYTHING'
        />

        <div className='mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
          {[
            ['face_emphasis', 'Face detection & emphasis'],
            ['high_contrast', 'High-contrast color tuning'],
            ['background_effects', 'Background isolation + effects'],
            ['ctr_optimized', 'CTR-optimized layout']
          ].map(([key, label]) => (
            <label key={key} className='flex items-center gap-2'>
              <input type='checkbox' checked={form[key]} onChange={(e) => updateForm(key, e.target.checked)} className='accent-red-600' />
              {label}
            </label>
          ))}
        </div>

        <div className='mt-5'>
          <label className='block text-sm font-medium mb-2'>A/B Variations: {form.variations}</label>
          <input
            type='range'
            min='1'
            max='4'
            value={form.variations}
            onChange={(e) => updateForm('variations', Number(e.target.value))}
            className='w-full accent-red-600'
          />
        </div>

        <button disabled={loading} className='w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60'>
          {loading ? <span className='w-4 h-4 rounded-full border-2 border-t-transparent animate-spin' /> : <Sparkles className='w-4 h-4' />}
          Generate Thumbnails
        </button>
      </form>

      <div className='w-full max-w-2xl p-4 bg-white rounded-lg border border-gray-200 min-h-96'>
        <div className='flex items-center gap-3 mb-4'>
          <PlaySquare className='w-5 h-5 text-red-600' />
          <h1 className='text-xl font-semibold'>1280x720 Thumbnails</h1>
        </div>

        {thumbnails.length === 0 ? (
          <div className='flex justify-center items-center min-h-80 text-sm text-gray-400'>
            Add a title and click "Generate Thumbnails"
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4'>
            {thumbnails.map((url, index) => (
              <div key={`${url}-${index}`} className='border rounded-lg overflow-hidden bg-gray-50'>
                <img src={url} alt={`Thumbnail ${index + 1}`} className='w-full aspect-video object-cover' />
                <button onClick={() => downloadThumbnail(url, index)} className='w-full flex items-center justify-center gap-2 p-2 text-sm text-red-700 hover:bg-red-50'>
                  <Download className='w-4 h-4' />
                  Download Thumbnail
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default YoutubeThumbnailGenerator
