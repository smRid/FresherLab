import { useNavigate } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Sparkles } from "lucide-react";

const stats = [
    { label: "Career tools", value: "12+" },
    { label: "Job-ready", value: "AI" },
    { label: "Workspace", value: "One" },
];

const features = [
    "Improve resumes and ATS match",
    "Generate cover letters and job emails",
    "Track applications and learning progress",
];

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className='relative overflow-hidden bg-[#080A12] pt-28 pb-16 sm:pt-32 sm:pb-20'>
            <div className='absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),transparent_35%,rgba(236,72,153,0.12)_70%,rgba(132,204,22,0.12))]' />
            <div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30' />

            <div className='relative z-10 px-4 sm:px-20 xl:px-32'>
                <div className='flex min-h-[78vh] items-center'>
                    <div className='max-w-3xl'>
                        <div className='mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/[0.08] px-4 py-2 text-sm font-medium text-cyan-100 shadow-lg shadow-cyan-950/20 backdrop-blur'>
                            <Sparkles className='h-4 w-4 text-lime-300' />
                            Your AI-powered job preparation workspace for freshers
                        </div>

                        <h1 className='max-w-4xl text-4xl font-bold leading-[1.08] text-white sm:text-5xl lg:text-6xl'>
                            Become Job-Ready Faster with AI
                        </h1>

                        <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
                            <button
                                onClick={() => navigate('/ai')}
                                className='inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#080A12] shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:bg-cyan-50'
                            >
                                Start Free
                                <ArrowRight className='h-4 w-4' />
                            </button>
                            <a
                                href="#tools"
                                className='inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.15] bg-white/[0.08] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-white/[0.12]'
                            >
                                <BriefcaseBusiness className='h-4 w-4' />
                                Open Dashboard
                            </a>
                        </div>

                        <div className='mt-9 flex flex-col gap-3 text-sm text-slate-300 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-3 lg:flex-nowrap'>
                            {features.map((feature) => (
                                <div key={feature} className='flex items-center gap-2'>
                                    <CheckCircle2 className='h-4 w-4 shrink-0 text-lime-300' />
                                    <span className='lg:whitespace-nowrap'>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className='mt-10 grid max-w-xl grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.08] backdrop-blur'>
                            {stats.map((stat) => (
                                <div key={stat.label} className='border-r border-white/10 px-4 py-4 last:border-r-0'>
                                    <p className='text-2xl font-bold text-white'>{stat.value}</p>
                                    <p className='mt-1 text-xs uppercase text-slate-400'>{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero
