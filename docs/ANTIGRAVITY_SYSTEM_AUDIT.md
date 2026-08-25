# ICST Connect — Antigravity System Audit & Current-State Inventory

*Generated in accordance with `ICST_CONNECT_GOOGLE_ANTIGRAVITY_MASTER_INSTRUCTIONS.md` (Section 1: First Phase Audit)*

---

## 1. System Overview & Baseline Verification

- **Workspace Path**: `d:\VS Code\Project\icstconnect`
- **Baseline Build Status (`npm run build`)**: **PASSED (Exit Code: 0)**
  - TypeScript compilation `tsc -b` and Vite Rollup bundling completed cleanly.
  - Chunk splitting: `vendor-react`, `vendor-ui`, `vendor-supabase`, dynamic lazy bundles.
- **Baseline Lint Status (`npm run lint`)**: **169 issues (140 errors, 29 warnings)**
  - Predominant issues: `@typescript-eslint/no-explicit-any`, unused variables in catch blocks, `react-hooks/set-state-in-effect` in layouts, and unmemoized `useEffect` dependencies.
  - These will be systematically resolved during the containerization and modernization phases.

---

## 2. Inventory of Current Routes & Layout Hierarchy

### 2.1 Public & Guest Routes (Wrapped in `MainLayout`)
| Route Path | Component File | Description |
| :--- | :--- | :--- |
| `/` | `src/pages/Home.tsx` | Main landing page (Hero, Courses, Scholarships, Stats, Gallery, Reviews) |
| `/courses/:courseId?` | `src/pages/Courses.tsx` | Searchable/filterable course catalog with modal inspector |
| `/enroll/:courseId` | `src/pages/EnrollmentForm.tsx` | Multi-step online student admission application wizard |
| `/notifications` | `src/pages/Notifications.tsx` | Public notice board and institutional circulars |
| `/gallery` | `src/pages/Gallery.tsx` | Interactive multi-layout photo gallery (Bento, Collage, Curve Road, 3D) |
| `/scholarships` | `src/pages/Scholarships.tsx` | Merit examination rankers, annual results & ceremony photos |
| `/online-test` | `src/pages/OnlineTest.tsx` | Public & student test catalog |
| `/online-test/:testId`| `src/pages/TestPlayer.tsx` | Timed MCQ online test examination interface |
| `/about` | `src/pages/AboutUs.tsx` | Institutional profile, faculty info & contact details |
| `/admin/login` | `src/pages/AdminLogin.tsx` | Administrator portal login |
| `/teacher/login` | `src/pages/TeacherLogin.tsx` | Faculty portal login |
| `/reset-password` | `src/pages/ResetPassword.tsx` | Self-service password recovery flow |

### 2.2 Standalone Public / Interactive Routes
| Route Path | Component File | Description |
| :--- | :--- | :--- |
| `/typing-practice` | `src/pages/TypingPractice.tsx` | Distraction-free 3-line viewport speed typing engine |
| `/connect` | `src/pages/Connect.tsx` | Referral discount claim calculator and token generator |

### 2.3 Shared Protected Routes
| Route Path | Component File | Guard Requirement |
| :--- | :--- | :--- |
| `/force-password-change` | `src/pages/ForcePasswordChange.tsx` | `ProtectedRoute` (Authenticated session) |
| `/quick-access` | `src/components/dashboard/QuickAccess.tsx` | `ProtectedRoute` (Authenticated session) |

