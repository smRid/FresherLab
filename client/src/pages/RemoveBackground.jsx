import { Download, Eraser, Sparkles, Upload } from 'lucide-react';
import { useState } from 'react'
import axios from "axios"
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const subjectTypes = ['Auto', 'Human', 'Product', 'Animal']
const edgeModes = ['Auto', 'Hair/Fur', 'Glass', 'Crisp Product']

const RemoveBackground = () => {
  const [images, setImages] = useState([])
  const [backgroundImage, setBackgroundImage] = useState(null)
  const [settings, setSettings] = useState({
    subject_type: 'Auto',
    edge_refinement: 'Auto',
    output_format: 'transparent_png',
    background_color: '#ffffff',
    shadow_preservation: true
  })
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])

  const { getToken } = useAuth()

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error('Please upload at least one image')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData();
      images.forEach((image) => formData.append('images', image))
      if (backgroundImage) formData.append('background_image', backgroundImage)
      Object.entries(settings).forEach(([key, value]) => formData.append(key, value))

      const { data } = await axios.post('/api/ai/remove-image-background', formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (data.success) {
        setResults(Array.isArray(data.content) ? data.content : [data.content])
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
    link.download = `cutout-${Date.now()}-${index + 1}.png`
    link.target = '_blank'
    link.click()
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-xl p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#FF4938]' />
          <h1 className='text-xl font-semibold'>Pixel-Perfect Background Removal</h1>
        </div>

        <label className='mt-6 block text-sm font-medium'>Upload Images</label>
        <div className='mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#FF4938] transition-colors'>
          <input
            onChange={(e) => setImages(Array.from(e.target.files || []))}
            type='file'
            accept='image/*'
            multiple
            className='hidden'
            id='background-upload'
            required
          />
          <label htmlFor='background-upload' className='cursor-pointer flex flex-col items-center'>
            <Upload className='w-10 h-10 text-gray-400 mb-2' />
            <span className='text-sm text-gray-600'>Click to upload one or more images</span>
            <span className='text-xs text-gray-400 mt-1'>Bulk removal supports up to 10 images</span>
          </label>
        </div>

        {images.length > 0 && (
          <p className='mt-2 text-xs text-gray-500'>
            Selected: {images.map((image) => image.name).join(', ')}
          </p>
        )}

        <div className='mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <div>
            <label className='block text-sm font-medium mb-2'>Subject Detection</label>
            <select
              value={settings.subject_type}
              onChange={(e) => updateSetting('subject_type', e.target.value)}
              className='w-full p-2 border border-gray-300 rounded-md text-sm outline-none'
            >
              {subjectTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>Edge Refinement</label>
            <select
              value={settings.edge_refinement}
              onChange={(e) => updateSetting('edge_refinement', e.target.value)}
              className='w-full p-2 border border-gray-300 rounded-md text-sm outline-none'
            >
              {edgeModes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
            </select>
          </div>
        </div>

        <div className='mt-5'>
          <label className='block text-sm font-medium mb-2'>Output</label>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm'>
            {[
              ['transparent_png', 'Transparent PNG'],
              ['solid_color', 'Color Background'],
              ['custom_image', 'Custom Image']
            ].map(([value, label]) => (
              <button
                key={value}
                type='button'
                onClick={() => updateSetting('output_format', value)}
                className={`p-2 rounded-md border ${settings.output_format === value ? 'bg-orange-50 border-orange-300 text-orange-700' : 'border-gray-300 text-gray-500'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {settings.output_format === 'solid_color' && (
          <div className='mt-3 flex items-center gap-3'>
            <input
              type='color'
              value={settings.background_color}
              onChange={(e) => updateSetting('background_color', e.target.value)}
              className='h-10 w-12 rounded border border-gray-300'
            />
            <input
              value={settings.background_color}
              onChange={(e) => updateSetting('background_color', e.target.value)}
              className='flex-1 p-2 border border-gray-300 rounded-md text-sm outline-none'
            />
          </div>
        )}

        {settings.output_format === 'custom_image' && (
          <div className='mt-3'>
            <input
              onChange={(e) => setBackgroundImage(e.target.files?.[0] || null)}
              type='file'
              accept='image/*'
              className='w-full p-2 px-3 outline-none text-sm rounded-md border border-gray-300 text-gray-600'
            />
          </div>
        )}

        <label className='mt-5 flex items-center gap-2 text-sm'>
          <input
            type='checkbox'
            checked={settings.shadow_preservation}
            onChange={(e) => updateSetting('shadow_preservation', e.target.checked)}
            className='accent-orange-600'
          />
          Preserve natural shadow when possible
        </label>

        <div className='mt-5 p-3 rounded-lg bg-orange-50 text-xs text-orange-700'>
          Manual brush refine is prepared as an output workflow: process the cutout, download it, then re-run with a tighter edge mode if needed.
        </div>

        <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#F6AB41] to-[#FF4938] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-60'>
          {loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> : <Eraser className='w-5' />}
          Remove Background
        </button>
      </form>

      <div className='w-full max-w-2xl p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96'>
        <div className='flex items-center gap-3'>
          <Eraser className='w-5 h-5 text-[#FF4938]' />
          <h1 className='text-xl font-semibold'>Processed Cutouts</h1>
        </div>

        {results.length === 0 ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <Eraser className='w-9 h-9' />
              <p>Upload images and click "Remove Background" to get started</p>
            </div>
          </div>
        ) : (
          <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {results.map((url, index) => (
              <div key={`${url}-${index}`} className='border rounded-lg overflow-hidden bg-[linear-gradient(45deg,#f3f4f6_25%,transparent_25%),linear-gradient(-45deg,#f3f4f6_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f3f4f6_75%),linear-gradient(-45deg,transparent_75%,#f3f4f6_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]'>
                <img src={url} alt={`Cutout ${index + 1}`} className='w-full h-auto' />
                <button
                  type='button'
                  onClick={() => downloadImage(url, index)}
                  className='w-full flex items-center justify-center gap-2 p-2 text-sm bg-white text-orange-700 hover:bg-orange-50'
                >
                  <Download className='w-4 h-4' />
                  Download PNG
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RemoveBackground
