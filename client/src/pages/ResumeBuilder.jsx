import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import GeneratedOutput from '../components/GeneratedOutput'
import { Loader2, Plus, Trash2 } from 'lucide-react'

const STEPS = ['Personal', 'Experience', 'Skills', 'Projects', 'Certifications', 'Education', 'Research']

const emptyExperience = { company: '', companyUrl: '', role: '', dates: '', location: '', bullets: '' }
const emptyProject = { name: '', stack: '', githubUrl: '', liveUrl: '', bullets: '' }
const emptyCertification = { institution: '', course: '', certificateUrl: '' }
const emptyEducation = { institution: '', degree: '', dates: '', grade: '' }

const inputClass = 'w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none'
const labelClass = 'block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1'

const ResumeBuilder = () => {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const { getToken } = useAuth()

  const [personal, setPersonal] = useState({
    fullName: '', email: '', phone: '', location: '',
    linkedinUrl: '', portfolioUrl: '', githubUrl: '', targetRole: '',
  })
  const [experiences, setExperiences] = useState([{ ...emptyExperience }])
  const [skills, setSkills] = useState({ languages: '', frameworks: '', databases: '', tools: '' })
  const [projects, setProjects] = useState([{ ...emptyProject }])
  const [certifications, setCertifications] = useState([{ ...emptyCertification }])
  const [educations, setEducations] = useState([{ ...emptyEducation }])
  const [research, setResearch] = useState({ title: '', stack: '' })

  const updateArrayItem = (setter) => (index, key, value) => {
    setter(prev => prev.map((item, i) => i === index ? { ...item, [key]: value } : item))
  }
  const addArrayItem = (setter, empty) => () => setter(prev => [...prev, { ...empty }])
  const removeArrayItem = (setter) => (index) => {
    setter(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!personal.fullName.trim()) return toast.error('Full name is required')
    setLoading(true)
    try {
      const payload = {
        ...personal,
        experiences,
        skills,
        projects,
        certifications,
        educations,
        research,
      }
      const { data } = await api.post('/api/ai/resume-builder', payload, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) { setResult(data.content); toast.success(data.message) }
      else toast.error(data.message)
    } catch (error) { toast.error(error.message) }
    setLoading(false)
  }

  // Personal step
  const personalStep = (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-3'>
        <Field label='Full Name *' value={personal.fullName} onChange={v => setPersonal({ ...personal, fullName: v })} placeholder='John Doe' />
        <Field label='Target Role' value={personal.targetRole} onChange={v => setPersonal({ ...personal, targetRole: v })} placeholder='Frontend Developer' />
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <Field label='Phone' value={personal.phone} onChange={v => setPersonal({ ...personal, phone: v })} placeholder='+8801611510841' />
        <Field label='Email' value={personal.email} onChange={v => setPersonal({ ...personal, email: v })} placeholder='john@example.com' type='email' />
      </div>
      <Field label='Location' value={personal.location} onChange={v => setPersonal({ ...personal, location: v })} placeholder='Khilgaon, Dhaka, Bangladesh' />
      <Field label='LinkedIn URL' value={personal.linkedinUrl} onChange={v => setPersonal({ ...personal, linkedinUrl: v })} placeholder='https://linkedin.com/in/username' />
      <Field label='Portfolio URL' value={personal.portfolioUrl} onChange={v => setPersonal({ ...personal, portfolioUrl: v })} placeholder='https://yourportfolio.com' />
      <Field label='GitHub URL' value={personal.githubUrl} onChange={v => setPersonal({ ...personal, githubUrl: v })} placeholder='https://github.com/username' />
    </div>
  )

  // Experience step
  const experienceStep = (
    <ArraySection title='Work Experience' items={experiences} onAdd={addArrayItem(setExperiences, emptyExperience)} onRemove={removeArrayItem(setExperiences)} renderItem={(exp, idx) => (
      <>
        <div className='grid grid-cols-2 gap-3'>
          <Field label='Company *' value={exp.company} onChange={v => updateArrayItem(setExperiences)(idx, 'company', v)} placeholder='Arena Web Security' />
          <Field label='Company URL' value={exp.companyUrl} onChange={v => updateArrayItem(setExperiences)(idx, 'companyUrl', v)} placeholder='https://company.com' />
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <Field label='Role *' value={exp.role} onChange={v => updateArrayItem(setExperiences)(idx, 'role', v)} placeholder='Software Engineer' />
          <Field label='Dates' value={exp.dates} onChange={v => updateArrayItem(setExperiences)(idx, 'dates', v)} placeholder='Jan 2026 – Current' />
        </div>
        <Field label='Location' value={exp.location} onChange={v => updateArrayItem(setExperiences)(idx, 'location', v)} placeholder='Dhaka, Bangladesh' />
        <TextareaField label='Bullets (one per line)' value={exp.bullets} onChange={v => updateArrayItem(setExperiences)(idx, 'bullets', v)} rows={4}
          placeholder={'Developed full-stack apps using React and Node.js\nOptimized database performance and scalability\nCollaborated with team to translate requirements'} />
      </>
    )} />
  )

  // Skills step
  const skillsStep = (
    <div className='space-y-4'>
      <Field label='Programming Languages' value={skills.languages} onChange={v => setSkills({ ...skills, languages: v })} placeholder='JavaScript, Python, Java, SQL' />
      <Field label='Frameworks' value={skills.frameworks} onChange={v => setSkills({ ...skills, frameworks: v })} placeholder='React, Next.js, Node.js, Django' />
      <Field label='Databases' value={skills.databases} onChange={v => setSkills({ ...skills, databases: v })} placeholder='MySQL, PostgreSQL, MongoDB' />
      <Field label='Tools & Others' value={skills.tools} onChange={v => setSkills({ ...skills, tools: v })} placeholder='Git, GitHub, Docker' />
    </div>
  )

  // Projects step
  const projectsStep = (
    <ArraySection title='Personal Projects' items={projects} onAdd={addArrayItem(setProjects, emptyProject)} onRemove={removeArrayItem(setProjects)} renderItem={(p, idx) => (
      <>
        <div className='grid grid-cols-2 gap-3'>
          <Field label='Project Name *' value={p.name} onChange={v => updateArrayItem(setProjects)(idx, 'name', v)} placeholder='E-commerce App' />
          <Field label='Tech Stack' value={p.stack} onChange={v => updateArrayItem(setProjects)(idx, 'stack', v)} placeholder='React, Node, MongoDB, Stripe' />
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <Field label='GitHub URL' value={p.githubUrl} onChange={v => updateArrayItem(setProjects)(idx, 'githubUrl', v)} placeholder='https://github.com/...' />
          <Field label='Live URL' value={p.liveUrl} onChange={v => updateArrayItem(setProjects)(idx, 'liveUrl', v)} placeholder='https://demo.example.com' />
        </div>
        <TextareaField label='Bullets (one per line)' value={p.bullets} onChange={v => updateArrayItem(setProjects)(idx, 'bullets', v)} rows={3}
          placeholder={'Built cart and checkout with Stripe and JWT auth\nDeveloped admin dashboard with Redis caching'} />
      </>
    )} />
  )

  // Certifications step
  const certificationsStep = (
    <ArraySection title='Training Certifications' items={certifications} onAdd={addArrayItem(setCertifications, emptyCertification)} onRemove={removeArrayItem(setCertifications)} renderItem={(c, idx) => (
      <>
        <div className='grid grid-cols-2 gap-3'>
          <Field label='Institution' value={c.institution} onChange={v => updateArrayItem(setCertifications)(idx, 'institution', v)} placeholder='FreeCodeCamp' />
          <Field label='Course Name' value={c.course} onChange={v => updateArrayItem(setCertifications)(idx, 'course', v)} placeholder='JavaScript Algorithms and Data Structures' />
        </div>
        <Field label='Certificate URL' value={c.certificateUrl} onChange={v => updateArrayItem(setCertifications)(idx, 'certificateUrl', v)} placeholder='https://certificate.example.com/...' />
      </>
    )} />
  )

  // Education step
  const educationStep = (
    <ArraySection title='Education' items={educations} onAdd={addArrayItem(setEducations, emptyEducation)} onRemove={removeArrayItem(setEducations)} renderItem={(e, idx) => (
      <>
        <div className='grid grid-cols-2 gap-3'>
          <Field label='Institution' value={e.institution} onChange={v => updateArrayItem(setEducations)(idx, 'institution', v)} placeholder='University of Asia Pacific' />
          <Field label='Dates' value={e.dates} onChange={v => updateArrayItem(setEducations)(idx, 'dates', v)} placeholder='March 2019 – Dec 2024' />
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <Field label='Degree' value={e.degree} onChange={v => updateArrayItem(setEducations)(idx, 'degree', v)} placeholder='B.Sc. in Computer Science & Engineering' />
          <Field label='Grade (CGPA/GPA)' value={e.grade} onChange={v => updateArrayItem(setEducations)(idx, 'grade', v)} placeholder='CGPA 3.5' />
        </div>
      </>
    )} />
  )

  // Research step
  const researchStep = (
    <div className='space-y-4'>
      <Field label='Research Title (optional)' value={research.title} onChange={v => setResearch({ ...research, title: v })}
        placeholder='Multiclass Skin Cancer Classification Using Transfer Learning Models with Explainable AI' />
      <Field label='Tech / Methods (optional)' value={research.stack} onChange={v => setResearch({ ...research, stack: v })}
        placeholder='Python, Deep Learning, TensorFlow, Keras, CNN' />
      <p className='text-xs text-gray-500 dark:text-gray-400'>Leave blank if you don't have research to include — the section will be omitted.</p>
    </div>
  )

  const stepContent = [personalStep, experienceStep, skillsStep, projectsStep, certificationsStep, educationStep, researchStep]

  return (
    <div className='h-full overflow-y-scroll p-6 text-slate-700 dark:text-gray-300'>
      <h1 className='text-2xl font-bold text-slate-800 dark:text-white mb-1'>AI Resume Builder</h1>
      <p className='text-slate-500 dark:text-gray-400 text-sm mb-6'>Generate a clean LaTeX resume in the Trey-Hunner <code>resume.cls</code> format used by top freshers.</p>

      <div className='mb-8 flex flex-wrap gap-2 max-w-3xl'>
        {STEPS.map((s, i) => (
          <button key={i} type='button' onClick={() => setStep(i)}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition ${i === step ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {i + 1}. {s}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className='max-w-3xl'>
        {stepContent[step]}

        <div className='mt-6 flex gap-3'>
          {step > 0 && (
            <button type='button' onClick={() => setStep(step - 1)}
              className='rounded-lg border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'>Back</button>
          )}
          {step < STEPS.length - 1 ? (
            <button type='button' onClick={() => setStep(step + 1)}
              className='rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700'>Next</button>
          ) : (
            <button type='submit' disabled={loading}
              className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:opacity-90 disabled:opacity-50'>
              {loading ? <><Loader2 className='h-4 w-4 animate-spin' /> Building LaTeX...</> : 'Generate LaTeX Resume'}
            </button>
          )}
        </div>
      </form>

      {result && (
        <div className='mt-8 max-w-4xl'>
          <GeneratedOutput content={result} title='Your LaTeX Resume' filename={`${(personal.fullName || 'fresherlab').replace(/\s+/g, '_')}_resume`} language='latex' />
          <p className='mt-3 text-xs text-gray-500 dark:text-gray-400'>
            Compile with XeLaTeX in <a className='text-blue-500 underline' href='https://www.overleaf.com/' target='_blank' rel='noreferrer'>Overleaf</a>. Requires the <code>resume.cls</code> class file (Trey Hunner template).
          </p>
        </div>
      )}
    </div>
  )
}

// --- small reusable building blocks ---

const Field = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={inputClass} />
  </div>
)

const TextareaField = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={`${inputClass} resize-y`} />
  </div>
)

const ArraySection = ({ title, items, onAdd, onRemove, renderItem }) => (
  <div className='space-y-4'>
    {items.map((item, idx) => (
      <div key={idx} className='rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-4 space-y-3 relative'>
        <div className='flex items-center justify-between'>
          <span className='text-xs font-semibold text-slate-500 dark:text-gray-400'>{title} #{idx + 1}</span>
          {items.length > 1 && (
            <button type='button' onClick={() => onRemove(idx)} className='text-gray-400 hover:text-red-500'>
              <Trash2 className='h-4 w-4' />
            </button>
          )}
        </div>
        {renderItem(item, idx)}
      </div>
    ))}
    <button type='button' onClick={onAdd}
      className='inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'>
      <Plus className='h-4 w-4' /> Add another
    </button>
  </div>
)

export default ResumeBuilder
