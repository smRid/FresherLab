# FresherLab Project Documentation

Last updated: April 28, 2026

## 1. Executive Summary

FresherLab is a full-stack AI-powered job preparation SaaS designed for fresher IT candidates. The application has a React and Vite frontend, an Express backend, Clerk authentication and subscription gating, Neon PostgreSQL persistence, Cloudinary media storage, Gemini text generation through the OpenAI SDK, PDF parsing for resume review, and Tesseract.js OCR.

The product helps freshers become job-ready through AI tools including resume review, ATS score checking, resume building, cover letter generation, job email generation, grammar enhancement, README generation, job description analysis, learning plan generation, code snippet generation, LinkedIn post generation, and a per-user job application tracker.

The public home page markets the product and sends authenticated users into a protected `/ai` workspace. Inside the workspace, the sidebar exposes all career-focused AI tools and the job tracker.

## 2. Product Purpose

FresherLab is designed as a one-stop AI job preparation workspace for freshers:

- Reviewing and improving resumes with AI feedback.
- Building ATS-friendly resumes from scratch.
- Checking ATS keyword match scores against job descriptions.
- Generating professional cover letters.
- Generating job emails (cold outreach, follow-up, referral, etc.).
- Analyzing job descriptions for skills, gaps, and project ideas.
- Enhancing grammar and tone for professional writing.
- Generating portfolio-ready GitHub README files.
- Creating personalized learning roadmaps.
- Generating educational code snippets.
- Creating LinkedIn posts to build professional visibility.
- Tracking job applications with full CRUD functionality.

## 3. Repository Layout

```text
FresherLab/
|-- .gitignore
|-- LICENSE
|-- README.md
|-- document.md
|-- client/
|   |-- index.html
|   |-- package.json
|   |-- package-lock.json
|   |-- vite.config.js
|   |-- eslint.config.js
|   |-- vercel.json
|   |-- public/
|   |   |-- favicon.svg
|   |   |-- gradientBackground.png
|   |   |-- logo.png
|   |   |-- preview.png
|   |   |-- preview2.png
|   |   |-- vite.svg
|   |-- src/
|       |-- App.jsx
|       |-- main.jsx
|       |-- index.css
|       |-- assets/
|       |-- components/
|       |-- pages/
|-- server/
    |-- package.json
    |-- package-lock.json
    |-- server.js
    |-- vercel.json
    |-- eng.traineddata
    |-- config/
    |-- controllers/
    |-- middlewares/
    |-- routes/
```

## 4. Technology Stack

### Frontend

| Technology | Role |
| --- | --- |
| React 19 | Component-based UI |
| Vite 7 | Development server and production bundling |
| Tailwind CSS 4 | Utility-first styling |
| React Router 7 | Client-side routing |
| Clerk React | Authentication UI, user state, plan protection, pricing table |
| Axios | API requests to the backend |
| React Hot Toast | Success and error notifications |
| React Markdown | Markdown rendering for generated text and saved creations |
| Lucide React | Icons |

### Backend

| Technology | Role |
| --- | --- |
| Express 5 | API server |
| Clerk Express | Auth middleware, user lookup, subscription plan checks |
| Neon PostgreSQL | Serverless database for creation history and likes |
| Cloudinary | Image upload, hosting, and transformations |
| OpenAI SDK | Calls Gemini through an OpenAI-compatible API endpoint |
| Gemini API | Text generation and formatting |
| Clipdrop API | Text-to-image generation for images, logos, and thumbnails |
| Multer | Multipart file upload handling |
| Tesseract.js | OCR processing for image-to-text |
| pdf-parse | Extracting text from uploaded PDF resumes |
| dotenv | Local environment variable loading |

## 5. High-Level Architecture

```text
Browser
  |
  | React/Vite app
  | ClerkProvider, BrowserRouter, Toaster
  |
  | Axios requests with Clerk bearer token
  v
Express API
  |
  | clerkMiddleware + requireAuth + custom auth middleware
  |
  |-- Gemini via OpenAI SDK for text generation
  |-- Clipdrop for text-to-image generation
  |-- Cloudinary for upload, storage, and image transformations
  |-- Tesseract.js for OCR
  |-- pdf-parse for resume text extraction
  v
Neon PostgreSQL
  |
  | creations table
  v
Dashboard creation history
```

## 6. Frontend Application

### 6.1 Entry Point

The frontend starts in `client/src/main.jsx`.

