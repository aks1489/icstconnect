---
name: course-keyword-optimization
description: Permanent specification, keyword matrix, and safety audit protocol for optimizing the ICST Connect 62-course catalog for top Google search engine rankings (e.g., Java, Python, Web Dev, DCA/ADCA Diplomas, Tally, Hardware/Networking) in Chowberia, Bongaon, and North 24 Parganas, West Bengal.
---

# ICST Connect Course Catalog & Keyword Optimization Skill

This skill governs the search engine optimization (SEO), metadata enrichment, syllabus structuring, and workflow safety protocols for the complete **62-course catalog** of the **Institute of Computer Science and Technology (ICST) Chowberia**.

Every agent, developer, or automated pipeline that updates, modifies, or audits course data in the Supabase database (`courses`, `course_modules`, `course_topics` tables) or frontend components must strictly adhere to the standards, invariants, and guidelines codified in this document.

---

## 1. Absolute Invariant Constraints (DO NOT VIOLATE)

To prevent breaking existing foreign key relationships, route handlers, class schedules, intake workflows, or dynamic homepage lookups, the following rules are non-negotiable:

### 1.1 Course Title & Code Invariance
* **`course_name` is IMMUTABLE:** Never change or edit `course_name` under any circumstances. Multiple components (e.g., homepage marquee in `CoursesSection.tsx`, test linkages, class assignments) use exact or substring matches on `course_name`.
* **`id` is IMMUTABLE:** Never alter primary key `id` values. Route patterns `/courses/:courseId` and `/enroll/:courseId` depend directly on primary key integers.
* **`short_code` is IMMUTABLE:** Do not alter existing short codes (e.g., `CJEA`, `0025`, `DITA`, `ADCA`).

### 1.2 Target Enrichment Scope (Safe to Augment)
The following fields are explicitly designated for SEO and keyword enrichment:
1. **`description`**: Augment into comprehensive, high-authority, keyword-rich descriptions (150–260 characters) combining core technical stack, practical lab competencies, career outcomes, and local geographic anchors.
2. **`tags`**: Provide 4 to 6 curated, high-intent keywords per course. (The UI displays the top 3 on catalog cards via `slice(0, 3)`, while the search filter indexes all tags).
3. **`syllabus`**: Enrich with structured, modern module topic lists reflecting industry expectations, practical lab projects, and government-recognized diploma standards.

---

## 2. Keyword Enrichment Framework

Every enriched course description and metadata payload must blend four essential pillars:

```
Enriched Description = [Core Technical Stack] 
                     + [Hands-on Lab Competencies & Modules] 
                     + [Target Job Roles & Career Outcomes] 
                     + [Institutional & Geographic Anchors]
```

### 2.1 The Four Enrichment Pillars

#### Pillar 1: Core Technology & Industry Standard
* State the specific programming languages, frameworks, or tools (e.g., Java JDK 21, Python 3.12, React 19, Tally Prime with GST, MS Office 2024, Red Hat Linux, Cisco CCNA concepts).
* Avoid vague hype; emphasize concrete software, syntaxes, and technical paradigms.

#### Pillar 2: Hands-on Lab Competency
* Emphasize practical implementation: individual workstations, real-world projects, live database queries, UI prototyping, or hardware diagnostics.
* Include ICST's unique institutional benefit: **Free extra practice sessions available Monday to Friday from 10:00 AM to 1:00 PM**.

#### Pillar 3: Career Pathways & Job Roles
* Explicitly mention employment roles enabled by the qualification (e.g., Junior Java Developer, Data Entry Specialist, Office Automation Executive, Full Stack Engineer, IT Support Specialist, Tally Accountant).
* State government certification validity across employment exchanges and corporate hiring.

#### Pillar 4: Local Authority & Geographic Intent Triggers
* Target local organic Google queries by naturally integrating regional identifiers:
  * Primary: **Chowberia** (PIN 743273)
  * Regional Hub: **Bongaon** (Bangaon)
  * Neighboring Locales: **Gaighata**, **Gopalnagar**, **Thakurnagar**, **Chandpara**
  * District & State: **North 24 Parganas**, **West Bengal**

---

## 3. SEO Tagging Standard

