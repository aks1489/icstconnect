import { useState, useEffect } from 'react'
import TechPopup, { type TechPopupAnchorRect, type TechCompanyUsage } from '../../ui/TechPopup'
import { getTechIconUrl, warmupTechIcons } from '../../../data/techIcons'

interface TechItem {
    name: string
    iconUrl: string
    color: string
    chipBg: string
    description: string
    keyPoints: string[]
    opportunities: string
    usedBy: TechCompanyUsage[]
}

const COMPANIES = {
    meta: { name: 'Meta', iconUrl: getTechIconUrl('company:meta') },
    google: { name: 'Google', iconUrl: getTechIconUrl('company:google') },
    microsoft: { name: 'Microsoft', iconUrl: getTechIconUrl('company:microsoft') },
    apple: { name: 'Apple', iconUrl: getTechIconUrl('company:apple') },
    netflix: { name: 'Netflix', iconUrl: getTechIconUrl('company:netflix') },
    uber: { name: 'Uber', iconUrl: getTechIconUrl('company:uber') },
    airbnb: { name: 'Airbnb', iconUrl: getTechIconUrl('company:airbnb') },
    spotify: { name: 'Spotify', iconUrl: getTechIconUrl('company:spotify') },
    stripe: { name: 'Stripe', iconUrl: getTechIconUrl('company:stripe') },
    shopify: { name: 'Shopify', iconUrl: getTechIconUrl('company:shopify') },
    vercel: { name: 'Vercel', iconUrl: getTechIconUrl('company:vercel') },
    tesla: { name: 'Tesla', iconUrl: getTechIconUrl('company:tesla') },
    nvidia: { name: 'NVIDIA', iconUrl: getTechIconUrl('company:nvidia') },
    discord: { name: 'Discord', iconUrl: getTechIconUrl('company:discord') },
    paypal: { name: 'PayPal', iconUrl: getTechIconUrl('company:paypal') },
    paytm: { name: 'Paytm', iconUrl: getTechIconUrl('company:paytm') },
    razorpay: { name: 'Razorpay', iconUrl: getTechIconUrl('company:razorpay') },
    zoho: { name: 'Zoho', iconUrl: getTechIconUrl('company:zoho') },
    zomato: { name: 'Zomato', iconUrl: getTechIconUrl('company:zomato') },
    swiggy: { name: 'Swiggy', iconUrl: getTechIconUrl('company:swiggy') },
    dropbox: { name: 'Dropbox', iconUrl: getTechIconUrl('company:dropbox') },
    pinterest: { name: 'Pinterest', iconUrl: getTechIconUrl('company:pinterest') },
    gitlab: { name: 'GitLab', iconUrl: getTechIconUrl('company:gitlab') },
    atlassian: { name: 'Atlassian', iconUrl: getTechIconUrl('company:atlassian') },
    intel: { name: 'Intel', iconUrl: getTechIconUrl('company:intel') },
    youtube: { name: 'YouTube', iconUrl: getTechIconUrl('company:youtube') },
    instagram: { name: 'Instagram', iconUrl: getTechIconUrl('company:instagram') },
    reddit: { name: 'Reddit', iconUrl: getTechIconUrl('company:reddit') },
    notion: { name: 'Notion', iconUrl: getTechIconUrl('company:notion') },
    infosys: { name: 'Infosys', iconUrl: getTechIconUrl('company:infosys') },
    tata: { name: 'Tata Group', iconUrl: getTechIconUrl('company:tata') }
} as const

