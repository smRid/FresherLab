import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import GeneratedOutput from '../components/GeneratedOutput'
import { ArrowLeft, CheckCircle2, Download, Eye, FileText, GripVertical, Loader2, Plus, Trash2, X } from 'lucide-react'

const SECTION_DEFINITIONS = [
  { key: 'personal', label: 'Personal' },
  { key: 'summary', label: 'Professional Summary' },
  { key: 'experience', label: 'Experience' },
  { key: 'skills', label: 'Skills' },
  { key: 'projects', label: 'Projects' },
  { key: 'certifications', label: 'Training & Certification' },
  { key: 'education', label: 'Education' },
  { key: 'research', label: 'Research' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'softSkills', label: 'Soft Skills' },
  { key: 'languages', label: 'Languages' },
]

const DEFAULT_SECTION_ORDER = SECTION_DEFINITIONS.map(section => section.key)
const SECTION_LABELS = SECTION_DEFINITIONS.reduce((labels, section) => ({ ...labels, [section.key]: section.label }), {})
const DEFAULT_RESUME_SECTION_TITLES = {
  summary: 'Professional Summary',
  experience: 'Work Experience',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Training & Certification',
  education: 'Education',
  research: 'Research Experience',
  achievements: 'Achievements',
  softSkills: 'Soft Skills',
  languages: 'Languages',
}
const BUILD_STEP_KEY = 'build'
const FIXED_STEP_KEYS = new Set(['personal', BUILD_STEP_KEY])
const STEP_LABELS = { ...SECTION_LABELS, [BUILD_STEP_KEY]: 'Build' }
const STEP_NAV_LABELS = {
  ...STEP_LABELS,
  summary: 'Summary',
  certifications: 'Training & Cert.',
  achievements: 'Achievements',
}

const RESUME_TEMPLATES = [
  {
    id: 'classic',
    name: 'Resume Sample 1',
  },
  {
    id: 'sample2',
    name: 'Resume Sample 2',
  },
  {
    id: 'sample3',
    name: 'Resume Sample 3',
  },
  {
    id: 'sample4',
    name: 'Resume Sample 4',
  },
]

const DUMMY_RESUME_PREVIEW_DATA = {
  personal: {
    fullName: 'Alex Rahman',
    email: 'alex.rahman@example.com',
    phone: '+880 1712 345 678',
    location: 'Dhaka, Bangladesh',
    linkedinUrl: 'https://linkedin.com/in/alex-rahman',
    portfolioUrl: 'https://alexrahman.dev',
    githubUrl: 'https://github.com/alexrahman',
    targetRole: 'Junior Frontend Developer',
    nationality: 'Bangladeshi',
    dob: '15-03-2001',
    nid: '1234567890',
    maritalStatus: 'Single',
    presentAddress: 'Mirpur, Dhaka - 1216',
  },
  summary: 'Junior frontend developer with hands-on experience building responsive React applications, API-driven dashboards, and reusable UI components. Skilled in JavaScript, Tailwind CSS, REST API integration, and Git workflows, with strong attention to accessibility, performance, clean code, and collaborative product delivery.',
  experiences: [
    {
      company: 'BrightApps Studio',
      role: 'Frontend Developer Intern',
      dates: 'June 2025 - December 2025',
      location: 'Remote',
      bullets: 'Built reusable React components for customer dashboards using Tailwind CSS.\nIntegrated REST APIs and improved form validation across key user flows.',
    },
  ],
  skills: {
    languages: 'HTML, CSS, JavaScript, TypeScript, Python',
    frameworks: 'React, Next.js, Tailwind CSS, Express.js',
    databases: 'MongoDB, PostgreSQL, Firebase',
    tools: 'Git, GitHub, Vercel, Postman',
  },
  projects: [
    {
      name: 'Job Tracker Platform',
      stack: 'React, Express.js, MongoDB, JWT',
      liveUrl: 'https://job-tracker-demo.example.com',
      githubUrl: 'https://github.com/alexrahman/job-tracker',
      bullets: 'Created application status boards with saved jobs, interviews, and follow-up reminders.\nImplemented authentication and protected API routes for user-specific data.',
    },
    {
      name: 'Portfolio CMS',
      stack: 'Next.js, PostgreSQL, Tailwind CSS',
      liveUrl: 'https://portfolio-cms.example.com',
      githubUrl: 'https://github.com/alexrahman/portfolio-cms',
      bullets: 'Built a project publishing workflow with markdown content and live previews.\nOptimized page performance with reusable server-rendered components.',
    },
  ],
  certifications: [
    { institution: 'Creative Tech Academy', course: 'Frontend Development with React', certificateUrl: 'https://example.com/certificate/react' },
    { institution: 'FreeCodeCamp', course: 'JavaScript Algorithms and Data Structures', certificateUrl: 'https://example.com/certificate/js' },
  ],
  educations: [
    { institution: 'Metropolitan University', degree: 'Bachelor of Computer Science and Engineering', dates: '2021 - 2025', grade: 'CGPA 3.72 / 4.00' },
  ],
  research: { title: '', stack: '' },
  achievements: 'Selected as team lead for final-year software project\nSolved 150+ programming problems across online judges\nBuilt and deployed 6 portfolio-ready web projects',
  softSkills: 'Communication\nTeam collaboration\nProblem solving\nTime management',
  languages: 'English - Professional working proficiency\nBangla - Native',
  sectionOrder: ['summary', 'experience', 'skills', 'projects', 'education', 'certifications', 'achievements', 'softSkills', 'languages'],
}

const getTemplatePreviewData = (templateId) => {
  const base = {
    ...DUMMY_RESUME_PREVIEW_DATA,
    softSkills: '',
    projects: DUMMY_RESUME_PREVIEW_DATA.projects.map(project => ({ ...project })),
    certifications: DUMMY_RESUME_PREVIEW_DATA.certifications.map(certification => ({ ...certification })),
    educations: DUMMY_RESUME_PREVIEW_DATA.educations.map(education => ({ ...education })),
  }

  return base
}

const emptyExperience = { company: '', companyUrl: '', role: '', dates: '', location: '', bullets: '' }
const emptyProject = { name: '', stack: '', githubUrl: '', liveUrl: '', bullets: '' }
const emptyCertification = { institution: '', course: '', certificateUrl: '' }
const emptyEducation = { institution: '', degree: '', dates: '', grade: '' }

const inputClass = 'w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none'
const labelClass = 'block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1'

