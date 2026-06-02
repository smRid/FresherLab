import logo from "./logo.svg";
import gradientBackground from "/gradientBackground.png";
import user_group from "./user_group.png";
import star_icon from "./star_icon.svg";
import star_dull_icon from "./star_dull_icon.svg";
import profile_img_1 from "./profile_img_1.png";
import arrow_icon from "./arrow_icon.svg";
import { BarChart3, BookOpen, BriefcaseBusiness, Code2, FileSearch, FileText, Github, Linkedin, Mail, PenTool, Search, Send } from 'lucide-react'

export const assets = {
    logo,
    gradientBackground,
    user_group,
    star_icon,
    star_dull_icon,
    profile_img_1,
    arrow_icon,
};

export const AiToolsData = [
    {
        title: 'Resume Review',
        description: 'Upload your resume and get recruiter-style feedback, ATS insights, skill gaps, and a 7-day action plan.',
        Icon: FileSearch,
        bg: { from: '#3C81F6', to: '#9234EA' },
        path: '/ai/resume-review'
    },
    {
        title: 'Resume Builder',
        description: 'Build an ATS-friendly fresher resume from your skills, projects, education, links, and target role.',
        Icon: FileText,
        bg: { from: '#20C363', to: '#11B97E' },
        path: '/ai/resume-builder'
    },
    {
        title: 'ATS Score Checker',
        description: 'Compare your resume against a job description and find missing keywords before applying.',
        Icon: BarChart3,
        bg: { from: '#F76C1C', to: '#F04A3C' },
        path: '/ai/ats-checker'
    },
    {
        title: 'Cover Letter',
        description: 'Generate tailored cover letters with full, short, email-ready, and subject line versions.',
        Icon: Mail,
        bg: { from: '#5C6AF1', to: '#427DF5' },
        path: '/ai/cover-letter'
    },
    {
        title: 'Job Email Generator',
        description: 'Write cold outreach, referral requests, recruiter messages, follow-ups, and thank-you emails.',
        Icon: Send,
        bg: { from: '#FF6B35', to: '#FF8E53' },
        path: '/ai/job-email-generator'
    },
    // {
    //     title: 'Grammar Enhancer',
    //     description: 'Polish resume bullets, emails, cover letters, LinkedIn posts, and professional writing.',
    //     Icon: PenTool,
    //     bg: { from: '#12B7AC', to: '#08B6CE' },
    //     path: '/ai/grammar-enhancer'
    // },
    {
        title: 'JD Analyzer',
        description: 'Extract skills, ATS keywords, responsibilities, gaps, and project ideas from job descriptions.',
        Icon: Search,
        bg: { from: '#9333EA', to: '#C026D3' },
        path: '/ai/job-description-analyzer'
    },
    {
        title: 'README Generator',
        description: 'Create portfolio-ready GitHub README files that explain your fresher projects professionally.',
        Icon: Github,
        bg: { from: '#DC2626', to: '#F97316' },
        path: '/ai/readme-generator'
    },
    // {
    //     title: 'Learning Plan',
    //     description: 'Generate a personalized roadmap with weekly tasks, projects, resources, and interview prep.',
    //     Icon: BookOpen,
    //     bg: { from: '#2563EB', to: '#06B6D4' },
    //     path: '/ai/learning-plan'
    // },
    // {
    //     title: 'Code Snippet',
    //     description: 'Generate beginner-friendly code examples with explanations, tests, and common mistakes.',
    //     Icon: Code2,
    //     bg: { from: '#111827', to: '#4F46E5' },
    //     path: '/ai/code-snippet-generator'
    // },
    // {
    //     title: 'LinkedIn Post',
    //     description: 'Turn projects, certifications, learning updates, and job-seeking goals into strong posts.',
    //     Icon: Linkedin,
    //     bg: { from: '#0A66C2', to: '#0284C7' },
    //     path: '/ai/linkedin-post-generator'
    // },
    {
        title: 'Job Tracker',
        description: 'Track saved jobs, applications, interviews, follow-ups, offers, rejections, contacts, and notes.',
        Icon: BriefcaseBusiness,
        bg: { from: '#16A34A', to: '#65A30D' },
        path: '/ai/job-tracker'
    }
]

