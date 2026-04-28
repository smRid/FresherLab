import { Aperture, Sparkles, Upload, Download, Focus, Palette } from 'lucide-react'
import { useState } from 'react'
import axios from "axios"
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const BackgroundBlur = () => {

    const bokehStyles = [
        { value: 'soft', label: 'Soft', description: 'Gentle, dreamy blur effect' },
        { value: 'circular', label: 'Circular', description: 'Classic DSLR-style circular bokeh' },
        { value: 'cinematic', label: 'Cinematic', description: 'Strong blur with vignette for film look' },
        { value: 'custom', label: 'Custom', description: 'Describe your own bokeh look' }
    ]

    const subjectModes = [
        { value: 'portrait', label: 'Portrait', description: 'Optimized for faces and people' },
        { value: 'product', label: 'Product', description: 'Best for product photography' }
    ]

    const presets = [
        { value: 'none', label: 'None', description: 'No additional adjustments' },
        { value: 'studio', label: 'Studio', description: 'Bright, crisp studio lighting' },
        { value: 'outdoor', label: 'Outdoor', description: 'Natural, vibrant outdoor colors' },
        { value: 'office', label: 'Office', description: 'Clean, professional appearance' }
    ]

    const [selectedImage, setSelectedImage] = useState(null)
    const [previewImage, setPreviewImage] = useState('')
    const [loading, setLoading] = useState(false)
    const [processedImage, setProcessedImage] = useState('')
    const [originalImage, setOriginalImage] = useState('')

    // Settings
    const [blurIntensity, setBlurIntensity] = useState(50)
    const [bokehStyle, setBokehStyle] = useState('soft')
    const [subjectMode, setSubjectMode] = useState('portrait')
    const [preset, setPreset] = useState('none')
    const [replaceBackground, setReplaceBackground] = useState(false)
    const [backgroundColor, setBackgroundColor] = useState('#1a1a2e')
    const [customBokehPrompt, setCustomBokehPrompt] = useState('')
    const [edgeRefinement, setEdgeRefinement] = useState('hair')
    const [focusControl, setFocusControl] = useState(65)

    const { getToken } = useAuth()

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error('Image size should be less than 10MB')
                return
            }
            setSelectedImage(file)
            const reader = new FileReader()
            reader.onload = () => {
                setPreviewImage(reader.result)
            }
            reader.readAsDataURL(file)
            setProcessedImage('')
            setOriginalImage('')
        }
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!selectedImage) {
            toast.error('Please select an image first')
            return
        }

        try {
            setLoading(true)
            const formData = new FormData()
            formData.append('image', selectedImage)
            formData.append('blur_intensity', blurIntensity)
            formData.append('bokeh_style', bokehStyle)
            formData.append('subject_mode', subjectMode)
            formData.append('preset', preset)
            formData.append('replace_background', replaceBackground)
            formData.append('background_color', backgroundColor)
            formData.append('custom_bokeh_prompt', customBokehPrompt)
            formData.append('edge_refinement', edgeRefinement)
            formData.append('focus_control', focusControl)

            const { data } = await axios.post('/api/ai/blur-background', formData, {
                headers: {
                    Authorization: `Bearer ${await getToken()}`,
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (data.success) {
                setProcessedImage(data.content)
                setOriginalImage(data.original)
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
        setLoading(false)
    }

    const downloadImage = () => {
        const link = document.createElement('a')
        link.href = processedImage
        link.download = `background-blur-${Date.now()}.png`
        link.target = '_blank'
        link.click()
    }

    return (
        <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
            {/* Left Column - Controls */}
            <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
                <div className='flex items-center gap-3 mb-6'>
                    <Aperture className='w-6 text-[#9234EA]' />
                    <h1 className='text-xl font-semibold'>AI Background Blur</h1>
                </div>

                {/* Image Upload */}
                <div className='mb-6'>
                    <label className='block text-sm font-medium mb-2'>Upload Image</label>
                    <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#9234EA] transition-colors cursor-pointer'>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className='hidden'
                            id='image-upload'
                        />
                        <label htmlFor='image-upload' className='cursor-pointer flex flex-col items-center'>
                            <Upload className='w-12 h-12 text-gray-400 mb-2' />
                            <span className='text-sm text-gray-600'>Click to upload an image</span>
                            <span className='text-xs text-gray-400 mt-1'>Max size: 10MB</span>
                        </label>
                    </div>
                    {previewImage && (
                        <div className='mt-4'>
                            <img src={previewImage} alt="Preview" className='w-full max-w-xs rounded-lg border' />
                        </div>
                    )}
                </div>

                {/* Blur Intensity Slider */}
                <div className='mb-6'>
                    <label className='block text-sm font-medium mb-2'>
                        Blur Intensity: {blurIntensity}%
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={blurIntensity}
                        onChange={(e) => setBlurIntensity(parseInt(e.target.value))}
                        className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#9234EA]'
                    />
                    <div className='flex justify-between text-xs text-gray-500 mt-1'>
                        <span>Subtle</span>
                        <span>Intense</span>
                    </div>
                </div>

                {/* Bokeh Style Selection */}
                <div className='mb-6'>
                    <label className='block text-sm font-medium mb-2'>Bokeh Style</label>
                    <div className='grid grid-cols-3 gap-2'>
                        {bokehStyles.map((style) => (
                            <button
                                key={style.value}
                                type="button"
                                onClick={() => setBokehStyle(style.value)}
                                className={`p-2 text-xs rounded-lg border transition-all ${bokehStyle === style.value
                                        ? 'border-[#9234EA] bg-[#9234EA]/10 text-[#9234EA]'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                {style.label}
                            </button>
                        ))}
                    </div>
                    <p className='text-xs text-gray-500 mt-1'>
                        {bokehStyles.find(s => s.value === bokehStyle)?.description}
                    </p>
                    {bokehStyle === 'custom' && (
                        <input
                            value={customBokehPrompt}
                            onChange={(e) => setCustomBokehPrompt(e.target.value)}
                            className='mt-2 w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#9234EA]'
                            placeholder='e.g., warm city lights, soft hexagonal bokeh'
                        />
                    )}
                </div>

                {/* Selective Focus and Edge Refinement */}
                <div className='mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div>
                        <label className='block text-sm font-medium mb-2'>Selective Focus: {focusControl}%</label>
                        <input
                            type='range'
                            min='1'
                            max='100'
                            value={focusControl}
                            onChange={(e) => setFocusControl(e.target.value)}
                            className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#9234EA]'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium mb-2'>Edge Refinement</label>
                        <select
                            value={edgeRefinement}
                            onChange={(e) => setEdgeRefinement(e.target.value)}
                            className='w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#9234EA]'
                        >
                            <option value='hair'>Hair detail</option>
                            <option value='product'>Product edge</option>
                            <option value='soft'>Soft feather</option>
                        </select>
                    </div>
                </div>

                {/* Subject Mode */}
                <div className='mb-6'>
                    <label className='block text-sm font-medium mb-2'>Subject Mode</label>
                    <div className='flex gap-2'>
                        {subjectModes.map((mode) => (
                            <button
                                key={mode.value}
                                type="button"
                                onClick={() => setSubjectMode(mode.value)}
                                className={`flex-1 flex items-center justify-center gap-2 p-2.5 text-sm rounded-lg border transition-all ${subjectMode === mode.value
                                        ? 'border-[#9234EA] bg-[#9234EA]/10 text-[#9234EA]'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <Focus className='w-4 h-4' />
                                {mode.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Portrait Presets */}
                <div className='mb-6'>
                    <label className='block text-sm font-medium mb-2'>Portrait Preset</label>
                    <select
                        value={preset}
                        onChange={(e) => setPreset(e.target.value)}
                        className='w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#9234EA]'
                    >
                        {presets.map((p) => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                    <p className='text-xs text-gray-500 mt-1'>
                        {presets.find(p => p.value === preset)?.description}
                    </p>
                </div>

                {/* Background Replacement */}
                <div className='mb-6 p-3 bg-gray-50 rounded-lg'>
                    <div className='flex items-center justify-between mb-2'>
                        <label className='text-sm font-medium flex items-center gap-2'>
                            <Palette className='w-4 h-4' />
                            Replace Background
                        </label>
                        <button
                            type="button"
                            onClick={() => setReplaceBackground(!replaceBackground)}
                            className={`w-12 h-6 rounded-full transition-colors ${replaceBackground ? 'bg-[#9234EA]' : 'bg-gray-300'
                                }`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${replaceBackground ? 'translate-x-6' : 'translate-x-0.5'
                                }`} />
                        </button>
                    </div>
                    {replaceBackground && (
                        <div className='mt-3'>
                            <label className='block text-xs text-gray-600 mb-1'>Background Color</label>
                            <div className='flex items-center gap-2'>
                                <input
                                    type="color"
                                    value={backgroundColor}
                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                    className='w-10 h-10 rounded border border-gray-200 cursor-pointer'
                                />
                                <input
                                    type="text"
                                    value={backgroundColor}
                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                    className='flex-1 p-2 border border-gray-200 rounded text-sm'
                                />
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type='submit'
                    disabled={loading || !selectedImage}
                    className='w-full py-2.5 bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                >
                    {loading ? (
                        <>
                            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Aperture className='w-4 h-4' />
                            Apply Background Blur
                        </>
                    )}
                </button>
            </form>

            {/* Right Column - Results */}
            <div className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 min-h-96'>
                <div className='flex items-center gap-3 mb-4'>
                    <Sparkles className='w-5 h-5 text-[#9234EA]' />
                    <h1 className='text-xl font-semibold'>DSLR Effect Result</h1>
                </div>

                {!processedImage ? (
                    <div className='flex-1 flex justify-center items-center min-h-80'>
                        <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
                            <Aperture className='w-9 h-9' />
                            <p className='text-center'>Upload an image and click "Apply Background Blur" to create a professional DSLR-style depth effect</p>
                        </div>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {/* Before and After Comparison */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <h3 className='text-sm font-medium mb-2 text-gray-600'>Original</h3>
                                <div className='border rounded-lg overflow-hidden'>
                                    <img
                                        src={originalImage || previewImage}
                                        alt="Original"
                                        className='w-full h-auto'
                                    />
                                </div>
                            </div>
                            <div>
                                <h3 className='text-sm font-medium mb-2 text-gray-600'>With Background Blur</h3>
                                <div className='border rounded-lg overflow-hidden'>
                                    <img
                                        src={processedImage}
                                        alt="Processed"
                                        className='w-full h-auto'
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Settings Summary */}
                        <div className='p-3 bg-gray-50 rounded-lg'>
                            <h3 className='font-medium text-sm mb-2'>Effect Settings:</h3>
                            <div className='grid grid-cols-2 gap-2 text-xs text-gray-600'>
                                <p><strong>Intensity:</strong> {blurIntensity}%</p>
                                <p><strong>Bokeh:</strong> {bokehStyles.find(s => s.value === bokehStyle)?.label}</p>
                                <p><strong>Mode:</strong> {subjectModes.find(m => m.value === subjectMode)?.label}</p>
                                <p><strong>Preset:</strong> {presets.find(p => p.value === preset)?.label}</p>
                                <p><strong>Focus:</strong> {focusControl}%</p>
                                <p><strong>Edges:</strong> {edgeRefinement}</p>
                            </div>
                        </div>

                        {/* Download Button */}
                        <button
                            onClick={downloadImage}
                            className='w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#9234EA] text-white rounded-lg text-sm hover:bg-[#9234EA]/90 transition'
                        >
                            <Download className='w-4 h-4' />
                            Download Image
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default BackgroundBlur