Key responsibilities:

- Loads `VITE_CLERK_PUBLISHABLE_KEY`.
- Throws an error if the Clerk publishable key is missing.
- Wraps the app in `ClerkProvider`.
- Wraps routes in `BrowserRouter`.
- Imports global styles from `index.css`.

### 6.2 Routing

Routes are defined in `client/src/App.jsx`.

| Route | Component | Purpose |
| --- | --- | --- |
| `/` | `Home` | Public landing page |
| `/ai` | `Layout` with `Dashboard` index | Protected workspace and dashboard |
| `/ai/resume-review` | `ReviewResume` | AI resume review with PDF upload |
| `/ai/resume-builder` | `ResumeBuilder` | Multi-step AI resume builder |
| `/ai/ats-checker` | `AtsScoreChecker` | ATS keyword match scoring |
| `/ai/cover-letter` | `CoverLetterGenerator` | AI cover letter generation |
| `/ai/grammar-enhancer` | `GrammarEnhancer` | Grammar and tone enhancement |
| `/ai/job-email-generator` | `EmailGenerator` | Job email generation |
| `/ai/job-description-analyzer` | `JobDescriptionAnalyzer` | JD analysis and skill gap detection |
| `/ai/readme-generator` | `ReadmeGenerator` | GitHub README generation |
| `/ai/learning-plan` | `LearningPlanGenerator` | Personalized learning roadmap |
| `/ai/code-snippet-generator` | `CodeSnippetGenerator` | Educational code snippet generation |
| `/ai/linkedin-post-generator` | `LinkedInPostGenerator` | LinkedIn post generation |
| `/ai/job-tracker` | `JobTracker` | Job application CRUD tracker |

### 6.3 Public Home Page

`client/src/pages/Home.jsx` composes:

- `Navbar`
- `Hero`
- `AiTools`
- `Testimonial`
- `Plan`
- `Footer`

The public page presents the product, shows the available career AI tools, renders a Clerk pricing table, and uses Clerk sign-in controls.

### 6.4 Protected Workspace Layout

`client/src/pages/Layout.jsx` controls the authenticated workspace.

Behavior:

- Uses Clerk `useUser()` to determine whether the current user is loaded and signed in.
- Displays a sign-in gate when the user is not authenticated.
- Displays a top nav and sidebar when the user is authenticated.
- Renders nested pages through React Router `Outlet`.
- Provides mobile sidebar open and close state.

### 6.5 Sidebar Navigation

`client/src/components/Sidebar.jsx` contains the active workspace navigation.

Current sidebar items:

- Dashboard
- Resume Review
- Resume Builder
- ATS Score Checker
- Cover Letter
- Job Email Generator
- Grammar Enhancer
- JD Analyzer
- README Generator
- Learning Plan
- Code Snippet
- LinkedIn Post
- Job Tracker

The sidebar also shows:

- User avatar and name.
- Current plan label through Clerk `Protect`.
- User profile access.
- Sign-out control.

### 6.6 Dashboard

`client/src/pages/Dashboard.jsx` fetches user creations from:

```text
GET /api/user/get-user-creations
```

It displays:

- Total creations.
- Active plan.
- Recent creations.

Creation rendering is handled by `client/src/components/CreationItem.jsx`.

Important implementation detail:

- `CreationItem` renders only `type === "image"` as an image preview.
- Other creation types are rendered as markdown.
- Several image-producing backend handlers store custom types such as `image-enhancement`, `photo-restoration`, `background-blur`, `logo`, and `youtube-thumbnail`. Those saved items may display as text/markdown URLs in the dashboard rather than image previews unless `CreationItem` is updated.

### 6.7 Routed Image Tool Pages

#### AI Image Generation

File: `client/src/pages/GenerateImages.jsx`

Backend endpoint:

```text
POST /api/ai/generate-image
```

Main controls:

- Prompt.
- Style preset: Realistic, Illustration, 3D, Minimal, Cyber, Anime.
- Aspect ratio: 1:1, 16:9, 9:16, Custom.
- Custom width and height.
- Negative prompt.
- Seed reference.
- Brand name, colors, and notes.
- Face consistency.
- Transparent background.
- Batch count.
- Commercial license prompt instruction.
- Publish flag.

#### Background Removal

File: `client/src/pages/RemoveBackground.jsx`

Backend endpoint:

```text
POST /api/ai/remove-image-background
```

Main controls:

