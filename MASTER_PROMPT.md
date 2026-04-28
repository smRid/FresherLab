# PROJECT TASK: Convert Existing Photonix AI Project into FresherLab

You are a senior full-stack SaaS engineer. I have an existing full-stack project called Photonix AI. Your task is to professionally convert it into a fresher-focused IT job preparation SaaS named **FresherLab**.

FresherLab is NOT a hiring platform. It does not hire people. It guides freshers to become job-ready using AI tools like resume review, resume builder, ATS checker, cover letter generator, job email generator, job description analyzer, grammar enhancer, GitHub README generator, learning roadmap generator, code snippet generator, LinkedIn post generator, and job application tracker.

---

# 1. Existing Project Context

The current project already includes:

- React 19 frontend
- Vite 7
- Tailwind CSS 4
- React Router 7
- Clerk authentication
- Express 5 backend
- Neon PostgreSQL
- Cloudinary
- Gemini API through OpenAI SDK
- Axios
- Protected dashboard
- Creation history
- Subscription/premium gating
- Existing AI text tools
- Existing resume PDF review using `pdf-parse`
- Existing README generator
- Existing grammar enhancer
- Existing cover letter generator
- Existing email generator

The project already has hidden/unrouted pages for:

- Resume Review
- Cover Letter Generator
- Grammar Enhancer
- Email Generator
- README Generator
- OCR / Image to Text

Use these existing pages and APIs where possible. Do not rebuild from zero.

---

# 2. New Product Name

Rename the full product from:

Photonix AI

to:

FresherLab

Tagline:

Your AI-powered job preparation workspace for freshers.

Alternative tagline:

Build your resume, improve your skills, and get job-ready with AI.

---

# 3. Main Goal

Transform the existing image-focused AI workspace into a professional fresher career preparation SaaS.

FresherLab should help freshers:

1. Improve resumes
2. Build resumes from scratch
3. Check ATS score
4. Generate cover letters
5. Generate job emails
6. Analyze job descriptions
7. Improve grammar and tone
8. Generate professional GitHub README files
9. Create personalized learning plans
10. Generate code snippets for learning
11. Generate LinkedIn posts
12. Track job applications

---

# 4. Important Development Rules

## Do not rebuild from scratch

Reuse the existing:

- Auth system
- Layout
- Dashboard structure
- Sidebar structure
- API structure
- Gemini setup
- Neon database connection
- Clerk premium logic
- Existing controller patterns
- Existing creation history
- Existing frontend pages where possible

## Remove image-first positioning

Hide or remove these from main navigation:

- Generate Images
- Remove Background
- Remove Object
- Image Enhancer
- Photo Restoration
- Background Blur
- Logo Generator
- YouTube Thumbnail Generator

Do not delete the backend image code immediately unless necessary. First remove them from the active UI.

## Make the SaaS feel professional

The final app should look like a premium SaaS dashboard, not a demo project.

Use:

- Clean cards
- Modern dashboard layout
- Strong empty states
- Role-based forms
- Clear AI output sections
- Export/copy buttons
- Loading states
- Error states
- Responsive design

---

# 5. Phase 1: Rebrand the Project

Update all visible branding from Photonix AI to FresherLab.

## Files to update

Search and update these files:

- `README.md`
- `document.md`
- `client/index.html`
- `client/src/components/Navbar.jsx`
- `client/src/components/Footer.jsx`
- `client/src/components/Hero.jsx`
- `client/src/components/AiTools.jsx`
- `client/src/components/Sidebar.jsx`
- `client/src/pages/Dashboard.jsx`
- Any logo/title/meta references

## New homepage copy

Hero heading:

Become Job-Ready Faster with AI

Hero subheading:

FresherLab helps freshers improve resumes, optimize for ATS, generate cover letters, write job emails, build GitHub READMEs, create learning plans, and track job applications from one powerful workspace.

CTA buttons:

Start Free
Open Dashboard

Feature section title:

Everything Freshers Need to Get Job-Ready

Pricing section:

Choose the plan that supports your job preparation journey.



# Phase 2: Update Routes

Open:

client/src/App.jsx

Import the existing hidden career pages:

import ReviewResume from './pages/ReviewResume';
import CoverLetterGenerator from './pages/CoverLetterGenerator';
import GrammarEnhancer from './pages/GrammarEnhancer';
import EmailGenerator from './pages/EmailGenerator';
import ReadmeGenerator from './pages/ReadmeGenerator';

Create and import new pages:

import ResumeBuilder from './pages/ResumeBuilder';
import AtsScoreChecker from './pages/AtsScoreChecker';
import JobDescriptionAnalyzer from './pages/JobDescriptionAnalyzer';
import LearningPlanGenerator from './pages/LearningPlanGenerator';
import CodeSnippetGenerator from './pages/CodeSnippetGenerator';
import LinkedInPostGenerator from './pages/LinkedInPostGenerator';
import JobTracker from './pages/JobTracker';

Inside the protected /ai route, add:

<Route index element={<Dashboard />} />
<Route path="resume-review" element={<ReviewResume />} />
<Route path="resume-builder" element={<ResumeBuilder />} />
<Route path="ats-checker" element={<AtsScoreChecker />} />
<Route path="cover-letter" element={<CoverLetterGenerator />} />
<Route path="grammar-enhancer" element={<GrammarEnhancer />} />
<Route path="job-email-generator" element={<EmailGenerator />} />
<Route path="job-description-analyzer" element={<JobDescriptionAnalyzer />} />
<Route path="readme-generator" element={<ReadmeGenerator />} />
<Route path="learning-plan" element={<LearningPlanGenerator />} />
<Route path="code-snippet-generator" element={<CodeSnippetGenerator />} />
<Route path="linkedin-post-generator" element={<LinkedInPostGenerator />} />
<Route path="job-tracker" element={<JobTracker />} />


# Phase 3: Update Sidebar Navigation 

Open:

client/src/components/Sidebar.jsx

Replace image-tool navigation with FresherLab navigation.

Use this structure:

const navItems = [
  {
    name: 'Dashboard',
    path: '/ai',
    icon: LayoutDashboard,
  },
  {
    name: 'Resume Review',
    path: '/ai/resume-review',
    icon: FileSearch,
  },
  {
    name: 'Resume Builder',
    path: '/ai/resume-builder',
    icon: FileText,
  },
  {
    name: 'ATS Score Checker',
    path: '/ai/ats-checker',
    icon: BarChart3,
  },
  {
    name: 'Cover Letter',
    path: '/ai/cover-letter',
    icon: Mail,
  },
  {
    name: 'Job Email Generator',
    path: '/ai/job-email-generator',
    icon: Send,
  },
  {
    name: 'Grammar Enhancer',
    path: '/ai/grammar-enhancer',
    icon: PenTool,
  },
  {
    name: 'JD Analyzer',
    path: '/ai/job-description-analyzer',
    icon: Search,
  },
  {
    name: 'README Generator',
    path: '/ai/readme-generator',
    icon: Github,
  },
  {
    name: 'Learning Plan',
    path: '/ai/learning-plan',
    icon: BookOpen,
  },
  {
    name: 'Code Snippet',
    path: '/ai/code-snippet-generator',
    icon: Code2,
  },
  {
    name: 'LinkedIn Post',
    path: '/ai/linkedin-post-generator',
    icon: Linkedin,
  },
  {
    name: 'Job Tracker',
    path: '/ai/job-tracker',
    icon: BriefcaseBusiness,
  },
];

Use icons from lucide-react.

# Phase 4: Update Dashboard

Open:

client/src/pages/Dashboard.jsx

Transform the dashboard from creation-history-only into a career progress dashboard.

Dashboard cards

Add these cards:

Total AI Generations
Resumes Reviewed
Cover Letters Created
Jobs Tracked
Current Plan
Latest Activity
Dashboard sections

Add:

Quick Actions

Cards:

Review Resume
Build Resume
Check ATS Score
Generate Cover Letter
Analyze Job Description
Track Job Application

Add:

Recent AI Outputs

Use existing:

GET /api/user/get-user-creations

Filter by career types:

[
  'resume-review',
  'resume-builder',
  'cover-letter',
  'grammar-enhancement',
  'email',
  'job-email',
  'readme',
  'ats-score',
  'job-description-analysis',
  'learning-plan',
  'linkedin-post',
  'code-snippet'
]


# Phase 5: Improve Existing Resume Review

The backend already supports resume PDF upload and uses pdf-parse.

Open:

server/controllers/aiController.js

Find:

resumeReview

Upgrade it.

New input fields

Frontend should send:

resume: File
target_role: string
experience_level: string
job_description?: string

Example target roles:

Frontend Developer
Backend Developer
Full Stack Developer
MERN Stack Developer
DevOps Engineer
QA Engineer
UI/UX Designer
Data Analyst
New AI prompt

Use this prompt:

You are a senior technical recruiter, ATS resume expert, and career mentor for fresher IT candidates.

Analyze the resume deeply for the target role.

Target Role: {target_role}
Experience Level: {experience_level}
Optional Job Description: {job_description}

Resume Text:
{resumeText}

