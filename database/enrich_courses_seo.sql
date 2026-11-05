-- Safe Course SEO Enrichment Migration

-- STRICT INVARIANTS: course_name, fees, duration, category, and id are 100% UNTOUCHED.

-- Only description, tags, and modern syllabus modules are enriched.


UPDATE public.courses
SET description = 'Master foundational C programming, algorithms, pointers, memory allocation, and data structures with intensive lab training at ICST Chowberia, Bongaon. Includes free practice lab access.',
    tags = ARRAY['C Programming', 'Pointers', 'Algorithms', 'Bongaon', 'Core Coding']::text[],
    syllabus = ARRAY['Programming Logic, Algorithms & Flowcharts', 'C Syntax, Data Types & Operators', 'Control Structures (Loops, Switch, If-Else)', 'Arrays, Strings & Modular Functions', 'Pointers & Dynamic Memory Allocation (malloc/calloc)', 'Structures, Unions & Bit Manipulation', 'File Handling, Preprocessors & Terminal Projects']::text[]
WHERE id = 1;

UPDATE public.courses
SET description = 'Comprehensive Object-Oriented Programming (OOP) in C++ covering classes, inheritance, polymorphism, templates, and STL at ICST Chowberia near Bongaon. Hands-on coding projects included.',
    tags = ARRAY['C++', 'OOP', 'STL', 'Bongaon', 'Software Engineering']::text[],
    syllabus = ARRAY['OOP Fundamentals: Classes, Objects & Abstraction', 'Constructors, Destructors & Memory Management', 'Inheritance Types & Virtual Functions', 'Polymorphism, Function & Operator Overloading', 'Generic Programming with C++ Templates & STL Containers', 'Exception Handling & Standard I/O Streams', 'Capstone Console Software Project']::text[]
WHERE id = 2;

UPDATE public.courses
SET description = 'Master industry-standard Java programming: OOP concepts, JVM architecture, Collections, Multithreading, and JDBC database connectivity at ICST Chowberia, Bongaon. Job-ready practical labs.',
    tags = ARRAY['Java', 'OOP', 'JDBC', 'Bongaon', 'Backend Development']::text[],
    syllabus = ARRAY['Java Architecture (JDK, JRE, JVM) & Syntax', 'Core Object-Oriented Principles (Encapsulation, Polymorphism)', 'Packages, Interfaces & Abstract Classes', 'Exception Handling & Multithreading Architecture', 'Java Collections Framework & Generics', 'File I/O Streams & Serialization', 'Database Connectivity with JDBC & MySQL Project']::text[]
WHERE id = 3;

UPDATE public.courses
SET description = 'Learn Python from scratch to advanced scripting, OOP, data structures, automation, and database interaction at ICST Chowberia, Bongaon. Ideal for aspiring software and data specialists.',
    tags = ARRAY['Python', 'Automation', 'Data Science', 'Bongaon', 'Scripting']::text[],
    syllabus = ARRAY['Python 3 Environment, Variables & Control Flow', 'Core Data Structures (Lists, Tuples, Dictionaries, Sets)', 'Functional Programming, Lambdas & List Comprehensions', 'Object-Oriented Programming (Classes & Inheritance)', 'File Handling, Modules & PIP Package Ecosystem', 'Database Operations with SQLite/PostgreSQL', 'Practical Automation & Data Processing Project']::text[]
WHERE id = 4;

UPDATE public.courses
SET description = 'Build modern Windows desktop software and enterprise applications using C# and Microsoft .NET framework at ICST Chowberia, Bongaon. Practical GUI and database integration training.',
    tags = ARRAY['C#', '.NET', 'Windows Apps', 'Bongaon', 'Desktop Development']::text[],
    syllabus = ARRAY['C# Language Basics & Common Type System', 'OOP with C# (Classes, Properties, Interfaces)', 'Windows Forms & Modern Desktop UI Development', 'Event-Driven Programming & Delegates', 'LINQ (Language Integrated Query) Essentials', 'ADO.NET Database Access & SQL Server Integration', 'End-to-End Enterprise Desktop Project']::text[]
WHERE id = 5;

UPDATE public.courses
SET description = 'Master SQL queries, schema design, complex joins, views, indexing, stored procedures, and transactions at ICST Chowberia, Bongaon. Essential for data analysts, web and backend developers.',
    tags = ARRAY['SQL', 'Database', 'RDBMS', 'Bongaon', 'Data Analytics']::text[],
    syllabus = ARRAY['Relational Database Fundamentals & Normalization', 'DDL, DML, DCL & DQL Command Standards', 'Complex Queries, Filtering, Aggregations & Grouping', 'Multi-table Joins (Inner, Left, Right, Full)', 'Subqueries, Common Table Expressions (CTEs) & Views', 'Indexes, Query Optimization & Transaction Management (ACID)', 'Stored Procedures, Triggers & Database Backups']::text[]
WHERE id = 6;

UPDATE public.courses
SET description = 'Comprehensive DBMS course covering relational algebra, ER modeling, ACID properties, indexing, and enterprise database management at ICST Chowberia, Bongaon. Lab-backed curriculum.',
    tags = ARRAY['DBMS', 'Database Architecture', 'ER Modeling', 'Bongaon', 'Data Management']::text[],
    syllabus = ARRAY['DBMS Architecture, Data Models & Independence', 'Entity-Relationship (ER) Modeling & Mapping', 'Relational Algebra, Calculus & Integrity Constraints', 'Functional Dependencies & Normalization (1NF to BCNF)', 'Concurrency Control, Locking & Crash Recovery', 'Physical Storage Systems, Indexing & B-Trees', 'Practical RDBMS Implementation in MySQL/PostgreSQL']::text[]
WHERE id = 7;