const TECH_ITEMS: TechItem[] = [
    {
        name: 'React',
        iconUrl: getTechIconUrl('tech:react'),
        color: '#0284C7',
        chipBg: 'rgba(2, 132, 199, 0.10)',
        description: 'The most popular library for building modern, interactive user interfaces.',
        keyPoints: ['Component-Based', 'Virtual DOM', 'Huge Ecosystem'],
        opportunities: 'Frontend Developer, React Native Developer',
        usedBy: [COMPANIES.meta, COMPANIES.netflix, COMPANIES.airbnb]
    },
    {
        name: 'Next.js',
        iconUrl: getTechIconUrl('tech:nextjs'),
        color: '#0F172A',
        chipBg: 'rgba(15, 23, 42, 0.07)',
        description: 'The React Framework for the Web. Used by some of the world\'s largest companies.',
        keyPoints: ['Server-Side Rendering', 'Static Site Gen', 'SEO Friendly'],
        opportunities: 'React Developer, Full Stack Engineer',
        usedBy: [COMPANIES.vercel, COMPANIES.netflix, COMPANIES.notion]
    },
    {
        name: 'JavaScript',
        iconUrl: getTechIconUrl('tech:javascript'),
        color: '#CA8A04',
        chipBg: 'rgba(234, 179, 8, 0.14)',
        description: 'The core programming language powering interactive websites and web applications.',
        keyPoints: ['DOM Manipulation', 'Async / Promises', 'Full-Stack ES6+'],
        opportunities: 'Web Developer, Frontend Engineer',
        usedBy: [COMPANIES.google, COMPANIES.paypal, COMPANIES.uber]
    },
    {
        name: 'TypeScript',
        iconUrl: getTechIconUrl('tech:typescript'),
        color: '#2572AB',
        chipBg: 'rgba(37, 114, 171, 0.10)',
        description: 'JavaScript with syntax for types. Adds safety and scalability to your code.',
        keyPoints: ['Static Typing', 'Better Tooling', 'Scalable'],
        opportunities: 'Senior Frontend Dev, Full Stack Developer',
        usedBy: [COMPANIES.microsoft, COMPANIES.airbnb, COMPANIES.stripe]
    },
    {
        name: 'HTML5',
        iconUrl: getTechIconUrl('tech:html5'),
        color: '#EA580C',
        chipBg: 'rgba(234, 88, 12, 0.10)',
        description: 'Semantic markup foundation structuring every modern webpage and web application.',
        keyPoints: ['Semantic Tags', 'Accessible Web', 'Multimedia Ready'],
        opportunities: 'Web Designer, UI Developer',
        usedBy: [COMPANIES.google, COMPANIES.youtube, COMPANIES.shopify]
    },
    {
        name: 'CSS3',
        iconUrl: getTechIconUrl('tech:css3'),
        color: '#2563EB',
        chipBg: 'rgba(37, 99, 235, 0.10)',
        description: 'Visual styling engine for responsive grids, Flexbox, and fluid web animations.',
        keyPoints: ['Flexbox & Grid', 'Responsive Design', 'Animations'],
        opportunities: 'UI Designer, Frontend Developer',
        usedBy: [COMPANIES.apple, COMPANIES.stripe, COMPANIES.pinterest]
    },
    {
        name: 'TailwindCSS',
        iconUrl: getTechIconUrl('tech:tailwindcss'),
        color: '#0891B2',
        chipBg: 'rgba(8, 145, 178, 0.10)',
        description: 'A utility-first CSS framework for rapidly building custom user interfaces.',
        keyPoints: ['Utility-First', 'Highly Customizable', 'Small Bundle Size'],
        opportunities: 'Frontend Developer, UI/UX Engineer',
        usedBy: [COMPANIES.vercel, COMPANIES.shopify, COMPANIES.razorpay]
    },
    {
        name: 'Bootstrap',
        iconUrl: getTechIconUrl('tech:bootstrap'),
        color: '#6D28D9',
        chipBg: 'rgba(109, 40, 217, 0.10)',
        description: 'The world\'s most popular framework for building responsive, mobile-first sites.',
        keyPoints: ['Responsive Grid', 'Pre-built Components', 'Easy to Use'],
        opportunities: 'UI Developer, Web Designer',
        usedBy: [COMPANIES.spotify, COMPANIES.intel, COMPANIES.zoho]
    },
    {
        name: 'Node.js',
        iconUrl: getTechIconUrl('tech:nodejs'),
        color: '#059669',
        chipBg: 'rgba(5, 150, 105, 0.10)',
        description: 'Execute JavaScript on the server-side to build scalable network applications.',
        keyPoints: ['Event-Driven', 'Non-Blocking I/O', 'NPM Registry'],
        opportunities: 'Backend Developer, Full Stack Engineer',
        usedBy: [COMPANIES.netflix, COMPANIES.uber, COMPANIES.paypal]
    },
    {
        name: 'Express',
        iconUrl: getTechIconUrl('tech:express'),
        color: '#D97706',
        chipBg: 'rgba(217, 119, 6, 0.10)',
        description: 'Fast, unopinionated, minimalist web framework for Node.js.',
        keyPoints: ['Minimalist', 'Flexible Routing', 'Middleware Support'],
        opportunities: 'Backend Developer, API Engineer',
        usedBy: [COMPANIES.uber, COMPANIES.paytm, COMPANIES.zomato]
    },
    {
        name: 'MongoDB',
        iconUrl: getTechIconUrl('tech:mongodb'),
        color: '#16A34A',
        chipBg: 'rgba(22, 163, 74, 0.10)',
        description: 'The most popular database for modern apps. Flexible, scalable, and powerful.',
        keyPoints: ['NoSQL', 'Document-Oriented', 'High Performance'],
        opportunities: 'Database Administrator, Backend Developer',
        usedBy: [COMPANIES.uber, COMPANIES.swiggy, COMPANIES.tata]
    },
    {
        name: 'MySQL',
        iconUrl: getTechIconUrl('tech:mysql'),
        color: '#2572AB',
        chipBg: 'rgba(37, 114, 171, 0.10)',
        description: 'Industry-standard relational database management system for structured enterprise data.',
        keyPoints: ['SQL Queries', 'ACID Compliance', 'Relational Tables'],
        opportunities: 'Database Developer, Backend Engineer',
        usedBy: [COMPANIES.youtube, COMPANIES.airbnb, COMPANIES.netflix]
    },
    {
        name: 'Python',
        iconUrl: getTechIconUrl('tech:python'),
        color: '#2572AB',
        chipBg: 'rgba(37, 114, 171, 0.10)',
        description: 'Versatile programming language for automation, data analysis, and AI workflows.',
        keyPoints: ['Beginner Friendly', 'Data & Automation', 'Backend Scripts'],
        opportunities: 'Python Developer, Data Analyst, AI Trainee',
        usedBy: [COMPANIES.google, COMPANIES.instagram, COMPANIES.spotify]
    },
    {
        name: 'Java',
        iconUrl: getTechIconUrl('tech:java'),
        color: '#EA580C',
        chipBg: 'rgba(234, 88, 12, 0.10)',
        description: 'Enterprise-grade object-oriented language powering software, APIs, and Android.',
        keyPoints: ['Strong OOP Design', 'Cross-Platform JVM', 'High Reliability'],
        opportunities: 'Software Engineer, Java Developer',
        usedBy: [COMPANIES.infosys, COMPANIES.netflix, COMPANIES.uber]
    },
    {
        name: 'C',
        iconUrl: getTechIconUrl('tech:c'),
        color: '#1D4ED8',
        chipBg: 'rgba(29, 78, 216, 0.10)',
        description: 'Foundational procedural programming language teaching core memory & system logic.',
        keyPoints: ['System Fundamentals', 'Pointers & Memory', 'Fast Execution'],
        opportunities: 'Systems Programmer, Embedded Trainee',
        usedBy: [COMPANIES.intel, COMPANIES.microsoft, COMPANIES.nvidia]
    },
    {
        name: 'C++',
        iconUrl: getTechIconUrl('tech:cplusplus'),
        color: '#1E40AF',
        chipBg: 'rgba(30, 64, 175, 0.10)',
        description: 'High-performance object-oriented programming language for software & algorithms.',
        keyPoints: ['DSA & OOP', 'STL Library', 'Competitive Coding'],
        opportunities: 'Software Developer, C++ Engineer',
        usedBy: [COMPANIES.google, COMPANIES.apple, COMPANIES.nvidia]
    },
    {
        name: 'Git',
        iconUrl: getTechIconUrl('tech:git'),
        color: '#DC2626',
        chipBg: 'rgba(220, 38, 38, 0.10)',
        description: 'Essential distributed version control system for tracking every line of team code.',
        keyPoints: ['Branch & Merge', 'Version History', 'Team Collaboration'],
        opportunities: 'Software Developer, DevOps Trainee',
        usedBy: [COMPANIES.google, COMPANIES.microsoft, COMPANIES.gitlab]
    },
    {
        name: 'GitHub',
        iconUrl: getTechIconUrl('tech:github'),
        color: '#0F172A',
        chipBg: 'rgba(15, 23, 42, 0.08)',
        description: 'Global platform for hosting repositories, pull requests, and developer portfolios.',
        keyPoints: ['Code Hosting', 'Pull Requests', 'Project Portfolios'],
        opportunities: 'Open Source Contributor, Web Developer',
        usedBy: [COMPANIES.microsoft, COMPANIES.vercel, COMPANIES.shopify]
    },
    {
        name: 'VS Code',
        iconUrl: getTechIconUrl('tech:vscode'),
        color: '#0284C7',
        chipBg: 'rgba(2, 132, 199, 0.10)',
        description: 'The industry-standard extensible code editor for debugging, linting, and Git.',
        keyPoints: ['IntelliSense', 'Built-in Terminal', 'Rich Extensions'],
        opportunities: 'All Software & Web Development Roles',
        usedBy: [COMPANIES.microsoft, COMPANIES.meta, COMPANIES.stripe]
    },
    {
        name: 'Docker',
        iconUrl: getTechIconUrl('tech:docker'),
        color: '#0284C7',
        chipBg: 'rgba(2, 132, 199, 0.10)',
        description: 'Container platform to package, ship, and deploy applications consistently anywhere.',
        keyPoints: ['Containers', 'Consistent Environments', 'Cloud Deployment'],
        opportunities: 'DevOps Engineer, Cloud Developer',
        usedBy: [COMPANIES.spotify, COMPANIES.paypal, COMPANIES.gitlab]
    },
    {
        name: 'Linux',
        iconUrl: getTechIconUrl('tech:linux'),
        color: '#D97706',
        chipBg: 'rgba(217, 119, 6, 0.10)',
        description: 'Open-source operating system powering cloud servers, shells, and cybersecurity labs.',
        keyPoints: ['CLI & Shell', 'File Permissions', 'Server Admin'],
        opportunities: 'System Administrator, Network Engineer',
        usedBy: [COMPANIES.google, COMPANIES.tesla, COMPANIES.meta]
    },
    {
        name: 'MS Word',
        iconUrl: getTechIconUrl('tech:word'),
        color: '#1D4ED8',
        chipBg: 'rgba(29, 78, 216, 0.10)',
        description: 'Professional document formatting, mail merge, and executive reporting suite.',
        keyPoints: ['Document Formatting', 'Mail Merge', 'Office Layouts'],
        opportunities: 'Computer Operator, Front Office Executive',
        usedBy: [COMPANIES.microsoft, COMPANIES.tata, COMPANIES.infosys]
    },
    {
        name: 'MS Excel',
        iconUrl: getTechIconUrl('tech:excel'),
        color: '#15803D',
        chipBg: 'rgba(21, 128, 61, 0.10)',
        description: 'Spreadsheet mastery including VLOOKUP, Pivot Tables, formulas, and MIS reporting.',
        keyPoints: ['Pivot Tables', 'Formulas & Charts', 'Data Validation'],
        opportunities: 'MIS Executive, Data Entry Operator, Analyst',
        usedBy: [COMPANIES.microsoft, COMPANIES.tata, COMPANIES.razorpay]
    },
    {
        name: 'MS PowerPoint',
        iconUrl: getTechIconUrl('tech:powerpoint'),
        color: '#C2410C',
        chipBg: 'rgba(194, 65, 12, 0.10)',
        description: 'Visual slide deck creation, SmartArt, and interactive business presentations.',
        keyPoints: ['Slide Design', 'Transitions', 'Visual Storytelling'],
        opportunities: 'Office Coordinator, Presentation Specialist',
        usedBy: [COMPANIES.microsoft, COMPANIES.infosys, COMPANIES.zoho]
    },
    {
        name: 'TallyPrime',
        iconUrl: getTechIconUrl('tech:tally'),
        color: '#0F766E',
        chipBg: 'rgba(15, 118, 110, 0.10)',
        description: 'India\'s leading accounting and GST compliance platform for modern finance careers.',
        keyPoints: ['GST Billing & Returns', 'Inventory Control', 'Payroll Ledger'],
        opportunities: 'Accounts Executive, GST Operator, Back Office',
        usedBy: [COMPANIES.tata, COMPANIES.zoho, COMPANIES.razorpay]
    },
    {
        name: 'ChatGPT',
        iconUrl: getTechIconUrl('tech:chatgpt'),
        color: '#10A37F',
        chipBg: 'rgba(16, 163, 127, 0.10)',
        description: 'Conversational AI assistant for prompt engineering, coding, and office productivity.',
        keyPoints: ['Prompt Engineering', 'Code Assistance', 'Workflow Automation'],
        opportunities: 'AI Specialist, Prompt Engineer, Digital Analyst',
        usedBy: [COMPANIES.microsoft, COMPANIES.stripe, COMPANIES.shopify]
    },
    {
        name: 'Gemini AI',
        iconUrl: getTechIconUrl('company:googlegemini'),
        color: '#2563EB',
        chipBg: 'rgba(66, 133, 244, 0.12)',
        description: 'Google\'s multimodal AI model built for research, coding, and workspace automation.',
        keyPoints: ['Multimodal Reasoning', 'AI Coding', 'Smart Workflows'],
        opportunities: 'AI App Builder, Automation Specialist',
        usedBy: [COMPANIES.google, COMPANIES.youtube, COMPANIES.infosys]
    },
    {
        name: 'Claude AI',
        iconUrl: getTechIconUrl('company:claude'),
        color: '#C2410C',
        chipBg: 'rgba(217, 119, 87, 0.12)',
        description: 'Advanced AI assistant for deep reasoning, structured analysis, and software architecture.',
        keyPoints: ['Long-Context Analysis', 'Clean Code Generation', 'Safe AI Workflows'],
        opportunities: 'AI Developer, Software Engineer',
        usedBy: [COMPANIES.notion, COMPANIES.gitlab, COMPANIES.dropbox]
    },
    {
        name: 'Hugging Face',
        iconUrl: getTechIconUrl('company:huggingface'),
        color: '#B45309',
        chipBg: 'rgba(255, 210, 30, 0.18)',
        description: 'Open-source hub for machine learning models, datasets, and transformer pipelines.',
        keyPoints: ['Pretrained LLMs', 'Transformers', 'AI Datasets'],
        opportunities: 'ML Engineer, AI Research Assistant',
        usedBy: [COMPANIES.google, COMPANIES.nvidia, COMPANIES.meta]
    },
    {
        name: 'TensorFlow',
        iconUrl: getTechIconUrl('tech:tensorflow'),
        color: '#EA580C',
        chipBg: 'rgba(234, 88, 12, 0.10)',
        description: 'End-to-end machine learning framework for training neural networks and vision models.',
        keyPoints: ['Deep Learning', 'Neural Networks', 'Model Deployment'],
        opportunities: 'Machine Learning Engineer, Data Scientist',
        usedBy: [COMPANIES.google, COMPANIES.airbnb, COMPANIES.paypal]
    },
    {
        name: 'PyTorch',
        iconUrl: getTechIconUrl('tech:pytorch'),
        color: '#DC2626',
        chipBg: 'rgba(220, 38, 38, 0.10)',
        description: 'Dynamic deep learning framework widely used in AI research and production systems.',
        keyPoints: ['Dynamic Graphs', 'GPU Tensors', 'AI Prototyping'],
        opportunities: 'AI Engineer, Deep Learning Developer',
        usedBy: [COMPANIES.meta, COMPANIES.tesla, COMPANIES.nvidia]
    },
    {
        name: 'Jupyter',
        iconUrl: getTechIconUrl('tech:jupyter'),
        color: '#EA580C',
        chipBg: 'rgba(234, 88, 12, 0.10)',
        description: 'Interactive computing notebooks for Python analytics, visualizations, and AI experiments.',
        keyPoints: ['Interactive Notebooks', 'Data Exploration', 'Live Code + Charts'],
        opportunities: 'Data Analyst, ML Trainee',
        usedBy: [COMPANIES.google, COMPANIES.netflix, COMPANIES.nvidia]
    },
    {
        name: 'Pandas',
        iconUrl: getTechIconUrl('tech:pandas'),
        color: '#1E3A8A',
        chipBg: 'rgba(30, 58, 138, 0.10)',
        description: 'Fast Python data manipulation toolkit for spreadsheets, CSVs, and tabular analysis.',
        keyPoints: ['DataFrames', 'CSV & Excel Cleaning', 'Data Aggregation'],
        opportunities: 'Data Analyst, Python Automation Engineer',
        usedBy: [COMPANIES.spotify, COMPANIES.uber, COMPANIES.paytm]
    },
    {
        name: 'NumPy',
        iconUrl: getTechIconUrl('tech:numpy'),
        color: '#0284C7',
        chipBg: 'rgba(2, 132, 199, 0.10)',
        description: 'Fundamental scientific computing library for high-speed numerical arrays in Python.',
        keyPoints: ['Vectorized Math', 'Matrix Operations', 'ML Foundations'],
        opportunities: 'Data Scientist, AI Developer',
        usedBy: [COMPANIES.tesla, COMPANIES.nvidia, COMPANIES.google]
    },
    {
        name: 'Vue.js',
        iconUrl: getTechIconUrl('tech:vuejs'),
        color: '#059669',
        chipBg: 'rgba(5, 150, 105, 0.10)',
        description: 'Approachable, high-performance JavaScript framework for reactive web interfaces.',
        keyPoints: ['Reactive Components', 'Gentle Learning Curve', 'SPA Routing'],
        opportunities: 'Frontend Developer, UI Engineer',
        usedBy: [COMPANIES.gitlab, COMPANIES.apple, COMPANIES.zoho]
    },
    {
        name: 'Angular',
        iconUrl: getTechIconUrl('tech:angular'),
        color: '#DC2626',
        chipBg: 'rgba(220, 38, 38, 0.10)',
        description: 'Structured TypeScript framework for enterprise web applications at scale.',
        keyPoints: ['TypeScript First', 'Dependency Injection', 'Enterprise Scale'],
        opportunities: 'Angular Developer, Enterprise Frontend',
        usedBy: [COMPANIES.google, COMPANIES.paypal, COMPANIES.infosys]
    },
    {
        name: 'Flutter',
        iconUrl: getTechIconUrl('tech:flutter'),
        color: '#0284C7',
        chipBg: 'rgba(2, 132, 199, 0.10)',
        description: 'Cross-platform UI toolkit for compiling native mobile, web, and desktop apps.',
        keyPoints: ['Single Codebase', 'Native Performance', 'Hot Reload'],
        opportunities: 'Mobile App Developer, Flutter Engineer',
        usedBy: [COMPANIES.google, COMPANIES.paytm, COMPANIES.tata]
    },
    {
        name: 'Django',
        iconUrl: getTechIconUrl('tech:django'),
        color: '#065F46',
        chipBg: 'rgba(6, 95, 70, 0.10)',
        description: 'Batteries-included Python web framework with built-in ORM, admin, and security.',
        keyPoints: ['Rapid Backend', 'Built-in Admin', 'Secure ORM'],
        opportunities: 'Python Backend Developer, Full Stack Dev',
        usedBy: [COMPANIES.instagram, COMPANIES.spotify, COMPANIES.pinterest]
    },
    {
        name: 'Spring Boot',
        iconUrl: getTechIconUrl('tech:spring'),
        color: '#16A34A',
        chipBg: 'rgba(22, 163, 74, 0.10)',
        description: 'Production-ready Java framework for microservices, REST APIs, and enterprise systems.',
        keyPoints: ['Java Microservices', 'REST APIs', 'Auto Configuration'],
        opportunities: 'Java Backend Developer, Software Engineer',
        usedBy: [COMPANIES.netflix, COMPANIES.swiggy, COMPANIES.infosys]
    },
    {
        name: 'Vite',
        iconUrl: getTechIconUrl('tech:vitejs'),
        color: '#6D28D9',
        chipBg: 'rgba(109, 40, 217, 0.10)',
        description: 'Next-generation frontend build tool offering instant HMR and optimized bundling.',
        keyPoints: ['Instant Dev Server', 'ES Modules', 'Fast Builds'],
        opportunities: 'Modern Frontend Developer, Web Architect',
        usedBy: [COMPANIES.shopify, COMPANIES.google, COMPANIES.meta]
    },
    {
        name: 'PHP',
        iconUrl: getTechIconUrl('tech:php'),
        color: '#4F46E5',
        chipBg: 'rgba(79, 70, 229, 0.10)',
        description: 'Server-side scripting language powering dynamic websites, CMS portals, and backends.',
        keyPoints: ['Server Scripting', 'Database Integration', 'Web Portals'],
        opportunities: 'PHP Developer, Web Backend Developer',
        usedBy: [COMPANIES.meta, COMPANIES.zoho, COMPANIES.tata]
    },
    {
        name: 'Go',
        iconUrl: getTechIconUrl('tech:go'),
        color: '#0891B2',
        chipBg: 'rgba(8, 145, 178, 0.10)',
        description: 'Fast compiled language designed for concurrent cloud services and scalable APIs.',
        keyPoints: ['Goroutines', 'Fast Compilation', 'Cloud Native'],
        opportunities: 'Backend Engineer, Cloud Developer',
        usedBy: [COMPANIES.google, COMPANIES.uber, COMPANIES.razorpay]
    },
    {
        name: 'Kotlin',
        iconUrl: getTechIconUrl('tech:kotlin'),
        color: '#7C3AED',
        chipBg: 'rgba(124, 58, 237, 0.10)',
        description: 'Modern, concise JVM programming language and official language for Android apps.',
        keyPoints: ['Null Safety', 'Android Native', 'Concise Syntax'],
        opportunities: 'Android Developer, Kotlin Engineer',
        usedBy: [COMPANIES.google, COMPANIES.zomato, COMPANIES.swiggy]
    },
    {
        name: 'PostgreSQL',
        iconUrl: getTechIconUrl('tech:postgresql'),
        color: '#2572AB',
        chipBg: 'rgba(37, 114, 171, 0.10)',
        description: 'Advanced open-source relational database supporting JSON, indexing, and analytics.',
        keyPoints: ['ACID Transactions', 'Advanced SQL', 'High Reliability'],
        opportunities: 'Database Engineer, Backend Developer',
        usedBy: [COMPANIES.instagram, COMPANIES.spotify, COMPANIES.reddit]
    },
    {
        name: 'Firebase',
        iconUrl: getTechIconUrl('tech:firebase'),
        color: '#D97706',
        chipBg: 'rgba(217, 119, 6, 0.10)',
        description: 'Google backend platform offering realtime databases, authentication, and hosting.',
        keyPoints: ['Cloud Firestore', 'Auth & Hosting', 'Realtime Sync'],
        opportunities: 'Full Stack Developer, App Developer',
        usedBy: [COMPANIES.google, COMPANIES.zomato, COMPANIES.spotify]
    },
    {
        name: 'IntelliJ IDEA',
        iconUrl: getTechIconUrl('tech:intellij'),
        color: '#1D4ED8',
        chipBg: 'rgba(29, 78, 216, 0.10)',
        description: 'Intelligent Java & Kotlin IDE with smart refactoring, debugging, and build tools.',
        keyPoints: ['Smart Refactoring', 'Integrated Debugger', 'Enterprise Java IDE'],
        opportunities: 'Java Developer, Software Engineer',
        usedBy: [COMPANIES.google, COMPANIES.infosys, COMPANIES.atlassian]
    },
    {
        name: 'PyCharm',
        iconUrl: getTechIconUrl('tech:pycharm'),
        color: '#059669',
        chipBg: 'rgba(5, 150, 105, 0.10)',
        description: 'Dedicated Python IDE for virtual environments, Django backends, and data science.',
        keyPoints: ['Code Inspection', 'Virtualenv Tools', 'Scientific Support'],
        opportunities: 'Python Developer, Data Science Trainee',
        usedBy: [COMPANIES.spotify, COMPANIES.dropbox, COMPANIES.uber]
    },
    {
        name: 'Android Studio',
        iconUrl: getTechIconUrl('tech:androidstudio'),
        color: '#15803D',
        chipBg: 'rgba(21, 128, 61, 0.10)',
        description: 'Official IDE for designing, testing, and debugging native Android applications.',
        keyPoints: ['Device Emulator', 'Layout Editor', 'APK Packaging'],
        opportunities: 'Android App Developer, Mobile Engineer',
        usedBy: [COMPANIES.google, COMPANIES.zomato, COMPANIES.paytm]
    },
    {
        name: 'Postman',
        iconUrl: getTechIconUrl('tech:postman'),
        color: '#EA580C',
        chipBg: 'rgba(234, 88, 12, 0.10)',
        description: 'Industry-standard API platform for testing endpoints, headers, and automated suites.',
        keyPoints: ['REST Testing', 'API Collections', 'Auth Debugging'],
        opportunities: 'Backend Developer, QA Engineer',
        usedBy: [COMPANIES.stripe, COMPANIES.razorpay, COMPANIES.paypal]
    },
    {
        name: 'Photoshop',
        iconUrl: getTechIconUrl('tech:photoshop'),
        color: '#1D4ED8',
        chipBg: 'rgba(29, 78, 216, 0.10)',
        description: 'Professional raster image editing, banner design, and digital retouching suite.',
        keyPoints: ['Photo Retouching', 'Layer Compositing', 'Banner Design'],
        opportunities: 'Graphic Designer, DTP Specialist',
        usedBy: [COMPANIES.netflix, COMPANIES.apple, COMPANIES.spotify]
    },
    {
        name: 'Illustrator',
        iconUrl: getTechIconUrl('tech:illustrator'),
        color: '#C2410C',
        chipBg: 'rgba(194, 65, 12, 0.10)',
        description: 'Precision vector graphics software for logos, branding icons, and print media.',
        keyPoints: ['Vector Logos', 'Typography', 'Print Layouts'],
        opportunities: 'Brand Designer, Vector Artist',
        usedBy: [COMPANIES.airbnb, COMPANIES.dropbox, COMPANIES.zoho]
    },
    {
        name: 'Figma',
        iconUrl: getTechIconUrl('tech:figma'),
        color: '#7C3AED',
        chipBg: 'rgba(124, 58, 237, 0.10)',
        description: 'Collaborative interface design and interactive prototyping tool for web & mobile UI.',
        keyPoints: ['UI Systems', 'Prototyping', 'Design Tokens'],
        opportunities: 'UI/UX Designer, Product Designer',
        usedBy: [COMPANIES.airbnb, COMPANIES.uber, COMPANIES.discord]
    },
    {
        name: 'Canva',
        iconUrl: getTechIconUrl('tech:canva'),
        color: '#0891B2',
        chipBg: 'rgba(8, 145, 178, 0.10)',
        description: 'Accessible visual design studio for posters, social graphics, and quick presentations.',
        keyPoints: ['Social Templates', 'Brand Kits', 'Fast Visuals'],
        opportunities: 'Digital Marketing, Content Creator',
        usedBy: [COMPANIES.zomato, COMPANIES.swiggy, COMPANIES.shopify]
    },
    {
        name: 'Windows 11',
        iconUrl: getTechIconUrl('tech:windows11'),
        color: '#0284C7',
        chipBg: 'rgba(2, 132, 199, 0.10)',
        description: 'Modern desktop operating system covering file management, shortcuts, and OS utilities.',
        keyPoints: ['OS Fundamentals', 'File Management', 'System Utilities'],
        opportunities: 'Office Operator, Hardware & Support Tech',
        usedBy: [COMPANIES.microsoft, COMPANIES.intel, COMPANIES.tata]
    }
]