### 2.4 Student Portal Routes (Wrapped in `StudentLayout`)
| Route Path | Component File | Guard Requirement |
| :--- | :--- | :--- |
| `/student` | `Navigate to /student/dashboard` | `ProtectedRoute` (`requireStudent`) |
| `/student/dashboard` | `src/student/pages/Dashboard.tsx` | `ProtectedRoute` (`requireStudent`) |
| `/student/offline-classes` | `src/student/pages/OfflineClasses.tsx` | `ProtectedRoute` (`requireStudent`) |
| `/student/calendar` | `src/student/pages/Calendar.tsx` | `ProtectedRoute` (`requireStudent`) |
| `/student/fees` | `src/student/pages/StudentFees.tsx` | `ProtectedRoute` (`requireStudent`) |
| `/student/complete-profile` | `src/student/pages/CompleteProfile.tsx` | `ProtectedRoute` (`requireStudent`) |
| `/student/tests` | `src/pages/OnlineTest.tsx` (`isStudentPortal`) | `ProtectedRoute` (`requireStudent`) |
| `/student/tests/:testId` | `src/pages/TestPlayer.tsx` | `ProtectedRoute` (`requireStudent`) |

### 2.5 Teacher Portal Routes (Wrapped in `TeacherLayout`)
| Route Path | Component File | Guard Requirement |
| :--- | :--- | :--- |
| `/teacher` | `Navigate to /teacher/dashboard` | `ProtectedRoute` (`requireTeacher`) |
| `/teacher/dashboard` | `src/teacher/pages/Dashboard.tsx` | `ProtectedRoute` (`requireTeacher`) |
| `/teacher/active-classes` | `src/teacher/pages/ActiveClasses.tsx` | `ProtectedRoute` (`requireTeacher`) |
| `/teacher/classes/:courseId` | `src/teacher/pages/ManageClass.tsx` | `ProtectedRoute` (`requireTeacher`) |
| `/teacher/classes/:studentId/:courseId` | `src/teacher/pages/StudentProgressTracker.tsx` | `ProtectedRoute` (`requireTeacher`) |
| `/teacher/calendar` | `src/teacher/pages/Calendar.tsx` | `ProtectedRoute` (`requireTeacher`) |
| `/teacher/exams` | `src/teacher/pages/Exams.tsx` | `ProtectedRoute` (`requireTeacher`) |

### 2.6 Admin Portal Routes (Wrapped in `AdminLayout`)
| Route Path | Component File | Guard Requirement |
| :--- | :--- | :--- |
| `/admin` | `Navigate to /admin/dashboard` | `ProtectedRoute` (`requireAdmin`) |
| `/admin/dashboard` | `src/admin/pages/Dashboard.tsx` | `ProtectedRoute` (`requireAdmin`) |
| `/admin/students` | `src/admin/pages/Students.tsx` | `ProtectedRoute` (`requireAdmin`) |
| `/admin/students/:id` | `src/admin/pages/StudentDetails.tsx` | `ProtectedRoute` (`requireAdmin`) |
| `/admin/teachers` | `src/admin/pages/Teachers.tsx` | `ProtectedRoute` (`requireAdmin`) |
| `/admin/teachers/:id` | `src/admin/pages/TeacherDetails.tsx` | `ProtectedRoute` (`requireAdmin`) |
| `/admin/courses` | `src/admin/pages/Courses.tsx` | `ProtectedRoute` (`requireAdmin`) |
| `/admin/courses/new` | `src/admin/pages/CourseForm.tsx` | `ProtectedRoute` (`requireAdmin`) |
| `/admin/courses/:id/edit` | `src/admin/pages/CourseForm.tsx` | `ProtectedRoute` (`requireAdmin`) |
| `/admin/courses/:id/structure` | `src/admin/pages/CourseStructureEditor.tsx` | `ProtectedRoute` (`requireAdmin`) |
| `/admin/courses/:id/classes` | `src/admin/pages/ClassManager.tsx` | `ProtectedRoute` (`requireAdmin`) |
| `/admin/classes` | `src/admin/pages/AdminClasses.tsx` | `ProtectedRoute` (`requireAdmin`) |
| `/admin/classes/:id` | `src/admin/pages/AdminClassDetails.tsx` | `ProtectedRoute` (`requireAdmin`) |
| `/admin/schedule` | `src/admin/pages/ScheduleClass.tsx` | `ProtectedRoute` (`requireAdmin`) |
| `/admin/calendar` | `src/admin/pages/Calendar.tsx` | `ProtectedRoute` (`requireAdmin`) |
| `/admin/finance` | `src/admin/pages/FinancialDashboard.tsx` | `ProtectedRoute` (`requireAdmin`) |
| `/admin/discount-claims` | `src/admin/pages/DiscountClaims.tsx` | `ProtectedRoute` (`requireAdmin`) |
| `/admin/enrollments` | `src/admin/pages/EnrollmentApplications.tsx` | `ProtectedRoute` (`requireAdmin`) |
| `/admin/scholarships` | `src/admin/pages/AdminScholarships.tsx` | `ProtectedRoute` (`requireAdmin`) |
| `/admin/gallery` | `src/admin/pages/AdminGallery.tsx` | `ProtectedRoute` (`requireAdmin`) |
| `/admin/tests` | `src/admin/pages/Tests.tsx` | `ProtectedRoute` (`requireAdmin`) |
| `/admin/tests/new` | `src/admin/pages/CreateTest.tsx` | `ProtectedRoute` (`requireAdmin`) |
| `/admin/tests/:id/edit` | `src/admin/pages/CreateTest.tsx` | `ProtectedRoute` (`requireAdmin`) |