UPDATE public.courses
SET description = 'Master foundational Data Structures & Algorithms (Stacks, Queues, Linked Lists, Trees, Graphs, Sorting) at ICST Chowberia near Bongaon. Tailored for BCA, BTech, and software interview prep.',
    tags = ARRAY['Data Structures', 'Algorithms', 'DSA', 'Bongaon', 'Interview Prep']::text[],
    syllabus = ARRAY['Algorithm Complexity Analysis (Time & Space, Big-O)', 'Linear Data Structures: Arrays, Stacks & Infix/Postfix Logic', 'Queues (Simple, Circular, Priority Queues)', 'Linked Lists (Singly, Doubly, Circular Implementations)', 'Non-Linear Structures: Binary Trees & Binary Search Trees (BST)', 'Graph Theory: Representations, BFS & DFS Traversals', 'Sorting Algorithms (Merge, Quick, Heap) & Searching Techniques']::text[]
WHERE id = 8;

UPDATE public.courses
SET description = 'Essential computer training for beginners: PC hardware, Windows OS, internet tools, cybersecurity basics, and MS Office at ICST Chowberia, Bongaon. Government-recognized certificate.',
    tags = ARRAY['Computer Basics', 'Windows OS', 'MS Office', 'Chowberia', 'Bongaon']::text[],
    syllabus = ARRAY['Computer Anatomy: Hardware, CPU, Memory & Peripherals', 'Windows 11 Operating System, File Management & Settings', 'MS Word Fundamentals & Document Formatting', 'MS Excel Basics: Spreadsheets, Tables & Simple Formulas', 'Internet Browsing, Email Etiquette, Google Workspace & Online Safety', 'Basic Peripheral Troubleshooting & Printing Techniques']::text[]
WHERE id = 9;

UPDATE public.courses
SET description = 'In-depth Operating Systems training covering process management, CPU scheduling, memory virtualization, file systems, and Linux bash commands at ICST Chowberia, Bongaon. Hands-on labs.',
    tags = ARRAY['Operating Systems', 'Linux', 'System Admin', 'Bongaon', 'Computer Science']::text[],
    syllabus = ARRAY['OS Architecture, Kernel vs User Space & System Calls', 'Process Management, Threads, Context Switching & IPC', 'CPU Scheduling Algorithms (FCFS, SJF, Round Robin)', 'Process Synchronization, Mutex, Semaphores & Deadlocks', 'Memory Management: Paging, Segmentation & Virtual Memory', 'File System Architecture & Disk Scheduling Algorithms', 'Linux Shell Scripting & Administrative Terminal Utilities']::text[]
WHERE id = 10;

UPDATE public.courses
SET description = 'Master Data Communications and Computer Networking: OSI & TCP/IP models, routing protocols, IP addressing, LAN setups, and network security at ICST Chowberia, Bongaon. 100% practical lab.',
    tags = ARRAY['Networking', 'TCP/IP', 'Routers', 'Bongaon', 'Network Support']::text[],
    syllabus = ARRAY['Data Communication Fundamentals & Transmission Media', 'OSI 7-Layer Reference Model & TCP/IP Protocol Stack', 'IPv4 / IPv6 Addressing, Subnetting & CIDR Schemes', 'LAN Protocols, Ethernet Standards, Switches & VLANs', 'Routing Fundamentals, Routers & Wireless Networking (Wi-Fi)', 'Network Services: DNS, DHCP, FTP, HTTP/HTTPS', 'Network Security, Firewalls & Practical Cable Crimping Lab']::text[]
WHERE id = 11;

UPDATE public.courses
SET description = 'Launch your frontend career with React.js: master JSX, functional components, props, state, hooks, and responsive UI design at ICST Chowberia, Bongaon. Build modern single-page applications.',
    tags = ARRAY['React', 'JavaScript', 'Frontend', 'Bongaon', 'Web Development']::text[],
    syllabus = ARRAY['Modern JavaScript (ES6+) Refresher for React', 'React Fundamentals: JSX, Virtual DOM & Tooling (Vite)', 'Components, Props & Unidirectional Data Flow', 'State Management with useState and useEffect Hooks', 'Handling User Events, Forms & Controlled Inputs', 'Styling React Apps with Tailwind CSS / CSS Modules', 'Building & Deploying a Production Single Page App (SPA)']::text[]
WHERE id = 12;

UPDATE public.courses
SET description = 'Master Advanced React patterns: custom hooks, Context API, Redux Toolkit, performance optimization, and REST API integration at ICST Chowberia, Bongaon. For career-focused frontend developers.',
    tags = ARRAY['React', 'Redux', 'Hooks', 'Bongaon', 'Frontend Architecture']::text[],
    syllabus = ARRAY['Advanced Hooks: useMemo, useCallback, useRef, useReducer', 'Global State Management with Context API & Redux Toolkit', 'React Router v6: Nested Routes, Loaders & Protected Guards', 'Server State & Data Fetching with React Query / Axios', 'Performance Optimization, Code Splitting & React.lazy()', 'Forms & Validation with Formik / React Hook Form & Zod', 'Full-Featured Dynamic React Web Application Project']::text[]
WHERE id = 13;

UPDATE public.courses
SET description = 'Deep dive into core and modern JavaScript (ES6+): asynchronous programming, DOM manipulation, promises, fetch API, and closures at ICST Chowberia near Bongaon. 100% hands-on lab training.',
    tags = ARRAY['JavaScript', 'ES6', 'DOM', 'Bongaon', 'Frontend']::text[],
    syllabus = ARRAY['JS Fundamentals: Data Types, Variables, Scopes & Hoisting', 'Functions, Arrow Syntax, Callbacks, Closures & Currying', 'DOM Manipulation, Event Bubbling & Dynamic UI', 'Modern ES6+ Features: Destructuring, Spread, Modules', 'Asynchronous JS: Event Loop, Promises, Async/Await & Fetch API', 'Object-Oriented JavaScript & Prototypes', 'Interactive Browser Application Capstone Project']::text[]
WHERE id = 14;