function shuffleTechItems(items: TechItem[]): TechItem[] {
    const arr = [...items]
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}

const TechTickerSection = () => {
    const [orderedTechs, setOrderedTechs] = useState<TechItem[]>(TECH_ITEMS)
    const [activeAnchor, setActiveAnchor] = useState<{
        key: string
        tech: TechItem
        rect: TechPopupAnchorRect
    } | null>(null)

    useEffect(() => {
        warmupTechIcons()
        setOrderedTechs(shuffleTechItems(TECH_ITEMS))
    }, [])

    useEffect(() => {
        if (!activeAnchor) return
        const closeOnScrollOrEsc = (ev: Event) => {
            if (ev.type === 'keydown' && (ev as KeyboardEvent).key !== 'Escape') return
            setActiveAnchor(null)
        }
        window.addEventListener('scroll', closeOnScrollOrEsc, { passive: true })
        window.addEventListener('keydown', closeOnScrollOrEsc)
        return () => {
            window.removeEventListener('scroll', closeOnScrollOrEsc)
            window.removeEventListener('keydown', closeOnScrollOrEsc)
        }
    }, [activeAnchor !== null])

    const openPopupForButton = (el: HTMLElement, key: string, tech: TechItem) => {
        const r = el.getBoundingClientRect()
        setActiveAnchor({
            key,
            tech,
            rect: { top: r.top, bottom: r.bottom, left: r.left, width: r.width }
        })
    }

    const closePopup = () => {
        setActiveAnchor(null)
    }

    const handleClick = (el: HTMLElement, key: string, tech: TechItem) => {
        if (activeAnchor?.key === key) {
            setActiveAnchor(null)
        } else {
            openPopupForButton(el, key, tech)
        }
    }

    return (
        <section className="py-4 bg-[#F8FAFC] border-y border-slate-200/80 overflow-hidden relative">
            <div className="w-full">
                <div className="flex items-center overflow-hidden relative">
                    <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#F8FAFC] to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#F8FAFC] to-transparent z-10 pointer-events-none" />

                    <div className="flex items-center gap-4 sm:gap-6 animate-marquee w-max py-1.5 touch-pan-y">
                        {[...orderedTechs, ...orderedTechs].map((tech, index) => {
                            const key = `${tech.name}-${index}`
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    className="flex items-center gap-2.5 whitespace-nowrap group cursor-pointer relative px-3.5 py-2 rounded-full bg-[#FFFFFF] hover:shadow-[0_8px_18px_-8px_rgba(15,23,42,0.12)] transition-[border-color,box-shadow] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] border border-slate-200/85 hover:border-slate-300"
                                    onMouseEnter={(e) => openPopupForButton(e.currentTarget, key, tech)}
                                    onMouseLeave={closePopup}
                                    onFocus={(e) => openPopupForButton(e.currentTarget, key, tech)}
                                    onBlur={closePopup}
                                    onClick={(e) => handleClick(e.currentTarget, key, tech)}
                                >
                                    <span
                                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: tech.chipBg }}
                                    >
                                        <img
                                            src={tech.iconUrl}
                                            alt=""
                                            aria-hidden="true"
                                            width={18}
                                            height={18}
                                            decoding="sync"
                                            className="w-4.5 h-4.5 object-contain"
                                        />
                                    </span>
                                    <span className="font-medium text-sm text-[#0F172A]">
                                        {tech.name}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {activeAnchor && (
                <TechPopup
                    {...activeAnchor.tech}
                    isVisible={true}
                    anchorRect={activeAnchor.rect}
                />
            )}

            <style>
                {`
                .animate-marquee {
                    animation: marquee 118s linear infinite;
                }
                .animate-marquee:hover,
                .animate-marquee:focus-within {
                    animation-play-state: paused;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                `}
            </style>
        </section>
    )
}

export default TechTickerSection
