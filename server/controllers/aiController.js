import OpenAI from "openai";
import sql from "../config/db.js";
// clerkClient removed — usage tracking via subscriptions table
import axios from "axios";
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";
import { getLimit } from "../config/usageLimits.js";
import { buildResumeLatex, splitBullets } from "../utils/latexResume.js";


const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

const cleanupUploadedFile = (file) => {
    if (file?.path) fs.unlink(file.path, () => { });
}

const ATS_STOP_WORDS = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'you', 'your', 'are', 'will', 'our', 'from', 'have', 'has', 'using',
    'use', 'used', 'work', 'team', 'teams', 'role', 'candidate', 'experience', 'skills', 'ability', 'strong', 'good',
    'excellent', 'knowledge', 'understanding', 'responsible', 'including', 'such', 'etc', 'job', 'description', 'about',
    'within', 'across', 'their', 'they', 'them', 'must', 'should', 'required', 'requirements', 'preferred', 'plus'
]);

const ATS_SKILL_KEYWORDS = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'go', 'ruby', 'sql', 'html', 'css',
    'react', 'next.js', 'node.js', 'express.js', 'vue', 'angular', 'django', 'flask', 'spring boot', 'tailwind',
    'bootstrap', 'redux', 'rest api', 'graphql', 'mongodb', 'mysql', 'postgresql', 'firebase', 'redis',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'github', 'ci/cd', 'linux', 'vercel',
    'testing', 'jest', 'cypress', 'selenium', 'figma', 'ui/ux', 'responsive design', 'api', 'database'
];

