import { ImageIcon, Sparkles, Upload } from 'lucide-react'
import { useState } from 'react'
import axios from "axios"
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ImageEnhancer = () => {

    const enhancementTypes = [
        { value: 'auto_enhance', label: 'Auto Enhance', description: 'Automatically improve brightness, contrast, and color' },
        { value: 'upscale_2x', label: 'Upscale 2x', description: 'Double image resolution with quality optimization' },
        { value: 'upscale_4x', label: 'Upscale 4x', description: 'Increase resolution for larger exports' },
        { value: 'denoise', label: 'Noise Reduction', description: 'Remove noise and improve image quality' },
        { value: 'sharpen', label: 'Sharpen & Clarity', description: 'Make image details more crisp and clear' },
        { value: 'face_enhance', label: 'Face Enhancement', description: 'Improve portrait clarity and facial detail' },
        { value: 'low_light', label: 'Low-Light Recovery', description: 'Recover brightness and contrast from dark photos' },
        { value: 'color_correction', label: 'Color Correction', description: 'Fix white balance, contrast, and color cast' },
        { value: 'old_photo_restore', label: 'Old Photo Restoration', description: 'Repair faded, damaged, or vintage photos' }
    ]

    const [selectedEnhancement, setSelectedEnhancement] = useState('auto_enhance')
    const [selectedImage, setSelectedImage] = useState(null)
    const [previewImage, setPreviewImage] = useState('')
    const [loading, setLoading] = useState(false)
    const [enhancedImage, setEnhancedImage] = useState('')
    const [comparison, setComparison] = useState(50)

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
            setEnhancedImage('')
            setComparison(50)
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
            formData.append('enhancement_type', selectedEnhancement)

            const { data } = await axios.post('/api/ai/enhance-image', formData, {
                headers: { 
                    Authorization: `Bearer ${await getToken()}`,
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (data.success) {
                setEnhancedImage(data.content)
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
        link.href = enhancedImage
        link.download = `enhanced-image-${Date.now()}.png`
        link.click()
    }

    return (
        <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
            {/* Left Column - Controls */}
            <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
                <div className='flex items-center gap-3 mb-6'>
                    <Sparkles className='w-6 text-[#00AD25]' />
                    <h1 className='text-xl font-semibold'>AI Image Enhancer</h1>
                </div>

                {/* Image Upload */}
                <div className='mb-6'>
                    <label className='block text-sm font-medium mb-2'>Upload Image</label>
                    <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#00AD25] transition-colors cursor-pointer'>
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

                {/* Enhancement Type Selection */}
                <div className='mb-6'>
                    <label className='block text-sm font-medium mb-2'>Enhancement Type</label>
                    <div className='space-y-2'>
                        {enhancementTypes.map((type) => (
                            <div key={type.value} className='flex items-start space-x-3'>
                                <input
                                    type="radio"
                                    id={type.value}
                                    name="enhancement"
                                    value={type.value}
                                    checked={selectedEnhancement === type.value}
                                    onChange={(e) => setSelectedEnhancement(e.target.value)}
                                    className='mt-1'
                                />
                                <div className='flex-1'>
                                    <label htmlFor={type.value} className='block text-sm font-medium cursor-pointer'>
                                        {type.label}
                                    </label>
                                    <p className='text-xs text-gray-500'>{type.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type='submit'
                    disabled={loading || !selectedImage}
                    className='w-full py-2.5 bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                >
                    {loading ? (
                        <>
                            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                            Enhancing...
                        </>
                    ) : (
                        <>
                            <ImageIcon className='w-4 h-4' />
                            Enhance Image
                        </>
                    )}
                </button>
            </form>

            {/* Right Column - Results */}
            <div className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 min-h-96'>
                <div className='flex items-center gap-3 mb-4'>
                    <ImageIcon className='w-5 h-5 text-[#00AD25]' />
                    <h1 className='text-xl font-semibold'>Enhanced Image</h1>
                </div>

                {!enhancedImage ? (
                    <div className='flex-1 flex justify-center items-center min-h-80'>
                        <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
                            <ImageIcon className='w-9 h-9' />
                            <p>Upload an image and click "Enhance Image" to get started</p>
                        </div>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {/* Before and After Comparison */}
                        <div>
                            <div className='flex items-center justify-between mb-2'>
                                <h3 className='text-sm font-medium text-gray-600'>Side-by-side Comparison</h3>
                                <span className='text-xs text-gray-500'>{comparison}% enhanced</span>
                            </div>
                            <div className='relative border rounded-lg overflow-hidden bg-gray-100'>
                                <img src={previewImage} alt="Original" className='w-full h-auto block' />
                                <div className='absolute inset-0 overflow-hidden' style={{ width: `${comparison}%` }}>
                                    <img src={enhancedImage} alt="Enhanced" className='h-full w-auto max-w-none' />
                                </div>
                                <div className='absolute top-0 bottom-0 w-0.5 bg-white shadow' style={{ left: `${comparison}%` }} />
                            </div>
                            <input
                                type='range'
                                min='0'
                                max='100'
                                value={comparison}
                                onChange={(e) => setComparison(e.target.value)}
                                className='mt-3 w-full accent-[#3C81F6]'
                            />
                        </div>
                        
                        {/* Enhancement Details */}
                        <div className='p-3 bg-gray-50 rounded-lg'>
                            <h3 className='font-medium text-sm mb-2'>Enhancement Details:</h3>
                            <p className='text-xs text-gray-600'>
                                <strong>Type:</strong> {enhancementTypes.find(type => type.value === selectedEnhancement)?.label}
                            </p>
                            <p className='text-xs text-gray-600 mt-1'>
                                {enhancementTypes.find(type => type.value === selectedEnhancement)?.description}
                            </p>
                        </div>

                        {/* Download Button */}
                        <button
                            onClick={downloadImage}
                            className='w-full px-4 py-2 bg-[#00AD25] text-white rounded-lg text-sm hover:bg-[#00AD25]/90 transition'
                        >
                            Download Enhanced Image
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ImageEnhancer
