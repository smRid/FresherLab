import { Star, Quote } from 'lucide-react';

const Testimonial = () => {
    const cardsData = [
        {
            image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200',
            name: 'Briar Martin',
            role: 'CS Fresher',
            rating: 5,
            text: 'FresherLab helped me revamp my resume, identify ATS gaps, and land my first interview in two weeks!'
        },
        {
            image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
            name: 'Avery Johnson',
            role: 'IT Graduate',
            rating: 5,
            text: 'The cover letter generator and JD analyzer saved me hours. My applications are now much stronger.'
        },
        {
            image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60',
            name: 'Jordan Lee',
            role: 'Self-taught Developer',
            rating: 5,
            text: 'The learning plan and code snippet tools gave me a structured path from zero to job-ready.'
        },
        {
            image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=60',
            name: 'Taylor Swift',
            role: 'MERN Stack Fresher',
            rating: 5,
            text: 'Best career tool I\'ve used. The README generator made my GitHub projects look truly professional.'
        },
    ];

    return (
        <div className='py-24 bg-[#0D0B1E]'>
            {/* Background decoration */}
            <div className='absolute left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none'></div>

            <div className='relative z-10 px-4 sm:px-20 xl:px-32'>
                {/* Section Header */}
                <div className='text-center mb-16'>
                    <span className='inline-block px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-sm font-medium mb-4'>
                        Testimonials
                    </span>
                    <h2 className='text-4xl md:text-5xl font-bold text-white mb-4'>
                        Loved by Freshers
                    </h2>
                    <p className='text-gray-400 max-w-xl mx-auto text-lg'>
                        See what freshers are saying about their FresherLab experience
                    </p>
                </div>

                {/* Testimonial Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto'>
                    {cardsData.map((card, index) => (
                        <div
                            key={index}
                            className='relative p-6 rounded-2xl bg-[#1A1730] border border-purple-900/30 hover:border-purple-500/30 transition-all duration-300'
                        >
                            {/* Quote icon */}
                            <Quote className='absolute top-6 right-6 w-8 h-8 text-purple-500/20' />

                            {/* Stars */}
                            <div className='flex gap-1 mb-4'>
                                {[...Array(card.rating)].map((_, i) => (
                                    <Star key={i} className='w-5 h-5 fill-yellow-400 text-yellow-400' />
                                ))}
                            </div>

                            {/* Text */}
                            <p className='text-gray-300 text-lg mb-6 leading-relaxed'>
                                "{card.text}"
                            </p>

                            {/* Author */}
                            <div className='flex items-center gap-4'>
                                <img
                                    className='w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/30'
                                    src={card.image}
                                    alt={card.name}
                                />
                                <div>
                                    <p className='font-semibold text-white'>{card.name}</p>
                                    <p className='text-sm text-gray-400'>{card.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Testimonial;