const ResumeBuilder = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [activeSection, setActiveSection] = useState(DEFAULT_SECTION_ORDER[0])
  const [sectionOrder, setSectionOrder] = useState(DEFAULT_SECTION_ORDER)
  const [sectionTitles, setSectionTitles] = useState(DEFAULT_RESUME_SECTION_TITLES)
  const [draggingSection, setDraggingSection] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [templatePreviewId, setTemplatePreviewId] = useState('')
  const { getToken } = useAuth()

  const [personal, setPersonal] = useState({
    fullName: '', email: '', phone: '', location: '',
    linkedinUrl: '', portfolioUrl: '', githubUrl: '', targetRole: '',
    nationality: '', dob: '', nid: '', maritalStatus: '', presentAddress: '',
  })
  const [summary, setSummary] = useState('')
  const [experiences, setExperiences] = useState([{ ...emptyExperience }])
  const [skills, setSkills] = useState({ languages: '', frameworks: '', databases: '', tools: '' })
  const [projects, setProjects] = useState([{ ...emptyProject }])
  const [certifications, setCertifications] = useState([{ ...emptyCertification }])
  const [educations, setEducations] = useState([{ ...emptyEducation }])
  const [research, setResearch] = useState({ title: '', stack: '' })
  const [achievements, setAchievements] = useState('')
  const [softSkills, setSoftSkills] = useState('')
  const [languages, setLanguages] = useState('')

  const updateArrayItem = (setter) => (index, key, value) => {
    setter(prev => prev.map((item, i) => i === index ? { ...item, [key]: value } : item))
  }
  const addArrayItem = (setter, empty) => () => setter(prev => [...prev, { ...empty }])
  const removeArrayItem = (setter) => (index) => {
    setter(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== index))
  }
  const moveSection = (sourceKey, targetKey) => {
    if (!sourceKey || !targetKey || sourceKey === targetKey) return
    if (FIXED_STEP_KEYS.has(sourceKey) || FIXED_STEP_KEYS.has(targetKey)) return

    setSectionOrder(prev => {
      const fromIndex = prev.indexOf(sourceKey)
      const toIndex = prev.indexOf(targetKey)
      if (fromIndex === -1 || toIndex === -1) return prev

      const next = [...prev]
      const [movedSection] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, movedSection)
      return next
    })
    setActiveSection(sourceKey)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!personal.fullName.trim()) return toast.error('Full name is required')
    setLoading(true)
    try {
      const payload = {
        ...personal,
        summary,
        experiences,
        skills,
        projects,
        certifications,
        educations,
        research,
        achievements,
        softSkills,
        languages,
        sectionOrder,
        sectionTitles,
        template: selectedTemplate,
      }
      const { data } = await api.post('/api/ai/resume-builder', payload, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) { setResult(data.content); toast.success(data.message) }
      else toast.error(data.message)
    } catch (error) { toast.error(error.message) }
    setLoading(false)
  }

  const handleDownloadPdf = () => {
    if (!personal.fullName.trim()) return toast.error('Full name is required')

    const pdfWindow = window.open('', '_blank')
    if (!pdfWindow) return toast.error('Please allow popups to download PDF')

    const html = buildResumeHtml({ personal, summary, experiences, skills, projects, certifications, educations, research, achievements, softSkills, languages, sectionOrder, sectionTitles, template: selectedTemplate })
    pdfWindow.document.open()
    pdfWindow.document.write(html)
    pdfWindow.document.close()
    pdfWindow.focus()

    setTimeout(() => {
      pdfWindow.print()
    }, 500)
  }

  const templateSelection = (
    <div className='h-full overflow-y-auto p-6 text-slate-700 dark:text-gray-300'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-5'>
          <h1 className='mb-1 text-2xl font-bold text-slate-800 dark:text-white'>Choose a resume template</h1>
          <p className='text-sm text-slate-500 dark:text-gray-400'>Select one template to continue building your resume.</p>
        </div>

        <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-4'>
          {RESUME_TEMPLATES.map(template => (
            <div key={template.id} className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-400 hover:shadow-lg dark:border-gray-800 dark:bg-[#111827]'>
              <div className='bg-slate-100 p-3 dark:bg-[#0B1120]'>
                <div className='group relative mx-auto aspect-[210/297] h-[21rem] max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-gray-700'>
                  <iframe
                    title={`${template.name} preview`}
                    srcDoc={buildResumeHtml({
                      ...getTemplatePreviewData(template.id),
                      template: template.id,
                      preview: true,
                    })}
                    className='h-full w-full border-0 bg-white'
                  />
                  <div className='absolute inset-0 flex items-center justify-center bg-slate-950/0 opacity-0 transition group-hover:bg-slate-950/45 group-hover:opacity-100'>
                    <button type='button' onClick={() => setTemplatePreviewId(template.id)}
                      className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-600 shadow-lg transition hover:scale-105 hover:bg-blue-50'
                      aria-label={`Preview ${template.name}`}>
                      <Eye className='h-5 w-5' />
                    </button>
                  </div>
                </div>
              </div>
              <div className='border-t border-slate-200 p-4 dark:border-gray-800'>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                  <div>
                    <h2 className='text-lg font-semibold text-slate-900 dark:text-white'>{template.name}</h2>
                  </div>
                  <button type='button' onClick={() => setSelectedTemplate(template.id)}
                    className='shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700'>
                    Use template
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {templatePreviewId && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm' onClick={() => setTemplatePreviewId('')}>
          <div className='flex h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#0B1120] shadow-2xl' onClick={e => e.stopPropagation()}>
            <div className='flex items-center justify-between border-b border-slate-800 px-5 py-4'>
              <div>
                <h2 className='text-lg font-semibold text-white'>{RESUME_TEMPLATES.find(template => template.id === templatePreviewId)?.name}</h2>
                <p className='text-xs text-slate-400'>Full template preview</p>
              </div>
              <button type='button' onClick={() => setTemplatePreviewId('')}
                className='inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                aria-label='Close template preview'>
                <X className='h-4 w-4' />
              </button>
            </div>
            <div className='min-h-0 flex-1 overflow-y-auto bg-slate-200 p-4 dark:bg-[#020617]'>
              <iframe
                title='Full template preview'
                srcDoc={buildResumeHtml({
                  ...getTemplatePreviewData(templatePreviewId),
                  template: templatePreviewId,
                  preview: true,
                  previewFit: 'width',
                })}
                className='mx-auto aspect-[210/297] w-full max-w-[48rem] rounded-xl border-0 bg-white shadow-xl'
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Personal step
  const personalStep = (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-3'>
        <Field label='Full Name *' value={personal.fullName} onChange={v => setPersonal({ ...personal, fullName: v })} placeholder='Alex Carter' />
        <Field label='Target Role' value={personal.targetRole} onChange={v => setPersonal({ ...personal, targetRole: v })} placeholder='Junior Software Engineer' />
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <Field label='Phone' value={personal.phone} onChange={v => setPersonal({ ...personal, phone: v })} placeholder='+1 555 123 4567' />
        <Field label='Email' value={personal.email} onChange={v => setPersonal({ ...personal, email: v })} placeholder='alex.carter@example.com' type='email' />
      </div>
      <Field label='Location' value={personal.location} onChange={v => setPersonal({ ...personal, location: v })} placeholder='Austin, TX, USA' />
      <Field label='LinkedIn URL' value={personal.linkedinUrl} onChange={v => setPersonal({ ...personal, linkedinUrl: v })} placeholder='https://linkedin.com/in/alex-carter' />
      <Field label='Portfolio URL' value={personal.portfolioUrl} onChange={v => setPersonal({ ...personal, portfolioUrl: v })} placeholder='https://alexcarter.dev' />
      <Field label='GitHub URL' value={personal.githubUrl} onChange={v => setPersonal({ ...personal, githubUrl: v })} placeholder='https://github.com/alexcarter' />
      <div className='rounded-xl border border-dashed border-slate-300 p-4 dark:border-gray-700'>
        <h3 className='mb-3 text-sm font-semibold text-slate-800 dark:text-white'>Personal Information for Sample 2</h3>
        <div className='grid grid-cols-2 gap-3'>
          <Field label='Nationality' value={personal.nationality} onChange={v => setPersonal({ ...personal, nationality: v })} placeholder='Bangladeshi' />
          <Field label='Date of Birth' value={personal.dob} onChange={v => setPersonal({ ...personal, dob: v })} placeholder='02-07-2000' />
          <Field label='NID' value={personal.nid} onChange={v => setPersonal({ ...personal, nid: v })} placeholder='6911281381' />
          <Field label='Marital Status' value={personal.maritalStatus} onChange={v => setPersonal({ ...personal, maritalStatus: v })} placeholder='Single' />
        </div>
        <div className='mt-3'>
          <Field label='Present Address' value={personal.presentAddress} onChange={v => setPersonal({ ...personal, presentAddress: v })} placeholder='21, South Khilgaon, Dhaka - 1219' />
        </div>
      </div>
    </div>
  )

  // Professional Summary step
  const summaryStep = (
    <div className='space-y-4'>
      <TextareaField
        label='Professional Summary'
        value={summary}
        onChange={setSummary}
        rows={5}
        placeholder='Junior Software Engineer with hands-on experience building responsive React applications, REST APIs, and database-backed projects. Strong problem-solver with a focus on clean code, collaboration, and continuous learning.'
      />
      <p className='text-xs text-gray-500 dark:text-gray-400'>Add 2-3 concise sentences tailored to your target role. Leave blank to omit this section.</p>
    </div>
  )

  // Experience step
  const experienceStep = (
    <ArraySection title='Work Experience' items={experiences} onAdd={addArrayItem(setExperiences, emptyExperience)} onRemove={removeArrayItem(setExperiences)} renderItem={(exp, idx) => (
      <>
        <div className='grid grid-cols-2 gap-3'>
          <Field label='Company *' value={exp.company} onChange={v => updateArrayItem(setExperiences)(idx, 'company', v)} placeholder='TechNova Solutions' />
          <Field label='Company URL' value={exp.companyUrl} onChange={v => updateArrayItem(setExperiences)(idx, 'companyUrl', v)} placeholder='https://technova.example.com' />
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <Field label='Role *' value={exp.role} onChange={v => updateArrayItem(setExperiences)(idx, 'role', v)} placeholder='Frontend Developer Intern' />
          <Field label='Dates' value={exp.dates} onChange={v => updateArrayItem(setExperiences)(idx, 'dates', v)} placeholder='June 2024 – August 2024' />
        </div>
        <Field label='Location' value={exp.location} onChange={v => updateArrayItem(setExperiences)(idx, 'location', v)} placeholder='Remote' />
        <TextareaField label='Bullets' value={exp.bullets} onChange={v => updateArrayItem(setExperiences)(idx, 'bullets', v)} rows={4}
          placeholder={'Built reusable React components for customer dashboard\nIntegrated REST APIs and handled client-side validation\nImproved page load performance by optimizing assets'} />
      </>
    )} />
  )

  // Skills step
  const skillsStep = (
    <div className='space-y-4'>
      <Field label='Programming Languages' value={skills.languages} onChange={v => setSkills({ ...skills, languages: v })} placeholder='JavaScript, TypeScript, Python, SQL' />
      <Field label='Frameworks' value={skills.frameworks} onChange={v => setSkills({ ...skills, frameworks: v })} placeholder='React, Express.js, Next.js, Tailwind CSS' />
      <Field label='Databases' value={skills.databases} onChange={v => setSkills({ ...skills, databases: v })} placeholder='PostgreSQL, MongoDB, Firebase' />
      <Field label='Tools & Others' value={skills.tools} onChange={v => setSkills({ ...skills, tools: v })} placeholder='Git, Docker, Vercel, Postman' />
    </div>
  )

  // Projects step
  const projectsStep = (
    <ArraySection title='Personal Projects' items={projects} onAdd={addArrayItem(setProjects, emptyProject)} onRemove={removeArrayItem(setProjects)} renderItem={(p, idx) => (
      <>
        <div className='grid grid-cols-2 gap-3'>
          <Field label='Project Name *' value={p.name} onChange={v => updateArrayItem(setProjects)(idx, 'name', v)} placeholder='Task Management Platform' />
          <Field label='Tech Stack' value={p.stack} onChange={v => updateArrayItem(setProjects)(idx, 'stack', v)} placeholder='React, Express.js, PostgreSQL, JWT' />
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <Field label='GitHub URL' value={p.githubUrl} onChange={v => updateArrayItem(setProjects)(idx, 'githubUrl', v)} placeholder='https://github.com/alexcarter/task-manager' />
          <Field label='Live URL' value={p.liveUrl} onChange={v => updateArrayItem(setProjects)(idx, 'liveUrl', v)} placeholder='https://task-manager-demo.vercel.app' />
        </div>
        <TextareaField label='Bullets' value={p.bullets} onChange={v => updateArrayItem(setProjects)(idx, 'bullets', v)} rows={3}
          placeholder={'Created task boards with drag-and-drop workflow\nImplemented JWT authentication and protected API routes\nDesigned responsive UI for desktop and mobile users'} />
      </>
    )} />
  )

  // Certifications step
  const certificationsStep = (
    <ArraySection title='Training & Certification' items={certifications} onAdd={addArrayItem(setCertifications, emptyCertification)} onRemove={removeArrayItem(setCertifications)} renderItem={(c, idx) => (
      <>
        <div className='grid grid-cols-2 gap-3'>
          <Field label='Institution' value={c.institution} onChange={v => updateArrayItem(setCertifications)(idx, 'institution', v)} placeholder='Coursera' />
          <Field label='Course Name' value={c.course} onChange={v => updateArrayItem(setCertifications)(idx, 'course', v)} placeholder='Full-Stack Web Development Specialization' />
        </div>
        <Field label='Certificate URL' value={c.certificateUrl} onChange={v => updateArrayItem(setCertifications)(idx, 'certificateUrl', v)} placeholder='https://coursera.org/verify/example-id' />
      </>
    )} />
  )

  // Education step
  const educationStep = (
    <ArraySection title='Education' items={educations} onAdd={addArrayItem(setEducations, emptyEducation)} onRemove={removeArrayItem(setEducations)} renderItem={(e, idx) => (
      <>
        <div className='grid grid-cols-2 gap-3'>
          <Field label='Institution' value={e.institution} onChange={v => updateArrayItem(setEducations)(idx, 'institution', v)} placeholder='State University' />
          <Field label='Dates' value={e.dates} onChange={v => updateArrayItem(setEducations)(idx, 'dates', v)} placeholder='August 2020 – May 2024' />
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <Field label='Degree' value={e.degree} onChange={v => updateArrayItem(setEducations)(idx, 'degree', v)} placeholder='Bachelor of Science in Computer Science' />
          <Field label='Grade (CGPA/GPA)' value={e.grade} onChange={v => updateArrayItem(setEducations)(idx, 'grade', v)} placeholder='GPA 3.7 / 4.0' />
        </div>
      </>
    )} />
  )

  // Research step
  const researchStep = (
    <div className='space-y-4'>
      <Field label='Research Title (optional)' value={research.title} onChange={v => setResearch({ ...research, title: v })}
        placeholder='Optimizing Neural Networks for Real-Time Image Classification' />
      <Field label='Tech / Methods (optional)' value={research.stack} onChange={v => setResearch({ ...research, stack: v })}
        placeholder='Python, TensorFlow, Computer Vision, CNN' />
      <p className='text-xs text-gray-500 dark:text-gray-400'>Leave blank if you don't have research to include — the section will be omitted.</p>
    </div>
  )

  // Achievements step
  const achievementsStep = (
    <BulletTextareaStep
      label='Achievements'
      value={achievements}
      onChange={setAchievements}
      placeholder={'Won 1st place in university hackathon\nCompleted 100+ DSA problems on LeetCode\nSelected as team lead for final-year project'}
    />
  )

  // Soft Skills step
  const softSkillsStep = (
    <BulletTextareaStep
      label='Soft Skills'
      value={softSkills}
      onChange={setSoftSkills}
      placeholder={'Communication\nTeam collaboration\nProblem solving\nTime management'}
    />
  )

  // Languages step
  const languagesStep = (
    <BulletTextareaStep
      label='Languages'
      value={languages}
      onChange={setLanguages}
      placeholder={'English - Professional working proficiency\nBangla - Native\nHindi - Conversational'}
    />
  )

  const buildChecks = [
    { key: 'personal', label: 'Personal', done: Boolean(personal.fullName.trim()) },
    { key: 'summary', label: 'Professional Summary', done: Boolean(summary.trim()) },
    { key: 'experience', label: 'Experience', done: experiences.some(item => hasAnyValue(item, ['company', 'role', 'bullets'])) },
    { key: 'skills', label: 'Skills', done: Object.values(skills).some(value => String(value || '').trim()) },
    { key: 'projects', label: 'Projects', done: projects.some(item => hasAnyValue(item, ['name', 'stack', 'bullets'])) },
    { key: 'certifications', label: 'Training & Certification', done: certifications.some(item => hasAnyValue(item, ['institution', 'course'])) },
    { key: 'education', label: 'Education', done: educations.some(item => hasAnyValue(item, ['institution', 'degree'])) },
    { key: 'research', label: 'Research', done: hasAnyValue(research, ['title', 'stack']) },
    { key: 'achievements', label: 'Achievements', done: Boolean(achievements.trim()) },
    { key: 'softSkills', label: 'Soft Skills', done: Boolean(softSkills.trim()) },
    { key: 'languages', label: 'Languages', done: Boolean(languages.trim()) },
  ]
  const resumePreviewHtml = buildResumeHtml({ personal, summary, experiences, skills, projects, certifications, educations, research, achievements, softSkills, languages, sectionOrder, sectionTitles, template: selectedTemplate, preview: true })

  const buildStep = (
    <div className='space-y-5'>
      <div className='rounded-xl border border-slate-200 bg-white p-5 dark:border-gray-800 dark:bg-[#111827]'>
        <div className='flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between'>
          <div className='flex items-start gap-3'>
            <span className='mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300'>
              <FileText className='h-5 w-5' />
            </span>
            <div>
              <p className='text-xs font-semibold uppercase text-blue-600 dark:text-blue-300'>Final Step</p>
              <h2 className='mt-1 text-xl font-semibold text-slate-900 dark:text-white'>Build your resume</h2>
            </div>
          </div>
        </div>

        <div className='mt-5 grid gap-2 sm:grid-cols-2 2xl:grid-cols-3'>
          {buildChecks.map(section => (
            <button key={section.key} type='button' onClick={() => setActiveSection(section.key)}
              className='flex min-h-10 items-center gap-2 rounded-lg bg-slate-50 px-3 text-left text-sm text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#0B1120] dark:text-gray-300 dark:hover:bg-slate-900'>
              <CheckCircle2 className={`h-4 w-4 shrink-0 ${section.done ? 'text-emerald-500' : 'text-slate-400 dark:text-gray-600'}`} />
              <span className='min-w-0 truncate'>{section.label}</span>
            </button>
          ))}
        </div>

        <div className='mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-[#0B1120]'>
          <h3 className='mb-3 text-sm font-semibold text-slate-800 dark:text-white'>Edit section headers</h3>
          <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
            {DEFAULT_SECTION_ORDER.filter(sectionKey => sectionKey !== 'personal').map(sectionKey => (
              <Field
                key={sectionKey}
                label={STEP_NAV_LABELS[sectionKey]}
                value={sectionTitles[sectionKey] || ''}
                onChange={value => setSectionTitles(prev => ({ ...prev, [sectionKey]: value }))}
                placeholder={DEFAULT_RESUME_SECTION_TITLES[sectionKey] || SECTION_LABELS[sectionKey]}
              />
            ))}
          </div>
        </div>

        <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap'>
          <button type='button' onClick={() => setActiveSection(sectionOrder[sectionOrder.length - 1])}
            className='rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'>Back</button>
          <button type='button' onClick={handleDownloadPdf}
            className='inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:opacity-90'>
            <Download className='h-4 w-4' /> Download PDF
          </button>
        </div>
      </div>

      {result && (
        <div>
          <GeneratedOutput content={result} title='Your LaTeX Resume' filename={`${(personal.fullName || 'fresherlab').replace(/\s+/g, '_')}_resume`} language='latex' />
          <p className='mt-3 text-xs text-gray-500 dark:text-gray-400'>
            Compile with XeLaTeX in <a className='text-blue-500 underline' href='https://www.overleaf.com/' target='_blank' rel='noreferrer'>Overleaf</a>. Requires the <code>resume.cls</code> class file (Trey Hunner template).
          </p>
        </div>
      )}
    </div>
  )

  const stepContent = {
    personal: personalStep,
    summary: summaryStep,
    experience: experienceStep,
    skills: skillsStep,
    projects: projectsStep,
    certifications: certificationsStep,
    education: educationStep,
    research: researchStep,
    achievements: achievementsStep,
    softSkills: softSkillsStep,
    languages: languagesStep,
    [BUILD_STEP_KEY]: buildStep,
  }
  const stepOrder = [...sectionOrder, BUILD_STEP_KEY]
  const activeIndex = stepOrder.indexOf(activeSection)
  const isBuildStep = activeSection === BUILD_STEP_KEY
  const resumePreviewPanel = (
    <aside className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#111827] xl:sticky xl:top-6 xl:self-start'>
      <div className='flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-gray-800'>
        <div>
          <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>Resume Preview</h3>
          <p className='text-xs text-slate-500 dark:text-gray-400'>Updates from your inputs</p>
        </div>
        <button type='button' onClick={() => setPreviewOpen(true)}
          className='inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700'>
          <Eye className='h-3.5 w-3.5' /> View
        </button>
      </div>
      <div className='bg-slate-100 p-2.5 dark:bg-[#0B1120]'>
        <div className='aspect-[210/297] overflow-hidden rounded-lg border border-slate-200 bg-slate-200 dark:border-gray-700 dark:bg-[#020617]'>
          <iframe
            title='Resume preview'
            srcDoc={resumePreviewHtml}
            className='h-full w-full border-0 bg-slate-100'
          />
        </div>
      </div>
    </aside>
  )

  if (!selectedTemplate) return templateSelection

  return (
    <div className='h-full overflow-y-scroll p-6 text-slate-700 dark:text-gray-300'>
      <div className='grid w-full gap-5 xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_330px]'>
        <div className='min-w-0'>
          <h1 className='mb-1 text-2xl font-bold text-slate-800 dark:text-white'>AI Resume Builder</h1>
          <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-sm text-slate-500 dark:text-gray-400'>Generate a clean resume with the selected <span className='font-medium text-slate-700 dark:text-gray-300'>{RESUME_TEMPLATES.find(template => template.id === selectedTemplate)?.name}</span> template.</p>
            <button type='button' onClick={() => setSelectedTemplate('')}
              className='inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'>
              <ArrowLeft className='h-4 w-4' /> Change template
            </button>
          </div>

          <div className='mb-7 grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6'>
            {stepOrder.map((sectionKey, i) => {
              const isActive = sectionKey === activeSection
              const isFixedTab = FIXED_STEP_KEYS.has(sectionKey)
              return (
                <button key={sectionKey} type='button' draggable={!isFixedTab} onClick={() => setActiveSection(sectionKey)}
                  onDragStart={isFixedTab ? undefined : (e) => {
                    e.dataTransfer.effectAllowed = 'move'
                    e.dataTransfer.setData('text/plain', sectionKey)
                    setDraggingSection(sectionKey)
                  }}
                  onDragEnd={isFixedTab ? undefined : () => setDraggingSection('')}
                  onDragOver={isFixedTab ? undefined : (e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                  }}
                  onDrop={isFixedTab ? undefined : (e) => {
                    e.preventDefault()
                    moveSection(e.dataTransfer.getData('text/plain') || draggingSection, sectionKey)
                    setDraggingSection('')
                  }}
                  title={isFixedTab ? (sectionKey === BUILD_STEP_KEY ? 'Build resume' : 'Personal section stays first') : 'Drag to reorder'}
                  className={`flex min-h-11 w-full items-center gap-1.5 rounded-xl border px-2.5 py-2 text-left text-[11px] font-medium leading-snug shadow-sm transition sm:text-xs ${isFixedTab ? '!cursor-pointer' : '!cursor-grab active:!cursor-grabbing'} ${isActive
                    ? 'border-blue-500 bg-blue-600 text-white shadow-blue-600/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-blue-500/60 dark:hover:bg-gray-700'
                    } ${draggingSection === sectionKey ? 'opacity-50 ring-2 ring-blue-400' : ''}`}>
                  {sectionKey === BUILD_STEP_KEY ? <FileText className='h-3.5 w-3.5 shrink-0 opacity-80' /> : <GripVertical className={`h-3.5 w-3.5 shrink-0 opacity-70 ${isFixedTab ? 'opacity-40' : ''}`} />}
                  <span className='min-w-0 truncate'>{i + 1}. {STEP_NAV_LABELS[sectionKey]}</span>
                </button>
              )
            })}
          </div>

          <form onSubmit={handleSubmit} className='w-full'>
            {stepContent[activeSection]}

            {!isBuildStep && <div className='mt-6 flex gap-3'>
              {activeIndex > 0 && (
                <button type='button' onClick={() => setActiveSection(stepOrder[activeIndex - 1])}
                  className='rounded-lg border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'>Back</button>
              )}
              {activeIndex < stepOrder.length - 1 && (
                <button type='button' onClick={() => setActiveSection(stepOrder[activeIndex + 1])}
                  className='rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700'>Next</button>
              )}
            </div>}
          </form>
        </div>

        {resumePreviewPanel}
      </div>

      {previewOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm' onClick={() => setPreviewOpen(false)}>
          <div className='flex h-[92vh] w-full max-w-[40rem] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#0B1120] shadow-2xl' onClick={e => e.stopPropagation()}>
            <div className='flex items-center justify-between border-b border-slate-800 px-5 py-4'>
              <div>
                <h2 className='text-lg font-semibold text-white'>Resume Preview</h2>
              </div>
              <button type='button' onClick={() => setPreviewOpen(false)}
                className='inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                aria-label='Close preview'>
                <X className='h-4 w-4' />
              </button>
            </div>
            <div className='min-h-0 flex-1 overflow-y-auto bg-slate-200 p-4 dark:bg-[#020617]'>
              <iframe
                title='Large resume preview'
                srcDoc={buildResumeHtml({ personal, summary, experiences, skills, projects, certifications, educations, research, achievements, softSkills, languages, sectionOrder, sectionTitles, template: selectedTemplate, preview: true, previewFit: 'width' })}
                className='aspect-[210/297] w-full rounded-xl border-0 bg-slate-100'
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;')

const splitLines = (value) => String(value || '')
  .split(/\r?\n/)
  .map(line => line.replace(/^\s*[-•*]\s*/, '').trim())
  .filter(Boolean)

const hasAnyValue = (item, keys) => keys.some(key => String(item?.[key] || '').trim())

const renderExternalLink = (url, label) => {
  if (!url || !String(url).trim()) return ''
  const safeUrl = escapeHtml(String(url).trim())
  return `<a href="${safeUrl}">${escapeHtml(label)}</a>`
}

const renderSection = (title, content) => content ? `
  <section class="section">
    <div class="section-title">${escapeHtml(title)}</div>
    ${content}
  </section>
` : ''

const sectionTitle = (sectionTitles = {}, key, fallback) => {
  const customTitle = String(sectionTitles?.[key] || '').trim()
  return customTitle || fallback
}

const renderBullets = (bullets) => {
  const items = splitLines(bullets)
  if (!items.length) return ''
  return `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
}

const buildResumeHtml = ({ personal = {}, summary = '', experiences = [], skills = {}, projects = [], certifications = [], educations = [], research = {}, achievements = '', softSkills = '', languages = '', sectionOrder = DEFAULT_SECTION_ORDER, sectionTitles = DEFAULT_RESUME_SECTION_TITLES, template = 'classic', preview = false, previewFit = 'contain' }) => {
  if (template === 'sample2') {
    return buildSample2ResumeHtml({ personal, summary, experiences, skills, projects, certifications, educations, research, achievements, softSkills, languages, sectionOrder, sectionTitles, preview, previewFit })
  }
  if (template === 'sample3') {
    return buildSample3ResumeHtml({ personal, summary, experiences, skills, projects, certifications, educations, research, achievements, softSkills, languages, sectionTitles, preview, previewFit })
  }
  if (template === 'sample4') {
    return buildSample4ResumeHtml({ personal, summary, experiences, skills, projects, certifications, educations, research, achievements, sectionTitles, preview, previewFit })
  }

  const contact = [
    personal.phone && `<a href="tel:${escapeHtml(personal.phone)}">${escapeHtml(personal.phone)}</a>`,
    personal.email && `<a href="mailto:${escapeHtml(personal.email)}">${escapeHtml(personal.email)}</a>`,
  ].filter(Boolean).join(' &nbsp;⋄&nbsp; ')
  const location = escapeHtml(personal.location || '')

  const links = [
    renderExternalLink(personal.linkedinUrl, 'LinkedIn'),
    renderExternalLink(personal.portfolioUrl, 'Portfolio'),
    renderExternalLink(personal.githubUrl, 'GitHub'),
  ].filter(Boolean).join(' &nbsp;⋄&nbsp; ')

  const summaryContent = String(summary || '').trim()
    ? `<p class="summary">${escapeHtml(summary).replace(/\r?\n/g, '<br />')}</p>`
    : ''

  const experienceContent = (experiences || [])
    .filter(item => hasAnyValue(item, ['company', 'role', 'bullets']))
    .map(item => `
      <div class="entry">
        <div class="row">
          <strong>${item.companyUrl ? renderExternalLink(item.companyUrl, item.company) : escapeHtml(item.company)}</strong>
          <span>${escapeHtml(item.dates)}</span>
        </div>
        <div class="row muted">
          <span>${escapeHtml(item.role)}</span>
          <span>${escapeHtml(item.location)}</span>
        </div>
        ${renderBullets(item.bullets)}
      </div>
    `).join('')

  const skillItems = [
    skills.languages && ['Programming Languages', skills.languages],
    skills.frameworks && ['Framework', skills.frameworks],
    skills.databases && ['Database', skills.databases],
    skills.tools && ['Tools & Others', skills.tools],
  ].filter(Boolean)
  const skillsContent = skillItems.length ? `<ul class="compact-list">${skillItems.map(([label, value]) => `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</li>`).join('')}</ul>` : ''

  const projectContent = (projects || [])
    .filter(item => hasAnyValue(item, ['name', 'stack', 'bullets']))
    .map(item => {
      const projectLinks = [
        renderExternalLink(item.githubUrl, 'Github'),
        renderExternalLink(item.liveUrl, 'Live link'),
      ].filter(Boolean).join(' | ')
      return `
        <div class="entry">
          <div class="row">
            <div><strong>${escapeHtml(item.name)}</strong>${item.stack ? ` <span>|</span> <em>${escapeHtml(item.stack)}</em>` : ''}</div>
            <span>${projectLinks}</span>
          </div>
          ${renderBullets(item.bullets)}
        </div>
      `
    }).join('')

  const certificationContent = (certifications || [])
    .filter(item => hasAnyValue(item, ['institution', 'course']))
    .map(item => `
      <p class="line-item"><strong>${escapeHtml(item.institution)}</strong>${item.certificateUrl ? ` ${renderExternalLink(item.certificateUrl, '(Certificate)')}` : ''} - ${escapeHtml(item.course)}</p>
    `).join('')

  const educationContent = (educations || [])
    .filter(item => hasAnyValue(item, ['institution', 'degree']))
    .map(item => `
      <div class="entry">
        <div class="row">
          <strong>${escapeHtml(item.institution)}</strong>
          <span>${escapeHtml(item.dates)}</span>
        </div>
        <div class="row muted">
          <span>${escapeHtml(item.degree)}</span>
          <span>${escapeHtml(item.grade)}</span>
        </div>
      </div>
    `).join('')

  const researchContent = hasAnyValue(research, ['title', 'stack'])
    ? `<p class="line-item"><strong>${escapeHtml(research.title)}</strong>${research.stack ? ` <span>|</span> <em>${escapeHtml(research.stack)}</em>` : ''}</p>`
    : ''
  const achievementsContent = renderBullets(achievements)
  const softSkillsContent = renderBullets(softSkills)
  const languagesContent = renderBullets(languages)
  const resumeSections = {
    summary: renderSection(sectionTitle(sectionTitles, 'summary', 'Professional Summary'), summaryContent),
    experience: renderSection(sectionTitle(sectionTitles, 'experience', 'Work Experience'), experienceContent),
    skills: renderSection(sectionTitle(sectionTitles, 'skills', 'Technical Skills'), skillsContent),
    projects: renderSection(sectionTitle(sectionTitles, 'projects', 'Personal Projects'), projectContent),
    certifications: renderSection(sectionTitle(sectionTitles, 'certifications', 'Training & Certification'), certificationContent),
    education: renderSection(sectionTitle(sectionTitles, 'education', 'Education'), educationContent),
    research: renderSection(sectionTitle(sectionTitles, 'research', 'Research Experience'), researchContent),
    achievements: renderSection(sectionTitle(sectionTitles, 'achievements', 'Achievements'), achievementsContent),
    softSkills: renderSection(sectionTitle(sectionTitles, 'softSkills', 'Soft Skills'), softSkillsContent),
    languages: renderSection(sectionTitle(sectionTitles, 'languages', 'Languages'), languagesContent),
  }
  const requestedOrder = Array.isArray(sectionOrder) && sectionOrder.length ? sectionOrder : DEFAULT_SECTION_ORDER
  const orderedSections = [...requestedOrder, ...DEFAULT_SECTION_ORDER.filter(key => !requestedOrder.includes(key))]
    .map(key => resumeSections[key])
    .filter(Boolean)
    .join('')
  const isWidthFitPreview = previewFit === 'width'
  const previewStyles = preview ? `
    html, body.preview-body { height: 100%; }
    body.preview-body { align-items: ${isWidthFitPreview ? 'flex-start' : 'center'}; background: #e2e8f0; display: flex; justify-content: center; overflow: hidden; padding: 10px; }
    body.preview-body .pdf-viewport { height: 100%; position: relative; width: 100%; }
    body.preview-body .pdf-shell { height: 11.69in; left: 50%; position: absolute; top: ${isWidthFitPreview ? '0' : '50%'}; transform-origin: ${isWidthFitPreview ? 'top center' : 'center center'}; width: 8.27in; }
    body.preview-body .resume { background: #ffffff; box-shadow: 0 14px 30px rgba(15, 23, 42, 0.24); height: 11.69in; margin: 0; max-width: none; overflow: hidden; padding: 0.55in 0.7in; width: 8.27in; }
  ` : ''
  const previewScript = preview ? `
  <script>
    const fitResumePage = () => {
      const viewport = document.querySelector('.pdf-viewport');
      const shell = document.querySelector('.pdf-shell');
      if (!viewport || !shell) return;

      const pageWidth = 8.27 * 96;
      const pageHeight = 11.69 * 96;
      const availableWidth = Math.max(220, document.documentElement.clientWidth - 20);
      const availableHeight = Math.max(300, document.documentElement.clientHeight - 20);
      const scale = ${isWidthFitPreview ? 'Math.min(1, availableWidth / pageWidth)' : 'Math.min(availableWidth / pageWidth, availableHeight / pageHeight)'};

      shell.style.transform = '${isWidthFitPreview ? 'translateX(-50%)' : 'translate(-50%, -50%)'} scale(' + scale + ')';
      viewport.style.height = Math.ceil(pageHeight * scale) + 'px';
    };

    window.addEventListener('load', fitResumePage);
    window.addEventListener('resize', fitResumePage);
    requestAnimationFrame(fitResumePage);
  </script>
  ` : ''

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(personal.fullName || 'Resume')}</title>
  <style>
    @page { size: A4; margin: 0.55in 0.7in; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #ffffff; color: #111827; font-family: "Trebuchet MS", Arial, sans-serif; font-size: 11.3pt; line-height: 1.28; }
    .resume { max-width: 8.27in; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 12px; }
    h1 { margin: 0; font-size: 21pt; line-height: 1.1; }
    .target-role { margin-top: 2px; font-size: 12pt; color: #374151; font-weight: 700; }
    .contact, .links, .location { margin-top: 2px; font-size: 10.7pt; }
    a { color: #003f91; text-decoration: none; }
    .contact a { color: #111827; }
    .section { margin-top: 9px; }
    .section-title { border-bottom: 1px solid #111827; color: #111827; font-size: 12pt; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 5px; padding-bottom: 2px; text-transform: uppercase; }
    .summary { margin: 4px 0; text-align: justify; text-align-last: left; }
    .entry { margin-bottom: 6px; }
    .row { display: flex; justify-content: space-between; gap: 16px; width: 100%; }
    .row > span:last-child { text-align: right; white-space: nowrap; }
    .muted { color: #374151; }
    ul { margin: 3px 0 6px 18px; padding: 0; }
    li { margin-bottom: 2px; text-align: justify; text-align-last: left; }
    .compact-list { margin-top: 2px; }
    .line-item { margin: 4px 0; text-align: justify; text-align-last: left; }
    ${previewStyles}
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body${preview ? ' class="preview-body"' : ''}>
  ${preview ? '<div class="pdf-viewport"><div class="pdf-shell">' : ''}
  <main class="resume">
    <header class="header">
      <h1>${escapeHtml(personal.fullName)}</h1>
      ${personal.targetRole ? `<div class="target-role">${escapeHtml(personal.targetRole)}</div>` : ''}
      ${links ? `<div class="links">${links}</div>` : ''}
      ${contact ? `<div class="contact">${contact}</div>` : ''}
      ${location ? `<div class="location">${location}</div>` : ''}
    </header>
    ${orderedSections}
  </main>
  ${preview ? '</div></div>' : ''}
  ${previewScript}
</body>
</html>`
}

const renderSample2Section = (title, content) => content ? `
  <section class="s2-section">
    <h2>${escapeHtml(title)}</h2>
    ${content}
  </section>
` : ''

const buildSample2ResumeHtml = ({ personal = {}, summary = '', experiences = [], skills = {}, projects = [], certifications = [], educations = [], research = {}, achievements = '', softSkills = '', languages = '', sectionOrder = DEFAULT_SECTION_ORDER, sectionTitles = DEFAULT_RESUME_SECTION_TITLES, preview = false, previewFit = 'contain' }) => {
  const contactRows = [
    personal.email && `<div><strong>Gmail :</strong> <a class="email-link" href="mailto:${escapeHtml(personal.email)}">${escapeHtml(personal.email)}</a></div>`,
    personal.phone && `<div><strong>Phone :</strong> ${escapeHtml(personal.phone)}</div>`,
  ].filter(Boolean).join('')

  const profileLinks = [
    renderExternalLink(personal.linkedinUrl, 'LinkedIn'),
    renderExternalLink(personal.githubUrl, 'GitHub'),
    renderExternalLink(personal.portfolioUrl, 'Portfolio'),
  ].filter(Boolean).join(' <span class="link-divider">|</span> ')

  const summaryContent = String(summary || '').trim()
    ? `<p class="s2-paragraph">${escapeHtml(summary).replace(/\r?\n/g, '<br />')}</p>`
    : ''

  const experienceContent = (experiences || [])
    .filter(item => hasAnyValue(item, ['company', 'role', 'bullets']))
    .map(item => `
      <div class="s2-entry">
        <div class="s2-entry-title">
          <strong>${item.companyUrl ? renderExternalLink(item.companyUrl, item.company) : escapeHtml(item.company)}</strong>
          ${item.role ? `<span>- ${escapeHtml(item.role)}</span>` : ''}
        </div>
        ${item.dates || item.location ? `<div class="s2-meta">${[item.dates, item.location].filter(Boolean).map(escapeHtml).join(' | ')}</div>` : ''}
        ${renderBullets(item.bullets)}
      </div>
    `).join('')

  const skillItems = [
    skills.languages && ['Programming Languages', skills.languages],
    skills.frameworks && ['Frameworks and others', skills.frameworks],
    skills.databases && ['Databases', skills.databases],
    skills.tools && ['Tools', skills.tools],
  ].filter(Boolean)
  const skillsContent = skillItems.length
    ? `<div class="s2-skill-list">${skillItems.map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}.</p>`).join('')}</div>`
    : ''

  const projectContent = (projects || [])
    .filter(item => hasAnyValue(item, ['name', 'stack', 'bullets']))
    .map(item => {
      const projectLinks = [
        renderExternalLink(item.liveUrl, 'Live link'),
        renderExternalLink(item.githubUrl, 'GitHub'),
      ].filter(Boolean).join(' | ')
      return `
        <div class="s2-entry">
          <div class="s2-project-header">
            <strong>${escapeHtml(item.name)}</strong>
            ${projectLinks ? `<span>${projectLinks}</span>` : ''}
          </div>
          ${item.stack ? `<p class="s2-tech"><strong>Tech :</strong> ${escapeHtml(item.stack)}</p>` : ''}
          ${renderBullets(item.bullets)}
        </div>
      `
    }).join('')

  const educationContent = (educations || [])
    .filter(item => hasAnyValue(item, ['institution', 'degree']))
    .map(item => `
      <div class="s2-education">
        <div>
          <strong>${escapeHtml(item.degree)}</strong>
          <p>${escapeHtml(item.institution)}${item.grade ? ` | ${escapeHtml(item.grade)}` : ''}</p>
        </div>
        <span>${escapeHtml(item.dates)}</span>
      </div>
    `).join('')

  const certificationContent = (certifications || [])
    .filter(item => hasAnyValue(item, ['institution', 'course']))
    .map(item => `<p class="s2-line"><strong>${escapeHtml(item.institution)}</strong>${item.certificateUrl ? ` ${renderExternalLink(item.certificateUrl, '(Certificate)')}` : ''} - ${escapeHtml(item.course)}</p>`)
    .join('')

  const researchContent = hasAnyValue(research, ['title', 'stack'])
    ? `<p class="s2-line"><strong>${escapeHtml(research.title)}</strong>${research.stack ? ` | ${escapeHtml(research.stack)}` : ''}</p>${summaryContent && !experienceContent ? summaryContent : ''}`
    : ''

  const achievementsContent = renderBullets(achievements)
  const softSkillsContent = renderBullets(softSkills)
  const languagesContent = renderBullets(languages)
  const resumeSections = {
    summary: renderSample2Section(sectionTitle(sectionTitles, 'summary', 'Professional Summary'), summaryContent),
    experience: renderSample2Section(sectionTitle(sectionTitles, 'experience', 'Work Experience'), experienceContent),
    skills: renderSample2Section(sectionTitle(sectionTitles, 'skills', 'Skills'), skillsContent),
    projects: renderSample2Section(sectionTitle(sectionTitles, 'projects', 'Projects'), projectContent),
    education: renderSample2Section(sectionTitle(sectionTitles, 'education', 'Educational Qualification'), educationContent),
    certifications: renderSample2Section(sectionTitle(sectionTitles, 'certifications', 'Training & Certification'), certificationContent),
    research: renderSample2Section(sectionTitle(sectionTitles, 'research', 'Research Experience'), researchContent),
    achievements: renderSample2Section(sectionTitle(sectionTitles, 'achievements', 'Achievements'), achievementsContent),
    softSkills: renderSample2Section(sectionTitle(sectionTitles, 'softSkills', 'Soft Skills'), softSkillsContent),
    languages: renderSample2Section(sectionTitle(sectionTitles, 'languages', 'Languages'), languagesContent),
  }
  const requestedOrder = Array.isArray(sectionOrder) && sectionOrder.length ? sectionOrder : DEFAULT_SECTION_ORDER
  const orderedSections = [...requestedOrder, ...DEFAULT_SECTION_ORDER.filter(key => !requestedOrder.includes(key))]
    .map(key => resumeSections[key])
    .filter(Boolean)
    .join('')
  const isWidthFitPreview = previewFit === 'width'
  const previewStyles = preview ? `
    html, body.preview-body { height: 100%; }
    body.preview-body { align-items: ${isWidthFitPreview ? 'flex-start' : 'center'}; background: #e2e8f0; display: flex; justify-content: center; overflow: hidden; padding: 10px; }
    body.preview-body .pdf-viewport { height: 100%; position: relative; width: 100%; }
    body.preview-body .pdf-shell { height: 11in; left: 50%; position: absolute; top: ${isWidthFitPreview ? '0' : '50%'}; transform-origin: ${isWidthFitPreview ? 'top center' : 'center center'}; width: 8.5in; }
    body.preview-body .resume { background: #ffffff; box-shadow: 0 14px 30px rgba(15, 23, 42, 0.24); height: 11in; margin: 0; max-width: none; overflow: hidden; padding: 0.22in 0.3in; width: 8.5in; }
  ` : ''
  const previewScript = preview ? `
  <script>
    const fitResumePage = () => {
      const viewport = document.querySelector('.pdf-viewport');
      const shell = document.querySelector('.pdf-shell');
      if (!viewport || !shell) return;

      const pageWidth = 8.5 * 96;
      const pageHeight = 11 * 96;
      const availableWidth = Math.max(220, document.documentElement.clientWidth - 20);
      const availableHeight = Math.max(300, document.documentElement.clientHeight - 20);
      const scale = ${isWidthFitPreview ? 'Math.min(1, availableWidth / pageWidth)' : 'Math.min(availableWidth / pageWidth, availableHeight / pageHeight)'};

      shell.style.transform = '${isWidthFitPreview ? 'translateX(-50%)' : 'translate(-50%, -50%)'} scale(' + scale + ')';
      viewport.style.height = Math.ceil(pageHeight * scale) + 'px';
    };

    window.addEventListener('load', fitResumePage);
    window.addEventListener('resize', fitResumePage);
    requestAnimationFrame(fitResumePage);
  </script>
  ` : ''

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(personal.fullName || 'Resume')}</title>
  <style>
    @page { size: Letter; margin: 0.22in 0.3in; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #ffffff; color: #20252a; font-family: Arial, Helvetica, sans-serif; font-size: 11.2pt; line-height: 1.25; }
    .resume { max-width: 8.5in; margin: 0 auto; }
    .s2-header { margin-bottom: 8px; }
    .s2-header h1 { margin: 0 0 5px; color: #20252a; font-size: 17.5pt; font-weight: 700; line-height: 1.05; }
    .s2-contact { display: grid; gap: 4px; font-size: 10.8pt; }
    .s2-links { font-size: 10.8pt; margin-top: 5px; }
    a { color: #00aeea; text-decoration: none; }
    .s2-links a:nth-child(5) { color: #804080; }
    .email-link { color: #00aeea; border-bottom: 1px solid #00aeea; }
    .link-divider { color: #007bff; padding: 0 4px; }
    .s2-section { border-top: 1.25px solid #20252a; margin-top: 10px; padding-top: 5px; }
    .s2-section h2 { color: #33786f; font-size: 12pt; letter-spacing: 0; line-height: 1; margin: 0 0 7px; text-transform: uppercase; }
    .s2-entry { margin-bottom: 5px; }
    .s2-entry-title { color: #20252a; font-size: 11.4pt; margin-bottom: 2px; }
    .s2-project-header { align-items: center; color: #20252a; display: flex; font-size: 12pt; gap: 12px; justify-content: space-between; margin-bottom: 3px; }
    .s2-project-header > span { font-size: 10.8pt; font-weight: 400; white-space: nowrap; }
    .s2-meta { color: #666666; font-size: 10.5pt; margin-bottom: 2px; }
    .s2-tech, .s2-line, .s2-paragraph, .s2-skill-list p, .s2-personal-info p { margin: 3px 0; }
    .s2-education { align-items: flex-start; display: flex; gap: 14px; justify-content: space-between; margin-bottom: 12px; }
    .s2-education strong { font-size: 11.4pt; }
    .s2-education p { margin: 2px 0 0; }
    .s2-education > span { color: #666666; white-space: nowrap; }
    ul { margin: 3px 0 8px 30px; padding: 0; }
    li { margin-bottom: 3px; padding-left: 2px; text-align: justify; text-align-last: left; }
    ${previewStyles}
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body${preview ? ' class="preview-body"' : ''}>
  ${preview ? '<div class="pdf-viewport"><div class="pdf-shell">' : ''}
  <main class="resume">
    <header class="s2-header">
      <h1>${escapeHtml(personal.fullName)}</h1>
      <div class="s2-contact">${contactRows}</div>
      ${profileLinks ? `<div class="s2-links">${profileLinks}</div>` : ''}
    </header>
    ${orderedSections}
  </main>
  ${preview ? '</div></div>' : ''}
  ${previewScript}
</body>
</html>`
}

const renderSample3Section = (title, content) => content ? `
  <section class="s3-section">
    <h2>${escapeHtml(title)}</h2>
    ${content}
  </section>
` : ''

const buildSample3ResumeHtml = ({ personal = {}, summary = '', experiences = [], skills = {}, projects = [], certifications = [], educations = [], achievements = '', softSkills = '', languages = '', sectionTitles = DEFAULT_RESUME_SECTION_TITLES, preview = false, previewFit = 'contain' }) => {
  const contact = [
    personal.phone && `Phone: ${escapeHtml(personal.phone)}`,
    personal.email && `Email: <a href="mailto:${escapeHtml(personal.email)}">${escapeHtml(personal.email)}</a>`,
    renderExternalLink(personal.linkedinUrl, 'LinkedIn'),
    renderExternalLink(personal.githubUrl, 'GitHub'),
    renderExternalLink(personal.portfolioUrl, 'Portfolio'),
  ].filter(Boolean).join(' <span>|</span> ')

  const summaryContent = String(summary || '').trim()
    ? `<p class="s3-summary">${escapeHtml(summary).replace(/\r?\n/g, '<br />')}</p>`
    : ''

  const skillItems = [
    skills.languages && ['Frontend Development', skills.languages],
    skills.frameworks && ['Frameworks & Libraries', skills.frameworks],
    skills.databases && ['Backend & Databases', skills.databases],
    skills.tools && ['Tools & Workflow', skills.tools],
  ].filter(Boolean)
  const skillsContent = skillItems.length
    ? `<div class="s3-skills">${skillItems.map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`).join('')}</div>`
    : ''

  const experienceContent = (experiences || [])
    .filter(item => hasAnyValue(item, ['company', 'role', 'bullets']))
    .map(item => `
      <div class="s3-entry">
        <div class="s3-entry-head">
          <strong>${escapeHtml(item.role || item.company)}</strong>
          ${item.company && item.role ? `<span>- ${item.companyUrl ? renderExternalLink(item.companyUrl, item.company) : escapeHtml(item.company)}</span>` : ''}
        </div>
        <p class="s3-meta">${[item.location, item.dates].filter(Boolean).map(escapeHtml).join(' | ')}</p>
        ${renderBullets(item.bullets)}
      </div>
    `).join('')

  const projectContent = (projects || [])
    .filter(item => hasAnyValue(item, ['name', 'stack', 'bullets']))
    .map(item => {
      const links = [
        renderExternalLink(item.liveUrl, 'Live'),
        renderExternalLink(item.githubUrl, 'GitHub'),
      ].filter(Boolean).join(' - ')
      return `
        <div class="s3-project">
          <div class="s3-project-head">
            <strong>${escapeHtml(item.name)}</strong>
            ${item.stack ? `<span>| ${escapeHtml(item.stack)}</span>` : ''}
            ${links ? `<em>${links}</em>` : ''}
          </div>
          ${renderBullets(item.bullets)}
        </div>
      `
    }).join('')

  const certificateContent = (certifications || [])
    .filter(item => hasAnyValue(item, ['institution', 'course']))
    .map(item => `<p class="s3-line">${escapeHtml(item.course)}${item.institution ? ` - ${escapeHtml(item.institution)}` : ''}${item.certificateUrl ? ` - ${renderExternalLink(item.certificateUrl, 'View Certificate')}` : ''}</p>`)
    .join('')

  const educationContent = (educations || [])
    .filter(item => hasAnyValue(item, ['institution', 'degree']))
    .map(item => `
      <div class="s3-education">
        <strong>${escapeHtml(item.degree)}</strong>
        <span>${escapeHtml(item.institution)}${item.dates ? ` (${escapeHtml(item.dates)})` : ''}${item.grade ? ` | ${escapeHtml(item.grade)}` : ''}</span>
      </div>
    `).join('')

  const isWidthFitPreview = previewFit === 'width'
  const previewStyles = preview ? `
    html, body.preview-body { height: 100%; }
    body.preview-body { align-items: ${isWidthFitPreview ? 'flex-start' : 'center'}; background: #e2e8f0; display: flex; justify-content: center; overflow: hidden; padding: 10px; }
    body.preview-body .pdf-viewport { height: 100%; position: relative; width: 100%; }
    body.preview-body .pdf-shell { height: 11.69in; left: 50%; position: absolute; top: ${isWidthFitPreview ? '0' : '50%'}; transform-origin: ${isWidthFitPreview ? 'top center' : 'center center'}; width: 8.27in; }
    body.preview-body .resume { background: #ffffff; box-shadow: 0 14px 30px rgba(15, 23, 42, 0.24); height: 11.69in; margin: 0; max-width: none; overflow: hidden; padding: 0.42in 0.5in; width: 8.27in; }
  ` : ''
  const previewScript = preview ? `
  <script>
    const fitResumePage = () => {
      const viewport = document.querySelector('.pdf-viewport');
      const shell = document.querySelector('.pdf-shell');
      if (!viewport || !shell) return;

      const pageWidth = 8.27 * 96;
      const pageHeight = 11.69 * 96;
      const availableWidth = Math.max(220, document.documentElement.clientWidth - 20);
      const availableHeight = Math.max(300, document.documentElement.clientHeight - 20);
      const scale = ${isWidthFitPreview ? 'Math.min(1, availableWidth / pageWidth)' : 'Math.min(availableWidth / pageWidth, availableHeight / pageHeight)'};

      shell.style.transform = '${isWidthFitPreview ? 'translateX(-50%)' : 'translate(-50%, -50%)'} scale(' + scale + ')';
      viewport.style.height = Math.ceil(pageHeight * scale) + 'px';
    };

    window.addEventListener('load', fitResumePage);
    window.addEventListener('resize', fitResumePage);
    requestAnimationFrame(fitResumePage);
  </script>
  ` : ''

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(personal.fullName || 'Resume')}</title>
  <style>
    @page { size: A4; margin: 0.42in 0.5in; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #ffffff; color: #111827; font-family: Arial, Calibri, sans-serif; font-size: 10.2pt; line-height: 1.27; }
    .resume { max-width: 8.27in; margin: 0 auto; }
    .s3-header { text-align: center; margin-bottom: 10px; }
    .s3-header h1 { font-size: 16pt; line-height: 1.1; margin: 0; text-transform: uppercase; }
    .s3-role { font-size: 11pt; font-weight: 700; margin-top: 2px; }
    .s3-contact { font-size: 9.4pt; margin-top: 4px; }
    .s3-contact span { color: #6b7280; padding: 0 2px; }
    a { color: #2563eb; text-decoration: none; }
    .s3-summary { margin: 0 0 8px; text-align: justify; text-align-last: left; }
    .s3-section { margin-top: 10px; }
    .s3-section h2 { border-bottom: 1px solid #111827; font-size: 11.2pt; letter-spacing: 0; line-height: 1.1; margin: 0 0 6px; padding-bottom: 2px; text-transform: uppercase; }
    .s3-skills p, .s3-line, .s3-meta { margin: 3px 0; }
    .s3-entry, .s3-project { margin-bottom: 8px; }
    .s3-entry-head, .s3-project-head { align-items: baseline; display: flex; flex-wrap: wrap; gap: 4px; }
    .s3-project-head em { font-style: normal; margin-left: auto; white-space: nowrap; }
    .s3-meta { color: #4b5563; font-size: 9.2pt; }
    ul { margin: 3px 0 0 18px; padding: 0; }
    li { margin-bottom: 2px; text-align: justify; text-align-last: left; }
    .s3-education { margin-bottom: 5px; }
    .s3-education strong { display: block; }
    .s3-education span { color: #374151; display: block; }
    ${previewStyles}
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body${preview ? ' class="preview-body"' : ''}>
  ${preview ? '<div class="pdf-viewport"><div class="pdf-shell">' : ''}
  <main class="resume">
    <header class="s3-header">
      <h1>${escapeHtml(personal.fullName)}</h1>
      ${personal.targetRole ? `<div class="s3-role">${escapeHtml(personal.targetRole)}</div>` : ''}
      ${contact ? `<div class="s3-contact">${contact}</div>` : ''}
    </header>
    ${summaryContent}
    ${renderSample3Section(sectionTitle(sectionTitles, 'skills', 'Skills'), skillsContent)}
    ${renderSample3Section(sectionTitle(sectionTitles, 'experience', 'Experience'), experienceContent)}
    ${renderSample3Section(sectionTitle(sectionTitles, 'projects', 'Projects'), projectContent)}
    ${renderSample3Section(sectionTitle(sectionTitles, 'certifications', 'Certificate'), certificateContent)}
    ${renderSample3Section(sectionTitle(sectionTitles, 'education', 'Education'), educationContent)}
    ${renderSample3Section(sectionTitle(sectionTitles, 'achievements', 'Achievements'), renderBullets(achievements))}
    ${renderSample3Section(sectionTitle(sectionTitles, 'softSkills', 'Soft Skills'), softSkills ? renderBullets(softSkills) : '')}
    ${renderSample3Section(sectionTitle(sectionTitles, 'languages', 'Languages'), languages ? renderBullets(languages) : '')}
  </main>
  ${preview ? '</div></div>' : ''}
  ${previewScript}
</body>
</html>`
}

const renderSample4Section = (title, content) => content ? `
  <section class="s4-section">
    <h2>${escapeHtml(title)}</h2>
    ${content}
  </section>
` : ''

const buildSample4ResumeHtml = ({ personal = {}, summary = '', experiences = [], skills = {}, projects = [], certifications = [], educations = [], research = {}, achievements = '', sectionTitles = DEFAULT_RESUME_SECTION_TITLES, preview = false, previewFit = 'contain' }) => {
  const contactBlock = [
    personal.email && `<p><strong>Email:</strong> <a href="mailto:${escapeHtml(personal.email)}">${escapeHtml(personal.email)}</a></p>`,
    personal.phone && `<p><strong>Phone:</strong> ${escapeHtml(personal.phone)}</p>`,
    [renderExternalLink(personal.linkedinUrl, 'LinkedIn'), renderExternalLink(personal.githubUrl, 'GitHub'), renderExternalLink(personal.portfolioUrl, 'Portfolio')].filter(Boolean).join(' <span>|</span> '),
  ].filter(Boolean).map(item => item.startsWith('<p') ? item : `<p>${item}</p>`).join('')

  const objectiveContent = String(summary || '').trim()
    ? `<p class="s4-paragraph">${escapeHtml(summary).replace(/\r?\n/g, '<br />')}</p>`
    : ''

  const skillItems = [
    skills.languages && ['Programming Languages', skills.languages],
    skills.frameworks && ['Frameworks and others', skills.frameworks],
    skills.databases && ['Databases', skills.databases],
    skills.tools && ['Tools', skills.tools],
  ].filter(Boolean)
  const skillsContent = skillItems.length
    ? `<div class="s4-skills">${skillItems.map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`).join('')}</div>`
    : ''

  const projectContent = (projects || [])
    .filter(item => hasAnyValue(item, ['name', 'stack', 'bullets']))
    .map(item => {
      const projectLinks = [
        renderExternalLink(item.githubUrl, 'GitHub'),
        renderExternalLink(item.liveUrl, 'Live link'),
      ].filter(Boolean).join(' | ')
      return `
        <div class="s4-project">
          <div class="s4-project-head">
            <strong>${escapeHtml(item.name)}</strong>
            ${projectLinks ? `<span>(${projectLinks})</span>` : ''}
          </div>
          ${item.stack ? `<p><strong>Tech Stack:</strong> ${escapeHtml(item.stack)}</p>` : ''}
          ${renderBullets(item.bullets)}
        </div>
      `
    }).join('')

  const experienceContent = (experiences || [])
    .filter(item => hasAnyValue(item, ['company', 'role', 'bullets']))
    .map(item => `
      <div class="s4-experience">
        <strong>${escapeHtml(item.role || item.company)}</strong>
        <span>${escapeHtml(item.dates)}</span>
        <p>${item.companyUrl ? renderExternalLink(item.companyUrl, item.company) : escapeHtml(item.company)}${item.location ? ` | ${escapeHtml(item.location)}` : ''}</p>
        ${renderBullets(item.bullets)}
      </div>
    `).join('')

  const certificationContent = (certifications || [])
    .filter(item => hasAnyValue(item, ['institution', 'course']))
    .map(item => `<p class="s4-line"><strong>${escapeHtml(item.institution)}</strong>${item.certificateUrl ? ` (${renderExternalLink(item.certificateUrl, 'Certificate')})` : ''} - ${escapeHtml(item.course)}</p>`)
    .join('')

  const researchContent = hasAnyValue(research, ['title', 'stack'])
    ? `<p class="s4-line"><strong>${escapeHtml(research.title)}</strong>${research.stack ? ` - ${escapeHtml(research.stack)}` : ''}</p>`
    : ''

  const educationContent = (educations || [])
    .filter(item => hasAnyValue(item, ['institution', 'degree']))
    .map(item => `
      <div class="s4-education">
        <strong>${escapeHtml(item.degree)}</strong>
        <span>${escapeHtml(item.dates)}</span>
        <p>${escapeHtml(item.institution)}${item.grade ? ` | ${escapeHtml(item.grade)}` : ''}</p>
      </div>
    `).join('')

  const achievementsContent = renderBullets(achievements)
  const isWidthFitPreview = previewFit === 'width'
  const previewStyles = preview ? `
    html, body.preview-body { height: 100%; }
    body.preview-body { align-items: ${isWidthFitPreview ? 'flex-start' : 'center'}; background: #e2e8f0; display: flex; justify-content: center; overflow: hidden; padding: 10px; }
    body.preview-body .pdf-viewport { height: 100%; position: relative; width: 100%; }
    body.preview-body .pdf-shell { height: 11.69in; left: 50%; position: absolute; top: ${isWidthFitPreview ? '0' : '50%'}; transform-origin: ${isWidthFitPreview ? 'top center' : 'center center'}; width: 8.27in; }
    body.preview-body .resume { background: #ffffff; box-shadow: 0 14px 30px rgba(15, 23, 42, 0.24); height: 11.69in; margin: 0; max-width: none; overflow: hidden; padding: 0.45in 0.5in; width: 8.27in; }
  ` : ''
  const previewScript = preview ? `
  <script>
    const fitResumePage = () => {
      const viewport = document.querySelector('.pdf-viewport');
      const shell = document.querySelector('.pdf-shell');
      if (!viewport || !shell) return;

      const pageWidth = 8.27 * 96;
      const pageHeight = 11.69 * 96;
      const availableWidth = Math.max(220, document.documentElement.clientWidth - 20);
      const availableHeight = Math.max(300, document.documentElement.clientHeight - 20);
      const scale = ${isWidthFitPreview ? 'Math.min(1, availableWidth / pageWidth)' : 'Math.min(availableWidth / pageWidth, availableHeight / pageHeight)'};

      shell.style.transform = '${isWidthFitPreview ? 'translateX(-50%)' : 'translate(-50%, -50%)'} scale(' + scale + ')';
      viewport.style.height = Math.ceil(pageHeight * scale) + 'px';
    };

    window.addEventListener('load', fitResumePage);
    window.addEventListener('resize', fitResumePage);
    requestAnimationFrame(fitResumePage);
  </script>
  ` : ''

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(personal.fullName || 'Resume')}</title>
  <style>
    @page { size: A4; margin: 0.45in 0.5in; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #ffffff; color: #111827; font-family: Calibri, Arial, sans-serif; font-size: 11.2pt; line-height: 1.28; }
    .resume { max-width: 8.27in; margin: 0 auto; }
    .s4-header { display: grid; grid-template-columns: minmax(0, 1fr) 2.3in; gap: 18px; margin-bottom: 10px; }
    .s4-header h1 { color: #473a92; font-size: 21pt; line-height: 1.1; margin: 0; }
    .s4-contact { align-self: end; color: #111827; font-size: 11pt; }
    .s4-contact p { margin: 2px 0; }
    .s4-contact span { color: #4f46e5; padding: 0 4px; }
    a { color: #2563eb; text-decoration: none; }
    .s4-section { margin-top: 8px; }
    .s4-section h2 { color: #548dd4; font-size: 12pt; line-height: 1.1; margin: 0 0 4px; text-transform: capitalize; }
    .s4-paragraph, .s4-line, .s4-skills p { margin: 3px 0; text-align: justify; text-align-last: left; }
    .s4-project { margin: 5px 0; }
    .s4-project-head { align-items: baseline; display: flex; flex-wrap: wrap; gap: 4px; }
    .s4-project-head strong { font-weight: 700; }
    .s4-project p { margin: 2px 0; }
    .s4-education, .s4-experience { margin-bottom: 5px; position: relative; }
    .s4-education strong, .s4-experience strong { display: inline-block; }
    .s4-education span, .s4-experience span { float: right; }
    .s4-education p, .s4-experience p { clear: both; margin: 2px 0 0; }
    ul { margin: 4px 0 0 18px; padding: 0; }
    li { margin-bottom: 2px; }
    ${previewStyles}
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body${preview ? ' class="preview-body"' : ''}>
  ${preview ? '<div class="pdf-viewport"><div class="pdf-shell">' : ''}
  <main class="resume">
    <header class="s4-header">
      <div>
        <h1>${escapeHtml(personal.fullName)}</h1>
      </div>
      <div class="s4-contact">${contactBlock}</div>
    </header>
    ${renderSample4Section(sectionTitle(sectionTitles, 'summary', 'Career Objective'), objectiveContent)}
    ${renderSample4Section(sectionTitle(sectionTitles, 'skills', 'Skills'), skillsContent)}
    ${renderSample4Section(sectionTitle(sectionTitles, 'experience', 'Work Experience'), experienceContent)}
    ${renderSample4Section(sectionTitle(sectionTitles, 'projects', 'Projects'), projectContent)}
    ${renderSample4Section(sectionTitle(sectionTitles, 'certifications', 'Training & Certification'), certificationContent)}
    ${renderSample4Section(sectionTitle(sectionTitles, 'research', 'Research Experience'), researchContent)}
    ${renderSample4Section(sectionTitle(sectionTitles, 'education', 'Educational Qualification'), educationContent)}
    ${renderSample4Section(sectionTitle(sectionTitles, 'achievements', 'Achievements'), achievementsContent)}
  </main>
  ${preview ? '</div></div>' : ''}
  ${previewScript}
</body>
</html>`
}

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

const BulletTextareaStep = ({ label, value, onChange, placeholder }) => (
  <div className='space-y-4'>
    <TextareaField
      label={label}
      value={value}
      onChange={onChange}
      rows={6}
      placeholder={placeholder}
    />
    <p className='text-xs text-gray-500 dark:text-gray-400'>Each line will automatically become a bullet point in the resume. Leave blank to omit this section.</p>
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
