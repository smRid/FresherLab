import { useMemo, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import { AlertTriangle, CheckCircle2, Copy, Download, FileText, Loader2, Search, Target, TrendingUp } from 'lucide-react'

const targetRoles = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'MERN Stack Developer', 'DevOps Engineer', 'QA Engineer',
  'UI/UX Designer', 'Data Analyst', 'Software Engineer', 'Other'
]
const experienceLevels = ['Fresher', 'Internship', '0-1 Year', '1-2 Years']

const AtsScoreChecker = () => {
  const [resumeFile, setResumeFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [targetRole, setTargetRole] = useState('Full Stack Developer')
  const [experienceLevel, setExperienceLevel] = useState('Fresher')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const { getToken } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!resumeFile) return toast.error('Please upload a resume PDF')
    if (!jobDescription.trim()) return toast.error('Please enter a job description')
    if (resumeFile.size > 5 * 1024 * 1024) return toast.error('Resume must be under 5MB')

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('resume', resumeFile)
      formData.append('jobDescription', jobDescription)
      formData.append('target_role', targetRole)
      formData.append('experience_level', experienceLevel)

      const { data } = await api.post('/api/ai/ats-score', formData, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        setResult(data.content)
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
    <div className='h-full overflow-y-scroll p-4 text-slate-700 dark:text-gray-300 sm:p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-slate-800 dark:text-white'>ATS Score Checker</h1>
        <p className='mt-1 text-sm text-slate-500 dark:text-gray-400'>Compare your resume against a job description to find keyword gaps</p>
      </div>

      <div className='grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(360px,620px)_minmax(420px,1fr)]'>
        <form onSubmit={handleSubmit} className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#0F172A] xl:sticky xl:top-6'>
          <div className='mb-5 flex items-start gap-3'>
            <div className='rounded-xl bg-orange-100 p-3 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300'>
              <Search className='h-5 w-5' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-slate-900 dark:text-white'>Analyze Resume Fit</h2>
              <p className='text-sm text-slate-500 dark:text-gray-400'>Upload your resume and paste the target job description.</p>
            </div>
          </div>

          <div className='space-y-5'>
            <div>
              <label className='block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1'>Upload Resume (PDF, max 5MB)</label>
              <input type='file' accept='.pdf' onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className='block w-full text-sm text-slate-500 dark:text-gray-400 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 dark:file:bg-blue-900/30 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50' />
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <label className='block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1'>Target Role</label>
            <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
              className='w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none'>
              {targetRoles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1'>Experience Level</label>
            <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}
              className='w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none'>
              {experienceLevels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1'>Job Description</label>
              <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                rows={10} maxLength={10000} placeholder='Paste the full job description here...'
                className='w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-[#1E293B] dark:text-gray-300' />
            </div>

            <button type='submit' disabled={loading}
              className='inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:opacity-90 disabled:opacity-50 sm:w-auto'>
              {loading ? <><Loader2 className='h-4 w-4 animate-spin' /> Analyzing...</> : 'Check ATS Score'}
            </button>
          </div>
        </form>

        <AtsReportPanel content={result} targetRole={targetRole} experienceLevel={experienceLevel} />
      </div>
    </div>
  )
}

const AtsReportPanel = ({ content, targetRole, experienceLevel }) => {
  const report = useMemo(() => parseAtsReport(content, targetRole, experienceLevel), [content, targetRole, experienceLevel])

  const copyContent = async () => {
    await navigator.clipboard.writeText(content)
    toast.success('Report copied')
  }

  const downloadContent = (extension) => {
    const blob = new Blob([content], { type: extension === 'md' ? 'text/markdown' : 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ats-score-report.${extension}`
    link.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded .${extension}`)
  }

  if (!content) {
    return (
      <aside className='rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center shadow-sm dark:border-gray-800 dark:bg-[#0F172A]/80'>
        <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300'>
          <FileText className='h-7 w-7' />
        </div>
        <h2 className='text-xl font-bold text-slate-900 dark:text-white'>ATS report preview</h2>
        <p className='mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-gray-400'>
          Your structured score report will appear here with score cards, matched keywords, missing keywords, and improvement suggestions.
        </p>
        <div className='mt-6 grid gap-3 sm:grid-cols-3'>
          {['Overall Score', 'Keywords', 'Role Match'].map(item => (
            <div key={item} className='rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-[#111827]'>
              <div className='mx-auto mb-3 h-2 w-16 rounded-full bg-slate-200 dark:bg-gray-700' />
              <p className='text-xs font-medium text-slate-500 dark:text-gray-400'>{item}</p>
            </div>
          ))}
        </div>
      </aside>
    )
  }

  return (
    <aside className='rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0F172A] xl:sticky xl:top-6'>
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5 dark:border-gray-800'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-orange-500'>Structured Report</p>
          <h2 className='mt-1 text-xl font-bold text-slate-900 dark:text-white'>ATS Score Report</h2>
        </div>
        <div className='flex flex-wrap gap-2'>
          <button type='button' onClick={copyContent} className='inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'>
            <Copy className='h-4 w-4' /> Copy
          </button>
          <button type='button' onClick={() => downloadContent('txt')} className='inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'>
            <Download className='h-4 w-4' /> TXT
          </button>
          <button type='button' onClick={() => downloadContent('md')} className='inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'>
            <Download className='h-4 w-4' /> MD
          </button>
        </div>
      </div>

      <div className='max-h-none space-y-5 overflow-y-auto p-5 xl:max-h-[calc(100vh-170px)]'>
        <div className='grid gap-4 md:grid-cols-3'>
          <ScoreCard label='Overall ATS' score={report.scores.overall} icon={TrendingUp} />
          <ScoreCard label='Keyword Match' score={report.scores.keyword} icon={Search} />
          <ScoreCard label='Role Match' score={report.scores.role} icon={Target} />
        </div>

        <div className='grid gap-3 sm:grid-cols-2'>
          <InfoBadge label='Target Role' value={report.meta.targetRole} />
          <InfoBadge label='Experience Level' value={report.meta.experienceLevel} />
        </div>

        <div className='grid gap-4 lg:grid-cols-2'>
          <KeywordPanel title='Matched Keywords' items={report.lists.matched} tone='success' />
          <KeywordPanel title='Missing Keywords' items={report.lists.missing} tone='warning' />
        </div>

        <ReportSection title='Weak Sections' icon={AlertTriangle} items={report.lists.weakSections} tone='warning' />
        <ReportSection title='Recommended Phrases to Add' icon={CheckCircle2} items={report.lists.recommendedPhrases} tone='success' />
        <TextPanel title='Optimized Resume Summary' text={report.sections.summary} />
        <ReportSection title='Project Bullet Improvements' icon={CheckCircle2} items={report.lists.projectBullets} tone='neutral' />
        <TextPanel title='Final Recommendation' text={report.sections.finalRecommendation} highlight />
      </div>
    </aside>
  )
}

const ScoreCard = ({ label, score, icon: Icon }) => {
  const value = Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : null
  const color = value >= 75 ? '#22c55e' : value >= 55 ? '#f59e0b' : '#ef4444'
  const tone = value >= 75 ? 'Strong' : value >= 55 ? 'Needs Work' : 'Improve'

  return (
    <div className='rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-[#111827]'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='rounded-xl bg-white p-2 text-slate-600 dark:bg-[#0B1120] dark:text-gray-300'>
          <Icon className='h-4 w-4' />
        </div>
        <span className='rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-[#0B1120] dark:text-gray-300'>{value === null ? 'Pending' : tone}</span>
      </div>
      <div className='flex items-end justify-between gap-3'>
        <div>
          <p className='text-xs font-medium text-slate-500 dark:text-gray-400'>{label}</p>
          <p className='mt-1 text-2xl font-bold text-slate-900 dark:text-white'>{value === null ? '—' : value}<span className='text-sm text-slate-400'>/100</span></p>
        </div>
        <div className='h-12 w-12 rounded-full p-1' style={{ background: `conic-gradient(${color} ${(value || 0) * 3.6}deg, rgba(148,163,184,0.22) 0deg)` }}>
          <div className='h-full w-full rounded-full bg-slate-50 dark:bg-[#111827]' />
        </div>
      </div>
    </div>
  )
}

const InfoBadge = ({ label, value }) => (
  <div className='rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-gray-800 dark:bg-[#111827]'>
    <p className='text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-gray-400'>{label}</p>
    <p className='mt-1 text-sm font-semibold text-slate-900 dark:text-white'>{value || 'Not specified'}</p>
  </div>
)

const KeywordPanel = ({ title, items, tone }) => {
  const toneClass = tone === 'success'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'
    : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300'

  return (
    <section className='rounded-2xl border border-slate-200 p-4 dark:border-gray-800'>
      <h3 className='text-sm font-bold text-slate-900 dark:text-white'>{title}</h3>
      <div className='mt-3 flex flex-wrap gap-2'>
        {items.length ? items.map(item => (
          <span key={item} className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}>{item}</span>
        )) : (
          <p className='text-sm text-slate-500 dark:text-gray-400'>No items found.</p>
        )}
      </div>
    </section>
  )
}

const ReportSection = ({ title, icon: Icon, items, tone }) => {
  const iconClass = tone === 'warning'
    ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300'
    : tone === 'success'
      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
      : 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300'

  return (
    <section className='rounded-2xl border border-slate-200 p-4 dark:border-gray-800'>
      <div className='mb-3 flex items-center gap-2'>
        <span className={`rounded-lg p-2 ${iconClass}`}>
          <Icon className='h-4 w-4' />
        </span>
        <h3 className='text-sm font-bold text-slate-900 dark:text-white'>{title}</h3>
      </div>
      <div className='space-y-2'>
        {items.length ? items.map(item => (
          <div key={item} className='rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:bg-[#111827] dark:text-gray-300'>{item}</div>
        )) : (
          <p className='text-sm text-slate-500 dark:text-gray-400'>No details available.</p>
        )}
      </div>
    </section>
  )
}

const TextPanel = ({ title, text, highlight = false }) => (
  <section className={`rounded-2xl border p-4 ${highlight ? 'border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10' : 'border-slate-200 dark:border-gray-800'}`}>
    <h3 className='text-sm font-bold text-slate-900 dark:text-white'>{title}</h3>
    <p className='mt-2 text-sm leading-6 text-slate-600 dark:text-gray-300'>{text || 'No details available.'}</p>
  </section>
)

const parseAtsReport = (content = '', targetRole, experienceLevel) => {
  const sections = getMarkdownSections(content)
  const roleSection = getSection(sections, 'Role Match Score')
  const metaTarget = roleSection.match(/Target Role:\s*([^\n]+)/i)?.[1]?.trim()
  const metaExperience = roleSection.match(/Experience Level:\s*([^\n]+)/i)?.[1]?.trim()

  return {
    scores: {
      overall: extractScore(getSection(sections, 'Overall ATS Score')),
      keyword: extractScore(getSection(sections, 'Keyword Match Score')),
      role: extractScore(roleSection),
    },
    meta: {
      targetRole: metaTarget || targetRole,
      experienceLevel: metaExperience || experienceLevel,
    },
    lists: {
      matched: extractListItems(getSection(sections, 'Matched Keywords')),
      missing: extractListItems(getSection(sections, 'Missing Keywords')),
      weakSections: extractListItems(getSection(sections, 'Weak Sections')),
      recommendedPhrases: extractListItems(getSection(sections, 'Recommended Phrases to Add')),
      projectBullets: extractListItems(getSection(sections, 'Project Bullet Improvements')),
    },
    sections: {
      summary: cleanSectionText(getSection(sections, 'Optimized Resume Summary')),
      finalRecommendation: cleanSectionText(getSection(sections, 'Final Recommendation')),
    },
  }
}

const getMarkdownSections = (content) => {
  const matches = [...content.matchAll(/^##\s+(.+)$/gm)]
  return matches.reduce((acc, match, index) => {
    const next = matches[index + 1]
    const title = normalizeHeading(match[1])
    acc[title] = content.slice(match.index + match[0].length, next?.index ?? content.length).trim()
    return acc
  }, {})
}

const getSection = (sections, title) => sections[normalizeHeading(title)] || ''

const normalizeHeading = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '')

const extractScore = (text) => {
  const score = Number(text.match(/(\d{1,3})\s*\/\s*100/)?.[1])
  if (!Number.isFinite(score)) return null
  return Math.max(0, Math.min(100, score))
}

const extractListItems = (text) => text
  .split('\n')
  .map(line => line.trim())
  .filter(line => /^[-*•]\s+/.test(line) || /^\d+[.)]\s+/.test(line))
  .map(line => cleanInlineText(line.replace(/^[-*•]\s+/, '').replace(/^\d+[.)]\s+/, '')))
  .filter(Boolean)

const cleanSectionText = (text) => cleanInlineText(text
  .split('\n')
  .filter(line => !/^[-*•]\s+/.test(line.trim()) && !/^\d{1,3}\s*\/\s*100/.test(line.trim()) && !/^Target Role:/i.test(line.trim()) && !/^Experience Level:/i.test(line.trim()))
  .join(' ')
  .trim())

const cleanInlineText = (text) => text
  .replace(/\*\*/g, '')
  .replace(/`/g, '')
  .replace(/\s+/g, ' ')
  .trim()

export default AtsScoreChecker