UPDATE public.courses
SET description = 'Scale modern web apps with TypeScript: static typing, interfaces, generics, type guards, and React integration at ICST Chowberia, Bongaon. Essential for modern full stack engineering.',
    tags = ARRAY['TypeScript', 'JavaScript', 'Web Dev', 'Bongaon', 'Frontend Engineering']::text[],
    syllabus = ARRAY['TypeScript Setup, tsconfig & Compiler Architecture', 'Basic Types, Union, Intersection & Literal Types', 'Interfaces, Type Aliases & Custom Type Definitions', 'Advanced Generics in Functions, Classes & Interfaces', 'Type Narrowing, Type Guards & Utility Types', 'TypeScript Integration with Modern React Components', 'Refactoring JavaScript Projects to Type-Safe TypeScript']::text[]
WHERE id = 15;

UPDATE public.courses
SET description = 'Build responsive, mobile-first websites rapidly with Bootstrap: grid systems, flexbox utilities, navigation bars, modals, and forms at ICST Chowberia, Bongaon. Hands-on client UI projects.',
    tags = ARRAY['Bootstrap', 'Responsive Web', 'HTML/CSS', 'Bongaon', 'UI Design']::text[],
    syllabus = ARRAY['HTML5 & CSS3 Review for Modern Frameworks', 'Bootstrap Grid Architecture, Breakpoints & Flexbox Layouts', 'Typography, Colors, Spacing & Utility Classes', 'Interactive Components: Navbars, Modals, Cards & Carousels', 'Responsive Form Controls, Badges & Alert Systems', 'Customizing Bootstrap Themes with SASS Variables', 'End-to-End Responsive Business Website Project']::text[]
WHERE id = 16;

UPDATE public.courses
SET description = 'Master modern utility-first CSS with Tailwind: responsive breakpoints, dark mode styling, custom configurations, and component animations at ICST Chowberia, Bongaon. Ideal for React/Next.js devs.',
    tags = ARRAY['Tailwind CSS', 'Modern Web', 'CSS3', 'Bongaon', 'UI/UX']::text[],
    syllabus = ARRAY['Tailwind CSS Core Philosophy & Utility-First Workflow', 'Layout, Flexbox, CSS Grid & Spacing Utilities', 'Responsive Design Patterns & Mobile Breakpoints', 'Typography, Background Gradients & Glassmorphism Effects', 'State Variants: Hover, Focus, Active & Dark Mode Themes', 'Tailwind Configuration, Plugins & Custom Theme Tokens', 'Building a Modern Production Web UI with Tailwind']::text[]
WHERE id = 17;

UPDATE public.courses
SET description = 'Comprehensive 18-month Frontend Web Development program: HTML5, CSS3, JavaScript ES6+, React, Tailwind, Git, and REST APIs at ICST Chowberia, Bongaon. 100% lab-based with career mentorship.',
    tags = ARRAY['Frontend', 'React', 'JavaScript', 'Tailwind', 'Bongaon', 'Web Dev']::text[],
    syllabus = ARRAY['Semantic HTML5, Accessibility (a11y) & Web Standards', 'Advanced CSS3, Flexbox, CSS Grid, Transitions & Animations', 'JavaScript Deep Dive: Asynchronous, DOM & APIs', 'React Ecosystem: Components, Hooks, State & Routing', 'Modern Styling with Tailwind CSS & Responsive Architecture', 'Version Control with Git & GitHub Collaboration Workflows', 'Performance Optimization, Build Tools (Vite) & Web Hosting', 'Portfolio-Grade Multi-Page Frontend Web Application']::text[]
WHERE id = 18;

UPDATE public.courses
SET description = 'Build scalable server-side systems and RESTful APIs with Node.js, Express, PostgreSQL, MongoDB, and JWT authentication at ICST Chowberia, Bongaon. Job-ready backend engineering.',
    tags = ARRAY['Backend', 'Node.js', 'Express', 'PostgreSQL', 'Bongaon', 'APIs']::text[],
    syllabus = ARRAY['Node.js Runtime Architecture, Event Loop & File System (fs)', 'Building Robust RESTful APIs with Express.js Framework', 'Relational Database Design with PostgreSQL & Knex/Prisma', 'NoSQL Database Integration with MongoDB & Mongoose', 'Authentication & Authorization with JWT, Cookies & bcrypt', 'API Validation, Error Handling Middlewares & Security', 'Server Deployment, Environment Configs & Cloud Hosting']::text[]
WHERE id = 19;

UPDATE public.courses
SET description = 'Complete 18-month Full Stack Web Development program: React, Node.js, Express, PostgreSQL, MongoDB, and Cloud deployment at ICST Chowberia, Bongaon. Industry-level capstone projects.',
    tags = ARRAY['Full Stack', 'MERN Stack', 'React', 'Node.js', 'Bongaon', 'PostgreSQL']::text[],
    syllabus = ARRAY['Frontend Foundations: HTML5, CSS3, Tailwind & JavaScript ES6+', 'Client Application Engineering with React.js & State Management', 'Server-Side Engineering with Node.js & Express.js APIs', 'Relational (PostgreSQL) & Document (MongoDB) Databases', 'User Authentication, Role-Based Access Control & Security', 'Full Stack System Integration & API Contract Testing', 'Git Version Control, CI/CD Concepts & Production Deployment', 'Live Industry Capstone Web Application Project']::text[]
WHERE id = 20;

UPDATE public.courses
SET description = 'Certificate in Information Technology Application (CITA): Office automation, Windows OS, MS Word, Excel, PowerPoint, and internet operations at ICST Chowberia, Bongaon. Government-recognized.',
    tags = ARRAY['CITA', 'IT Application', 'MS Office', 'Bongaon', 'Certificate']::text[],
    syllabus = ARRAY['Computer Fundamentals, Hardware Peripherals & Windows OS', 'MS Word: Professional Formatting, Letters & Mail Merge', 'MS Excel: Calculations, Worksheets, Functions & Charts', 'MS PowerPoint: Dynamic Presentations & Slide Transitions', 'Internet Applications, Emailing, Digital Payments & Cyber Safety']::text[]
WHERE id = 21;

