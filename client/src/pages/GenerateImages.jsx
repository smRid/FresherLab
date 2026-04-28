import { Download, Image, Sparkles } from 'lucide-react'
import { useState } from 'react'
import axios from "axios"
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const styles = ['Realistic', 'Illustration', '3D', 'Minimal', 'Cyber', 'Anime']
const ratios = ['1:1', '16:9', '9:16', 'Custom']

const GenerateImages = () => {
  const [mode, setMode] = useState('simple')
  const [form, setForm] = useState({
    prompt: '',
    negative_prompt: '',
    aspect_ratio: '1:1',
    custom_width: 1024,
    custom_height: 1024,
    style: 'Realistic',
    seed: '',
    brand_name: '',
    brand_colors: '',
    brand_notes: '',
    face_consistency: false,
    transparent_background: false,
    batch_count: 1,
    commercial_license: true,
    publish: false
  })
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])

  const { getToken } = useAuth()

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true)

      const { data } = await axios.post('/api/ai/generate-image', form, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })

      if (data.success) {
        setImages(Array.isArray(data.content) ? data.content : [data.content])
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }

    setLoading(false)
  }

  const downloadImage = (url, index) => {
    const link = document.createElement('a')
    link.href = url
    link.download = `ai-image-${Date.now()}-${index + 1}.png`
    link.target = '_blank'
    link.click()
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-xl p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#00AD25]' />
          <h1 className='text-xl font-semibold'>AI Image Generator</h1>
        </div>

        <div className='mt-6 grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1 text-sm'>
          {['simple', 'advanced'].map((item) => (
            <button
              key={item}
              type='button'
              onClick={() => setMode(item)}
              className={`rounded-md py-2 capitalize ${mode === item ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}
            >
              {item}
            </button>
          ))}
        </div>

        <label className='mt-6 block text-sm font-medium'>Describe Your Image</label>
        <textarea
          onChange={(e) => updateForm('prompt', e.target.value)}
          value={form.prompt}
          rows={4}
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
          placeholder='A cinematic product photo of a futuristic camera on a clean studio table...'
          required
        />

        <div className='mt-4'>
          <p className='text-sm font-medium'>Style Preset</p>
          <div className='mt-3 flex gap-2 flex-wrap'>
            {styles.map((item) => (
              <button
                type='button'
                onClick={() => updateForm('style', item)}
                className={`text-xs px-4 py-1.5 border rounded-full ${form.style === item ? 'bg-green-50 text-green-700 border-green-200' : 'text-gray-500 border-gray-300'}`}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className='mt-4 grid grid-cols-2 gap-3'>
          <div>
            <label className='block text-sm font-medium mb-2'>Aspect Ratio</label>
            <select
              value={form.aspect_ratio}
              onChange={(e) => updateForm('aspect_ratio', e.target.value)}
              className='w-full p-2 border border-gray-300 rounded-md text-sm outline-none'
            >
              {ratios.map((ratio) => <option key={ratio} value={ratio}>{ratio}</option>)}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>Batch Variations</label>
            <input
              type='number'
              min='1'
              max='4'
              value={form.batch_count}
              onChange={(e) => updateForm('batch_count', Math.min(4, Math.max(1, Number(e.target.value))))}
              className='w-full p-2 border border-gray-300 rounded-md text-sm outline-none'
            />
          </div>
        </div>

        {form.aspect_ratio === 'Custom' && (
          <div className='mt-3 grid grid-cols-2 gap-3'>
            <input
              type='number'
              min='256'
              value={form.custom_width}
              onChange={(e) => updateForm('custom_width', e.target.value)}
              className='w-full p-2 border border-gray-300 rounded-md text-sm outline-none'
              placeholder='Width'
            />
            <input
              type='number'
              min='256'
              value={form.custom_height}
              onChange={(e) => updateForm('custom_height', e.target.value)}
              className='w-full p-2 border border-gray-300 rounded-md text-sm outline-none'
              placeholder='Height'
            />
          </div>
        )}

        {mode === 'advanced' && (
          <div className='mt-5 space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>Negative Prompt</label>
              <textarea
                value={form.negative_prompt}
                onChange={(e) => updateForm('negative_prompt', e.target.value)}
                rows={2}
                className='w-full p-2 border border-gray-300 rounded-md text-sm outline-none'
                placeholder='Avoid blur, extra fingers, text artifacts, low quality...'
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm font-medium mb-2'>Seed</label>
                <input
                  value={form.seed}
                  onChange={(e) => updateForm('seed', e.target.value)}
                  className='w-full p-2 border border-gray-300 rounded-md text-sm outline-none'
                  placeholder='Optional number'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>Brand Colors</label>
                <input
                  value={form.brand_colors}
                  onChange={(e) => updateForm('brand_colors', e.target.value)}
                  className='w-full p-2 border border-gray-300 rounded-md text-sm outline-none'
                  placeholder='#111827, #22c55e'
                />
              </div>
            </div>

            <input
              value={form.brand_name}
              onChange={(e) => updateForm('brand_name', e.target.value)}
              className='w-full p-2 border border-gray-300 rounded-md text-sm outline-none'
              placeholder='Brand name or campaign'
            />
            <textarea
              value={form.brand_notes}
              onChange={(e) => updateForm('brand_notes', e.target.value)}
              rows={2}
              className='w-full p-2 border border-gray-300 rounded-md text-sm outline-none'
              placeholder='Logo usage, mood, typography, brand guardrails...'
            />

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              {[
                ['face_consistency', 'Face consistency mode'],
                ['transparent_background', 'Transparent PNG output'],
                ['commercial_license', 'Commercial-use license'],
                ['publish', 'Make image public']
              ].map(([key, label]) => (
                <label key={key} className='flex items-center gap-2 text-sm'>
                  <input
                    type='checkbox'
                    checked={form[key]}
                    onChange={(e) => updateForm(key, e.target.checked)}
                    className='accent-green-600'
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        )}

        {mode === 'simple' && (
          <label className='my-6 flex items-center gap-2 text-sm'>
            <input
              type='checkbox'
              onChange={(e) => updateForm('publish', e.target.checked)}
              checked={form.publish}
              className='accent-green-600'
            />
            Make this image public
          </label>
        )}

        <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00AD25] to-[#04FF50] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-60'>
          {loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> : <Image className='w-5' />}
          Generate Image
        </button>
      </form>

      <div className='w-full max-w-2xl p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96'>
        <div className='flex items-center gap-3'>
          <Image className='w-5 h-5 text-[#00AD25]' />
          <h1 className='text-xl font-semibold'>Generated Images</h1>
        </div>

        {images.length === 0 ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <Image className='w-9 h-9' />
              <p>Enter a prompt and click "Generate Image" to get started</p>
            </div>
          </div>
        ) : (
          <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {images.map((url, index) => (
              <div key={`${url}-${index}`} className='border rounded-lg overflow-hidden bg-gray-50'>
                <img src={url} alt={`Generated ${index + 1}`} className='w-full h-auto' />
                <button
                  type='button'
                  onClick={() => downloadImage(url, index)}
                  className='w-full flex items-center justify-center gap-2 p-2 text-sm text-green-700 hover:bg-green-50'
                >
                  <Download className='w-4 h-4' />
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default GenerateImages