- Multiple image uploads.
- Optional custom background image.
- Subject type: Auto, Human, Product, Animal.
- Edge refinement: Auto, Hair/Fur, Glass, Crisp Product.
- Output format: transparent PNG, solid color, or custom image.
- Background color.
- Shadow preservation.

#### Object Removal

File: `client/src/pages/RemoveObject.jsx`

Backend endpoint:

```text
POST /api/ai/remove-image-object
```

Main controls:

- Single image upload.
- Object list to remove.
- Suggestions such as person, wire, trash, text, logo, car, shadow, and reflection.
- Texture fill.
- Edge control.
- Local history of recent results.

#### Image Enhancer

File: `client/src/pages/ImageEnhancer.jsx`

Backend endpoint:

```text
POST /api/ai/enhance-image
```

Enhancement types:

- Auto enhance.
- Upscale 2x.
- Upscale 4x.
- Noise reduction.
- Sharpen and clarity.
- Face enhancement.
- Low-light recovery.
- Color correction.
- Old photo restoration.

#### Photo Restoration

File: `client/src/pages/PhotoRestoration.jsx`

Backend endpoint:

```text
POST /api/ai/restore-photo
```

Restoration types:

- Scratch and crease removal.
- Black and white to color.
- Deblur.
- Face clarity and repair.

#### Background Blur

File: `client/src/pages/BackgroundBlur.jsx`

Backend endpoint:

```text
POST /api/ai/blur-background
```

Main controls:

- Image upload.
- Blur intensity.
- Bokeh style: soft, circular, cinematic, custom.
- Subject mode: portrait or product.
- Preset: none, studio, outdoor, office.
- Replace background toggle.
- Background color.
- Custom bokeh prompt.
- Edge refinement.
- Focus control.

#### Logo Generator

File: `client/src/pages/LogoGenerator.jsx`

Backend endpoint:

```text
POST /api/ai/generate-logo
```

Main controls:

- Company name.
- Industry.
- Style.
- Colors.
- Font style.
- Description.
- Include icon.
- Include typography.
- Light/dark variants.
- Social versions.
- Favicon versions.
- Editable layers.
- Vector export intent.

#### YouTube Thumbnail Generator

File: `client/src/pages/YoutubeThumbnailGenerator.jsx`

Backend endpoint:

```text
POST /api/ai/generate-thumbnail
```

Main controls:

- Video title.
- Visual prompt.
- Template: Creator Face, Product Reveal, Tutorial, Before/After, Gaming, Podcast.
- Emotion: Neutral, Excited, Surprised, Confident, Curious.
- Text overlay.
- Face emphasis.
- High contrast.
- Background effects.
- CTR optimization.
- Variation count.

### 6.8 Existing but Currently Unrouted Frontend Pages

The following pages exist under `client/src/pages`, but they are not imported into `App.jsx` routes and are not listed in the current sidebar:

| Page File | Related Backend Endpoint | Purpose |
| --- | --- | --- |
| `WriteArticle.jsx` | `POST /api/ai/generate-article` | Article generation |
| `BlogTitles.jsx` | `POST /api/ai/generate-blog-title` | Blog title generation |
| `EmailGenerator.jsx` | `POST /api/ai/generate-email` | Email generation |
| `ReadmeGenerator.jsx` | `POST /api/ai/generate-readme` | README generation |
| `GrammarEnhancer.jsx` | `POST /api/ai/enhance-grammar` | Grammar and tone improvement |
| `CoverLetterGenerator.jsx` | `POST /api/ai/generate-cover-letter` | Cover letter generation |
| `ReviewResume.jsx` | `POST /api/ai/resume-review` | Resume PDF review |
| `ImageToText.jsx` | `POST /api/ai/image-to-text` | OCR and text formatting |

These files can be activated by importing them in `App.jsx`, adding routes, and adding sidebar entries.

## 7. Backend Application

### 7.1 Server Startup

File: `server/server.js`

Startup sequence:

1. Creates an Express app.
2. Connects Cloudinary through `connectCloudinary()`.
3. Initializes the database schema through `initDb()`.
4. Enables CORS.
5. Enables JSON request parsing.
6. Registers Clerk middleware.
7. Exposes a root health route:

```text
GET /
```

Response:

```text
Server is Live!
```

8. Mounts protected route groups:

```text
/api/ai
/api/user
```

Both groups use Clerk `requireAuth()` at the router mount level.

### 7.2 Backend Route Groups