UPDATE public.courses
SET description = 'Certificate in Information Technology (CIT): Master fundamental IT concepts, computer operating systems, office productivity tools, and web research at ICST Chowberia, Bongaon. Practical labs.',
    tags = ARRAY['CIT', 'Information Tech', 'Computer Basics', 'Bongaon', 'IT Skills']::text[],
    syllabus = ARRAY['Information Technology Concepts & Digital Systems', 'Operating Systems Navigation & Desktop Settings', 'Office Suite Proficiency: Word Processing & Spreadsheets', 'Multimedia Presentations & Graphical Visuals', 'Internet Browsing, Online Portals & Digital Hygiene']::text[]
WHERE id = 22;

UPDATE public.courses
SET description = 'Certified Data Entry Operator (CDEO): High-speed touch typing, MS Excel data management, form filling, OCR scanning, and accuracy training at ICST Chowberia, Bongaon. Job placement assistance.',
    tags = ARRAY['CDEO', 'Data Entry', 'Excel', 'Typing Speed', 'Bongaon']::text[],
    syllabus = ARRAY['Touch Typing Mastery (English/Bengali) & Speed Enhancement (35+ WPM)', 'MS Excel for Data Management: Sort, Filter, VLOOKUP & Data Validation', 'Online Data Entry Forms, Portals & Government Intake Systems', 'Document Scanning, OCR Conversion & File Archiving Standards', 'Speed Accuracy Audits & Real-World Entry Practicals']::text[]
WHERE id = 23;

UPDATE public.courses
SET description = 'Certificate in Desktop Publishing (CDTP): Photoshop, PageMaker, CorelDraw, graphic layouts, and commercial print design at ICST Chowberia near Bongaon. Hands-on design studio lab.',
    tags = ARRAY['CDTP', 'DTP', 'Photoshop', 'CorelDraw', 'Bongaon', 'Graphic Design']::text[],
    syllabus = ARRAY['Graphic Design Principles, Color Modes (RGB/CMYK) & Typography', 'Adobe Photoshop: Photo Retouching, Layers, Masking & Filters', 'PageMaker: Editorial Layouts, Books & Magazine Publishing', 'CorelDraw: Vector Illustrations, Logos, Banners & Flex Designing', 'Commercial Printing Workflow, Offset Prepress & Export Standards']::text[]
WHERE id = 24;

UPDATE public.courses
SET description = 'Certificate in Computer Awareness (CCA): Beginner-friendly introduction to digital literacy, mouse/keyboard mastery, internet safety, and essential utilities at ICST Chowberia, Bongaon.',
    tags = ARRAY['CCA', 'Digital Literacy', 'Computer Awareness', 'Chowberia', 'Bongaon']::text[],
    syllabus = ARRAY['Introduction to Personal Computers & Peripherals', 'Keyboarding, Mouse Navigation & Basic System Operation', 'Introduction to Word Processing & Note Making', 'Internet Surfing, Information Searching & Safety', 'Digital India Services, Citizen Portals & Online Payments']::text[]
WHERE id = 25;

UPDATE public.courses
SET description = 'Certificate in Internet Application (CIA): Master advanced web browsing, Google Workspace, cloud storage, e-governance portals, and online safety at ICST Chowberia, Bongaon. Hands-on labs.',
    tags = ARRAY['CIA', 'Internet', 'Google Workspace', 'Cyber Safety', 'Bongaon']::text[],
    syllabus = ARRAY['Internet Architecture, Web Browsers & Safe Search Techniques', 'Google Cloud Tools: Drive, Docs, Sheets & Forms', 'Professional Email Communications & Netiquette', 'E-Commerce Portals, Online Banking & UPI Security', 'Social Media Ethics, Privacy Protection & Cyber Hygiene']::text[]
WHERE id = 26;

UPDATE public.courses
SET description = 'Certificate in Computer Fundamentals (CCF): Build strong core skills in computer hardware components, Windows OS, word processing, and file systems at ICST Chowberia, Bongaon. Practical classes.',
    tags = ARRAY['CCF', 'Fundamentals', 'Windows', 'Office', 'Bongaon']::text[],
    syllabus = ARRAY['Hardware Architecture, CPU, Storage & Memory Types', 'Operating System Basics, Windows Explorer & Utilities', 'MS Word Document Authoring & Formatting', 'Basic Spreadsheets with MS Excel', 'Introduction to Internet Connectivity & Peripheral Setup']::text[]
WHERE id = 27;

UPDATE public.courses
SET description = 'Certificate in Office Automation (COA): Advanced MS Word, Excel, PowerPoint, and Outlook for corporate and government administrative roles at ICST Chowberia, Bongaon. 100% practical lab.',
    tags = ARRAY['COA', 'Office Automation', 'MS Excel', 'MS Word', 'Bongaon']::text[],
    syllabus = ARRAY['Advanced MS Word: Automated Table of Contents, Templates & Mail Merge', 'MS Excel: Formulas (SUMIFS, VLOOKUP, XLOOKUP), Pivot Tables & Charts', 'MS PowerPoint: Executive Slide Decks, Animations & Transitions', 'Office Communications, Email Clients & Cloud Sharing', 'Office Hardware Management: Printers, Scanners & Copiers']::text[]
WHERE id = 28;

UPDATE public.courses
SET description = 'Certificate in Typing Master (CTM): High-speed English and regional language touch typing, accuracy metrics, and speed test preparation (40+ WPM) at ICST Chowberia, Bongaon.',
    tags = ARRAY['CTM', 'Typing Master', 'Touch Typing', 'Speed Test', 'Bongaon']::text[],
    syllabus = ARRAY['Touch Typing Ergonomics & Finger Placement Techniques', 'Home Row, Top Row & Bottom Row Drill Exercises', 'Numeric Keypad & Punctuation High-Speed Typing', 'Speed Drills, Error Tracking & Words Per Minute (WPM) Analytics', 'Timed Typing Examination Preparation for Government Exams']::text[]
WHERE id = 29;

