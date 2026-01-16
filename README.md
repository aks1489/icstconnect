# ICST Connect

ICST Connect is a comprehensive Learning Management System (LMS) and portal for ICST (Institute of Computer Science & Technology). It serves as a central hub for students, teachers, and administrators to manage courses, track progress, conduct online tests, and more.

## 🚀 Features

### 🎓 Student Portal
- **Dashboard:** Overview of enrolled courses and progress.
- **My Courses:** detailed view of course content, syllabus, and progress tracking.
- **Online Tests:** Take exams and quizzes with real-time timers and instant results.
- **Profile Management:** Update personal details.
- **Offline Classes:** View schedules and status of offline classes.

### 👨‍🏫 Teacher Portal
- **Dashboard:** Overview of active classes and students.
- **Class Management:** Manage batches, syllabus completion, and mark topics as cleared.
- **Student Progress:** detailed tracker for individual student progress in specific courses.
- **Enrollment:** Enroll students into courses and batches.

### 🛡️ Admin Portal
- **Dashboard:** System-wide statistics.
- **User Management:** Manage students and teachers.
- **Course Management:** Create and edit courses, modules, and topics.
- **Test Management:** Create and manage online tests and questions.
- **Discount Claims:** Manage discount inquiries.

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React, Bootstrap Icons (mapped)
- **Backend/Database:** Supabase (PostgreSQL, Auth, Realtime)
- **State Management:** React Context API
- **Routing:** React Router DOM

## ⚙️ Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/icst-connect.git
    cd icst-connect
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Build for production:**
    ```bash
    npm run build
    ```

## 📂 Project Structure

- `src/admin` - Admin portal pages and components.
- `src/student` - Student portal pages and components.
- `src/teacher` - Teacher portal pages and components.
- `src/components` - Shared UI components (layout, sections, ui).
- `src/contexts` - React contexts (AuthContext, etc.).
- `src/services` - API service layers (courseService, etc.).
- `src/lib` - Supabase client configuration.
- `src/types` - TypeScript interfaces and types.

## 🤝 Contribution

Contributions are welcome! Please ensure you follow the project rules defined in `PROJECT_RULES.md`.

## 📄 License

This project is proprietary software of ICST.