| Route Group | File | Purpose |
| --- | --- | --- |
| `/api/ai` | `server/routes/aiRoutes.js` | AI text, image, file, and document tools |
| `/api/user` | `server/routes/userRoutes.js` | Creation history, published creations, and likes |

### 7.3 Custom Auth Middleware

File: `server/middlewares/auth.js`

The custom `auth` middleware:

- Reads `userId` and `has` from `req.auth()`.
- Checks whether the user has the Clerk `premium` plan.
- Fetches the Clerk user through `clerkClient.users.getUser(userId)`.
- Reads or initializes `privateMetadata.free_usage`.
- Adds these values to the request:

```js
req.plan = "premium" | "free";
req.free_usage = number;
```

Usage behavior:

- Premium users are treated as unlimited for free-usage tracked tools.
- Free users are capped at 10 uses for selected text and OCR tools.
- Premium-only tools return an error when `req.plan !== "premium"`.

## 8. Backend APIs

All APIs under `/api/ai` and `/api/user` require a valid Clerk bearer token.

Most controllers return a JSON body shaped like:

```json
{
  "success": true,
  "message": "Operation completed",
  "content": "result"
}
```

Errors are generally returned as JSON with `success: false`. The current code usually does not set non-200 HTTP status codes for validation or application errors.

### 8.1 AI Routes

| Method | Path | Handler | Access | Main Input |
| --- | --- | --- | --- | --- |
| POST | `/api/ai/generate-article` | `generateArticle` | Free up to 10, premium unlimited | `prompt`, `length` |
| POST | `/api/ai/generate-blog-title` | `generateBlogTitle` | Free up to 10, premium unlimited | `prompt` |
| POST | `/api/ai/generate-email` | `generateEmail` | Free up to 10, premium unlimited | `purpose`, `tone`, `recipient`, `context`, `subject`, `key_points` |
| POST | `/api/ai/generate-readme` | `generateReadme` | Free up to 10, premium unlimited | `project_title`, `description`, `tech_stack`, `installation`, `usage`, `features`, `license` |
| POST | `/api/ai/enhance-grammar` | `enhanceGrammar` | Free up to 10, premium unlimited | `text`, `tone`, `enhancement_level` |
| POST | `/api/ai/generate-cover-letter` | `generateCoverLetter` | Free up to 10, premium unlimited | `job_title`, `company_name`, `job_description`, `resume_highlights`, `tone`, `experience_level` |
| POST | `/api/ai/image-to-text` | `imageToText` | Free up to 10, premium unlimited | Multipart `image`, `language`, `extract_format` |
| POST | `/api/ai/generate-image` | `generateImage` | Premium only | Prompt and image generation settings |
| POST | `/api/ai/generate-logo` | `generateLogo` | Premium only | Logo brief settings |
| POST | `/api/ai/remove-image-background` | `removeImageBackground` | Premium only | Multipart images and background settings |
| POST | `/api/ai/remove-image-object` | `removeImageObject` | Premium only | Multipart image, `object`, `texture_fill`, `edge_control` |
| POST | `/api/ai/enhance-image` | `enhanceImage` | Premium only | Multipart image, `enhancement_type` |
| POST | `/api/ai/restore-photo` | `restorePhoto` | Premium only | Multipart image, `restoration_type` |
| POST | `/api/ai/blur-background` | `blurBackground` | Premium only | Multipart image and blur settings |
| POST | `/api/ai/generate-thumbnail` | `generateThumbnail` | Premium only | Thumbnail brief settings |
| POST | `/api/ai/resume-review` | `resumeReview` | Premium only | Multipart PDF `resume` |

### 8.2 User Routes

| Method | Path | Handler | Purpose |
| --- | --- | --- | --- |
| GET | `/api/user/get-user-creations` | `getUserCreations` | Fetch creations for the authenticated user |
| GET | `/api/user/get-published-creations` | `getPublishedCreations` | Fetch all public creations |
| POST | `/api/user/toggle-like-creation` | `toggleLikeCreation` | Like or unlike a published creation by creation id |

## 9. AI and Media Processing Details

### 9.1 Gemini Text Generation

`server/controllers/aiController.js` initializes the OpenAI SDK with:

```js
const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});
```

Text-generation routes use:

```text
gemini-2.0-flash
```

This applies to article, blog title, email, README, grammar enhancement, cover letter, resume review, and optional OCR formatting.

### 9.2 Clipdrop Image Generation

Image, logo, and thumbnail generation call:

```text
https://clipdrop-api.co/text-to-image/v1
```

The API key is read from:

```text
SECRET_API_KEY
```

The generated binary image response is converted to a base64 data URL and uploaded to Cloudinary.

### 9.3 Cloudinary Transformations

Cloudinary is used for:

- Uploading generated images.
- Uploading user images.
- Background removal.
- Background replacement.
- Object removal.
- Image enhancement.
- Upscaling.
- Restoration.
- Face enhancement.
- Color correction.
- Thumbnail sizing.
- Quality and format optimization.

Examples of effects used in the backend:

- `background_removal`
- `gen_remove`
- `gen_restore`
- `gen_colorize`
- `gen_deblur`
- `gen_face_enhance`
- `gen_background_replace`
- `auto_brightness`
- `auto_contrast`
- `auto_color`
- `sharpen`
- `improve`
- `vignette`

### 9.4 OCR

The image-to-text endpoint:

1. Accepts an uploaded image.
2. Uploads the image to Cloudinary.
3. Runs Tesseract.js OCR on the Cloudinary URL.
4. Uses Gemini to reformat the extracted text when the requested format is not plain text.
5. Saves the result as a creation.

Important note:

- The frontend exposes many language choices.
- The backend currently calls Tesseract with `eng`, so OCR is effectively English-only unless the controller is extended.
- `server/eng.traineddata` exists in the repository, but the current code does not explicitly wire it into Tesseract.

### 9.5 Resume Review

The resume review endpoint:

1. Accepts a PDF file under the field name `resume`.
2. Rejects files over 5 MB.
3. Reads the file from disk.
4. Extracts text with `pdf-parse`.
5. Sends the text to Gemini for review.
6. Saves the feedback as a `resume-review` creation.

## 10. Data Model

The backend initializes a single table in `server/config/initDb.js`.