UPDATE public.courses
SET description = 'Certificate in Financial Accounting (CFA): Manual and computerized bookkeeping, journal entries, ledger balancing, and accounting software at ICST Chowberia, Bongaon. Career-focused training.',
    tags = ARRAY['CFA', 'Financial Accounting', 'Bookkeeping', 'Tally', 'Bongaon']::text[],
    syllabus = ARRAY['Principles of Accounting & Double-Entry Bookkeeping', 'Journal Entries, Ledger Accounts & Cash Books', 'Preparation of Trial Balance, Profit & Loss Account & Balance Sheet', 'Computerized Accounting Software Setup & Master Creation', 'Voucher Entry, Bank Reconciliation (BRS) & Financial Reports']::text[]
WHERE id = 30;

UPDATE public.courses
SET description = 'Certificate in Web Design (CWD): HTML5, CSS3, responsive mobile layouts, UI styling, and basic JavaScript for aspiring web designers at ICST Chowberia, Bongaon. Portfolio projects included.',
    tags = ARRAY['CWD', 'Web Design', 'HTML5', 'CSS3', 'Bongaon']::text[],
    syllabus = ARRAY['HTML5 Web Page Structure, Semantic Tags & Links', 'CSS3 Styling, Fonts, Colors, Box Model & Borders', 'Responsive Layouts with Flexbox & Media Queries', 'Designing Navigation Menus, Contact Forms & Headers', 'Web Hosting Basics, Domain Setup & FTP Uploading']::text[]
WHERE id = 31;

UPDATE public.courses
SET description = 'Certificate in Computer Language (CCL): Core programming paradigms, algorithm logic, flowchart design, and structured coding in C at ICST Chowberia, Bongaon. Strong foundation for software studies.',
    tags = ARRAY['CCL', 'Programming', 'C Language', 'Logic', 'Bongaon']::text[],
    syllabus = ARRAY['Problem Solving Techniques, Pseudo-code & Flowcharts', 'Core Programming Syntax, Identifiers & Data Types', 'Decision Making Statements & Iterative Loops', 'Modular Programming with Custom Functions & Arrays', 'Basic Data Sorting & Algorithm Implementation']::text[]
WHERE id = 32;

UPDATE public.courses
SET description = 'Master Tally Prime with GST: company creation, voucher entry, inventory management, e-invoicing, TDS, and balance sheets at ICST Chowberia, Bongaon. 100% practical accounting training.',
    tags = ARRAY['Tally Prime', 'GST', 'Accounting', 'Inventory', 'Bongaon']::text[],
    syllabus = ARRAY['Tally Prime Setup, Company Creation & Chart of Accounts', 'Voucher Entry: Sales, Purchase, Payment, Receipt & Contra', 'Inventory Management: Stock Groups, Units & Godowns', 'GST Compliance: CGST, SGST, IGST Invoicing & E-Way Bills', 'Bank Reconciliation Statement (BRS) & Cheque Printing', 'TDS Entries & Generation of Final Financial Balance Sheets']::text[]
WHERE id = 33;

UPDATE public.courses
SET description = 'Diploma in Information Technology Application (DITA): 12-month program covering office automation, database management, web design, and digital accounting at ICST Chowberia, Bongaon.',
    tags = ARRAY['DITA', 'Diploma', 'Office Automation', 'Web Design', 'Bongaon', 'Tally']::text[],
    syllabus = ARRAY['Module 1: Operating Systems & PC Hardware Fundamentals', 'Module 2: Advanced MS Office (Word, Excel, PowerPoint, Access)', 'Module 3: Web Designing Basics (HTML5, CSS3)', 'Module 4: Computerized Financial Accounting with Tally', 'Module 5: Real-World Lab Project & Viva Voce']::text[]
WHERE id = 34;

UPDATE public.courses
SET description = 'Diploma in Information Technology (DIT): 12-month comprehensive program in IT systems, software applications, networking, and programming at ICST Chowberia, Bongaon. Government-recognized.',
    tags = ARRAY['DIT', 'Diploma', 'Information Tech', 'Networking', 'Bongaon']::text[],
    syllabus = ARRAY['Module 1: Computer Hardware, OS & Architecture', 'Module 2: Office Automation & Database Systems', 'Module 3: Computer Networking Principles & Protocols', 'Module 4: Structured Programming Concepts', 'Module 5: Comprehensive IT Project & Lab Evaluation']::text[]
WHERE id = 35;

UPDATE public.courses
SET description = 'Diploma in Computer Application (DCA): 12-month flagship diploma covering MS Office, Desktop Publishing, Tally Accounting, and internet applications at ICST Chowberia, Bongaon. Job placement ready.',
    tags = ARRAY['DCA', 'Diploma', 'MS Office', 'DTP', 'Tally', 'Bongaon']::text[],
    syllabus = ARRAY['Module 1: Computer Fundamentals & Operating Systems', 'Module 2: Advanced MS Office Suite (Word, Excel, PowerPoint)', 'Module 3: Desktop Publishing (Photoshop & PageMaker)', 'Module 4: Computerized Accounting with Tally Prime', 'Module 5: Practical Lab Project & Comprehensive Exam']::text[]
WHERE id = 36;

UPDATE public.courses
SET description = 'Diploma in Computer Programming (DCP): 12-month deep dive into C, C++, Python, algorithms, and database systems at ICST Chowberia near Bongaon. Ideal for aspiring software developers.',
    tags = ARRAY['DCP', 'Programming', 'C++', 'Python', 'Bongaon', 'Diploma']::text[],
    syllabus = ARRAY['Module 1: Algorithmic Logic & C Programming', 'Module 2: Object-Oriented Programming with C++', 'Module 3: Modern Scripting with Python 3', 'Module 4: Database Design with SQL & Relational Models', 'Module 5: Software Application Development Project']::text[]
WHERE id = 37;

UPDATE public.courses
SET description = 'Diploma in Web Designing (DWD): 12-month professional program covering HTML5, CSS3, JavaScript, Bootstrap, Photoshop, and UI/UX design at ICST Chowberia, Bongaon. Live web project portfolio.',
    tags = ARRAY['DWD', 'Web Designing', 'UI/UX', 'JavaScript', 'Bongaon', 'Diploma']::text[],
    syllabus = ARRAY['Module 1: Web Concept & UI/UX Wireframing', 'Module 2: Responsive HTML5, CSS3 & Modern Styling', 'Module 3: Client-Side Interactivity with JavaScript & DOM', 'Module 4: Mobile-First Layouts with Bootstrap Framework', 'Module 5: Live Website Hosting, SEO & Portfolio Showcase']::text[]
WHERE id = 38;

UPDATE public.courses
SET description = 'Diploma in Computer Science (DCS): 12-month program spanning hardware, operating systems, data structures, programming, and networking at ICST Chowberia, Bongaon. Strong technical foundation.',
    tags = ARRAY['DCS', 'Computer Science', 'Hardware', 'Programming', 'Bongaon', 'Diploma']::text[],
    syllabus = ARRAY['Module 1: Digital Electronics & Computer Architecture', 'Module 2: Operating Systems & System Programming', 'Module 3: Data Structures & Algorithms in C/C++', 'Module 4: Computer Networking & Cyber Security Basics', 'Module 5: Technical Capstone Project & Viva']::text[]
WHERE id = 39;

UPDATE public.courses
SET description = 'Diploma in Computer Hardware & Networking (DCHN): 12-month hands-on course covering PC assembling, chip troubleshooting, OS installation, LAN setup, and routers at ICST Chowberia, Bongaon.',
    tags = ARRAY['DCHN', 'Hardware', 'Networking', 'PC Repair', 'Bongaon', 'Diploma']::text[],
    syllabus = ARRAY['Module 1: PC Architecture, Motherboards & Component Testing', 'Module 2: System Assembling, BIOS/UEFI & OS Installation', 'Module 3: Hardware Diagnostics, Maintenance & Peripherals', 'Module 4: LAN Wiring, Switches, Routers & Network Troubleshooting', 'Module 5: Live Lab Practicals & Diagnostic Examination']::text[]
WHERE id = 40;

UPDATE public.courses
SET description = 'Diploma in Office Automation & Programming (DOACP): 12-month dual-skill diploma combining high-end office automation with coding fundamentals at ICST Chowberia, Bongaon. Government recognized.',
    tags = ARRAY['DOACP', 'Office Automation', 'Programming', 'Excel', 'Bongaon', 'Diploma']::text[],
    syllabus = ARRAY['Module 1: Advanced MS Office Productivity (Word, Excel, PowerPoint)', 'Module 2: Relational Database Management with MS Access', 'Module 3: Core Programming Logic & C Language', 'Module 4: Web Concepts & Digital Communication', 'Module 5: End-to-End Practical Project & Certification']::text[]
WHERE id = 41;

UPDATE public.courses
SET description = 'Diploma in Office Management (DOM): 12-month program in corporate administration, business documentation, advanced Excel, billing, and communication at ICST Chowberia, Bongaon.',
    tags = ARRAY['DOM', 'Office Management', 'Administration', 'Excel', 'Bongaon', 'Diploma']::text[],
    syllabus = ARRAY['Module 1: Principles of Business Office Management', 'Module 2: Business Correspondence, Filing & Documentation', 'Module 3: Advanced Spreadsheets, Data Analysis & Reporting', 'Module 4: Computerized Billing & Inventory Concepts', 'Module 5: Professional Soft Skills & Administrative Practical']::text[]
WHERE id = 42;

UPDATE public.courses
SET description = 'Diploma in Desktop Publishing (DDTP): 12-month professional graphic design diploma covering Photoshop, CorelDraw, PageMaker, Illustrator, and print prepress at ICST Chowberia, Bongaon.',
    tags = ARRAY['DDTP', 'Graphic Design', 'Photoshop', 'CorelDraw', 'Bongaon', 'Diploma']::text[],
    syllabus = ARRAY['Module 1: Digital Image Processing with Adobe Photoshop', 'Module 2: Vector Graphic Design with CorelDraw', 'Module 3: Editorial Layout & Publications with PageMaker', 'Module 4: Vector Illustration Concepts with Adobe Illustrator', 'Module 5: Commercial Print Projects & Portfolio Review']::text[]
WHERE id = 43;

UPDATE public.courses
SET description = 'Diploma in Data Entry & Digital Language (DDL): 12-month diploma covering bilingual typing mastery, high-speed data transcription, advanced Excel, and office forms at ICST Chowberia, Bongaon.',
    tags = ARRAY['DDL', 'Data Entry', 'Typing', 'Digital Language', 'Bongaon', 'Diploma']::text[],
    syllabus = ARRAY['Module 1: Computer Operation & Operating Systems', 'Module 2: Advanced Bilingual Touch Typing (English & Bengali)', 'Module 3: Complex Spreadsheet Management & Reporting', 'Module 4: Digital Data Transcription & Form Processing', 'Module 5: Practical Typing Speed & Accuracy Audits']::text[]
WHERE id = 44;

UPDATE public.courses
SET description = 'Diploma in Professional Accounting & Tally (DPAT): 12-month comprehensive accounting program covering Tally Prime, GST, TDS, Payroll, and balance sheets at ICST Chowberia, Bongaon.',
    tags = ARRAY['DPAT', 'Tally Prime', 'GST', 'Payroll', 'Bongaon', 'Accounting Diploma']::text[],
    syllabus = ARRAY['Module 1: Advanced Financial Accounting Concepts', 'Module 2: Tally Prime Mastery & Chart of Accounts', 'Module 3: Complete GST Filing, Invoicing & Return Modules', 'Module 4: TDS Calculation, Payroll Management & Audit Reports', 'Module 5: Live Corporate Accounting Internship Project']::text[]
WHERE id = 45;