Return the response in clean Markdown with this exact structure:

# Resume Review Report

## 1. Overall Score
Give score out of 100 with short reason.

## 2. ATS Compatibility Score
Give score out of 100.

## 3. Role Match Score
Explain how suitable this resume is for the target role.

## 4. Strengths
List strong parts of the resume.

## 5. Weaknesses
List weak parts clearly.

## 6. Missing Sections
Mention missing sections such as summary, projects, tech stack, links, achievements, metrics, certifications, or experience.

## 7. Skills Found
Group skills into:
- Programming Languages
- Frameworks
- Databases
- Tools
- Soft Skills

## 8. Missing Skills for This Role
List important missing skills based on the target role.

## 9. Project Improvement Suggestions
Suggest how to improve project descriptions using impact, tech stack, and measurable outcomes.

## 10. Formatting and Layout Suggestions
Give practical formatting advice.

## 11. Grammar and Clarity Fixes
Mention confusing or weak wording.

## 12. Suggested Professional Summary
Write an improved resume summary for this candidate.

## 13. Action Plan
Give a 7-day improvement plan.

Keep the response professional, direct, and actionable.

Save the creation as:

type: 'resume-review'

# Phase 6: Build ATS Score Checker

Create frontend page:

client/src/pages/AtsScoreChecker.jsx

Create backend route:

POST /api/ai/ats-score
Frontend fields
Resume PDF upload
Job description textarea
Target role
Experience level
Backend behavior
Accept resume PDF using multer.
Extract text using pdf-parse.
Compare resume text with job description.
Ask Gemini to generate structured ATS report.
Save to creations.
AI prompt
You are an ATS optimization expert and technical recruiter.

Compare this resume with the job description.

Target Role: {target_role}
Experience Level: {experience_level}

Resume:
{resumeText}

Job Description:
{jobDescription}

Return Markdown with this exact structure:

# ATS Score Report

## Overall ATS Score
Score out of 100.

## Keyword Match Score
Score out of 100.

## Role Match Score
Score out of 100.

## Matched Keywords
List matched skills, tools, technologies, and action verbs.

## Missing Keywords
List important missing keywords from the job description.

## Weak Sections
Mention resume sections that need improvement.

## Recommended Phrases to Add
Give ATS-friendly bullet phrases the user can add.

## Optimized Resume Summary
Rewrite the summary for this job.

## Project Bullet Improvements
Rewrite 3 stronger project bullets using action verbs and measurable impact.

## Final Recommendation
Tell the user whether they should apply now or improve first.

Creation type:

'ats-score'


Phase 7: Build AI Resume Builder

Create page:

client/src/pages/ResumeBuilder.jsx

Create backend route:

POST /api/ai/build-resume
Frontend sections

Use a multi-step form.

Step 1: Personal Info
Full name
Email
Phone
Location
LinkedIn
GitHub
Portfolio
Step 2: Career Target
Target role
Experience level
Preferred tech stack
Step 3: Education
Degree
Institution
Year
CGPA/result
Step 4: Skills
Programming languages
Frameworks
Databases
Tools
Soft skills
Step 5: Projects

Allow multiple projects:

Project name
Description
Tech stack
Features
GitHub link
Live link
Step 6: Certifications

Optional.


# Step 7: Generate Resume

Generate professional resume content.

Output format

Show:

Professional Summary
Skills
Projects
Education
Certifications
Final Resume Markdown

Add buttons:

Copy
Download PDF
Download Markdown
Download TXT

For PDF export, use browser print first or a simple frontend export method.

AI prompt
You are an expert technical resume writer for fresher software engineers.

Create a professional ATS-friendly resume from the user's information.

User Data:
{JSON.stringify(userData)}

Rules:
- Keep it suitable for fresher IT candidates.
- Make project descriptions strong and technical.
- Use action verbs.
- Avoid fake experience.
- Do not invent companies or jobs.
- Highlight projects, skills, education, GitHub, and portfolio.
- Keep formatting clean and ATS-friendly.
- Use Markdown.

Return:

# Resume

## Professional Summary

## Technical Skills

## Projects

## Education

## Certifications

## Links

## Final Improvement Tips

Creation type:

'resume-builder'


# Phase 8: Improve Existing Cover Letter Generator

Existing route:

POST /api/ai/generate-cover-letter

Existing page:

CoverLetterGenerator.jsx

Upgrade fields:

Job title
Company name
Job description
Resume highlights
Tone
Experience level
Candidate name
Key achievements
Skills to emphasize

Tone options:

Professional
Confident
Passionate
Friendly
Short and direct

Output:

Full cover letter
Short version
Email version
Best subject line

