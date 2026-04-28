import { z } from 'zod';

const MAX_TEXT = 10000;
const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5MB

// ─── AI Text Tool Schemas ────────────────────────────────────

export const grammarSchema = z.object({
    text: z.string().min(5, 'Text must be at least 5 characters').max(MAX_TEXT, `Text must be under ${MAX_TEXT} characters`),
    tone: z.string().optional(),
    enhancement_level: z.string().optional(),
    purpose: z.string().optional(),
});

export const coverLetterSchema = z.object({
    job_title: z.string().min(1, 'Job title is required').max(200),
    company_name: z.string().min(1, 'Company name is required').max(200),
    job_description: z.string().max(MAX_TEXT).optional(),
    resume_highlights: z.string().max(MAX_TEXT).optional(),
    candidate_name: z.string().max(200).optional(),
    key_achievements: z.string().max(MAX_TEXT).optional(),
    skills_to_emphasize: z.string().max(MAX_TEXT).optional(),
    tone: z.string().optional(),
    experience_level: z.string().optional(),
});

export const emailSchema = z.object({
    purpose: z.string().optional(),
    tone: z.string().optional(),
    recipient: z.string().max(200).optional(),
    job_role: z.string().min(1, 'Job role is required').max(200),
    company: z.string().min(1, 'Company is required').max(200),
    user_background: z.string().max(MAX_TEXT).optional(),
    key_points: z.string().max(MAX_TEXT).optional(),
});

export const readmeSchema = z.object({
    project_title: z.string().min(1, 'Project title is required').max(200),
    description: z.string().min(1, 'Description is required').max(MAX_TEXT),
    tech_stack: z.string().max(500).optional(),
    installation: z.string().max(MAX_TEXT).optional(),
    usage: z.string().max(MAX_TEXT).optional(),
    features: z.string().max(MAX_TEXT).optional(),
    github_url: z.string().url().optional().or(z.literal('')),
    demo_url: z.string().url().optional().or(z.literal('')),
    license: z.string().optional(),
});

export const jobApplicationSchema = z.object({
    company: z.string().min(1, 'Company is required').max(200),
    role: z.string().min(1, 'Role is required').max(200),
    status: z.enum(['Saved', 'Applied', 'Interview', 'Assignment', 'Offer', 'Rejected']).optional(),
    job_url: z.string().url().optional().or(z.literal('')),
    location: z.string().max(200).optional(),
    salary_range: z.string().max(100).optional(),
    source: z.string().max(200).optional(),
    contact_name: z.string().max(200).optional(),
    contact_email: z.string().email().optional().or(z.literal('')),
    notes: z.string().max(MAX_TEXT).optional(),
    follow_up_date: z.string().optional(),
});

// ─── File Validation Helpers ─────────────────────────────────

export const validatePdfUpload = (file) => {
    if (!file) return 'Please upload a resume PDF.';
    if (file.size > MAX_PDF_SIZE) return 'Resume file size exceeds 5MB.';
    if (!file.originalname?.toLowerCase().endsWith('.pdf') && file.mimetype !== 'application/pdf') return 'Only PDF files are accepted.';
    return null;
};

// ─── Middleware ───────────────────────────────────────────────

export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const message = result.error.errors.map(e => e.message).join(', ');
        return res.status(400).json({ success: false, message });
    }
    req.body = result.data;
    next();
};
