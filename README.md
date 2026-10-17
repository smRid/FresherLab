<div align="center">

<img src="./public/logo.png" alt="FresherLab logo" width="92" />

# FresherLab

### AI-Powered Career & Job Preparation Platform for Freshers

FresherLab connects fresh graduates and junior IT candidates with intelligent AI
career tools powered by Google Gemini. From analyzing resumes and scoring ATS
compatibility against job descriptions to building ATS-ready resumes, drafting
tailored cover letters and cold emails, analyzing skill gaps, and tracking
job applications in a real-time pipeline, FresherLab brings everything needed
to land your first tech job into one focused workspace.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_FresherLab-2ea44f?style=for-the-badge)](https://fresherlab.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Authentication-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.0_Flash-4285F4?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Stripe](https://img.shields.io/badge/Stripe-Subscriptions-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://fresherlab.vercel.app)

</div>

---

## Preview

<p align="center">
  <img src="./public/preview1.png" alt="FresherLab landing page" width="1000" />
</p>

<p align="center">
  <img src="./public/preview2.png" alt="FresherLab career workspace" width="1000" />
</p>

> **Live site:** [https://fresherlab.vercel.app](https://fresherlab.vercel.app)

---

## Features

| Feature                             | Description                                                                                          |
| :---------------------------------- | :--------------------------------------------------------------------------------------------------- |
| **Clerk Authentication**            | Secure sign-up, sign-in, session handling, user profiles, and protected `/ai` workspace routes       |
| **AI Resume Review**                | Upload PDF resumes (up to 5MB) to extract text and receive deep AI critique on strengths and gaps    |
| **ATS Score & Keyword Matcher**     | Evaluates resumes against target job descriptions with keyword match scoring and section checks      |
| **Step-by-Step Resume Builder**     | Guided form generating ATS-formatted resumes with LaTeX and structured markdown export options       |
| **Tailored Cover Letter Generator** | Context-driven cover letters customized by role, company name, tone, and candidate achievements      |
| **Job Email & Cold Outreach**       | Generates recruiter outreach, referral requests, application follow-ups, and interview replies       |
| **Job Description Analyzer**        | Extracts core competencies, required tech stacks, red flags, and interview questions from raw JDs    |
| **GitHub README Generator**         | Creates portfolio-ready repository READMEs with badges, architecture overviews, and setup steps      |
| **Grammar & Bullet Enhancer**       | Polishes resume bullet points and professional correspondence into high-impact action statements     |
| **Job Application Tracker**         | Full CRUD pipeline to track applications by status, company, role, follow-up dates, and interview notes |
| **Workspace Creation History**      | Stores AI outputs in Neon PostgreSQL with one-click copy, markdown download, and print capabilities  |
| **Tiered Usage & Subscriptions**    | Free tier with 10 free generations tracked in PostgreSQL and unlimited usage for Stripe Premium      |
| **Stripe Checkout & Webhooks**      | Automated checkout sessions, webhook lifecycle processing, customer portal, and plan synchronization |

---

## How It Works

1. **Authentication:** A candidate signs in with Clerk and enters the protected `/ai` career workspace.
2. **Tool Selection:** The user selects a career tool (Resume Review, ATS Checker, Resume Builder, Cover Letter, Job Email, JD Analyzer, or Job Tracker).
3. **Context Ingestion:** The user uploads a resume PDF (parsed on the server with `pdf-parse`) or submits role details and target company requirements.
4. **Validation & Quota Check:** Express validates inputs with Zod schemas and verifies remaining credits or active Stripe Premium status.
5. **AI Processing:** Google Gemini (`gemini-2.0-flash` via OpenAI SDK protocol) generates structured, actionable career materials.
6. **Artifact Persistence:** Results are saved to Neon PostgreSQL under the user's account with instant copy, download, and print options.
7. **Pipeline Tracking:** The candidate logs the job in their Job Tracker to monitor application milestones from submission to offer.

---

## Tech Stack

<div align="center">

|       Technology       | Purpose                                                                             |
| :--------------------: | :---------------------------------------------------------------------------------- |
|      **React 19**      | Interactive component-based landing page, career tools, and workspace UI            |
|       **Vite 7**       | Modern build tooling, fast hot module replacement, and client bundling              |
|     **Express 5**      | Modular REST API server, authentication middleware, and route handlers              |
|   **Tailwind CSS 4**   | Utility-first responsive design, modern dark/light mode palette, and typography     |
|   **React Router 7**   | Declarative client-side routing and protected workspace subroutes                   |
|       **Clerk**        | Hosted authentication, JWT verification, session tokens, and user profile management |
|  **Neon PostgreSQL**   | Serverless PostgreSQL database for creations, job applications, and subscriptions   |
|   **Google Gemini**    | High-speed `gemini-2.0-flash` LLM for career document generation and ATS analysis   |
|       **Stripe**       | Subscription billing, checkout sessions, and automated webhook lifecycle management  |
|        **Zod**         | Runtime schema validation, input sanitization, and error handling                   |
|     **pdf-parse**      | Server-side text extraction from candidate resume PDF uploads                       |
|   **React Markdown**   | GitHub-flavored markdown rendering for generated career materials                   |
|   **React Hot Toast**  | Accessible, lightweight toast feedback for asynchronous user actions                |
|    **Lucide React**    | Clean, consistent icon set across the workspace and navigation                      |
|     **Cloudinary**     | Cloud-based file handling and media asset management                                |
|       **Vercel**       | Production hosting for client Single Page Application and serverless API functions  |

</div>

---

## Project Structure

```text
FresherLab/
|-- client/                              # Frontend React 19 + Vite application
|   |-- public/
|   |   |-- favicon.svg                  # Browser favicon
|   |   |-- gradientBackground.png       # Hero visual backdrop
|   |   |-- logo.png                     # FresherLab logo
|   |   |-- preview.png                  # Landing page preview
|   |   |-- preview2.png                 # Workspace preview
|   |   |-- robots.txt                   # Search crawler configuration
|   |   |-- site.webmanifest             # PWA web manifest
|   |   `-- sitemap.xml                  # Search engine sitemap
|   |-- src/
|   |   |-- assets/                      # Static assets and tool definitions
|   |   |-- components/
|   |   |   |-- AiTools.jsx              # Landing page tools showcase
|   |   |   |-- CreationItem.jsx         # Saved creation card with actions
|   |   |   |-- Footer.jsx               # Site footer
|   |   |   |-- GeneratedOutput.jsx      # Reusable Markdown display with Copy/Print
|   |   |   |-- Hero.jsx                 # Hero marketing banner
|   |   |   |-- Navbar.jsx               # Main navigation with Clerk auth buttons
|   |   |   |-- Plan.jsx                 # Pricing tiers and upgrade buttons
|   |   |   |-- Sidebar.jsx              # Workspace navigation and plan indicator
|   |   |   `-- Testimonial.jsx          # User reviews and social proof
|   |   |-- context/                     # Context providers (user state)
|   |   |-- lib/
|   |   |   `-- api.js                   # Pre-configured Axios instance
|   |   |-- pages/
|   |   |   |-- AtsScoreChecker.jsx      # ATS score and keyword matching tool
|   |   |   |-- CoverLetterGenerator.jsx # Tailored cover letter generator
|   |   |   |-- Dashboard.jsx            # Career dashboard and saved creations
|   |   |   |-- EmailGenerator.jsx       # Job and recruiter email generator
|   |   |   |-- GrammarEnhancer.jsx      # Resume bullet & grammar enhancer
|   |   |   |-- Home.jsx                 # Public landing page
|   |   |   |-- JobDescriptionAnalyzer.jsx # Job description skill breakdown
|   |   |   |-- JobTracker.jsx           # Full job application pipeline manager
|   |   |   |-- Layout.jsx               # Protected workspace shell with sidebar
|   |   |   |-- ReadmeGenerator.jsx      # GitHub repository README builder
|   |   |   |-- ResumeBuilder.jsx        # Step-by-step resume builder with LaTeX
|   |   |   `-- ReviewResume.jsx         # PDF resume review & critique
|   |   |-- App.jsx                      # Route definitions
|   |   |-- index.css                    # Tailwind CSS 4 theme imports
|   |   `-- main.jsx                     # Application entry point with ClerkProvider
|   |-- .env.example                     # Client environment template
|   |-- eslint.config.js                 # ESLint rules
|   |-- package.json                     # Client scripts and dependencies
|   |-- vercel.json                      # Client SPA rewrite rules
|   `-- vite.config.js                   # Vite configuration
|-- server/                              # Backend Express 5 REST API
|   |-- config/
|   |   |-- cloudinary.js                # Cloudinary SDK connection
|   |   |-- db.js                        # Neon PostgreSQL connection client
|   |   |-- initDb.js                    # Database table and index initialization
|   |   |-- multer.js                    # File upload configuration
|   |   `-- usageLimits.js               # Usage limit thresholds
|   |-- controllers/
|   |   |-- aiController.js              # Gemini prompt execution and analysis
|   |   `-- userController.js            # Creations and Job Tracker CRUD logic
|   |-- middlewares/
|   |   `-- auth.js                      # Clerk authentication & subscription gating
|   |-- routes/
|   |   |-- aiRoutes.js                  # AI career tool endpoints
|   |   |-- stripeRoutes.js              # Stripe checkout and webhook handlers
|   |   `-- userRoutes.js                # Creations and Job Tracker routes
|   |-- utils/
|   |   `-- latexResume.js               # LaTeX resume compilation helper
|   |-- validators/
|   |   `-- schemas.js                   # Zod request validation schemas
|   |-- .env.example                     # Server environment template
|   |-- package.json                     # Server scripts and dependencies
|   |-- server.js                        # Express server entry point
|   `-- vercel.json                      # Serverless function configuration
|-- docs/                                # Sample resume test PDFs
|-- public/                              # Root public assets for documentation
|   |-- logo.png
|   |-- preview1.png
|   `-- preview2.png
|-- .env.example                         # Combined environment template
|-- document.md                          # Comprehensive project technical specifications
|-- LICENSE                              # MIT License
`-- README.md                            # Project documentation
```

---

## API Overview

### AI Career Tools (`/api/ai`)

All AI career endpoints require an authenticated Clerk Bearer token.

| Endpoint                            |  Method  | Access              | Purpose                                                                |
| :---------------------------------- | :------: | :------------------ | :--------------------------------------------------------------------- |
| `/api/ai/resume-review`             |  `POST`  | Free (10) / Premium | Upload PDF resume to receive comprehensive AI feedback and critique    |
| `/api/ai/ats-score`                 |  `POST`  | Free (10) / Premium | Score resume PDF against target JD with matched and missing keywords   |
| `/api/ai/resume-builder`            |  `POST`  | Free (10) / Premium | Generate structured resume content with LaTeX export support           |
| `/api/ai/generate-cover-letter`     |  `POST`  | Free (10) / Premium | Create targeted cover letters customized for specific job roles        |
| `/api/ai/generate-email`            |  `POST`  | Free (10) / Premium | Draft professional cold outreach, referral requests, and follow-ups    |
| `/api/ai/job-description-analysis`  |  `POST`  | Free (10) / Premium | Analyze job postings for required skills, gaps, and interview questions|
| `/api/ai/generate-readme`           |  `POST`  | Free (10) / Premium | Build portfolio-ready GitHub README files with setup and tech stack    |
| `/api/ai/enhance-grammar`           |  `POST`  | Free (10) / Premium | Polish resume bullet points and professional statements                |
| `/api/ai/learning-plan`             |  `POST`  | Free (10) / Premium | Generate customized learning roadmaps for target tech roles            |
| `/api/ai/code-snippet`              |  `POST`  | Free (10) / Premium | Generate educational, interview-focused code examples                  |

### User & Job Tracker (`/api/user`)

| Endpoint                       |   Method   | Purpose                                                                |
| :----------------------------- | :--------: | :--------------------------------------------------------------------- |
| `/api/user/get-user-creations` |   `GET`    | Retrieve all saved AI creations for the authenticated user             |
| `/api/user/get-published-creations` | `GET` | Retrieve community-shared creations                                    |
| `/api/user/toggle-like-creation`| `POST`    | Like or unlike a shared creation                                       |
| `/api/user/job-applications`   |   `GET`    | Fetch all tracked job applications for the candidate                   |
| `/api/user/job-applications`   |   `POST`   | Add a new job application (company, role, status, contact, notes)      |
| `/api/user/job-applications/:id` | `PUT`    | Update application status, salary range, follow-up dates, or notes     |
| `/api/user/job-applications/:id` | `DELETE` | Delete a job application from the tracker                              |

### Stripe Subscriptions (`/api/stripe`)

| Endpoint                                | Method | Purpose                                                                |
| :-------------------------------------- | :----: | :--------------------------------------------------------------------- |
| `/api/stripe/create-checkout-session`   | `POST` | Initialize a Stripe Checkout session for the Premium subscription      |
| `/api/stripe/subscription-status`       | `GET`  | Return user's active plan (`free` or `premium`), status, and usage     |
| `/api/stripe/webhook`                   | `POST` | Raw body webhook handler verifying events and updating subscriptions   |

---

## Environment Variables

Copy the example configuration for each project:

```bash
# Frontend
cp client/.env.example client/.env

# Backend
cp server/.env.example server/.env
```

On Windows PowerShell:

```powershell
# Frontend
Copy-Item client/.env.example client/.env

# Backend
Copy-Item server/.env.example server/.env
```

### Frontend Configuration (`client/.env`)

```env
# Backend API URL (use http://localhost:3000 locally)
VITE_BASE_URL=http://localhost:3000

# Clerk Authentication Publishable Key
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
```

### Backend Configuration (`server/.env`)

```env
# Server Port
PORT=3000

# Client App URL for CORS and Stripe Redirects
CLIENT_URL=http://localhost:5173

# Neon PostgreSQL Connection String
DATABASE_URL=postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require

# Google Gemini API Key (Google AI Studio)
GEMINI_API_KEY=your_gemini_api_key

# Clerk Authentication Keys
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

# Stripe Subscriptions & Billing
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PRICE_ID=price_your_stripe_monthly_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_signing_secret

# Cloudinary Media Storage (Optional for media uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Key Integrations Setup

1. **Clerk Authentication:**
   - Create an application in the [Clerk Dashboard](https://dashboard.clerk.com).
   - Enable Email and Google social providers.
   - Copy the Publishable and Secret keys into `client/.env` and `server/.env`.
2. **Google Gemini:**
   - Generate an API Key in [Google AI Studio](https://aistudio.google.com).
   - Assign the key to `GEMINI_API_KEY` in `server/.env`.
3. **Neon PostgreSQL:**
   - Create a serverless Postgres project on [Neon](https://neon.tech).
   - Set `DATABASE_URL` in `server/.env`. Database tables and indexes are initialized automatically on server boot via `initDb()`.
4. **Stripe Subscriptions & Webhooks:**
   - Create a recurring monthly product/price in the [Stripe Dashboard](https://dashboard.stripe.com).
   - Set up a webhook endpoint pointing to `/api/stripe/webhook` listening for `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/smRid/FresherLab.git
cd FresherLab
```

### 2. Install dependencies

Install both frontend and backend dependencies:

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Configure environment variables

Populate `client/.env` and `server/.env` with your API keys as described in the [Environment Variables](#environment-variables) section.

### 4. Start development servers

In your first terminal, start the Express backend:

```bash
cd server
npm run dev
```

The server starts on [http://localhost:3000](http://localhost:3000) and automatically creates the required PostgreSQL tables.

In your second terminal, start the Vite frontend:

```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Scripts

### Frontend (`client/`)

| Command           | Description                                        |
| :---------------- | :------------------------------------------------- |
| `npm run dev`     | Start the Vite local development server            |
| `npm run build`   | Build the production Single Page Application (SPA) |
| `npm run preview` | Locally preview the production build               |
| `npm run lint`    | Run ESLint across client components and pages      |

### Backend (`server/`)

| Command           | Description                                        |
| :---------------- | :------------------------------------------------- |
| `npm run dev`     | Start the API server with `nodemon` hot reloading  |
| `npm start`       | Start the production Node.js Express server        |

---

## Deployment

Both the client and backend can be deployed seamlessly on Vercel:

**Production Site:** [https://fresherlab.vercel.app](https://fresherlab.vercel.app)

### Frontend Deployment (Vercel)

1. Import the `client` directory as a project on Vercel.
2. Set Framework Preset to **Vite**.
3. Add `VITE_BASE_URL` (pointing to your production backend URL) and `VITE_CLERK_PUBLISHABLE_KEY`.
4. Client-side routing is handled via `client/vercel.json`:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/" }]
   }
   ```

### Backend Deployment (Vercel)

1. Import the `server` directory as a separate project or configure as a monorepo function.
2. Ensure `server/vercel.json` routes all requests to `server.js` using `@vercel/node`:
   ```json
   {
     "version": 2,
     "builds": [{ "src": "server.js", "use": "@vercel/node" }],
     "routes": [{ "src": "/(.*)", "dest": "server.js" }]
   }
   ```
3. Add all server environment variables (`DATABASE_URL`, `GEMINI_API_KEY`, `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`, etc.) in the Vercel project settings.
4. Update the Stripe webhook URL to `https://your-server.vercel.app/api/stripe/webhook`.

---

## Security Notes

- **JWT Authentication:** All `/api/ai`, `/api/user`, and `/api/stripe` endpoints are guarded by Clerk authentication tokens.
- **Zod Schema Validation:** All user inputs are validated and sanitized using Zod schemas before hitting business logic.
- **Safe File Handling:** Uploaded PDF resumes are capped at 5MB, inspected for MIME validity, and automatically purged from temporary storage after parsing.
- **SQL Injection Prevention:** All database operations utilize parameterized queries through `@neondatabase/serverless`.
- **Webhook Integrity:** Stripe webhooks verify HMAC signatures against `STRIPE_WEBHOOK_SECRET` using raw request payloads before processing subscription updates.
- **Secret Isolation:** API secrets remain strictly in backend environment variables and are never bundled in client code.

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

<div align="center">

Built with React 19, Vite, Express, Clerk, Neon PostgreSQL, Google Gemini, Stripe, and Tailwind CSS.

</div>