export const dummyTestimonialData = [
    {
        image: assets.profile_img_1,
        name: 'John Doe',
        title: 'Marketing Director, TechCorp',
        content: 'FresherLab helped me improve my resume and understand exactly what recruiters look for.',
        rating: 4,
    },
    {
        image: assets.profile_img_1,
        name: 'Jane Smith',
        title: 'Content Creator, TechCorp',
        content: 'The ATS checker and job email generator made my applications more focused and professional.',
        rating: 5,
    },
    {
        image: assets.profile_img_1,
        name: 'David Lee',
        title: 'Content Writer, TechCorp',
        content: 'FresherLab gave me a clear learning roadmap and helped me present my projects better on GitHub.',
        rating: 4,
    },
]


export const dummyCreationData = [
    {
        "id": 9,
        "user_id": "user_2yMX02PRbyMtQK6PebpjnxvRNIA",
        "prompt": "Generate a blog title for the keyword blog in the category Technology.",
        "content": "Here are a few blog title options for a technology blog, playing with different angles:\n\n**General & Broad:**\n\n*   The Tech Blog: News, Reviews, and Insights\n*   Technology Today: Your Daily Dose of Tech\n*   The Future is Now: Exploring the World of Technology\n*   Tech Talk: Unpacking the Latest Innovations\n\n**More Specific & Intriguing:**\n\n*   Decoding Tech: Making Sense of the Digital World\n*   Beyond the Gadgets: The",
        "type": "blog-title",
        "publish": false,
        "likes": [],
        "created_at": "2025-07-01T11:09:50.492Z",
        "updated_at": "2025-07-01T11:09:50.492Z"
    },
    {
        "id": 8,
        "user_id": "user_2yMX02PRbyMtQK6PebpjnxvRNIA",
        "prompt": "Generate a blog title for the keyword blog in the category General.",
        "content": "Here are a few blog title options for a blog about blogs in the General category, ranging from straightforward to a bit more creative:\n\n**Straightforward:**\n\n*   The Blog Blog: Everything You Need to Know About Blogging\n*   Blogging Insights: Tips, Tricks, and Trends\n*   Your Guide to the World of Blogging\n\n**More Creative:**\n\n*   Beyond the Post: Exploring the Art of Blogging\n*   Blogosphere Unlocked: Navigating the World of Online Writing",
        "type": "blog-title",
        "publish": false,
        "likes": [],
        "created_at": "2025-07-01T11:08:10.450Z",
        "updated_at": "2025-07-01T11:08:10.450Z"
    },
    {
        "id": 7,
        "user_id": "user_2yMX02PRbyMtQK6PebpjnxvRNIA",
        "prompt": "Write an article about AI With Coding in Short (500-800 word).",
        "content": "## AI and Coding: A Symbiotic Partnership Reshaping the Future\n\nArtificial intelligence (AI) and coding, once distinct disciplines, are now deeply intertwined, forging a powerful symbiotic relationship that's revolutionizing industries and accelerating innovation. Understanding this connection is crucial for anyone seeking to navigate the future of technology.\n\nAt its core, AI is the ability of a machine to mimic intelligent human behavior. This is achieved through algorithms, which are essentially sets of instructions meticulously crafted by programmers – coders. Coding, therefore, is the backbone of AI, providing the language and structure necessary to bring these algorithms to life.\n\n**Coding Fuels AI: Building the Foundation**\n\nAI models don't magically appear. They are built, trained, and deployed using code. Here's how:\n\n*   **Data Preprocessing:** Raw data, the lifeblood of AI, is often messy and unusable in its original form. Coders use programming languages like Python with libraries like Pandas and NumPy to clean, transform, and prepare this data for training. This involves handling missing values, removing inconsistencies, and formatting data into a suitable structure.\n*   **Model Development:** Coders utilize programming languages like Python and R, coupled with machine learning libraries like TensorFlow, PyTorch, and scikit-learn, to build and train AI models. These libraries provide pre-built functionalities and tools that simplify the process of creating complex algorithms.\n*   **Deployment and Integration:** Once trained, AI models need to be deployed and integrated into real-world applications. This involves writing code to connect the model to existing systems, handle user input, and present the results in a user-friendly manner.\n*   **Maintenance and Optimization:** AI models are not static entities. They require constant monitoring, maintenance, and optimization to ensure they remain accurate and effective. Coders play a vital role in identifying and addressing performance issues, retraining models with new data, and adapting them to changing requirements.\n\n**AI Empowers Coding: Revolutionizing Development**\n\nThe relationship isn't just one-way. AI is also transforming the way coding is done, making developers more efficient and productive.\n\n*   **Code Completion and Suggestion:** AI-powered tools like GitHub Copilot and Tabnine analyze code context and suggest code snippets, reducing repetitive tasks and accelerating development. These tools learn from vast code repositories and can predict what a developer is likely to write next, saving significant time and effort.\n*   **Automated Testing and Debugging:** AI can automate the process of testing code and identifying bugs. By analyzing code patterns and identifying potential vulnerabilities, AI tools can help developers catch errors early and improve code quality.\n*   **Code Generation:** AI is increasingly capable of generating code from natural language descriptions. This allows developers to focus on the higher-level aspects of software design and leave the more tedious coding tasks to AI.\n*   **Personalized Learning:** AI can personalize the learning experience for aspiring coders by tailoring educational content and providing individualized feedback. This can make learning to code more effective and engaging.\n\n**The Future: Collaboration and Specialization**\n\nThe future of AI and coding is one of increasing collaboration and specialization. As AI becomes more sophisticated, coders will need to focus on higher-level tasks such as designing AI architectures, managing data pipelines, and ensuring ethical considerations are addressed.\n\nThe demand for skilled professionals who understand both AI and coding is rapidly growing. Individuals with this skillset are well-positioned to lead the charge in developing innovative AI-powered solutions across a wide range of industries.\n\n**In conclusion,** AI and coding are not separate entities but rather two sides of the same coin. Coding provides the foundation for AI, while AI empowers coding, leading to a more efficient and innovative development process. Understanding this symbiotic relationship is essential for anyone seeking to thrive in the rapidly evolving landscape of technology. As AI continues to advance, the demand for skilled professionals who can bridge",
        "type": "article",
        "publish": false,
        "likes": [],
        "created_at": "2025-07-01T11:07:51.312Z",
        "updated_at": "2025-07-01T11:07:51.312Z"
    }
]