const normalizeAtsText = (value = '') => String(value)
    .toLowerCase()
    .replace(/node\.js/g, 'node.js')
    .replace(/next\.js/g, 'next.js')
    .replace(/express\.js/g, 'express.js')
    .replace(/ci\/cd/g, 'ci/cd')
    .replace(/[^a-z0-9+#./\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const keywordExists = (normalizedText, keyword) => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|\\s)${escaped}(\\s|$)`, 'i').test(normalizedText);
}

const extractAtsKeywords = (text = '') => {
    const normalized = normalizeAtsText(text);
    const foundSkills = ATS_SKILL_KEYWORDS.filter(keyword => normalized.includes(keyword));
    const words = normalized.match(/[a-z][a-z0-9+#.]{2,}/g) || [];
    const counts = new Map();

    words.forEach(word => {
        if (ATS_STOP_WORDS.has(word) || /^\d+$/.test(word)) return;
        counts.set(word, (counts.get(word) || 0) + 1);
    });

    const frequentWords = [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 35)
        .map(([word]) => word);

    return [...new Set([...foundSkills, ...frequentWords])].slice(0, 45);
}

const formatMarkdownList = (items, fallback) => {
    if (!items.length) return `- ${fallback}`;
    return items.map(item => `- ${item}`).join('\n');
}

const buildLocalAtsReport = ({ resumeText, jobDescription, target_role, experience_level }) => {
    const normalizedResume = normalizeAtsText(resumeText);
    const jdKeywords = extractAtsKeywords(jobDescription);
    const matchedKeywords = jdKeywords.filter(keyword => keywordExists(normalizedResume, keyword));
    const missingKeywords = jdKeywords.filter(keyword => !keywordExists(normalizedResume, keyword));
    const roleKeywords = extractAtsKeywords(target_role || '').filter(keyword => !['developer', 'engineer'].includes(keyword));
    const matchedRoleKeywords = roleKeywords.filter(keyword => keywordExists(normalizedResume, keyword));

    const keywordScore = jdKeywords.length ? Math.round((matchedKeywords.length / jdKeywords.length) * 100) : 60;
    const roleMatchScore = roleKeywords.length ? Math.round((matchedRoleKeywords.length / roleKeywords.length) * 100) : keywordScore;
    const sectionChecks = [
        /education|university|college|bachelor|degree|cgpa|gpa/.test(normalizedResume),
        /project|projects|github|portfolio/.test(normalizedResume),
        /skill|skills|technologies|tools/.test(normalizedResume),
        /experience|intern|developer|engineer|work/.test(normalizedResume),
        /mail|email|linkedin|phone|\+?\d{7,}/.test(normalizedResume)
    ];
    const sectionScore = Math.round((sectionChecks.filter(Boolean).length / sectionChecks.length) * 100);
    const overallScore = Math.round((keywordScore * 0.55) + (roleMatchScore * 0.25) + (sectionScore * 0.20));

    const weakSections = [];
    if (!sectionChecks[0]) weakSections.push('Education section is missing or not clearly labeled.');
    if (!sectionChecks[1]) weakSections.push('Projects/GitHub/portfolio information should be clearer.');
    if (!sectionChecks[2]) weakSections.push('Technical skills section should be easier for ATS to parse.');
    if (!sectionChecks[3]) weakSections.push('Experience, internship, or practical work section needs stronger wording.');
    if (missingKeywords.length > matchedKeywords.length) weakSections.push('Resume is missing several important job-description keywords.');

    const recommendedKeywords = missingKeywords.slice(0, 8);
    const recommendedPhrases = recommendedKeywords.length
        ? recommendedKeywords.map(keyword => `Add a bullet showing practical experience with ${keyword}.`)
        : ['Add measurable outcomes to existing project and experience bullets.'];

    const summarySkills = matchedKeywords.slice(0, 6).join(', ') || 'relevant technical skills';

    return `# ATS Score Report

## Overall ATS Score
${overallScore}/100

This score is calculated from keyword match, role alignment, and ATS-readable resume sections.

## Keyword Match Score
${keywordScore}/100

## Role Match Score
${roleMatchScore}/100

Target Role: ${target_role || 'Software Engineer'}
Experience Level: ${experience_level || 'Fresher'}

## Matched Keywords
${formatMarkdownList(matchedKeywords.slice(0, 20), 'No strong job-description keyword matches were found.')}

## Missing Keywords
${formatMarkdownList(missingKeywords.slice(0, 20), 'No major missing keywords detected from the provided job description.')}

## Weak Sections
${formatMarkdownList(weakSections, 'No critical section gaps detected. Improve impact metrics and role-specific wording.')}

## Recommended Phrases to Add
${formatMarkdownList(recommendedPhrases, 'Add concise action-verb bullets with measurable outcomes.')}

## Optimized Resume Summary
Fresher ${target_role || 'software engineering'} candidate with hands-on experience in ${summarySkills}. Skilled at building practical projects, learning quickly, and translating requirements into clean, maintainable solutions.

## Project Bullet Improvements
- Built responsive features aligned with user requirements and improved usability across devices.
- Integrated APIs and managed data flow to support real-world application workflows.
- Improved code quality by organizing reusable components, validation, and error handling.

## Final Recommendation
${overallScore >= 75 ? 'You can apply now, but add measurable achievements where possible.' : overallScore >= 55 ? 'Improve missing keywords and strengthen project bullets before applying.' : 'Improve keyword alignment, skills visibility, and project descriptions before applying.'}
`;
}

const clampNumber = (value, min, max, fallback) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
}

const getImageDimensions = (aspectRatio = '1:1', customWidth, customHeight) => {
    if (aspectRatio === '16:9') return { width: 1280, height: 720 };
    if (aspectRatio === '9:16') return { width: 720, height: 1280 };
    if (aspectRatio === 'Custom') {
        return {
            width: clampNumber(customWidth, 256, 2048, 1024),
            height: clampNumber(customHeight, 256, 2048, 1024)
        };
    }
    return { width: 1024, height: 1024 };
}

const buildImagePrompt = ({
    prompt,
    style,
    negative_prompt,
    seed,
    brand_name,
    brand_colors,
    brand_notes,
    face_consistency,
    transparent_background,
    commercial_license
}) => {
    const parts = [
        prompt,
        style ? `Style preset: ${style}.` : '',
        brand_name ? `Brand/campaign: ${brand_name}.` : '',
        brand_colors ? `Use brand colors: ${brand_colors}.` : '',
        brand_notes ? `Brand direction: ${brand_notes}.` : '',
        face_consistency ? 'Keep faces consistent, natural, and recognizable across variations.' : '',
        transparent_background ? 'Isolate the subject for transparent PNG output.' : '',
        commercial_license ? 'Design as a polished commercial-use visual.' : '',
        seed ? `Seed reference: ${seed}.` : '',
        negative_prompt ? `Avoid: ${negative_prompt}.` : ''
    ];

    return parts.filter(Boolean).join(' ');
}


export const generateArticle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." })
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{
                role: "user",
                content: prompt,
            },
            ],
            temperature: 0.7,
            max_tokens: length,
        });

        const content = response.choices[0].message.content

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'article');`;

        if (plan !== 'premium') {
            await sql`UPDATE subscriptions SET free_usage = free_usage + 1, updated_at = NOW() WHERE user_id = ${userId}`;
        }

        res.json({
            success: true,
            message: "Article generated successfully",
            content: content,
            usage: plan !== 'premium' ? free_usage + 1 : 'unlimited'
        });

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." })
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{
                role: "user",
                content: prompt,
            },
            ],
            temperature: 0.7,
            max_tokens: 100,
        });

        const content = response.choices[0].message.content

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'blog-title');`;

        if (plan !== 'premium') {
            await sql`UPDATE subscriptions SET free_usage = free_usage + 1, updated_at = NOW() WHERE user_id = ${userId}`;
        }

        res.json({
            success: true,
            message: "Blog generated successfully",
            content: content,
            usage: plan !== 'premium' ? free_usage + 1 : 'unlimited'
        });

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export const generateImage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const {
            prompt,
            publish,
            aspect_ratio,
            custom_width,
            custom_height,
            batch_count,
            transparent_background
        } = req.body;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions." })
        }

        if (!prompt || !prompt.trim()) {
            return res.json({ success: false, message: "Please provide an image prompt." })
        }

        const count = clampNumber(batch_count, 1, 4, 1);
        const { width, height } = getImageDimensions(aspect_ratio, custom_width, custom_height);
        const imagePrompt = buildImagePrompt(req.body);
        const isTransparent = transparent_background === true || transparent_background === 'true';
        const generatedImages = [];

        for (let index = 0; index < count; index += 1) {
            const formData = new FormData()
            formData.append('prompt', count > 1 ? `${imagePrompt} Variation ${index + 1}.` : imagePrompt)
            const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
                headers: { 'x-api-key': process.env.SECRET_API_KEY },
                responseType: "arraybuffer",
            })

            const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;
            const uploadOptions = {
                transformation: [
                    { width, height, crop: "fill", gravity: "auto" },
                    ...(isTransparent ? [{ effect: 'background_removal', background_removal: 'remove_the_background' }] : []),
                    { quality: "auto:best" },
                    { fetch_format: "png" }
                ]
            }

            const { secure_url } = await cloudinary.uploader.upload(base64Image, uploadOptions)
            generatedImages.push(secure_url)

            await sql` INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${imagePrompt}, ${secure_url}, 'image', ${publish ?? false}) `;
        }

        res.json({
            success: true,
            content: count === 1 ? generatedImages[0] : generatedImages,
            message: count === 1 ? "Image generated successfully" : `${count} image variations generated successfully`
        });

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export const removeImageBackground = async (req, res) => {
    try {
        const { userId } = req.auth();
        const uploadedImages = req.files?.images || req.files?.image || (req.file ? [req.file] : []);
        const backgroundImage = req.files?.background_image?.[0];
        const {
            subject_type = 'Auto',
            edge_refinement = 'Auto',
            output_format = 'transparent_png',
            background_color = '#ffffff',
            shadow_preservation = true
        } = req.body;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions." })
        }

        if (!uploadedImages.length) {
            return res.json({ success: false, message: "Please upload at least one image." })
        }

        const processedImages = [];

        for (const image of uploadedImages) {
            let transformation = [
                {
                    effect: 'background_removal',
                    background_removal: 'remove_the_background'
                }
            ];

            if (edge_refinement === 'Hair/Fur') {
                transformation.push({ effect: "sharpen:30" });
            } else if (edge_refinement === 'Glass') {
                transformation.push({ effect: "improve" });
            } else if (edge_refinement === 'Crisp Product') {
                transformation.push({ effect: "sharpen:80" }, { effect: "auto_contrast" });
            }

            if (output_format === 'solid_color') {
                transformation.push({ background: background_color.replace('#', '') });
            } else if (output_format === 'custom_image' && backgroundImage) {
                const bgUpload = await cloudinary.uploader.upload(backgroundImage.path);
                transformation.push({ underlay: bgUpload.public_id, crop: "fill", gravity: "auto" });
            }

            if (shadow_preservation === 'true' || shadow_preservation === true) {
                transformation.push({ effect: "dropshadow:30" });
            }

            transformation.push({ quality: "auto:best" }, { fetch_format: "png" });

            const { secure_url } = await cloudinary.uploader.upload(image.path, { transformation })
            processedImages.push(secure_url)

            const prompt = `Remove background from image - Subject: ${subject_type}, Edge: ${edge_refinement}, Output: ${output_format}`;
            await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${secure_url}, 'image') `;
        }

        res.json({
            success: true,
            content: processedImages.length === 1 ? processedImages[0] : processedImages,
            message: processedImages.length === 1 ? "Background removed successfully" : `${processedImages.length} backgrounds removed successfully`
        });

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export const removeImageObject = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { object, texture_fill = true, edge_control = 50 } = req.body;
        const image = req.file;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions." })
        }

        if (!image) {
            return res.json({ success: false, message: "Please upload an image file." })
        }

        const objects = object
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 8);

        if (!objects.length) {
            return res.json({ success: false, message: "Please describe at least one object to remove." })
        }

        const { public_id } = await cloudinary.uploader.upload(image.path)

        const transformation = objects.map((item) => ({ effect: `gen_remove:${item}` }));

        if (texture_fill === 'true' || texture_fill === true) {
            transformation.push({ effect: "improve" });
        }

        if (Number(edge_control) > 60) {
            transformation.push({ effect: "sharpen:40" });
        }

        transformation.push({ quality: "auto:best" }, { fetch_format: "auto" });

        const imageUrl = cloudinary.url(public_id, {
            transformation,
            resource_type: 'image'
        })

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`Removed ${objects.join(', ')} from image`}, ${imageUrl}, 'image')
        `;

        res.json({
            success: true,
            content: imageUrl,
            message: objects.length === 1 ? "Object removed successfully" : `${objects.length} objects removed successfully`
        });

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export const resumeReview = async (req, res) => {
    try {
        const { userId } = req.auth();
        const resume = req.file;
        const { target_role, experience_level, job_description } = req.body;

        if (!resume) return res.json({ success: false, message: "Please upload a resume PDF." });
        if (resume.size > 5 * 1024 * 1024) return res.json({ success: false, message: "Resume file size exceeds 5MB." });

        const dataBuffer = fs.readFileSync(resume.path);
        const pdfData = await pdf(dataBuffer);

        const prompt = `You are a senior technical recruiter, ATS resume expert, and career mentor for fresher IT candidates.

Analyze the resume deeply for the target role.

Target Role: ${target_role || 'Software Engineer'}
Experience Level: ${experience_level || 'Fresher'}
${job_description ? `Optional Job Description:\n${job_description}\n` : ''}
Resume Text:
${pdfData.text}

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

Keep the response professional, direct, and actionable.`;

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 3000,
        });

        const content = response.choices[0].message.content;
        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Resume review for ${target_role || 'general'}', ${content}, 'resume-review')`;

        res.json({ success: true, content, message: "Resume reviewed successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const enhanceImage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const image = req.file;
        const { enhancement_type } = req.body;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions." })
        }

        if (image.size > 10 * 1024 * 1024) {
            return res.json({ success: false, message: "Image file size exceeds allowed size (10MB)." })
        }

        let transformation = {};

        switch (enhancement_type) {
            case 'upscale_2x':
                transformation = {
                    transformation: [
                        { quality: "auto:best" },
                        { fetch_format: "auto" },
                        { width: "iw_mul_2.0", crop: "scale" }
                    ]
                };
                break;
            case 'upscale_4x':
                transformation = {
                    transformation: [
                        { quality: "auto:best" },
                        { fetch_format: "auto" },
                        { width: "iw_mul_4.0", crop: "scale" }
                    ]
                };
                break;
            case 'sharpen':
                transformation = {
                    transformation: [
                        { effect: "sharpen:100" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
                break;
            case 'denoise':
                transformation = {
                    transformation: [
                        { effect: "improve" },
                        { effect: "auto_contrast" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
                break;
            case 'face_enhance':
                transformation = {
                    transformation: [
                        { effect: "gen_face_enhance" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
                break;
            case 'low_light':
                transformation = {
                    transformation: [
                        { effect: "auto_brightness:90" },
                        { effect: "auto_contrast" },
                        { effect: "improve" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
                break;
            case 'color_correction':
                transformation = {
                    transformation: [
                        { effect: "auto_color" },
                        { effect: "auto_contrast" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
                break;
            case 'old_photo_restore':
                transformation = {
                    transformation: [
                        { effect: "gen_restore" },
                        { effect: "auto_color" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
                break;
            case 'auto_enhance':
                transformation = {
                    transformation: [
                        { effect: "auto_brightness" },
                        { effect: "auto_contrast" },
                        { effect: "auto_color" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
                break;
            default:
                transformation = {
                    transformation: [
                        { effect: "auto_brightness" },
                        { effect: "auto_contrast" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
        }

        const { secure_url } = await cloudinary.uploader.upload(image.path, transformation)

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`Enhanced image with ${enhancement_type}`}, ${secure_url}, 'image-enhancement')
        `;

        res.json({
            success: true,
            content: secure_url,
            message: "Image enhanced successfully"
        });

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export const generateLogo = async (req, res) => {
    try {
        const { userId } = req.auth();
        const {
            company_name,
            industry,
            style,
            colors,
            description,
            font_style,
            include_icon,
            include_typography,
            light_dark_variants,
            social_versions,
            favicon_versions,
            editable_layers,
            vector_export
        } = req.body;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions." })
        }

        const prompt = `Create a professional startup-ready logo for "${company_name}" in the ${industry} industry. Style: ${style}. Brand colors: ${colors}. Font direction: ${font_style}. Additional description: ${description}. Include icon mark: ${include_icon}. Include typography lockup: ${include_typography}. Plan for light and dark variants: ${light_dark_variants}. Plan editable logo layers for icon/text/colors: ${editable_layers}. Vector/SVG export intent: ${vector_export}. Social versions: ${social_versions}. Favicon versions: ${favicon_versions}. The logo should be clean, centered, brand-consistent, high contrast, and suitable for business use.`

        const formData = new FormData()
        formData.append('prompt', prompt)
        const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers: { 'x-api-key': process.env.SECRET_API_KEY },
            responseType: "arraybuffer",
        })

        const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;

        const { secure_url } = await cloudinary.uploader.upload(base64Image, {
            transformation: [
                { quality: "auto:best" },
                { fetch_format: "auto" }
            ]
        })

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${secure_url}, 'logo')
        `;

        res.json({
            success: true,
            content: secure_url,
            palette: colors ? colors.split(',').map(color => color.trim()).filter(Boolean) : [],
            message: "Logo generated successfully"
        });

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export const generateEmail = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { purpose, tone, recipient, job_role, company, user_background, key_points } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= getLimit(plan, 'job-email')) {
            return res.status(403).json({ success: false, message: `Free limit reached (${getLimit(plan, 'job-email')} emails). Upgrade to continue.` })
        }

        if (!job_role || !company) {
            return res.status(400).json({ success: false, message: "Job role and company are required." })
        }

        const prompt = `You are an email writing assistant for fresher IT job seekers.

Write a ${purpose || 'Cold outreach'} email.

Tone: ${tone || 'Professional'}
Job Role: ${job_role}
Company: ${company}
${recipient ? `Recipient: ${recipient}` : ''}
${user_background ? `Candidate Background:\n${user_background}` : ''}
${key_points ? `Key Points:\n${key_points}` : ''}

Return in Markdown:

# Email

## Subject Line
(A compelling subject line)

## Email Body
(The full email — greeting, body, sign-off)

## Tips
- 2-3 tips for sending this type of email

Keep it under 200 words, genuine, and professional.`

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{
                role: "user",
                content: prompt,
            },
            ],
            temperature: 0.7,
            max_tokens: 800,
        });

        const content = response.choices[0].message.content

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'email');`;

        if (plan !== 'premium') {
            await sql`UPDATE subscriptions SET free_usage = free_usage + 1, updated_at = NOW() WHERE user_id = ${userId}`;
        }

        res.json({
            success: true,
            message: "Email generated successfully",
            content: content,
            usage: plan !== 'premium' ? free_usage + 1 : 'unlimited'
        });

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}

export const generateReadme = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { project_title, description, tech_stack, installation, usage, features, license, github_url, demo_url } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= getLimit(plan, 'readme')) {
            return res.status(403).json({ success: false, message: `Free limit reached (${getLimit(plan, 'readme')} READMEs). Upgrade to continue.` })
        }

        const prompt = `You are a README.md expert for fresher developers building portfolio projects.

Generate a professional GitHub README.md for:

Project Title: ${project_title}
Description: ${description}
Tech Stack: ${tech_stack || 'Not specified'}
Features: ${features || 'Auto-generate based on description'}
Installation: ${installation || 'Auto-generate standard steps'}
Usage: ${usage || 'Auto-generate usage examples'}
License: ${license || 'MIT'}
${github_url ? `GitHub: ${github_url}` : ''}
${demo_url ? `Live Demo: ${demo_url}` : ''}

Include these sections:
- Project title with badges
- Description
- Live Demo link (if provided)
- Features list
- Tech Stack
- Getting Started (Prerequisites, Installation, Running)
- Project Structure (brief)
- Screenshots placeholder
- Contributing
- License

Use proper Markdown formatting. Make it portfolio-ready and impressive for recruiters.`

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{
                role: "user",
                content: prompt,
            },
            ],
            temperature: 0.7,
            max_tokens: 1500,
        });

        const content = response.choices[0].message.content

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'readme');`;

        if (plan !== 'premium') {
            await sql`UPDATE subscriptions SET free_usage = free_usage + 1, updated_at = NOW() WHERE user_id = ${userId}`;
        }

        res.json({
            success: true,
            message: "README generated successfully",
            content: content,
            usage: plan !== 'premium' ? free_usage + 1 : 'unlimited'
        });

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}

export const enhanceGrammar = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { text, tone, enhancement_level, purpose } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= getLimit(plan, 'grammar-enhancement')) {
            return res.status(403).json({ success: false, message: `Free limit reached (${getLimit(plan, 'grammar-enhancement')} enhancements). Upgrade to continue.` })
        }

        if (!text || !text.trim()) {
            return res.status(400).json({ success: false, message: "Please provide text to enhance." })
        }

        if (text.trim().length < 5) {
            return res.status(400).json({ success: false, message: "Text must be at least 5 characters long." })
        }

        const prompt = `You are a professional writing assistant for fresher IT candidates.

Enhance the following text. Fix grammar, spelling, punctuation, and improve readability.

Purpose: ${purpose || 'General'}
Desired Tone: ${tone || 'Professional'}
Enhancement Level: ${enhancement_level || 'Medium'}

Original Text:
"${text}"

Return in Markdown:

# Enhanced Text
(The improved version)

## Changes Made
- List each change briefly

## Writing Tips
- Give 2-3 tips specific to this purpose

Keep the original meaning. Make it professional and suitable for job applications.`

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{
                role: "user",
                content: prompt,
            },
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        const content = response.choices[0].message.content

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'grammar-enhancement');`;

        if (plan !== 'premium') {
            await sql`UPDATE subscriptions SET free_usage = free_usage + 1, updated_at = NOW() WHERE user_id = ${userId}`;
        }

        res.json({
            success: true,
            message: "Text enhanced successfully",
            content: content,
            usage: plan !== 'premium' ? free_usage + 1 : 'unlimited'
        });

    } catch (error) {
        console.log('Grammar Enhancement Error:', error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}

export const generateCoverLetter = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { job_title, company_name, job_description, resume_highlights, tone, experience_level, candidate_name, key_achievements, skills_to_emphasize } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= getLimit(plan, 'cover-letter')) {
            return res.status(403).json({ success: false, message: `Free limit reached (${getLimit(plan, 'cover-letter')} cover letters). Upgrade to continue.` })
        }

        const prompt = `You are a professional cover letter writer for fresher/entry-level IT candidates.

Write a cover letter for the following:

Candidate Name: ${candidate_name || 'Candidate'}
Job Title: ${job_title}
Company: ${company_name}
Experience Level: ${experience_level || 'Fresher'}
Tone: ${tone || 'Professional'}
${job_description ? `Job Description:\n${job_description}\n` : ''}
${resume_highlights ? `Resume Highlights:\n${resume_highlights}\n` : ''}
${key_achievements ? `Key Achievements:\n${key_achievements}\n` : ''}
${skills_to_emphasize ? `Skills to Emphasize: ${skills_to_emphasize}\n` : ''}

Return in clean Markdown:

# Cover Letter

## Subject Line
(Suggested email subject)

## Letter Body
(The full cover letter with opening, body paragraphs, and closing)

## Key Talking Points
- List 3 points the candidate should mention in an interview

Keep it concise (under 400 words), genuine, and ATS-friendly.`

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{
                role: "user",
                content: prompt,
            },
            ],
            temperature: 0.7,
            max_tokens: 1200,
        });

        const content = response.choices[0].message.content

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'cover-letter');`;

        if (plan !== 'premium') {
            await sql`UPDATE subscriptions SET free_usage = free_usage + 1, updated_at = NOW() WHERE user_id = ${userId}`;
        }

        res.json({
            success: true,
            message: "Cover letter generated successfully",
            content: content,
            usage: plan !== 'premium' ? free_usage + 1 : 'unlimited'
        });

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
}

export const imageToText = async (req, res) => {
    try {
        const { userId } = req.auth();
        const image = req.file;
        const { extract_format, language } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." })
        }

        if (!image) {
            return res.json({ success: false, message: "Please upload an image file." })
        }

        if (image.size > 10 * 1024 * 1024) {
            return res.json({ success: false, message: "Image file size exceeds allowed size (10MB)." })
        }

        // Upload image to Cloudinary first
        const { secure_url } = await cloudinary.uploader.upload(image.path)

        // Use Tesseract.js for actual OCR with error handling
        let extractedText = '';

        try {
            const { recognize } = await import('tesseract.js');

            // Perform OCR on the image with basic options
            const result = await recognize(secure_url, 'eng', {
                logger: m => console.log(m) // Optional: log progress
            });

            extractedText = result.data.text.trim();

        } catch (ocrError) {
            console.log('OCR processing failed:', ocrError.message);
            // Fallback: provide a helpful error message
            return res.json({
                success: false,
                message: "OCR processing failed. Please ensure the image contains clear, readable text and try again."
            });
        }

        if (!extractedText || extractedText.length === 0) {
            return res.json({
                success: false,
                message: "No text could be extracted from this image. Please make sure the image contains readable text."
            });
        }

        // Format the extracted text based on the requested format
        if (extract_format && extract_format !== 'plain text') {
            const formatPrompt = `Please format the following OCR-extracted text according to the specified format:

Original extracted text:
${extractedText}

Format the text as: ${extract_format}

Instructions:
${getFormatInstructions(extract_format)}

Only return the formatted text, no explanations.`;

            const response = await AI.chat.completions.create({
                model: "gemini-2.0-flash",
                messages: [{
                    role: "user",
                    content: formatPrompt
                }],
                temperature: 0.1,
                max_tokens: 2000,
            });

            const formattedText = response.choices[0].message.content;
            if (formattedText && formattedText.trim().length > 0) {
                extractedText = formattedText.trim();
            }
        }

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`OCR text extraction from image - Format: ${extract_format || 'plain text'}, Language: ${language || 'English'}`}, ${extractedText}, 'image-to-text')
        `;

        if (plan !== 'premium') {
            await sql`UPDATE subscriptions SET free_usage = free_usage + 1, updated_at = NOW() WHERE user_id = ${userId}`;
        }

        res.json({
            success: true,
            content: extractedText,
            image_url: secure_url,
            message: "Text extracted successfully from image",
            usage: plan !== 'premium' ? free_usage + 1 : 'unlimited'
        });

    } catch (error) {
        console.log('Image to Text Error:', error.message)
        res.json({ success: false, message: `OCR Error: ${error.message}` })
    }
}

// Helper function to get format-specific instructions
function getFormatInstructions(format) {
    switch (format) {
        case 'code format':
            return 'Format as code with proper indentation, syntax highlighting structure, and preserve any programming language syntax. Maintain line breaks and indentation.';
        case 'structured markdown':
            return 'Format with proper markdown syntax including headers, lists, emphasis, and code blocks where appropriate.';
        case 'formatted document':
            return 'Format as a well-structured document with proper paragraphs, spacing, and organization.';
        case 'table format':
            return 'If the text appears to be tabular data, format it as a proper table. Otherwise, organize the text in a structured way.';
        case 'bullet points':
            return 'Organize the text into logical bullet points and sub-points with proper hierarchy.';
        default:
            return 'Clean up the text and present it in a readable format.';
    }
}


// Photo Restoration Controller
export const restorePhoto = async (req, res) => {
    try {
        const { userId } = req.auth();
        const image = req.file;
        const { restoration_type } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions." })
        }

        if (!image) {
            return res.json({ success: false, message: "Please upload an image file." })
        }

        if (image.size > 10 * 1024 * 1024) {
            return res.json({ success: false, message: "Image file size exceeds allowed size (10MB)." })
        }

        let transformation = {};
        let prompt = '';
        switch (restoration_type) {
            case 'scratch_removal':
                transformation = {
                    transformation: [
                        { effect: "gen_restore:scratches" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
                prompt = 'Remove scratches and creases from photo';
                break;
            case 'colorize':
                transformation = {
                    transformation: [
                        { effect: "gen_colorize" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
                prompt = 'Colorize black & white photo';
                break;
            case 'deblur':
                transformation = {
                    transformation: [
                        { effect: "gen_deblur" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
                prompt = 'Enhance sharpness and detail in blurred photo';
                break;
            case 'face_repair':
                transformation = {
                    transformation: [
                        { effect: "gen_face_enhance" },
                        { quality: "auto:best" },
                        { fetch_format: "auto" }
                    ]
                };
                prompt = 'Repair and enhance face clarity for vintage portrait';
                break;
            default:
                return res.json({ success: false, message: "Invalid restoration type." });
        }

        const { secure_url } = await cloudinary.uploader.upload(image.path, transformation);

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${secure_url}, 'photo-restoration') `;

        res.json({
            success: true,
            content: secure_url,
            message: "Photo restored successfully",
            restoration_type
        });

    } catch (error) {
        console.log('Photo Restoration Error:', error.message)
        res.json({ success: false, message: error.message })
    }
}

// Background Blur (DSLR Effect) Controller
export const blurBackground = async (req, res) => {
    try {
        const { userId } = req.auth();
        const image = req.file;
        const {
            blur_intensity = 50,
            bokeh_style = 'soft',
            subject_mode = 'portrait',
            preset = 'none',
            replace_background = false,
            background_color = '#000000',
            background_scene = 'none',
            custom_bokeh_prompt = '',
            edge_refinement = 'hair',
            focus_control = 65
        } = req.body;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions." })
        }

        if (!image) {
            return res.json({ success: false, message: "Please upload an image file." })
        }

        if (image.size > 10 * 1024 * 1024) {
            return res.json({ success: false, message: "Image file size exceeds allowed size (10MB)." })
        }

        // Calculate blur strength based on intensity (1-100) -> Cloudinary blur (100-2000)
        const intensity = parseInt(blur_intensity) || 50;
        const blurStrength = Math.round(100 + (intensity * 19)); // Maps 1-100 to 100-2000

        // Build transformation based on options
        let transformation = [];

        // Apply portrait preset adjustments
        switch (preset) {
            case 'studio':
                transformation.push(
                    { effect: "auto_brightness:80" },
                    { effect: "auto_contrast" },
                    { effect: "sharpen:50" }
                );
                break;
            case 'outdoor':
                transformation.push(
                    { effect: "auto_brightness" },
                    { effect: "saturation:10" },
                    { effect: "vibrance:20" }
                );
                break;
            case 'office':
                transformation.push(
                    { effect: "auto_brightness:70" },
                    { effect: "auto_contrast" },
                    { effect: "improve" }
                );
                break;
        }

        // Background replacement or blur effect
        const isReplacingBackground = replace_background === 'true' || replace_background === true;

        if (isReplacingBackground) {
            // Remove background completely and add solid color
            transformation.push(
                { effect: 'background_removal' }
            );

            // Add background color
            const colorHex = background_color ? background_color.replace('#', '') : '000000';
            transformation.push({ background: colorHex });
        } else {
            // Use gen_background_replace to blur the background while keeping the subject
            // This creates a DSLR-like depth of field effect
            const blurPrompt = bokeh_style === 'custom' && custom_bokeh_prompt
                ? custom_bokeh_prompt
                : bokeh_style === 'cinematic'
                ? 'soft blurred cinematic background with bokeh lights'
                : bokeh_style === 'circular'
                    ? 'smooth blurred background with circular bokeh'
                    : 'softly blurred dreamy background';

            transformation.push(
                { effect: `gen_background_replace:prompt_${blurPrompt}` }
            );

            // Add vignette for cinematic style
            if (bokeh_style === 'cinematic') {
                transformation.push({ effect: 'vignette:30' });
            }
        }

        // Subject mode optimizations
        if (subject_mode === 'portrait') {
            transformation.push(
                { effect: "sharpen:30" }
            );
        } else if (subject_mode === 'product') {
            transformation.push(
                { effect: "sharpen:50" },
                { effect: "auto_contrast" }
            );
        }

        if (edge_refinement === 'hair') {
            transformation.push({ effect: "sharpen:20" });
        } else if (edge_refinement === 'product') {
            transformation.push({ effect: "sharpen:60" });
        }

        const focusStrength = clampNumber(focus_control, 1, 100, 65);
        if (focusStrength > 75) {
            transformation.push({ effect: "sharpen:40" });
        }

        // Add quality settings
        transformation.push(
            { quality: "auto:best" },
            { fetch_format: "auto" }
        );

        // Upload with transformations applied
        const { secure_url } = await cloudinary.uploader.upload(image.path, {
            transformation: transformation
        });

        // Also upload original for comparison
        const originalUpload = await cloudinary.uploader.upload(image.path);

        // Construct description for database
        const description = `Background blur effect - Intensity: ${intensity}%, Style: ${bokeh_style}, Mode: ${subject_mode}${preset !== 'none' ? `, Preset: ${preset}` : ''}${isReplacingBackground ? ', Background replaced' : ''}`;

        await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${description}, ${secure_url}, 'background-blur') `;

        res.json({
            success: true,
            content: secure_url,
            original: originalUpload.secure_url,
            message: "Background blur applied successfully",
            settings: {
                blur_intensity: intensity,
                bokeh_style,
                subject_mode,
                preset,
                replace_background: isReplacingBackground,
                edge_refinement,
                focus_control: focusStrength
            }
        });

    } catch (error) {
        console.log('Background Blur Error:', error.message)
        res.json({ success: false, message: error.message })
    }
}

export const generateThumbnail = async (req, res) => {
    try {
        const { userId } = req.auth();
        const {
            title,
            visual_prompt,
            template,
            emotion,
            text_overlay,
            face_emphasis,
            high_contrast,
            background_effects,
            ctr_optimized,
            variations
        } = req.body;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.json({ success: false, message: "This feature is only available for premium subscriptions." })
        }

        if (!title || !title.trim()) {
            return res.json({ success: false, message: "Please provide a video title." })
        }

        const count = clampNumber(variations, 1, 4, 1);
        const prompt = [
            `Create a YouTube thumbnail at 1280x720 for the video title: "${title}".`,
            visual_prompt ? `Visual direction: ${visual_prompt}.` : '',
            `Template: ${template}. Emotion: ${emotion}.`,
            text_overlay ? `Use bold readable text overlay: "${text_overlay}".` : 'Leave clean space for bold readable title text.',
            face_emphasis ? 'Emphasize face/eyes and expression if a person is present.' : '',
            high_contrast ? 'Use high-contrast colors and strong visual hierarchy.' : '',
            background_effects ? 'Use background isolation, glow, arrows, or depth effects where helpful.' : '',
            ctr_optimized ? 'Optimize for high click-through rate, mobile readability, and clear focal point.' : ''
        ].filter(Boolean).join(' ');

        const thumbnails = [];

        for (let index = 0; index < count; index += 1) {
            const formData = new FormData()
            formData.append('prompt', `${prompt} A/B variation ${index + 1}.`)
            const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
                headers: { 'x-api-key': process.env.SECRET_API_KEY },
                responseType: "arraybuffer",
            })

            const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;
            const { secure_url } = await cloudinary.uploader.upload(base64Image, {
                transformation: [
                    { width: 1280, height: 720, crop: "fill", gravity: "auto" },
                    { effect: "auto_contrast" },
                    { quality: "auto:best" },
                    { fetch_format: "png" }
                ]
            })

            thumbnails.push(secure_url)
            await sql` INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${secure_url}, 'youtube-thumbnail') `;
        }

        res.json({
            success: true,
            content: count === 1 ? thumbnails[0] : thumbnails,
            message: count === 1 ? "Thumbnail generated successfully" : `${count} thumbnail variations generated successfully`
        });
    } catch (error) {
        console.log('Thumbnail Generation Error:', error.message)
        res.json({ success: false, message: error.message })
    }
}

// ─── FresherLab New AI Tools ─────────────────────────────────────

export const atsScoreChecker = async (req, res) => {
    const resume = req.file;
    try {
        const { userId } = req.auth();
        const { jobDescription, target_role, experience_level } = req.body;

        if (!resume) return res.status(400).json({ success: false, message: "Please upload a resume PDF." });
        if (!resume.originalname?.toLowerCase().endsWith('.pdf') && resume.mimetype !== 'application/pdf') {
            cleanupUploadedFile(resume);
            return res.status(400).json({ success: false, message: "Only PDF files are accepted." });
        }
        if (!jobDescription || !jobDescription.trim()) {
            cleanupUploadedFile(resume);
            return res.status(400).json({ success: false, message: "Please provide a job description." });
        }
        if (resume.size > 5 * 1024 * 1024) {
            cleanupUploadedFile(resume);
            return res.status(400).json({ success: false, message: "Resume file size exceeds 5MB." });
        }

        let pdfData;
        try {
            const dataBuffer = fs.readFileSync(resume.path);
            pdfData = await pdf(dataBuffer);
        } catch (parseError) {
            cleanupUploadedFile(resume);
            return res.status(400).json({ success: false, message: `Could not read this PDF. Please upload a text-based resume PDF. (${parseError.message})` });
        }

        const resumeText = pdfData.text?.trim();
        if (!resumeText) {
            cleanupUploadedFile(resume);
            return res.status(400).json({ success: false, message: "No readable text found in this PDF. Please upload a text-based resume PDF instead of a scanned image." });
        }

        const resumeTextForAI = resumeText.slice(0, 15000);
        const jobDescriptionForAI = jobDescription.trim().slice(0, 10000);

        const prompt = `You are an ATS optimization expert and technical recruiter.

Compare this resume with the job description.

Target Role: ${target_role || 'Software Engineer'}
Experience Level: ${experience_level || 'Fresher'}

Resume:
${resumeTextForAI}

Job Description:
${jobDescriptionForAI}

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
Tell the user whether they should apply now or improve first.`;

        let content;
        let usedLocalFallback = false;

        try {
            const response = await AI.chat.completions.create({
                model: "gemini-2.0-flash",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 3000,
            });

            content = response.choices?.[0]?.message?.content;
        } catch (aiError) {
            usedLocalFallback = true;
            console.warn('ATS AI unavailable, using local analysis:', aiError.message);
            content = buildLocalAtsReport({ resumeText: resumeTextForAI, jobDescription: jobDescriptionForAI, target_role, experience_level });
        }

        if (!content) {
            usedLocalFallback = true;
            content = buildLocalAtsReport({ resumeText: resumeTextForAI, jobDescription: jobDescriptionForAI, target_role, experience_level });
        }

        const promptLabel = `ATS score check for ${target_role || 'general'}`;
        try {
            await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${promptLabel}, ${content}, 'ats-score')`;
        } catch (dbError) {
            console.error('ATS history save failed:', dbError.message);
        }

        cleanupUploadedFile(resume);

        res.json({ success: true, content, message: usedLocalFallback ? "ATS score analysis complete using local analysis" : "ATS score analysis complete" });
    } catch (error) {
        cleanupUploadedFile(resume);
        console.error('ATS Score Error:', error.message);
        res.status(500).json({ success: false, message: error.message || "ATS score analysis failed." });
    }
}

export const resumeBuilder = async (req, res) => {
    try {
        const { userId } = req.auth();
        const {
            fullName, email, phone, location,
            linkedinUrl, portfolioUrl, githubUrl,
            experiences = [], skills = {}, projects = [],
            certifications = [], educations = [], research = {},
            targetRole = '',
        } = req.body;

        if (!fullName || !fullName.trim()) {
            return res.status(400).json({ success: false, message: "Full name is required." });
        }

        const polished = await polishBulletsWithAI({ experiences, projects, targetRole });

        const data = {
            fullName, email, phone, location,
            linkedinUrl, portfolioUrl, githubUrl,
            experiences: polished.experiences,
            skills,
            projects: polished.projects,
            certifications,
            educations,
            research,
        };

        const content = buildResumeLatex(data);

        const promptLabel = `Build LaTeX resume${targetRole ? ` for ${targetRole}` : ''}`.replace(/'/g, "''");
        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${promptLabel}, ${content}, 'resume-builder')`;

        res.json({ success: true, content, message: "Resume generated successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

const polishBulletsWithAI = async ({ experiences, projects, targetRole }) => {
    const buildItems = (group, list, getBullets) => list.map((entry, idx) => ({
        group,
        index: idx,
        bullets: splitBullets(getBullets(entry)),
    })).filter(item => item.bullets.length);

    const items = [
        ...buildItems('experience', experiences || [], e => e.bullets),
        ...buildItems('project', projects || [], p => p.bullets),
    ];

    if (!items.length) return { experiences: experiences || [], projects: projects || [] };

    const prompt = `You are an expert resume bullet writer for freshers applying to ${targetRole || 'tech roles'}.
Rewrite each bullet to start with a strong action verb, be concise (max ~22 words), highlight impact and quantify when possible. Keep technical keywords. Do NOT invent metrics; only quantify if the original implies it.

Return ONLY valid JSON in this exact shape (no prose, no markdown fences):
{ "items": [ { "group": "experience"|"project", "index": <number>, "bullets": ["..."] } ] }

Input items:
${JSON.stringify(items)}`;

    let polishedMap = new Map();
    try {
        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
            max_tokens: 1500,
        });
        const raw = response.choices[0].message.content || '';
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            (parsed.items || []).forEach(it => {
                polishedMap.set(`${it.group}:${it.index}`, it.bullets || []);
            });
        }
    } catch (err) {
        console.log('Bullet polish failed, using originals:', err.message);
    }

    const applyPolish = (group, list, getBullets) => (list || []).map((entry, idx) => {
        const polished = polishedMap.get(`${group}:${idx}`);
        if (polished && polished.length) {
            return { ...entry, bullets: polished.join('\n') };
        }
        const original = splitBullets(getBullets(entry));
        return { ...entry, bullets: original.join('\n') };
    });

    return {
        experiences: applyPolish('experience', experiences, e => e.bullets),
        projects: applyPolish('project', projects, p => p.bullets),
    };
}

export const jobDescriptionAnalysis = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { jobDescription, currentSkills } = req.body;

        if (!jobDescription || !jobDescription.trim()) return res.json({ success: false, message: "Please provide a job description." });

        const prompt = `You are a career coach for freshers. Analyze this job description and provide:

1. **Role Summary** — what the company is looking for
2. **Required Skills** — categorized (must-have vs nice-to-have)
3. **ATS Keywords** — exact keywords to include in resume
4. **Key Responsibilities** — simplified for a fresher to understand
5. **Skill Gap Analysis** — ${currentSkills ? `compare with candidate skills: ${currentSkills}` : 'list common gaps for freshers'}
6. **Recommended Projects** — 2-3 portfolio project ideas that demonstrate the required skills
7. **Interview Prep Tips** — likely questions based on this JD

Job Description:
${jobDescription}`;

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 2000,
        });

        const content = response.choices[0].message.content;
        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Analyze job description', ${content}, 'job-description-analysis')`;

        res.json({ success: true, content, message: "JD analysis complete" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const learningPlan = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { targetRole, currentSkills, duration, hoursPerDay } = req.body;

        if (!targetRole || !targetRole.trim()) return res.json({ success: false, message: "Please provide a target role." });

        const prompt = `You are a senior tech mentor creating a personalized learning roadmap for a fresher.

Target Role: ${targetRole}
Current Skills: ${currentSkills || 'Beginner level'}
Duration: ${duration || '4 weeks'}
Available Hours/Day: ${hoursPerDay || '3'}

Generate a structured learning plan with:
1. **Week-by-Week Breakdown** with daily tasks and time allocation
2. **Key Topics to Master** in priority order
3. **Recommended Resources** (free courses, docs, YouTube channels)
4. **Practice Projects** — one per week, increasing difficulty
5. **Interview Preparation** — common questions for this role
6. **Milestones & Checkpoints** to track progress
7. **Tips for Standing Out** as a fresher candidate

Make it actionable, specific, and achievable.`;

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 2500,
        });

        const content = response.choices[0].message.content;
        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Learning plan for ${targetRole}', ${content}, 'learning-plan')`;

        res.json({ success: true, content, message: "Learning plan generated" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

const UNSAFE_PATTERNS = /\b(hack|exploit|malware|keylogger|credential.?theft|phish|brute.?force|injection.?attack|backdoor|ransomware)\b/i;

export const codeSnippet = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { topic, language, level } = req.body;

        if (!topic || !topic.trim()) return res.json({ success: false, message: "Please provide a topic." });

        if (UNSAFE_PATTERNS.test(topic)) {
            return res.json({ success: false, message: "This topic is not allowed. Please request educational coding examples only." });
        }

        const prompt = `You are a coding tutor for ${level || 'beginner'}-level developers. Generate a ${language || 'JavaScript'} code snippet for:

Topic: ${topic}

Include:
1. **Clean, well-commented code** with proper formatting
2. **Step-by-step explanation** of how it works
3. **Example usage / test cases**
4. **Common mistakes** beginners make with this pattern
5. **Time & Space Complexity** (if algorithmic)
6. **Related concepts** to learn next

Keep it educational, practical, and interview-relevant.`;

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 2000,
        });

        const content = response.choices[0].message.content;
        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, '${language} snippet: ${topic.substring(0, 80)}', ${content}, 'code-snippet')`;

        res.json({ success: true, content, message: "Code snippet generated" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const linkedinPost = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { postType, context, tone } = req.body;

        if (!context || !context.trim()) return res.json({ success: false, message: "Please provide context for your post." });

        const prompt = `You are a LinkedIn content strategist helping freshers build professional visibility.

Post Type: ${postType || 'Project showcase'}
Tone: ${tone || 'professional'}
Context: ${context}

Generate:
1. **Main Post** (150-250 words) with a strong hook, storytelling body, and clear CTA
2. **3 Hashtag Suggestions** relevant to the topic
3. **Alternative Shorter Version** (under 100 words)
4. **Engagement Tips** — best time to post and how to boost reach

The post should feel authentic, avoid cringe, and showcase the fresher's growth mindset.`;

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.8,
            max_tokens: 1500,
        });

        const content = response.choices[0].message.content;
        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'LinkedIn post: ${postType}', ${content}, 'linkedin-post')`;

        res.json({ success: true, content, message: "LinkedIn post generated" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}