Each course must carry 4 to 6 uppercase or title-cased keyword tags adhering to:
1. **Primary Technology Tag:** (e.g., `Java`, `Python`, `React`, `Tally`, `Hardware`)
2. **Specialization / Domain Tag:** (e.g., `OOP`, `Data Science`, `Full Stack`, `Accounting`, `Networking`)
3. **Academic Credential Tag:** (e.g., `Diploma`, `Certificate`, `Advance Diploma`, `School`)
4. **Local Intent Tag:** (e.g., `Bongaon`, `Chowberia`, `West Bengal`)
5. **Career / Application Tag:** (e.g., `Job Ready`, `GST`, `Practical Lab`, `Web Design`)

---

## 4. Technology Categories & Keyword Matrix

The 62 courses belong to 9 core technology tracks:

### 4.1 Java Programming Track
* **Courses:**
  * ID 3: `Certificate in Java Programming` (6 Months)
  * ID 68: `Core Java Engineering & Architecture` (6 Months, Code: CJEA)
* **Primary Search Queries:**
  * "java course in bongaon", "best java programming classes chowberia", "core java institute north 24 parganas", "java certification west bengal", "learn java oops jdbc spring"
* **Target Tags:** `['Java', 'OOP', 'JDBC', 'Bongaon', 'Backend']`
* **Core Competencies:** JDK, JVM Architecture, Object-Oriented Programming, Multithreading, Exception Handling, Collections Framework, JDBC Connectivity, Clean Code Principles.

### 4.2 Python Programming Track
* **Courses:**
  * ID 4: `Certificate in Python Programming` (6 Months)
* **Primary Search Queries:**
  * "python programming course bongaon", "python classes chowberia", "learn python coding north 24 parganas", "python for beginners west bengal", "data analysis python institute"
* **Target Tags:** `['Python', 'Coding', 'Data Structures', 'Bongaon', 'Software']`
* **Core Competencies:** Python 3 Fundamentals, Data Structures (Lists, Tuples, Dictionaries), Functional & OOP Concepts, File I/O, Automation Scripting, PIP Packages.

### 4.3 C / C++ / C# Track
* **Courses:**
  * ID 1: `Certificate in C Programming` (6 Months)
  * ID 2: `Certificate in C++ Programming` (6 Months)
  * ID 5: `Certificate in C# Programming` (6 Months)
* **Primary Search Queries:**
  * "c programming course bongaon", "c++ classes chowberia", "c sharp dot net training north 24 parganas", "bca college coding tuition bongaon", "learn c language from scratch"
* **Target Tags:** `['C Programming', 'C++', 'Algorithms', 'Bongaon', 'Memory Mgmt']`
* **Core Competencies:** Logic & Flowcharts, Pointers, Dynamic Memory, Structs & Unions, OOP, Templates, STL, .NET Framework, Windows Form Development.

### 4.4 Web Technologies & Full Stack Track
* **Courses:**
  * ID 12: `React Basics` (6 Months)
  * ID 13: `Advanced React` (6 Months)
  * ID 14: `Certificate in JavaScript` (6 Months)
  * ID 15: `Certificate in TypeScript` (6 Months)
  * ID 16: `Web Dev using Bootstrap` (6 Months)
  * ID 17: `Web Dev using Tailwind` (6 Months)
  * ID 18: `Frontend Web Development` (18 Months)
  * ID 19: `Backend Web Development` (18 Months)
  * ID 20: `Full Stack Web Development` (18 Months)
  * ID 31: `Cert. in Web Design (CWD)` (6 Months)
  * ID 38: `Diploma in Web Designing (DWD)` (12 Months)
  * ID 54: `Adv Dip in Web Designing (ADWD)` (12 Months)
* **Primary Search Queries:**
  * "web development course in bongaon", "react js frontend classes chowberia", "full stack developer institute north 24 parganas", "html css javascript training west bengal", "mern stack coding institute"
* **Target Tags:** `['Web Dev', 'React', 'JavaScript', 'Full Stack', 'Bongaon', 'Frontend']`
* **Core Competencies:** Responsive Design, Modern JavaScript ES6+, React Hooks & Context, Tailwind CSS, Node.js REST APIs, Database Integration, Web Deployment.