export const dummyPublishedCreationData = [
    {
        "id": 1,
        "user_id": "user_2yMX02PRbyMtQK6PebpjnxvRNIA",
        "prompt": "Generate an image of A Boy is on Boat , and fishing in the style Anime style.",
        "content": "https://via.placeholder.com/400x300/4f46e5/ffffff?text=AI+Generated+Image+1",
        "type": "image",
        "publish": true,
        "likes": [
            "user_2yMX02PRbyMtQK6PebpjnxvRNIA",
            "user_2yaW5EHzeDfQbXdAJWYFnZo2bje"
        ],
        "created_at": "2025-06-19T09:02:25.035Z",
        "updated_at": "2025-06-19T09:58:37.552Z",
    },
    {
        "id": 2,
        "user_id": "user_2yMX02PRbyMtQK6PebpjnxvRNIA",
        "prompt": "Generate an image of A Boy Riding a bicycle on road and bicycle is from year 2201  in the style Anime style.",
        "content": "https://via.placeholder.com/400x300/7c3aed/ffffff?text=AI+Generated+Image+2",
        "type": "image",
        "publish": true,
        "likes": [
            "user_2yMX02PRbyMtQK6PebpjnxvRNIA",
            "user_2yaW5EHzeDfQbXdAJWYFnZo2bje"
        ],
        "created_at": "2025-06-19T08:16:54.614Z",
        "updated_at": "2025-06-19T09:58:40.072Z",
    },
    {
        "id": 3,
        "user_id": "user_2yaW5EHzeDfQbXdAJWYFnZo2bje",
        "prompt": "Generate an image of a boy riding a car on sky in the style Realistic.",
        "content": "https://via.placeholder.com/400x300/059669/ffffff?text=AI+Generated+Image+3",
        "type": "image",
        "publish": true,
        "likes": [
            "user_2yaW5EHzeDfQbXdAJWYFnZo2bje"
        ],
        "created_at": "2025-06-23T11:29:23.351Z",
        "updated_at": "2025-06-23T11:29:44.434Z",
        "__v": 1
    },
]
