
import { ArrowRight } from 'lucide-react'

const CoursesSection = () => {
    const courses = [
        {
            title: 'Web Development',
            image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1744&q=80',
            description: 'Master HTML, CSS, JavaScript, React, and Node.js to build modern web applications.',
            duration: '6 Months',
            level: 'Beginner to Advanced',
            color: 'blue'
        },
        {
            title: 'Data Science',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
            description: 'Learn Python, Data Analysis, Machine Learning, and AI concepts.',
            duration: '8 Months',
            level: 'Intermediate',
            color: 'purple'
        },
        {
            title: 'Digital Marketing',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1630&q=80',
            description: 'Become an expert in SEO, SEM, Social Media Marketing, and Content Strategy.',
            duration: '4 Months',
            level: 'Beginner',
            color: 'orange'
        },
        {
            title: 'Graphic Design',
            image: 'https://images.unsplash.com/photo-1626785774573-4b7993125651?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
            description: 'Unleash your creativity with Photoshop, Illustrator, and InDesign.',
            duration: '3 Months',
            level: 'Beginner',
            color: 'pink'
        }
    ]

    return (
        <section className="py-20 bg-slate-50" id="courses">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <div className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                        Our Courses
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Explore Our Popular Courses</h2>
                    <p className="text-slate-500 max-w-2xl mx-auto">
                        Choose from a variety of career-oriented courses designed to help you master in-demand skills.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {courses.map((course, index) => (
                        <div key={index} className="group h-full">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-full hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col">
                                <div className="relative overflow-hidden h-48">
                                    <img
                                        src={course.image}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        alt={course.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                        {course.duration}
                                    </span>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h5 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-blue-600 transition-colors">{course.title}</h5>
                                    <p className="text-sm text-slate-500 mb-6 flex-grow leading-relaxed">{course.description}</p>

                                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-auto">
                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-semibold uppercase tracking-wide">
                                            {course.level}
                                        </span>
                                        <a href="#" className="text-blue-600 font-bold text-sm hover:text-blue-700 flex items-center gap-1 group/link no-underline">
                                            Details
                                            <ArrowRight size={16} className="transform group-hover/link:translate-x-1 transition-transform" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <button className="px-8 py-3 rounded-full border-2 border-slate-900 text-slate-900 font-semibold hover:bg-slate-900 hover:text-white transition-all duration-300">
                        View All Courses
                    </button>
                </div>
            </div>
        </section>
    )
}

export default CoursesSection
