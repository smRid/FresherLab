import { useNavigate } from "react-router"
import { AiToolsData } from "../assets/assets"
import { useUser, useClerk } from "@clerk/clerk-react"

const AiTools = () => {

    const navigate = useNavigate()
    const { user } = useUser()
    const { openSignIn } = useClerk()

    const handleToolClick = (toolPath) => {
        if (user) {
            navigate(toolPath)
        } else {
            openSignIn()
        }
    }

    return (
        <div id='tools' className='py-24 bg-[#0D0B1E]'>
            <div className='px-4 sm:px-20 xl:px-32'>
                {/* Section Header */}
                <div className='text-center mb-16'>
                    <span className='inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-medium mb-4'>
                        AI-Powered Career Tools
                    </span>
                    <h2 className='text-4xl md:text-5xl font-bold text-white mb-4'>
                        Everything Freshers Need to Get Job-Ready
                    </h2>
                    <p className='text-gray-400 max-w-xl mx-auto text-lg'>
                        Resume review, ATS optimization, cover letters, job emails, learning plans, and more — all powered by AI.
                    </p>
                </div>

                {/* Tools Grid */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                    {AiToolsData.map((tool, index) => (
                        <div
                            key={index}
                            className='group p-6 rounded-2xl bg-[#1A1730] border border-purple-900/30 hover:border-purple-500/50 transition-all duration-300 cursor-pointer hover:-translate-y-1'
                            onClick={() => handleToolClick(tool.path)}
                        >
                            {/* Icon */}
                            <div
                                className='w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-lg'
                                style={{ background: `linear-gradient(135deg, ${tool.bg.from}, ${tool.bg.to})` }}
                            >
                                <tool.Icon className='w-7 h-7 text-white' />
                            </div>

                            {/* Title */}
                            <h3 className='text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors'>
                                {tool.title}
                            </h3>

                            {/* Description */}
                            <p className='text-gray-400 text-sm leading-relaxed'>
                                {tool.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AiTools