UPDATE public.courses
SET description = 'Diploma in Cyber Security & Ethical Hacking (DCSEH): 12-month course covering network defense, vulnerability assessment, cryptography, and penetration testing at ICST Chowberia, Bongaon.',
    tags = ARRAY['DCSEH', 'Cyber Security', 'Ethical Hacking', 'Networking', 'Bongaon', 'Diploma']::text[],
    syllabus = ARRAY['Module 1: Cyber Security Fundamentals & Threat Landscape', 'Module 2: Network Security Protocols, Firewalls & VPNs', 'Module 3: Ethical Hacking Concepts & Vulnerability Assessment', 'Module 4: Web Application Security & Cryptography Basics', 'Module 5: Hands-on Cyber Defense Simulation Lab & Viva']::text[]
WHERE id = 46;

UPDATE public.courses
SET description = 'Diploma in Digital Marketing (DDM): 12-month career program in SEO, Google Ads, social media marketing, content creation, and analytics at ICST Chowberia near Bongaon. Live campaigns included.',
    tags = ARRAY['DDM', 'Digital Marketing', 'SEO', 'Social Media', 'Bongaon', 'Diploma']::text[],
    syllabus = ARRAY['Module 1: Digital Marketing Strategy & Market Research', 'Module 2: Search Engine Optimization (SEO: On-Page & Off-Page)', 'Module 3: Social Media Marketing (Facebook, Instagram, LinkedIn)', 'Module 4: Google Ads (SEM), PPC & Email Campaign Automation', 'Module 5: Web Analytics, Conversion Tracking & Live Projects']::text[]
WHERE id = 47;

UPDATE public.courses
SET description = 'Advance Diploma in Computer Application (ADCA): 12-month premier diploma covering Office Automation, DTP, Tally Prime with GST, Programming, and Web Design at ICST Chowberia, Bongaon.',
    tags = ARRAY['ADCA', 'Advance Diploma', 'Office Automation', 'Tally GST', 'Web Design', 'Bongaon']::text[],
    syllabus = ARRAY['Module 1: Advanced Computer Applications & Windows Administration', 'Module 2: High-End Office Productivity with MS Office Suite', 'Module 3: Desktop Publishing with Adobe Photoshop & CorelDraw', 'Module 4: Financial Accounting with Tally Prime & GST', 'Module 5: Web Designing with HTML5, CSS3 & JavaScript', 'Module 6: Capstone Project Work & Government-Recognized Viva']::text[]
WHERE id = 48;

UPDATE public.courses
SET description = 'Advanced Diploma in Office Automation & Programming (ADOACP): 18-month master diploma bridging executive administration with software development at ICST Chowberia, Bongaon.',
    tags = ARRAY['ADOACP', 'Advance Diploma', 'Office Suite', 'Programming', 'Bongaon']::text[],
    syllabus = ARRAY['Module 1: Master Office Automation Suite & Cloud Solutions', 'Module 2: Database Systems Architecture & SQL Queries', 'Module 3: Advanced C & C++ Programming Methodologies', 'Module 4: Web Design & Interactive Applications', 'Module 5: Comprehensive Year-End Industry Project']::text[]
WHERE id = 49;

UPDATE public.courses
SET description = 'Advance Diploma in Information Technology (ADIT): 18-month high-level IT diploma covering systems administration, enterprise databases, programming, and networking at ICST Chowberia, Bongaon.',
    tags = ARRAY['ADIT', 'Advance Diploma', 'Information Tech', 'Systems Admin', 'Bongaon']::text[],
    syllabus = ARRAY['Module 1: Computer Systems, OS Internals & Diagnostics', 'Module 2: Enterprise Relational Databases & SQL Server', 'Module 3: Object-Oriented Software Programming in Java/C++', 'Module 4: Network Infrastructure, Routing & Server Management', 'Module 5: Full-Scale Technical Thesis Project']::text[]
WHERE id = 50;

UPDATE public.courses
SET description = 'Advance Diploma in Desktop Publishing (ADDTP): 18-month master graphic design diploma covering Photoshop, CorelDraw, Illustrator, and commercial print media at ICST Chowberia, Bongaon.',
    tags = ARRAY['ADDTP', 'Advance Diploma', 'Graphic Design', 'Photoshop', 'CorelDraw', 'Bongaon']::text[],
    syllabus = ARRAY['Module 1: Commercial Graphic Design Theory & Visual Layouts', 'Module 2: Advanced Adobe Photoshop Masking & Composition', 'Module 3: Vector Graphics & Branding with CorelDraw', 'Module 4: Vector Illustration Art with Adobe Illustrator', 'Module 5: Print Production Prepress & Portfolio Exhibition']::text[]
WHERE id = 51;

UPDATE public.courses
SET description = 'Advance Diploma in Computer Hardware & Networking (ADCHN): 18-month elite program in chip diagnostics, advanced server networking, and cybersecurity at ICST Chowberia, Bongaon.',
    tags = ARRAY['ADCHN', 'Advance Diploma', 'Hardware', 'Networking', 'Server Admin', 'Bongaon']::text[],
    syllabus = ARRAY['Module 1: Microprocessor Architecture & Chip-Level Motherboard Diagnostics', 'Module 2: Advanced Assembling, Storage Systems & Hardware Fault Finding', 'Module 3: Server Administration (Windows Server & Linux Admin)', 'Module 4: Enterprise Network Routing, Switching & Firewall Configuration', 'Module 5: Real-World Hardware & Network Infrastructure Project']::text[]
WHERE id = 52;

UPDATE public.courses
SET description = 'Advance Diploma in Office Management (ADOM): 18-month executive program covering corporate HR workflows, advanced data analysis, accounting, and business communication at ICST Chowberia, Bongaon.',
    tags = ARRAY['ADOM', 'Advance Diploma', 'Office Management', 'HR Admin', 'Bongaon']::text[],
    syllabus = ARRAY['Module 1: Executive Office Management & Corporate Governance', 'Module 2: Advanced Business Analytics with Excel & PowerBI Concepts', 'Module 3: Computerized Financial Accounting with Tally Prime', 'Module 4: Human Resource Administration & Corporate Communication', 'Module 5: End-to-End Administrative Management Internship Case Study']::text[]
WHERE id = 53;