### 4.5 Cloud, Database, Systems & Computer Science Track
* **Courses:**
  * ID 6: `Certificate in SQL Programming` (6 Months)
  * ID 7: `Certificate in DBMS` (6 Months)
  * ID 8: `Certificate in Data Structure` (6 Months)
  * ID 10: `Certificate in Operating Systems` (6 Months)
  * ID 37: `Diploma in Comp Programming (DCP)` (12 Months)
  * ID 39: `Diploma in Computer Science (DCS)` (12 Months)
* **Primary Search Queries:**
  * "sql database course bongaon", "dbms institute chowberia", "data structures and algorithms tuition west bengal", "computer science diploma north 24 parganas"
* **Target Tags:** `['SQL', 'Database', 'DSA', 'Operating Systems', 'Bongaon']`
* **Core Competencies:** Relational Schema Design, SQL Queries, Joins, Indexing, Transactions, Linux/Windows OS Management, Stack/Queue/Trees Algorithms.

### 4.6 Hardware, Networking & Cyber Security Track
* **Courses:**
  * ID 11: `Cert. in Data Comm. & Networking` (6 Months)
  * ID 40: `Diploma in Hardware & Net (DCHN)` (12 Months)
  * ID 46: `Diploma in Cyber Security (DCSEH)` (12 Months)
  * ID 52: `Adv Dip Hardware & Net (ADCHN)` (18 Months)
* **Primary Search Queries:**
  * "computer hardware course bongaon", "networking institute chowberia", "cyber security course north 24 parganas", "ethical hacking classes west bengal", "dchn diploma training"
* **Target Tags:** `['Hardware', 'Networking', 'Cyber Security', 'Troubleshooting', 'Bongaon']`
* **Core Competencies:** PC Assembling, OS Installation, Motherboard Diagnostics, LAN/WAN Configuration, Routers & Switches, Ethical Hacking Basics, Firewall & Network Defense.

### 4.7 Tally, Accounting & Financial Software Track
* **Courses:**
  * ID 30: `Cert. in Financial Accounting (CFA)` (6 Months)
  * ID 33: `Cert. in Accounting (Tally)` (6 Months)
  * ID 45: `Dip. Prof. Accounting & Tally (DPAT)` (12 Months)
* **Primary Search Queries:**
  * "tally prime course in bongaon", "tally gst training chowberia", "financial accounting institute north 24 parganas", "computer accounting classes west bengal", "gst e-filing course"
* **Target Tags:** `['Tally Prime', 'GST', 'Accounting', 'Vouchers', 'Bongaon']`
* **Core Competencies:** Double-Entry Bookkeeping, Tally Prime Interface, Journal Entries, Ledger & Trial Balance, GST Invoicing & E-Way Bills, TDS Calculation, Payroll Management.

### 4.8 Diploma & Certificate Programs (DITA, DCA, ADCA, IT & Office)
* **Courses:**
  * ID 9: `Certificate in Computer Fundamentals` (6 Months)
  * ID 21: `Cert. in IT Application (CITA)` (6 Months)
  * ID 22: `Cert. in Information Tech (CIT)` (6 Months)
  * ID 23: `Cert. in Data Entry Operator (CDEO)` (6 Months)
  * ID 24: `Cert. in Desktop Publishing (CDTP)` (6 Months)
  * ID 25: `Cert. in Computer Awareness (CCA)` (6 Months)
  * ID 26: `Cert. in Internet Application (CIA)` (6 Months)
  * ID 27: `Cert. in Computer Fundamentals (CCF)` (6 Months)
  * ID 28: `Cert. in Office Automation (COA)` (6 Months)
  * ID 29: `Cert. in Typing Master (CTM)` (6 Months)
  * ID 32: `Cert. in Language (CCL)` (6 Months)
  * ID 34: `Diploma in IT Application (DITA)` (12 Months)
  * ID 35: `Diploma in IT (DIT)` (12 Months)
  * ID 36: `Diploma in Comp Application (DCA)` (12 Months)
  * ID 41: `Dip. Office Auto. & Prog. (DOACP)` (12 Months)
  * ID 42: `Diploma in Office Management (DOM)` (12 Months)
  * ID 43: `Diploma in Desktop Publishing (DDTP)` (12 Months)
  * ID 44: `Dip. Data Entry & Digital Lang (DDL)` (12 Months)
  * ID 47: `Diploma in Digital Marketing (DDM)` (12 Months)
  * ID 48: `Adv Diploma in Comp App (ADCA)` (12 Months)
  * ID 49: `Adv Dip Office Auto & Prog (ADOACP)` (18 Months)
  * ID 50: `Adv Diploma in IT (ADIT)` (18 Months)
  * ID 51: `Adv Diploma in DTP (ADDTP)` (18 Months)
  * ID 53: `Adv Dip in Office Mgmt (ADOM)` (18 Months)