---

## 3. Roles, Permissions & Authentication State

### Current Roles
- `student`: Enrolled learners. Can view offline class timetables, topic progress, fee statuses, personal academic calendar, and attempt assigned tests.
- `teacher`: Instructional staff. Can view active assigned batches, mark student attendance, track and check off topic progress, and oversee exam results.
- `admin`: Operational administrators. Full management of courses, batches, students, teachers, finances, admissions, scholarships, gallery, and tests.

### Required Role Modernization (Master Instructions Section 12 & 13)
- `super_admin`: System owner with highest authority.
  - Can manage other administrators, configure fine-grained role permissions, manage external ICST ecosystem sites, oversee audit logs, and control global system settings.

### Authentication State Flow (`src/contexts/AuthContext.tsx`)
- Supabase session management with `accessTokenRef` token caching to eliminate tab-switch re-renders.
- Profile lookup on `profiles` table.
- Computed flags: `isAdmin`, `isTeacher`, `isProfileComplete`.
- Mandatory password rotation interceptor via `requires_password_change` flag.

---

## 4. Current Database Schema & Tables Inventory

| Table Name | Primary Purpose | Key Foreign Keys / Relations |
| :--- | :--- | :--- |
| `public.profiles` | User profile, contact, role, temp passwords | `id -> auth.users.id` |
| `public.courses` | Course catalog, durations, fee structure, tags | Primary catalog entity |
| `public.course_modules` | Curriculum module hierarchy | `course_id -> courses.id` |
| `public.course_topics` | Specific syllabus topics | `module_id -> course_modules.id`, `course_id -> courses.id` |
| `public.student_topic_progress` | Topic completion timestamps per student | `student_id -> profiles.id`, `topic_id -> course_topics.id` |
| `public.classes` | Academic batches with capacity limits | `course_id -> courses.id`, `teacher_id -> profiles.id` |
| `public.class_schedules` | Weekly recurring timetable rules | `course_id -> courses.id` |
| `public.calendar_events` | Specific calendar instances / exams / holidays | `course_id -> courses.id`, `schedule_id -> class_schedules.id` |
| `public.enrollments` | Enrolled students per class batch | `student_id -> profiles.id`, `class_id -> classes.id` |
| `public.enrollment_applications` | Online student admission submissions | `course_id -> courses.id`, `student_id -> auth.users.id` |
| `public.student_fees` | Student fee packages & payment plans | `student_id -> profiles.id`, `course_id -> courses.id` |
| `public.fee_payments` | Student installment payment receipts | `student_fee_id -> student_fees.id`, `student_id -> profiles.id` |
| `public.institution_transactions` | Balance sheet ledger (income, expense, asset, liability) | `student_id -> profiles.id`, `related_payment_id -> fee_payments.id` |
| `public.tests` | MCQ online test definitions | `course_id -> courses.id`, `created_by -> auth.users.id` |
| `public.questions` | Questions linked to tests | `test_id -> tests.id` |
| `public.options` | MCQ options with `is_correct` flag | `question_id -> questions.id` |
| `public.test_results` | Test attempt submissions & scores | `test_id -> tests.id`, `user_id -> auth.users.id` |
| `public.scholarship_settings` | Singleton scholarship CMS configuration | Public / Admin settings |
| `public.scholarship_winners` | Merit examination district rankers | Annual rank records |
| `public.scholarship_exam_images` | Examination center photo galleries | Annual event records |
| `public.gallery_categories` | Media categories with layout styles | Category definitions |
| `public.gallery_images` | Cloudinary images with hotspot tags | `categories -> UUID[]` |
| `public.notifications` | Circulars and notice board items | General announcements |

