const escapeLatex = (input) => {
    if (input === null || input === undefined) return ''
    const str = String(input)
    return str
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/([&%$#_{}])/g, '\\$1')
        .replace(/~/g, '\\~{}')
        .replace(/\^/g, '\\^{}')
}

const sanitizeUrl = (url) => (url || '').toString().trim()

const DEFAULT_SECTION_ORDER = [
    'summary',
    'experience',
    'skills',
    'projects',
    'certifications',
    'education',
    'research',
    'achievements',
    'softSkills',
    'languages',
]

const splitBullets = (text) => {
    if (!text) return []
    return text
        .split(/\r?\n/)
        .map(line => line.replace(/^\s*[-•*]\s*/, '').trim())
        .filter(Boolean)
}

const renderBullets = (bullets, itemSep = '-0.15cm', topVspace = '-0.2cm') => {
    if (!bullets.length) return ''
    const items = bullets
        .map(b => `        \\item ${escapeLatex(b)}`)
        .join('\n')
    return `    \\begin{itemize}[leftmargin=0.4cm, label={\\Large \\textbullet}]
    \\setlength\\itemsep{${itemSep}}
    \\vspace{${topVspace}}
${items}
    \\end{itemize}`
}

const renderHeader = (data) => {
    const name = escapeLatex(data.fullName || '')
    const phone = sanitizeUrl(data.phone)
    const email = sanitizeUrl(data.email)
    const location = escapeLatex(data.location || '')
    const linkedin = sanitizeUrl(data.linkedinUrl)
    const portfolio = sanitizeUrl(data.portfolioUrl)
    const github = sanitizeUrl(data.githubUrl)

    const contactLine1Parts = []
    if (phone) contactLine1Parts.push(`\\href{tel:${phone}}{${escapeLatex(phone)}}`)
    if (email) contactLine1Parts.push(`\\href{mailto:${email}}{${escapeLatex(email)}}`)

    const linksParts = []
    if (linkedin) linksParts.push(`\\href{${linkedin}}{LinkedIn}`)
    if (portfolio) linksParts.push(`\\href{${portfolio}}{Portfolio}`)
    if (github) linksParts.push(`\\href{${github}}{GitHub}`)

    let header = `\\name{${name}}\n`
    if (linksParts.length) header += `\\address{\\textcolor{cobalt}{${linksParts.join(' $\\diamond$ ')}}}\n`
    if (contactLine1Parts.length) header += `\\address{\\textcolor{black}{${contactLine1Parts.join(' $\\diamond$ ')}}}\n`
    if (location) header += `\\address{${location}}\n`
    return header
}

const renderProfessionalSummary = (summary = '') => {
    const text = escapeLatex(String(summary || '').trim())
    if (!text) return ''

    return `\\vspace{-0.18cm}
\\begin{rSection}{Professional Summary}
\\justifying
${text}
\\end{rSection}
\\vspace{-0.18cm}
`
}

const renderWorkExperience = (entries = []) => {
    const valid = entries.filter(e => e && (e.company || e.role))
    if (!valid.length) return ''

    const blocks = valid.map(e => {
        const company = escapeLatex(e.company || '')
        const companyLink = sanitizeUrl(e.companyUrl)
        const role = escapeLatex(e.role || '')
        const dates = escapeLatex(e.dates || '')
        const location = escapeLatex(e.location || '')
        const bullets = renderBullets(splitBullets(e.bullets))

        const companyText = companyLink
            ? `{\\href{${companyLink}}{\\bf ${company}}}`
            : `{\\bf ${company}}`

        return `    ${companyText} \\hfill {${dates}} \\\\
    {${role}} \\hfill {${location}}
${bullets}`
    }).join('\n\n')

    return `\\vspace{-0.18cm}
\\begin{rSection}{Work Experience}
${blocks}
\\end{rSection}
\\vspace{-0.18cm}
`
}

const renderSkills = (skills = {}) => {
    const items = []
    if (skills.languages) items.push(['Programming Languages', skills.languages])
    if (skills.frameworks) items.push(['Framework', skills.frameworks])
    if (skills.databases) items.push(['Database', skills.databases])
    if (skills.tools) items.push(['Tools \\& Others', skills.tools])
    if (!items.length) return ''

    const lines = items
        .map(([label, value]) => `    \\item \\textbf{${label}:} ${escapeLatex(value)}`)
        .join('\n')

    return `\\vspace{-0.18cm}
\\begin{rSection}{Technical Skills}
\\begin{itemize}[leftmargin=0.4cm, label={\\Large \\textbullet}]
    \\setlength\\itemsep{-0.15cm}
${lines}
\\end{itemize}
\\end{rSection}
\\vspace{-0.18cm}
`
}

const renderProjects = (projects = []) => {
    const valid = projects.filter(p => p && p.name)
    if (!valid.length) return ''

    const blocks = valid.map(p => {
        const name = escapeLatex(p.name || '')
        const stack = escapeLatex(p.stack || '')
        const github = sanitizeUrl(p.githubUrl)
        const live = sanitizeUrl(p.liveUrl)
        const bullets = renderBullets(splitBullets(p.bullets), '-0.2cm', '-0.2cm')

        const linkParts = []
        if (github) linkParts.push(`\\href{${github}}{Github}`)
        if (live) linkParts.push(`\\href{${live}}{Live link}`)
        const linkLine = linkParts.length ? `\\hfill{${linkParts.join(' | ')}}` : ''

        const headerParts = [`{\\textbf{${name}}}`]
        if (stack) headerParts.push(`\\emph{${stack}}`)
        const header = headerParts.join(' $|$ ')

        return `${header}
${linkLine}
    \\vspace{-0.2cm}
${bullets}`
    }).join('\n\n')

    return `\\vspace{-0.18cm}
\\begin{rSection}{Personal Projects}

${blocks}

\\end{rSection}
\\vspace{-0.18cm}
`
}

const renderCertifications = (certs = []) => {
    const valid = certs.filter(c => c && (c.institution || c.course))
    if (!valid.length) return ''

    const lines = valid.map(c => {
        const institution = escapeLatex(c.institution || '')
        const course = escapeLatex(c.course || '')
        const url = sanitizeUrl(c.certificateUrl)
        const certBadge = url ? ` \\href{${url}}{\\textbf{(Certificate)}}` : ''
        return `    {\\bf ${institution}}${certBadge} - ${course}.`
    }).join('\n\n')

    return `\\vspace{-0.18cm}
\\begin{rSection}{Training \\& Certification}
${lines}
\\end{rSection}
\\vspace{-0.18cm}
`
}

const renderEducation = (entries = []) => {
    const valid = entries.filter(e => e && (e.institution || e.degree))
    if (!valid.length) return ''

    const blocks = valid.map(e => {
        const institution = escapeLatex(e.institution || '')
        const dates = escapeLatex(e.dates || '')
        const degree = escapeLatex(e.degree || '')
        const grade = escapeLatex(e.grade || '')
        return `    {\\bf ${institution}} \\hfill {${dates}} \\\\
    ${degree} \\hfill {${grade}}`
    }).join('\n\n')

    return `\\vspace{-0.18cm}
\\begin{rSection}{Education}
${blocks}
\\end{rSection}
\\vspace{-0.18cm}
`
}

const renderResearch = (research = {}) => {
    const title = escapeLatex(research.title || '')
    const stack = escapeLatex(research.stack || '')
    if (!title && !stack) return ''
    const headerParts = []
    if (title) headerParts.push(`{\\textbf{${title}}}`)
    if (stack) headerParts.push(`\\emph{${stack}}`)
    return `\\vspace{-0.18cm}
\\begin{rSection}{Research Experience}
${headerParts.join(' $|$ ')}
\\end{rSection}
`
}

const renderBulletSection = (title, text = '') => {
    const bullets = renderBullets(splitBullets(text))
    if (!bullets) return ''

    return `\\vspace{-0.18cm}
\\begin{rSection}{${title}}
${bullets}
\\end{rSection}
\\vspace{-0.18cm}
`
}

export const buildResumeLatex = (data = {}) => {
    const preamble = `\\documentclass{resume}

% FONT SETTING
\\usepackage{fontspec}
\\setmainfont[Scale=0.9]{Trebuchet MS}

\\usepackage[left=0.75in,top=0.6in,right=0.75in,bottom=0.6in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{ragged2e}

\\definecolor{blue(pigment)}{rgb}{0.2, 0.2, 0.6}
\\definecolor{blue(ncs)}{rgb}{0.0, 0.53, 0.74}
\\definecolor{blue(munsell)}{rgb}{0.0, 0.5, 0.69}
\\definecolor{cobalt}{rgb}{0.0, 0.28, 0.67}

\\hypersetup{hidelinks}
`

    const header = renderHeader(data)
    const sections = {
        summary: renderProfessionalSummary(data.summary || ''),
        experience: renderWorkExperience(data.experiences),
        skills: renderSkills(data.skills),
        projects: renderProjects(data.projects),
        certifications: renderCertifications(data.certifications),
        education: renderEducation(data.educations),
        research: renderResearch(data.research),
        achievements: renderBulletSection('Achievements', data.achievements),
        softSkills: renderBulletSection('Soft Skills', data.softSkills),
        languages: renderBulletSection('Languages', data.languages),
    }
    const requestedOrder = Array.isArray(data.sectionOrder) && data.sectionOrder.length ? data.sectionOrder : DEFAULT_SECTION_ORDER
    const orderedSections = [...requestedOrder, ...DEFAULT_SECTION_ORDER.filter(key => !requestedOrder.includes(key))]
    const body = orderedSections.map(key => sections[key]).filter(Boolean).join('\n')

    return `${preamble}
${header}
\\begin{document}
\\fontsize{11pt}{13pt}\\selectfont

\\vspace{-0.15cm}

${body}

\\end{document}
`
}

export { escapeLatex, splitBullets }