* **Primary Search Queries:**
  * "adca computer course bongaon", "dca diploma chowberia", "dita computer course in north 24 parganas", "data entry operator course bongaon", "desktop publishing dtp institute west bengal"
* **Target Tags:** `['ADCA', 'DCA', 'DITA', 'Office Automation', 'Bongaon', 'Diploma']`
* **Core Competencies:** Operating Systems, MS Word / Excel / PowerPoint, Desktop Publishing (Photoshop, PageMaker, CorelDraw), Typing Speed, Office Administration, Digital Marketing.

### 4.9 Kids & School Foundation Computer Courses
* **Courses:**
  * ID 55: `PP1 & PP2` (12 Months)
  * ID 56: `Learning School Comp (Class 1-5)` (12 Months)
  * ID 57: `Learning School Comp (Class 6-7)` (12 Months)
  * ID 58: `Learning School Comp (Class 8-9)` (12 Months)
  * ID 59: `Foundation Cert. (FCCE)` (12 Months)
  * ID 60: `Creative Computing (CCK)` (6 Months)
* **Primary Search Queries:**
  * "school computer tuition chowberia", "kids coding classes bongaon", "computer basics for school students north 24 parganas", "cbse icse school computer training chowberia"
* **Target Tags:** `['Kids Coding', 'School Computer', 'Basics', 'Typing', 'Chowberia']`
* **Core Competencies:** Computer Ergonomics, MS Paint, Typing Mastery, Logo/Scratch Programming, Word & PowerPoint School Projects, Internet Safety.

---

## 5. Workflow Safety Verification Gate

Before committing any database update or frontend code changes, perform the following verification:

| Checkpoint | Target Standard | Verification Procedure |
| :--- | :--- | :--- |
| **Course Name Invariance** | 100% Identical | Verify `course_name` matches original database text character-for-character. |
| **Course Code Invariance** | Preserved | Ensure `short_code` and primary keys are unchanged. |
| **Catalog UI Layout** | Zero CLS, No Overflow | Verify `Courses.tsx` displays clean 3-tag pill badges (`slice(0, 3)`) and cards align cleanly with `line-clamp-3`. |
| **Homepage Marquee** | Seamless Scroll | Verify `CoursesSection.tsx` matches courses via exact substring match and text clamps to `line-clamp-2 h-8`. |
| **Course Modal** | Smooth Scroll | Verify `CourseDetailsModal.tsx` renders updated syllabus list inside `max-h-[90vh]` scrollable container. |
| **Enrollment Flow** | Zero Breakage | Verify `/enroll/:courseId` loads correct course name, duration, and fee structure. |
| **Sitemap Generation** | Valid XML | Run `node scripts/generate-sitemap.js` and verify all 61 public course URLs are registered. |
| **Prerender HTML** | Rich Static Markup | Run `node scripts/prerender.js` and inspect `dist/courses/[id]/index.html` for single H1, meta descriptions, and Schema.org Course markup. |

---

## 6. Anti-Patterns & Prohibitions

1. ❌ **Never truncate or drop courses:** All 62 database records must be audited and accounted for.
2. ❌ **Never alter course titles to stuff keywords:** Keyword stuffing into `course_name` (e.g. changing "React Basics" to "React Basics Web Dev Best Institute Bongaon") breaks existing routes, database joins, and homepage lookups. Put all keywords in `description`, `tags`, and `syllabus`.
3. ❌ **Never leave empty tags:** Every active course must have 4 to 6 searchable tags.
4. ❌ **Never introduce generic placeholders:** Avoid phrases like "Best course for you" or "Enroll today". Always specify concrete skills, software tools, and career competencies.
