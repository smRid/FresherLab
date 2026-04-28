import { History, RotateCcw, Scissors, Sparkles, ZoomIn } from 'lucide-react'
import { useState } from 'react'
import axios from "axios"
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const suggestions = ['person', 'wire', 'trash', 'text', 'logo', 'car', 'shadow', 'reflection']

const RemoveObject = () => {
  const [input, setInput] = useState(null)
  const [preview, setPreview] = useState('')
  const [objects, setObjects] = useState('')
  const [settings, setSettings] = useState({
    selection_mode: 'brush',
    brush_size: 32,
    texture_fill: true,
    precision_zoom: 100,
    edge_control: 50
  })
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [history, setHistory] = useState([])

  const { getToken } = useAuth()

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  const handleImage = (file) => {
    setInput(file)
    setContent('')
    setHistory([])
    if (!file) {
      setPreview('')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const addSuggestion = (item) => {
    const current = objects.split(',').map((value) => value.trim()).filter(Boolean)
    if (!current.includes(item)) {
      setObjects([...current, item].join(', '))
    }
  }

  const undoResult = () => {
    setHistory((current) => {
      if (current.length === 0) return current
      const next = [...current]
      const previous = next.pop()
      setContent(previous || '')
      return next
    })
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!input) {
      toast.error('Please upload an image')
      return
    }
    if (!objects.trim()) {
      toast.error('Please describe at least one object to remove')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData();
      formData.append('image', input);
      formData.append('object', objects);
      Object.entries(settings).forEach(([key, value]) => formData.append(key, value))

      const { data } = await axios.post('/api/ai/remove-image-object', formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (data.success) {
        if (content) setHistory((current) => [...current, content])
        setContent(data.content)
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
      <form onSubmit={onSubmitHandler} className='w-full max-w-xl p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Object Removal</h1>
        </div>

        <label className='mt-6 block text-sm font-medium'>Upload Image</label>
        <input
          onChange={(e) => handleImage(e.target.files?.[0] || null)}
          type='file'
          accept='image/*'
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600'
          required
        />

        <label className='mt-6 block text-sm font-medium'>Objects to Remove</label>
        <textarea
          onChange={(e) => setObjects(e.target.value)}
          value={objects}
          rows={3}
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
          placeholder='person, wires, trash, text'
          required
        />

        <div className='mt-3 flex gap-2 flex-wrap'>
          {suggestions.map((item) => (
            <button
              key={item}
              type='button'
              onClick={() => addSuggestion(item)}
              className='text-xs px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700'
            >
              {item}
            </button>
          ))}
        </div>

        <div className='mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div>
            <label className='flex items-center gap-2 text-sm font-medium mb-2'>
              <Scissors className='w-4 h-4' />
              Brush Size: {settings.brush_size}px
            </label>
            <input
              type='range'
              min='8'
              max='96'
              value={settings.brush_size}
              onChange={(e) => updateSetting('brush_size', e.target.value)}
              className='w-full accent-blue-600'
            />
          </div>
          <div>
            <label className='flex items-center gap-2 text-sm font-medium mb-2'>
              <ZoomIn className='w-4 h-4' />
              Precision Zoom: {settings.precision_zoom}%
            </label>
            <input
              type='range'
              min='100'
              max='300'
              step='25'
              value={settings.precision_zoom}
              onChange={(e) => updateSetting('precision_zoom', e.target.value)}
              className='w-full accent-blue-600'
            />
          </div>
        </div>

        <div className='mt-4'>
          <label className='block text-sm font-medium mb-2'>Edge Control: {settings.edge_control}%</label>
          <input
            type='range'
            min='0'
            max='100'
            value={settings.edge_control}
            onChange={(e) => updateSetting('edge_control', e.target.value)}
            className='w-full accent-blue-600'
          />
        </div>

        <label className='mt-4 flex items-center gap-2 text-sm'>
          <input
            type='checkbox'
            checked={settings.texture_fill}
            onChange={(e) => updateSetting('texture_fill', e.target.checked)}
            className='accent-blue-600'
          />
          Texture-aware fill
        </label>

        <div className='mt-5 p-3 rounded-lg bg-blue-50 text-xs text-blue-700'>
          Brush controls define the edit intent for precise retouching. The backend uses the object list for AI inpainting and stores each result in the undo history.
        </div>

        <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#417DF6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-60'>
          {loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> : <Scissors className='w-5' />}
          Remove Objects
        </button>
      </form>

      <div className='w-full max-w-2xl p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96'>
        <div className='flex items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <Scissors className='w-5 h-5 text-[#4A7AFF]' />
            <h1 className='text-xl font-semibold'>Clean Edit Result</h1>
          </div>
          <button
            type='button'
            onClick={undoResult}
            disabled={history.length === 0}
            className='flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border border-gray-200 disabled:opacity-40'
          >
            <RotateCcw className='w-4 h-4' />
            Undo
          </button>
        </div>

        {!content ? (
          <div className='flex-1 flex justify-center items-center min-h-80'>
            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
              <Scissors className='w-9 h-9' />
              <p>Upload an image, target objects, and click "Remove Objects"</p>
            </div>
          </div>
        ) : (
          <div className='mt-4 space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <h3 className='text-sm font-medium mb-2 text-gray-600'>Original</h3>
                <img src={preview} alt='Original' className='w-full rounded-lg border' />
              </div>
              <div>
                <h3 className='text-sm font-medium mb-2 text-gray-600'>Inpainted</h3>
                <img src={content} alt='Edited' className='w-full rounded-lg border' />
              </div>
            </div>
            <div className='flex items-center gap-2 text-xs text-gray-500'>
              <History className='w-4 h-4' />
              {history.length} previous result{history.length === 1 ? '' : 's'} in undo stack
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RemoveObject
