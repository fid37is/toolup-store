import { motion } from 'framer-motion';
import Image from 'next/image';
import logo from '/public/favy.png'; // Make sure this is placed in the /public folder

export default function LoadingScreen({ message = 'Loading...' }) {
    // Create subtle ripple rings with varying sizes and delays
    const rippleSpecs = [
        { color: '#ffbb33', size: 90, delay: 0 },
        { color: '#003380', size: 110, delay: 0.7 },
        { color: '#ffbb33', size: 130, delay: 1.4 },
    ];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="relative w-[150px] h-[150px] flex items-center justify-center mb-6">
                {rippleSpecs.map(({ color, size, delay }, index) => (
                    <motion.div
                        key={index}
                        className="absolute rounded-full"
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            background: `radial-gradient(circle, transparent 60%, ${color}40 70%, ${color}20 80%, transparent 90%)`,
                            zIndex: 1,
                        }}
                        initial={{
                            scale: 0,
                            opacity: 0,
                        }}
                        animate={{
                            scale: [0, 1.2, 1.5],
                            opacity: [0, 0.8, 0],
                        }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: 'easeOut',
                            delay: delay,
                        }}
                    />
                ))}

                {/* Center logo with subtle pulse */}
                <motion.div 
                    className="relative z-50 bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
                    animate={{
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    <Image
                        src={logo}
                        alt="ToolUp Logo"
                        width={80}
                        height={80}
                        className="object-contain"
                    />
                </motion.div>
            </div>

            {/* Message below */}
            <motion.p 
                className="text-sm text-gray-500"
                animate={{
                    opacity: [0.5, 1, 0.5],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            >
                {message}
            </motion.p>
        </div>
    );
}