---

## 5. Services & External Integrations

| Service / Lib File | Integrations | Operations |
| :--- | :--- | :--- |
| `src/services/courseService.ts` | Supabase `courses`, `course_modules`, `course_topics` | Fetch courses, detail lookup, syllabus hierarchy mapping |
| `src/services/enrollmentService.ts` | Supabase + SMTP Relay | Submit admission, approve applicant, provision account, dispatch email |
| `src/services/feesService.ts` | Supabase `student_fees`, `fee_payments` | Assign fee structures, record installment payments, calculate balance |
| `src/services/financeService.ts` | Supabase `institution_transactions` | Ledger transactions, stats summary, bulk CSV import |
| `src/services/scholarshipService.ts`| Supabase + Cloudinary + LocalStorage | Real-time settings, winner rankings, exam gallery sync |
| `src/services/emailService.ts` | Netlify Serverless Function | POST to `/.netlify/functions/send-email` |
| `src/lib/cloudinary.ts` | Cloudinary REST API | Unsigned direct image upload |
| `email-server.js` | Express + Nodemailer + Supabase Auth | Local development SMTP and account creation relay |
| `netlify/functions/send-email.ts`| Netlify Serverless + Nodemailer | Production SMTP email transport |

---

## 6. Current Technical Debt & Modernization Targets

1. **Icon Library Migration**:
   - Current: `lucide-react` is used across ~45 components.
   - Requirement: Completely migrate to `@tabler/icons-react` and remove `lucide-react` dependency cleanly.
2. **Global Theme System**:
   - Current: Default dark background `#242424` with partial light/dark styling.
   - Requirement: Full Light, Dark, System Theme Provider with persistence, contrast verification, and zero flash on load.
3. **Container Isolation & Error Boundaries**:
   - Current: Single root `ErrorBoundary` and single top-level `ToastContainer`.
   - Requirement: Feature-level container isolation, route-level and widget-level error boundaries with exact error codes, retry mechanisms, and structured logging.
4. **Direct Student Registration & Account Provisioning**:
   - Current: Applications approved via `enrollmentService` and `email-server.js`.
   - Requirement: Unified direct admin student registration form (personal, guardian, academic, address, login, fee setup) with immediate account generation, enrollment, fee plan creation, and temporary credentials without requiring email verification.
5. **Super Admin & Granular RBAC Permissions**:
   - Current: 3 basic roles (`admin`, `teacher`, `student`).
   - Requirement: `super_admin` role, permission matrix UI, server-side and database-level permission enforcement, and structured audit logging.
6. **External ICST Ecosystem Registry**:
   - Requirement: Central registry of ICST satellite websites (including Job Portal Simulator), Super Admin site management, and student ecosystem navigation.
7. **PWA & Web Worker Game Performance**:
   - Current: Main-thread calculation in `useTypingEngine.ts`.
   - Requirement: Web Worker offloading for performance-intensive calculations, PWA service worker with offline application shell caching.
8. **No Native Alerts Rule**:
   - Audit and ensure zero instances of `window.alert`, `confirm`, or `prompt` exist in the application.

---

*Audit completed and recorded in accordance with Master Engineering Instructions.*
