import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import GeneratedOutput from '../components/GeneratedOutput'
import { Download, GripVertical, Loader2, Plus, Trash2 } from 'lucide-react'

const SECTION_DEFINITIONS = [
  { key: 'personal', label: 'Personal' },
  { key: 'summary', label: 'Professional Summary' },
  { key: 'experience', label: 'Experience' },
  { key: 'skills', label: 'Skills' },
  { key: 'projects', label: 'Projects' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'education', label: 'Education' },
  { key: 'research', label: 'Research' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'softSkills', label: 'Soft Skills' },
  { key: 'languages', label: 'Languages' },
]

const DEFAULT_SECTION_ORDER = SECTION_DEFINITIONS.map(section => section.key)
const SECTION_LABELS = SECTION_DEFINITIONS.reduce((labels, section) => ({ ...labels, [section.key]: section.label }), {})

const emptyExperience = { company: '', companyUrl: '', role: '', dates: '', location: '', bullets: '' }
const emptyProject = { name: '', stack: '', githubUrl: '', liveUrl: '', bullets: '' }
const emptyCertification = { institution: '', course: '', certificateUrl: '' }
const emptyEducation = { institution: '', degree: '', dates: '', grade: '' }

const inputClass = 'w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none'
const labelClass = 'block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1'

const ResumeBuilder = () => {
  const [activeSection, setActiveSection] = useState(DEFAULT_SECTION_ORDER[0])
  const [sectionOrder, setSectionOrder] = useState(DEFAULT_SECTION_ORDER)
  const [draggingSection, setDraggingSection] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const { getToken } = useAuth()

  const [personal, setPersonal] = useState({
    fullName: '', email: '', phone: '', location: '',
    linkedinUrl: '', portfolioUrl: '', githubUrl: '', targetRole: '',
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

    const html = buildResumeHtml({ personal, summary, experiences, skills, projects, certifications, educations, research, achievements, softSkills, languages, sectionOrder })
    pdfWindow.document.open()
    pdfWindow.document.write(html)
    pdfWindow.document.close()
    pdfWindow.focus()

    setTimeout(() => {
      pdfWindow.print()
    }, 500)
  }

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
    <ArraySection title='Training Certifications' items={certifications} onAdd={addArrayItem(setCertifications, emptyCertification)} onRemove={removeArrayItem(setCertifications)} renderItem={(c, idx) => (
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
  }
  const activeIndex = sectionOrder.indexOf(activeSection)

  return (
    <div className='h-full overflow-y-scroll p-6 text-slate-700 dark:text-gray-300'>
      <h1 className='text-2xl font-bold text-slate-800 dark:text-white mb-1'>AI Resume Builder</h1>
      <p className='text-slate-500 dark:text-gray-400 text-sm mb-6'>Generate a clean LaTeX resume in the Trey-Hunner <code>resume.cls</code> format used by top freshers.</p>

      <div className='mb-8 flex max-w-3xl flex-wrap gap-2'>
        {sectionOrder.map((sectionKey, i) => {
          const isActive = sectionKey === activeSection
          return (
            <button key={sectionKey} type='button' draggable onClick={() => setActiveSection(sectionKey)}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move'
                e.dataTransfer.setData('text/plain', sectionKey)
                setDraggingSection(sectionKey)
              }}
              onDragEnd={() => setDraggingSection('')}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
              }}
              onDrop={(e) => {
                e.preventDefault()
                moveSection(e.dataTransfer.getData('text/plain') || draggingSection, sectionKey)
                setDraggingSection('')
              }}
              title='Drag to reorder'
              className={`inline-flex !cursor-grab items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium shadow-sm transition active:!cursor-grabbing ${isActive
                ? 'border-blue-500 bg-blue-600 text-white shadow-blue-600/20'
                : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-blue-500/60 dark:hover:bg-gray-700'
                } ${draggingSection === sectionKey ? 'opacity-50 ring-2 ring-blue-400' : ''}`}>
              <GripVertical className='h-3.5 w-3.5 shrink-0 opacity-70' />
              <span>{i + 1}. {SECTION_LABELS[sectionKey]}</span>
            </button>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className='max-w-3xl'>
        {stepContent[activeSection]}

        <div className='mt-6 flex gap-3'>
          {activeIndex > 0 && (
            <button type='button' onClick={() => setActiveSection(sectionOrder[activeIndex - 1])}
              className='rounded-lg border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'>Back</button>
          )}
          {activeIndex < sectionOrder.length - 1 ? (
            <button type='button' onClick={() => setActiveSection(sectionOrder[activeIndex + 1])}
              className='rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700'>Next</button>
          ) : (
            <>
              <button type='submit' disabled={loading}
                className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:opacity-90 disabled:opacity-50'>
                {loading ? <><Loader2 className='h-4 w-4 animate-spin' /> Building LaTeX...</> : 'Generate LaTeX Resume'}
              </button>
              <button type='button' onClick={handleDownloadPdf}
                className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:opacity-90'>
                <Download className='h-4 w-4' /> Download PDF
              </button>
            </>
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

const renderBullets = (bullets) => {
  const items = splitLines(bullets)
  if (!items.length) return ''
  return `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
}

const buildResumeHtml = ({ personal = {}, summary = '', experiences = [], skills = {}, projects = [], certifications = [], educations = [], research = {}, achievements = '', softSkills = '', languages = '', sectionOrder = DEFAULT_SECTION_ORDER }) => {
  const contact = [
    personal.phone && `<a href="tel:${escapeHtml(personal.phone)}">${escapeHtml(personal.phone)}</a>`,
    personal.email && `<a href="mailto:${escapeHtml(personal.email)}">${escapeHtml(personal.email)}</a>`,
  ].filter(Boolean).join(' &nbsp;|&nbsp; ')
  const location = escapeHtml(personal.location || '')

  const links = [
    renderExternalLink(personal.linkedinUrl, 'LinkedIn'),
    renderExternalLink(personal.portfolioUrl, 'Portfolio'),
    renderExternalLink(personal.githubUrl, 'GitHub'),
  ].filter(Boolean).join(' &nbsp;|&nbsp; ')

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
      <p class="line-item"><strong>${escapeHtml(item.institution)}</strong>${item.certificateUrl ? ` ${renderExternalLink(item.certificateUrl, '(Certificate)')}` : ''} -- ${escapeHtml(item.course)}</p>
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
    summary: renderSection('Professional Summary', summaryContent),
    experience: renderSection('Work Experience', experienceContent),
    skills: renderSection('Technical Skills', skillsContent),
    projects: renderSection('Personal Projects', projectContent),
    certifications: renderSection('Training Certification', certificationContent),
    education: renderSection('Education', educationContent),
    research: renderSection('Research Experience', researchContent),
    achievements: renderSection('Achievements', achievementsContent),
    softSkills: renderSection('Soft Skills', softSkillsContent),
    languages: renderSection('Languages', languagesContent),
  }
  const requestedOrder = Array.isArray(sectionOrder) && sectionOrder.length ? sectionOrder : DEFAULT_SECTION_ORDER
  const orderedSections = [...requestedOrder, ...DEFAULT_SECTION_ORDER.filter(key => !requestedOrder.includes(key))]
    .map(key => resumeSections[key])
    .filter(Boolean)
    .join('')

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(personal.fullName || 'Resume')}</title>
  <style>
    @page { size: A4; margin: 0.55in 0.7in; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #ffffff; color: #111827; font-family: "Trebuchet MS", Arial, sans-serif; font-size: 10.3pt; line-height: 1.28; }
    .resume { max-width: 8.27in; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 12px; }
    h1 { margin: 0; font-size: 21pt; line-height: 1.1; }
    .target-role { margin-top: 3px; font-size: 11pt; color: #374151; font-weight: 700; }
    .contact, .links, .location { margin-top: 4px; font-size: 9.7pt; }
    a { color: #003f91; text-decoration: none; }
    .section { margin-top: 9px; }
    .section-title { border-bottom: 1px solid #111827; color: #111827; font-size: 11pt; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 5px; padding-bottom: 2px; text-transform: uppercase; }
    .summary { margin: 4px 0; text-align: left; }
    .entry { margin-bottom: 6px; }
    .row { display: flex; justify-content: space-between; gap: 16px; width: 100%; }
    .row > span:last-child { text-align: right; white-space: nowrap; }
    .muted { color: #374151; }
    ul { margin: 3px 0 6px 18px; padding: 0; }
    li { margin-bottom: 2px; }
    .compact-list { margin-top: 2px; }
    .line-item { margin: 4px 0; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <main class="resume">
    <header class="header">
      <h1>${escapeHtml(personal.fullName)}</h1>
      ${personal.targetRole ? `<div class="target-role">${escapeHtml(personal.targetRole)}</div>` : ''}
      ${contact ? `<div class="contact">${contact}</div>` : ''}
      ${links ? `<div class="links">${links}</div>` : ''}
      ${location ? `<div class="location">${location}</div>` : ''}
    </header>
    ${orderedSections}
  </main>
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