UPDATE public.courses
SET description = 'Advance Diploma in Web Designing (ADWD): 12-month advanced program covering HTML5, CSS3, JavaScript, React basics, Tailwind, and backend API integration at ICST Chowberia, Bongaon.',
    tags = ARRAY['ADWD', 'Advance Diploma', 'Web Design', 'React', 'Tailwind', 'Bongaon']::text[],
    syllabus = ARRAY['Module 1: Modern Web Standards, Semantic HTML5 & CSS3', 'Module 2: JavaScript ES6+ & Dynamic UI DOM Programming', 'Module 3: Mobile Frameworks (Bootstrap & Tailwind CSS)', 'Module 4: Frontend Component Architecture with React.js', 'Module 5: Live Website Deployment, Hosting & Client Project']::text[]
WHERE id = 54;

UPDATE public.courses
SET description = 'Pre-Primary Computer Fun (PP1 & PP2): Engaging, child-friendly introduction to computer parts, mouse control, educational games, and creative drawing at ICST Chowberia, Bongaon.',
    tags = ARRAY['Kids Computer', 'Pre-Primary', 'MS Paint', 'Mouse Skills', 'Chowberia']::text[],
    syllabus = ARRAY['Friendly Introduction to Computer Parts (Screen, Keyboard, Mouse)', 'Interactive Mouse Control, Clicking & Drag-and-Drop Games', 'Digital Drawing & Color Magic with MS Paint', 'Fun with Numbers & Alphabets on the Keyboard', 'Healthy Computer Ergonomics & Screen Time Awareness']::text[]
WHERE id = 55;

UPDATE public.courses
SET description = 'Computer Learning for School Students (Class 1-5): Fun-filled training in MS Paint, touch typing basics, WordPad, and educational software at ICST Chowberia, Bongaon. Build early tech confidence.',
    tags = ARRAY['Kids Coding', 'School Computer', 'Class 1-5', 'MS Paint', 'Chowberia']::text[],
    syllabus = ARRAY['Hardware Basics: CPU, Monitor, Keyboard & Printer', 'Creative Art & Shape Composition with MS Paint', 'Touch Keyboarding & Fun Typing Exercises', 'WordPad Basics: Typing Stories & Simple Formatting', 'Safe Internet Awareness for Young Learners']::text[]
WHERE id = 56;

UPDATE public.courses
SET description = 'Computer Training for Class 6-7: Master MS Word project formatting, PowerPoint presentation slides, Excel tables, and scratch coding at ICST Chowberia, Bongaon. Aligned with school curriculum.',
    tags = ARRAY['School Computer', 'Class 6-7', 'MS Office', 'PowerPoint', 'Chowberia']::text[],
    syllabus = ARRAY['Windows File Organization, Folders & Safe Internet Search', 'MS Word: Formatting School Projects, Tables & Borders', 'MS PowerPoint: Building Visual Presentations & Transitions', 'MS Excel: Basic Formulas, Tables & Student Mark Sheets', 'Introduction to Creative Logic & Block-based Coding Concepts']::text[]
WHERE id = 57;

UPDATE public.courses
SET description = 'Computer Education for Class 8-9: Advanced Excel, introductory programming logic, web basics, and presentation skills at ICST Chowberia, Bongaon. Perfect for academic excellence.',
    tags = ARRAY['School Computer', 'Class 8-9', 'Coding Basics', 'MS Excel', 'Chowberia']::text[],
    syllabus = ARRAY['Computer Architecture, Binary Number System & Logic Gates', 'Advanced MS Word: Reports, Referencing & SmartArt', 'MS Excel: Mathematical Functions, Sorting & Chart Visuals', 'Web Basics: Creating First HTML Web Pages', 'Introductory Programming Logic & Problem Solving']::text[]
WHERE id = 58;

UPDATE public.courses
SET description = 'Foundation Certificate in Computer Education (FCCE): Comprehensive 12-month foundational diploma for school and teenage students at ICST Chowberia, Bongaon. Aligned with modern school boards.',
    tags = ARRAY['FCCE', 'Foundation', 'School Computer', 'MS Office', 'Chowberia']::text[],
    syllabus = ARRAY['Module 1: Computer Concepts, OS & Windows File Management', 'Module 2: Complete MS Office Suite (Word, Excel, PowerPoint)', 'Module 3: Internet Research, Digital Etiquette & Online Safety', 'Module 4: Basics of Web Technology & HTML', 'Module 5: Student Project Work & Annual Assessment']::text[]
WHERE id = 59;

UPDATE public.courses
SET description = 'Creative Computing (CCK): Digital art, simple 2D animation, photo editing, and creative storytelling for young learners at ICST Chowberia, Bongaon. Inspiring young digital creators.',
    tags = ARRAY['CCK', 'Creative Computing', 'Digital Art', 'Animation', 'Chowberia']::text[],
    syllabus = ARRAY['Digital Drawing & Vector Art Fundamentals', 'Introduction to Image Editing & Photo Effects', 'Basics of 2D Animation & Storyboard Creation', 'Interactive Multimedia Presentations with Sound & Motion', 'Creative Student Project Showcase']::text[]
WHERE id = 60;

UPDATE public.courses
SET description = 'Core Java Engineering & Architecture (CJEA): Enterprise Java, JVM tuning, OOP patterns, Multithreading, JDBC, and Clean Architecture at ICST Chowberia, Bongaon. High-tier software engineering.',
    tags = ARRAY['Java', 'Core Java', 'Software Architecture', 'JVM', 'Bongaon', 'CJEA']::text[],
    syllabus = ARRAY['Advanced JVM Architecture, Bytecode & ClassLoaders', 'Deep Dive OOP Design Patterns (Singleton, Factory, Builder, Observer)', 'Multithreading, Concurrency Utilities & Memory Model (JMM)', 'Java Collections Framework & High-Performance Data Structures', 'JDBC Database Operations, Connection Pooling & Transaction Isolation', 'Unit Testing with JUnit, Clean Code & Software Engineering Principles']::text[]
WHERE id = 68;