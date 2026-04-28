import { FileText, Upload, Download, Copy } from 'lucide-react'
import { useState } from 'react'
import axios from "axios"
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ImageToText = () => {

    const languages = [
        'Auto-detect',
        'English',
        'Spanish', 
        'French',
        'German',
        'Italian',
        'Portuguese',
        'Chinese',
        'Japanese',
        'Korean',
        'Arabic',
        'JavaScript',
        'Python',
        'Java',
        'C++',
        'C#',
        'Go',
        'Rust',
        'TypeScript'
    ]

    const extractFormats = [
        'plain text',
        'structured markdown',
        'formatted document',
        'table format',
        'bullet points',
        'code format'
    ]

    const [formData, setFormData] = useState({
        language: 'Auto-detect',
        extract_format: 'plain text'
    })
    const [image, setImage] = useState(null)
    const [imagePreview, setImagePreview] = useState('')
    const [loading, setLoading] = useState(false)
    const [extractedText, setExtractedText] = useState('')
    const [uploadedImageUrl, setUploadedImageUrl] = useState('')

    const { getToken } = useAuth()

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error('Image size should be less than 10MB')
                return
            }
            
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff']
            if (!allowedTypes.includes(file.type)) {
                toast.error('Please upload a valid image file (JPEG, PNG, WebP, BMP, TIFF)')
                return
            }

            setImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        
        if (!image) {
            toast.error('Please upload an image')
            return
        }

        try {
            setLoading(true)
            setExtractedText('') // Clear previous results
            
            const formDataToSend = new FormData()
            formDataToSend.append('image', image)
            formDataToSend.append('language', formData.language)
            formDataToSend.append('extract_format', formData.extract_format)

            const { data } = await axios.post('/api/ai/image-to-text', formDataToSend, {
                headers: { 
                    Authorization: `Bearer ${await getToken()}`,
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (data.success) {
                setExtractedText(data.content)
                setUploadedImageUrl(data.image_url)
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.error('Error:', error)
            if (error.response?.status === 404) {
                toast.error('Image to Text service is not available. Please try again later.')
            } else {
                toast.error(error.response?.data?.message || error.message || 'An error occurred during text extraction')
            }
        }
        setLoading(false)
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(extractedText)
        toast.success('Text copied to clipboard!')
    }

    const downloadAsText = () => {
        const element = document.createElement('a')
        const file = new Blob([extractedText], { type: 'text/plain' })
        element.href = URL.createObjectURL(file)
        
        // Set appropriate file extension based on format
        let fileName = 'extracted-text.txt';
        if (formData.extract_format === 'code format') {
            // Try to detect language and set appropriate extension
            const lang = formData.language.toLowerCase();
            if (lang.includes('javascript')) fileName = 'extracted-code.js';
            else if (lang.includes('python')) fileName = 'extracted-code.py';
            else if (lang.includes('java')) fileName = 'extracted-code.java';
            else if (lang.includes('c++')) fileName = 'extracted-code.cpp';
            else if (lang.includes('c#')) fileName = 'extracted-code.cs';
            else if (lang.includes('go')) fileName = 'extracted-code.go';
            else if (lang.includes('rust')) fileName = 'extracted-code.rs';
            else if (lang.includes('typescript')) fileName = 'extracted-code.ts';
            else fileName = 'extracted-code.txt';
        } else if (formData.extract_format === 'structured markdown') {
            fileName = 'extracted-text.md';
        }
        
        element.download = fileName;
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
        toast.success(`File downloaded as ${fileName}!`)
    }

    return (
        <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
            {/* Left Column - Form */}
            <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
                <div className='flex items-center gap-3 mb-6'>
                    <FileText className='w-6 text-[#9234EA]' />
                    <div>
                        <h1 className='text-xl font-semibold'>Image to Text</h1>
                        <p className='text-xs text-gray-500'>Using Tesseract.js OCR Technology</p>
                    </div>
                </div>

                {/* Image Upload */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Upload Image *</label>
                    <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#9234EA] transition-colors cursor-pointer'>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className='hidden'
                            id="image-upload"
                        />
                        <label htmlFor="image-upload" className='cursor-pointer'>
                            {imagePreview ? (
                                <div className='space-y-2'>
                                    <img src={imagePreview} alt="Preview" className='w-full max-h-40 object-contain rounded' />
                                    <p className='text-sm text-green-600'>Click to change image</p>
                                </div>
                            ) : (
                                <div className='space-y-2'>
                                    <Upload className='w-8 h-8 text-gray-400 mx-auto' />
                                    <p className='text-sm text-gray-500'>Click to upload image</p>
                                    <p className='text-xs text-gray-400'>JPEG, PNG, WebP, BMP, TIFF up to 10MB</p>
                                </div>
                            )}
                        </label>
                    </div>
                </div>

                {/* Language */}
                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Expected Language</label>
                    <select
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9234EA] focus:border-transparent'
                    >
                        {languages.map((language) => (
                            <option key={language} value={language}>{language}</option>
                        ))}
                    </select>
                </div>

                {/* Extract Format */}
                <div className='mb-6'>
                    <label className='block text-sm font-medium mb-2'>Output Format</label>
                    <div className='space-y-2'>
                        {extractFormats.map((format) => (
                            <div key={format} className='flex items-center space-x-3'>
                                <input
                                    type="radio"
                                    id={format}
                                    name="extract_format"
                                    value={format}
                                    checked={formData.extract_format === format}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor={format} className='text-sm cursor-pointer flex-1 capitalize'>
                                    {format}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type='submit'
                    disabled={loading || !image}
                    className='w-full py-2.5 bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                >
                    {loading ? (
                        <>
                            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                            Processing Image with OCR...
                        </>
                    ) : (
                        <>
                            <FileText className='w-4 h-4' />
                            Extract Text
                        </>
                    )}
                </button>
            </form>

            {/* Right Column - Results */}
            <div className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 min-h-96'>
                <div className='flex items-center gap-3 mb-4'>
                    <FileText className='w-5 h-5 text-[#9234EA]' />
                    <h1 className='text-xl font-semibold'>Extracted Text</h1>
                </div>

                {!extractedText ? (
                    <div className='flex-1 flex justify-center items-center min-h-80'>
                        <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
                            <FileText className='w-9 h-9' />
                            <p>Upload an image to extract text</p>
                        </div>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {/* Source Image */}
                        {uploadedImageUrl && (
                            <div>
                                <h3 className='text-sm font-medium mb-2 text-gray-600'>Source Image</h3>
                                <img src={uploadedImageUrl} alt="Source" className='w-full max-h-32 object-contain rounded border' />
                            </div>
                        )}
                        
                        {/* Extracted Text */}
                        <div>
                            <h3 className='text-sm font-medium mb-2 text-gray-600 flex items-center gap-2'>
                                Extracted Text 
                                <span className='text-xs bg-green-100 text-green-700 px-2 py-1 rounded'>
                                    {extractedText.length} characters
                                </span>
                            </h3>
                            <div className='border rounded-lg bg-gray-50 text-sm max-h-64 overflow-y-auto'>
                                {formData.extract_format === 'structured markdown' ? (
                                    <div className='p-3'>
                                        <ReactMarkdown>{extractedText}</ReactMarkdown>
                                    </div>
                                ) : formData.extract_format === 'code format' ? (
                                    <pre className='whitespace-pre-wrap font-mono text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto'>
                                        <code>{extractedText}</code>
                                    </pre>
                                ) : (
                                    <div className='whitespace-pre-wrap p-3'>{extractedText}</div>
                                )}
                            </div>
                        </div>
                        
                        {/* Settings Used */}
                        <div className='p-3 bg-blue-50 rounded-lg'>
                            <h3 className='font-medium text-sm mb-2'>Extraction Settings:</h3>
                            <ul className='text-xs text-gray-600 space-y-1'>
                                <li><strong>Language:</strong> {formData.language}</li>
                                <li><strong>Format:</strong> {formData.extract_format}</li>
                                <li><strong>Character Count:</strong> {extractedText.length}</li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className='grid grid-cols-2 gap-2'>
                            <button
                                onClick={copyToClipboard}
                                className='px-4 py-2 bg-[#9234EA] text-white rounded-lg text-sm hover:bg-[#9234EA]/90 transition flex items-center justify-center gap-2'
                            >
                                <Copy className='w-3 h-3' />
                                Copy
                            </button>
                            <button
                                onClick={downloadAsText}
                                className='px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition flex items-center justify-center gap-2'
                            >
                                <Download className='w-3 h-3' />
                                {formData.extract_format === 'code format' ? 'Save Code' : 'Download'}
                            </button>
                        </div>
                        
                        <button
                            onClick={() => {
                                setExtractedText('');
                                setUploadedImageUrl('');
                                setImage(null);
                                setImagePreview('');
                                setFormData({
                                    language: 'Auto-detect',
                                    extract_format: 'plain text'
                                });
                                // Reset file input
                                document.getElementById('image-upload').value = '';
                            }}
                            className='w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition'
                        >
                            Extract from New Image
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ImageToText
