import { Target, Laptop, Award, MapPin, Mail, Users } from 'lucide-react'

const AboutUs = () => {
    return (
        <div className="pt-24 pb-16 min-h-screen bg-slate-50">
            {/* Header Section */}
            <div className="container mx-auto px-4 md:px-6 mb-16">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">About ICST Chowberia</h1>
                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                        Empowering students with cutting-edge technical education and fostering a community of learners dedicated to excellence.
                    </p>
                </div>
            </div>

            {/* Mission & Vision Section */}
            <div className="container mx-auto px-4 md:px-6 mb-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                                <Target size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
                            <p className="text-slate-600 mb-6 leading-relaxed">
                                To provide accessible, high-quality computer education to students in Chowberia and surrounding areas. We aim to bridge the digital divide by equipping our students with practical skills that are relevant in today's technology-driven world.
                            </p>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h2>
                            <p className="text-slate-600 leading-relaxed">
                                To be a premier institute for technical studies, known for innovation, student success, and contribution to the digital empowerment of the community.
                            </p>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 grid grid-cols-2 gap-4">
                        <div className="space-y-4 translate-y-8">
                            <div className="bg-slate-200 h-48 rounded-2xl w-full object-cover"></div>
                            <div className="bg-slate-300 h-32 rounded-2xl w-full object-cover"></div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-slate-300 h-32 rounded-2xl w-full object-cover"></div>
                            <div className="bg-slate-200 h-48 rounded-2xl w-full object-cover"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why Choose Us */}
            <div className="bg-white py-20 mb-20">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose ICST?</h2>
                        <p className="text-slate-600">
                            We offer a comprehensive learning environment designed to help you succeed.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                Icon: Laptop,
                                title: 'Modern Labs',
                                description: 'State-of-the-art computer labs with the latest software and hardware.'
                            },
                            {
                                Icon: Users, // was bi-person-badge
                                title: 'Expert Faculty',
                                description: 'Learn from experienced instructors who are passionate about teaching.'
                            },
                            {
                                Icon: Award,
                                title: 'Certified Courses',
                                description: 'Industry-recognized certifications to boost your career prospects.'
                            }
                        ].map((feature, index) => (
                            <div key={index} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white mb-6">
                                    <feature.Icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div className="container mx-auto px-4 md:px-6">
                <div className="bg-slate-900 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold mb-6">Start Your Journey With Us</h2>
                        <p className="text-slate-300 mb-8 text-lg">
                            Ready to learn? Join ICST Chowberia today and take the first step towards a bright future.
                        </p>
                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                            <div className="flex items-center justify-center gap-2 text-slate-300">
                                <MapPin size={18} />
                                <span>Chowberia, West Bengal</span>
                            </div>
                            <div className="hidden md:block text-slate-600">•</div>
                            <div className="flex items-center justify-center gap-2 text-slate-300">
                                <Mail size={18} />
                                <span>contact@icstchowberia.com</span>
                            </div>
                        </div>
                    </div>

                    {/* Decorative circles */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 opacity-50"></div>
                </div>
            </div>
        </div>
    )
}

export default AboutUs
