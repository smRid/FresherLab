import express from "express";
import { auth } from "../middlewares/auth.js";
import {
    generateArticle,
    generateBlogTitle,
    generateImage,
    removeImageBackground,
    removeImageObject,
    resumeReview,
    enhanceImage,
    generateLogo,
    generateEmail,
    generateReadme,
    enhanceGrammar,
    generateCoverLetter,
    imageToText,
    restorePhoto,
    blurBackground,
    generateThumbnail,
    atsScoreChecker,
    resumeBuilder,
    jobDescriptionAnalysis,
    learningPlan,
    codeSnippet,
    linkedinPost
} from "../controllers/aiController.js";
import { upload } from "../config/multer.js";
import { validate, grammarSchema, coverLetterSchema, emailSchema, readmeSchema } from "../validators/schemas.js";

const aiRouter = express.Router();

// Text-based AI tools
aiRouter.post('/generate-article', auth, generateArticle)
aiRouter.post('/generate-blog-title', auth, generateBlogTitle)
aiRouter.post('/generate-email', auth, validate(emailSchema), generateEmail)
aiRouter.post('/generate-readme', auth, validate(readmeSchema), generateReadme)
aiRouter.post('/enhance-grammar', auth, validate(grammarSchema), enhanceGrammar)
aiRouter.post('/generate-cover-letter', auth, validate(coverLetterSchema), generateCoverLetter)

// FresherLab career AI tools
aiRouter.post('/ats-score', upload.single('resume'), auth, atsScoreChecker)
aiRouter.post('/resume-builder', auth, resumeBuilder)
aiRouter.post('/job-description-analysis', auth, jobDescriptionAnalysis)
aiRouter.post('/learning-plan', auth, learningPlan)
aiRouter.post('/code-snippet', auth, codeSnippet)
aiRouter.post('/linkedin-post', auth, linkedinPost)

// Image-based AI tools
aiRouter.post('/generate-image', auth, generateImage)
aiRouter.post('/generate-logo', auth, generateLogo)
aiRouter.post('/remove-image-background', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 10 }, { name: 'background_image', maxCount: 1 }]), auth, removeImageBackground)
aiRouter.post('/remove-image-object', upload.single('image'), auth, removeImageObject)
aiRouter.post('/enhance-image', upload.single('image'), auth, enhanceImage)
aiRouter.post('/restore-photo', upload.single('image'), auth, restorePhoto)
aiRouter.post('/blur-background', upload.single('image'), auth, blurBackground)
aiRouter.post('/generate-thumbnail', auth, generateThumbnail)

// File-based AI tools
aiRouter.post('/resume-review', upload.single('resume'), auth, resumeReview)
aiRouter.post('/image-to-text', upload.single('image'), auth, imageToText)


export default aiRouter