```sql
CREATE TABLE IF NOT EXISTS creations (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  publish BOOLEAN NOT NULL DEFAULT false,
  likes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Indexes:

```sql
CREATE INDEX IF NOT EXISTS creations_user_id_created_at_idx
ON creations (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS creations_publish_created_at_idx
ON creations (publish, created_at DESC);
```

### 10.1 Creation Fields

| Field | Meaning |
| --- | --- |
| `id` | Numeric primary key |
| `user_id` | Clerk user id |
| `prompt` | Input prompt or operation description |
| `content` | Generated text or hosted media URL |
| `type` | Creation category |
| `publish` | Whether the creation is public |
| `likes` | Array of Clerk user ids that liked the creation |
| `created_at` | Creation timestamp |
| `updated_at` | Update timestamp |

### 10.2 Creation Types Used

Observed creation types include:

- `article`
- `blog-title`
- `email`
- `readme`
- `grammar-enhancement`
- `cover-letter`
- `image-to-text`
- `image`
- `image-enhancement`
- `logo`
- `resume-review`
- `photo-restoration`
- `background-blur`
- `youtube-thumbnail`

## 11. Authentication, Plans, and Usage Limits

Authentication and subscriptions are handled by Clerk.

Frontend usage:

- `ClerkProvider` wraps the app.
- `UserButton` is used in the navbar.
- `PricingTable` is used in the pricing section.
- `Protect plan="premium"` displays plan-specific labels.
- Tool pages call `useAuth().getToken()` and send the token as:

```text
Authorization: Bearer <token>
```

Backend usage:

- `clerkMiddleware()` runs globally.
- `requireAuth()` protects `/api/ai` and `/api/user`.
- Custom `auth` middleware checks the premium plan and populates usage metadata.

Free plan behavior:

- Text and OCR routes allow 10 free uses.
- Usage is stored in Clerk private metadata as `free_usage`.

Premium-only behavior:

- Image generation.
- Background removal.
- Object removal.
- Image enhancement.
- Photo restoration.
- Background blur.
- Logo generation.
- YouTube thumbnail generation.
- Resume review.

## 12. Environment Variables

### 12.1 Client

Create `client/.env` with:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BASE_URL=http://localhost:3000
```

`VITE_BASE_URL` should point to the running backend API.

### 12.2 Server

Create `server/.env` with:

```env
PORT=3000
DATABASE_URL=your_neon_database_url
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GEMINI_API_KEY=your_gemini_api_key
SECRET_API_KEY=your_clipdrop_api_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

Depending on Clerk configuration, additional Clerk server variables may be needed for the Express SDK in the deployment environment.

## 13. Local Development

### 13.1 Install Dependencies

Client:

```bash
cd client
npm install
```

Server:

```bash
cd server
npm install
```

### 13.2 Run the Backend

```bash
cd server
npm run dev
```

Default backend URL:

```text
http://localhost:3000
```

### 13.3 Run the Frontend

```bash
cd client
npm run dev
```

Vite normally serves the frontend on:

```text
http://localhost:5173
```

### 13.4 Build the Frontend

```bash
cd client
npm run build
```

### 13.5 Preview the Frontend Build

```bash
cd client
npm run preview
```

## 14. Deployment

### 14.1 Client Deployment

`client/vercel.json` rewrites every route to `/`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

This supports React Router client-side routing on Vercel.

### 14.2 Server Deployment

`server/vercel.json` configures `server.js` as a Vercel Node function:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

All production environment variables must be configured in Vercel for both client and server projects.

## 15. Quality, Tooling, and Tests

Client scripts:

```json
{
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

Server scripts:

```json
{
  "dev": "nodemon server.js",
  "start": "node server.js"
}
```

Current test status:

- No test or spec files were found in the repository.
- The client has ESLint configured.
- The server has no lint or test script in `server/package.json`.

## 16. Important Implementation Notes

### 16.1 Unrouted Feature Pages

The repository has more frontend pages than the current router exposes. If the goal is to make all backend tools available in the UI, `App.jsx`, `Sidebar.jsx`, and possibly `AiToolsData` should be extended.

### 16.2 Dashboard Image Preview Handling

The dashboard only treats `type === "image"` as an image. Several generated media tools save other type names while storing image URLs in `content`. Updating `CreationItem` to detect media URLs or support more image-like types would improve the creation history.

### 16.3 OCR Language Handling

`ImageToText.jsx` supports many language choices, but the backend always runs Tesseract with `eng`. To support multiple languages, the backend should map the frontend language field to Tesseract language codes and provide the needed trained data.

### 16.4 File Cleanup

Multer stores uploaded files on disk, but the controllers do not remove temporary upload files after Cloudinary upload or PDF parsing. Long-running deployments may need cleanup logic.

### 16.5 Response Status Codes

Most controller errors return `res.json({ success: false, ... })` without setting HTTP status codes. API consumers must inspect `success`. More conventional API behavior would use status codes such as 400, 401, 403, and 500.

### 16.6 Validation

Validation is currently handled inline in controllers and components. There is no shared schema validation layer. A validation library would reduce edge cases and keep client/server contracts clearer.

### 16.7 Background Blur Unused Values

The `blurBackground` controller calculates `blurStrength` and destructures `background_scene`, but the current transformation does not use those values. This is harmless but suggests unfinished or refactored behavior.

### 16.8 Axios Configuration

Most pages set `axios.defaults.baseURL = import.meta.env.VITE_BASE_URL` directly. A shared Axios client module would make this cleaner and less fragile.

### 16.9 Premium Feature Consistency

Premium enforcement is correctly implemented on the backend for premium-only tools. Frontend messaging and navigation could make premium requirements more explicit before a user submits a request.

## 17. Recommended Next Improvements

1. Wire the unrouted text, OCR, and resume pages into the app if those features should be public.
2. Update dashboard rendering so all media-producing creation types display image previews.
3. Add server-side cleanup for uploaded files.
4. Add shared API validation for request bodies and multipart file constraints.
5. Add automated tests for controllers, route protection, and database operations.
6. Centralize Axios setup in a reusable client module.
7. Add a public gallery page if published creations and likes are intended product features.
8. Align OCR language UI with actual Tesseract language support.
9. Use HTTP status codes for backend errors while preserving the current `success` response field.
10. Add server linting and formatting scripts.

## 18. Summary

FresherLab is a full-stack AI-powered job preparation SaaS with a polished React frontend and a feature-rich Express backend. Its core production path is an authenticated, premium-gated career AI workspace, backed by Gemini, Clerk, and Neon. The application provides 12 career-focused AI tools and a per-user job application tracker, all accessible from a clean sidebar navigation and career-progress dashboard.

Legacy image-processing code (Cloudinary, Clipdrop) remains in the backend but is no longer exposed in the active UI. The frontend uses a shared Axios client, reusable GeneratedOutput component with Copy/Download/Print actions, and React Markdown rendering for all AI outputs.