Creation type:

'cover-letter'


# Phase 9: Improve Existing Job Email Generator

Existing route:

POST /api/ai/generate-email

Existing page:

EmailGenerator.jsx

Rename in UI:

Smart Job Email Generator

Email types:

Cold outreach
Follow-up
Thank you
Referral request
Internship request
Recruiter message
Interview availability reply

Fields:

Email type
Recruiter/company name
Job role
Company
User background
Tone
Key points

Output:

Subject line options
Email body
Short LinkedIn DM version
Follow-up version

Creation type:

'job-email'

# Phase 10: Improve Existing Grammar Enhancer

Existing route:

POST /api/ai/enhance-grammar

Existing page:

GrammarEnhancer.jsx

Update UI to support:

Resume bullet improvement
Email polishing
Cover letter polishing
LinkedIn post polishing
General grammar

Fields:

Text
Tone
Enhancement level
Purpose

Output:

Improved version
What changed
Readability score
Tone feedback

Creation type:

'grammar-enhancement'

# Phase 11: Improve Existing README Generator

Existing route:

POST /api/ai/generate-readme

Existing page:

ReadmeGenerator.jsx

Update for fresher portfolio projects.

Fields:

Project title
Description
Tech stack
Features
Installation steps
Usage
Screenshots placeholder
Live demo link
GitHub repo link
License
Deployment platform

Output sections:

# Project Title

## Overview

## Features

## Tech Stack

## Screenshots

## Installation

## Environment Variables

## Usage

## Live Demo

## GitHub Repository

## What I Learned

## Future Improvements

## License

Creation type:

'readme'

# Phase 12: Build Job Description Analyzer

Create frontend:

client/src/pages/JobDescriptionAnalyzer.jsx

Create backend route:

POST /api/ai/analyze-jd

Fields:

Job title
Job description
User current skills
Experience level

AI output:

# Job Description Analysis

## Required Skills

## Preferred Skills

## Tools and Technologies

## Experience Level Detected

## ATS Keywords

## Responsibilities Summary

## Resume Gap Analysis

## Skills You Should Learn First

## Suggested Projects to Match This Job

## Application Strategy

Creation type:

'job-description-analysis'

# Phase 13: Build Learning Plan Generator

Create frontend:

client/src/pages/LearningPlanGenerator.jsx

Create backend route:

POST /api/ai/learning-plan

Fields:

Target role
Current skill level
Current skills
Weak areas
Duration: 1 week, 1 month, 3 months
Daily available time
Preferred learning style

AI output:

# Personalized Learning Plan

## Target Role

## Current Level Analysis

## Skills to Learn

## Weekly Roadmap

## Daily Tasks

## Practice Projects

## Free Resources

## GitHub Project Ideas

## Interview Preparation Tasks

## Final Checklist

Creation type:

'learning-plan'

# Phase 14: Build Code Snippet Generator

Create frontend:

client/src/pages/CodeSnippetGenerator.jsx

Create backend route:

POST /api/ai/code-snippet

Fields:

Language/framework
Prompt
Difficulty level
Include comments: yes/no
Include explanation: yes/no
Include test case: yes/no

Output:

Code
Explanation
Test case
Common mistakes
Beginner-friendly notes

Creation type:

'code-snippet'

Important: This is for learning and job preparation. Do not generate harmful hacking, malware, credential theft, exploit, or abuse code.

# Phase 15: Build LinkedIn Post Generator

Create frontend:

client/src/pages/LinkedInPostGenerator.jsx

Create backend route:

POST /api/ai/linkedin-post

Fields:

Post type
Topic
Achievement/project/certification
Tone
Target audience
CTA

Post types:

Job seeking
Project showcase
Internship update
Certification
Learning progress
Interview experience
Portfolio launch

Output:

Main post
Short version
Hashtags
CTA
Suggested first comment

Creation type:

'linkedin-post'

# Phase 16: Build Job Apply Tracker

This is not just AI generation. This needs real database CRUD.

Add database table

Open:

server/config/initDb.js

Add:

CREATE TABLE IF NOT EXISTS job_applications (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  job_url TEXT,
  location TEXT,
  salary_range TEXT,
  status TEXT NOT NULL DEFAULT 'Applied',
  source TEXT,
  contact_name TEXT,
  contact_email TEXT,
  notes TEXT,
  follow_up_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

Statuses:

Saved
Applied
Interview
Assignment
Offer
Rejected
Create routes

Create:

server/routes/jobRoutes.js

Routes:

GET /api/jobs
POST /api/jobs
GET /api/jobs/:id
PUT /api/jobs/:id
DELETE /api/jobs/:id

Mount in:

server/server.js
app.use('/api/jobs', requireAuth(), auth, jobRoutes);
Create controller

Create:

server/controllers/jobController.js

Functions:

getJobs
createJob
getJobById
updateJob
deleteJob

Always filter by:

user_id = req.auth().userId

Never allow one user to access another user’s jobs.

Frontend page

Create:

client/src/pages/JobTracker.jsx

Features:

Add job modal
Job table
Status filter
Search company/role
Follow-up date
Notes
Delete confirmation
Dashboard stats

Cards:

Total Applied
Interviews
Offers
Rejected
Follow-ups Due

# Phase 17: Update User Creation Rendering

Open:

client/src/components/CreationItem.jsx

Update it so all FresherLab text generations render as Markdown.

Supported text creation types:

const textTypes = [
  'resume-review',
  'resume-builder',
  'ats-score',
  'cover-letter',
  'job-email',
  'grammar-enhancement',
  'readme',
  'job-description-analysis',
  'learning-plan',
  'code-snippet',
  'linkedin-post'
];

If content is text or Markdown, render with ReactMarkdown.

Add:

Copy button
Download .txt
Download .md

# Phase 18: Add Shared Axios Client

Current project sets Axios base URL in multiple pages.

Create:

client/src/lib/api.js

Code:

import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

Usage pattern:

const token = await getToken();

const { data } = await api.post('/api/ai/ats-score', formData, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

Replace repeated:

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

with shared client usage.

# Phase 19: Add Validation

Add basic validation on frontend and backend.

Recommended package:

npm install zod

Use Zod for text APIs.

Validate:

Required fields
Maximum input length
File type
File size
Empty job description
Empty resume upload

PDF max size:

5MB

Text max size:

10,000 characters

# Phase 20: Improve API Error Handling

Improve controller responses to use proper status codes:

400 for validation errors
401 for unauthenticated
403 for premium restriction
500 for server errors

Still keep response shape:

{
  success: false,
  message: "Readable error message"
}

Success shape:

{
  success: true,
  message: "Operation completed successfully",
  content: result
}

# Phase 21: Update Pricing / Usage Logic

Current free usage logic gives limited free usage and premium unlimited.

Update plan logic:

Free Plan
3 resume reviews/month
3 cover letters/month
5 grammar enhancements/month
3 job emails/month
Basic README generator
Job tracker limit: 20 applications
Pro Plan
Unlimited AI tools
ATS score checker
Resume builder export
Learning plans
LinkedIn posts
Unlimited job tracker
Advanced dashboard

For MVP, if monthly reset is complex, keep existing free_usage logic but rename UI limits clearly.

Later improve using a new usage table.

Phase 22: Add Download / Export Features

For generated text outputs, add:

Copy button
Download .txt
Download .md

For resume builder:

Copy Markdown
Download .md
Print to PDF using browser print first
Later add proper PDF export

For cover letter:

Download .txt
Copy email format

For README:

Download README.md

# Phase 23: Security and Safety

Do not expose API keys on frontend.

Keep these in server env:

GEMINI_API_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

Client env:

VITE_CLERK_PUBLISHABLE_KEY=
VITE_BASE_URL=

For code snippet generator, block unsafe prompts related to:

Malware
Phishing
Credential stealing
Exploit automation
Bypassing security
Bot spam
Harmful hacking

Return safe educational alternatives instead.

Final MVP Checklist

Before finishing, make sure these work:

Auth
User can sign in
User can sign out
Protected routes block unauthenticated users
Dashboard
Shows user stats
Shows quick actions
Shows recent generations
Resume Review
Upload PDF
Select target role
Generate structured report
Save to history
ATS Checker
Upload resume
Paste job description
Generate ATS score
Show missing keywords
Resume Builder
Fill form
Generate resume
Copy/export result
Cover Letter
Generate personalized cover letter
Job Email
Generate cold email/follow-up/referral email
Grammar Enhancer
Improve text and tone
README Generator
Generate portfolio-ready README
JD Analyzer
Extract skills and gaps
Learning Plan
Generate roadmap
LinkedIn Post
Generate post and hashtags
Job Tracker
Add job
Edit job
Delete job
Filter by status
Save per user
30. Final Expected Result

The final app should be a polished SaaS named FresherLab.

It should feel like:

A complete AI job preparation workspace for fresher IT candidates.

It should not feel like Photonix AI anymore.

It should not focus on image tools.

It should reuse the existing codebase intelligently and only build what is missing.

Build cleanly, step by step, with production-ready structure, reusable components, proper error handling, responsive UI, and professional SaaS-level user experience.