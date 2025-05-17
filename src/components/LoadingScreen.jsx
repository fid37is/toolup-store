// src/components/LoadingScreen.jsx
import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen({ message = 'Loading...' }) {
    // Letter animation variants
    const letterVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        }
    };

    // Staggered animation for all letters
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.2,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 1.5
            }
        }
    };

    // Line animation
    const lineVariants = {
        hidden: { scaleX: 0, originX: 0 },
        visible: {
            scaleX: 1,
            transition: {
                duration: 1.2,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 0.8
            }
        }
    };

    // Dot animation
    const dotVariants = {
        initial: { scale: 0.6, opacity: 0.6 },
        animate: {
            scale: [0.6, 1, 0.6],
            opacity: [0.6, 1, 0.6],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="flex flex-col items-center">
                {/* Animated Text */}
                <motion.div
                    className="flex items-center mb-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Animate each letter individually */}
                    {"toolup store".split("").map((letter, index) => (
                        <motion.div
                            key={index}
                            variants={letterVariants}
                            className={`text-4xl font-light ${letter === " " ? "w-4" : ""}`}
                        >
                            {letter === " " ? "\u00A0" : letter}
                        </motion.div>
                    ))}
                </motion.div>

                {/* Progress Line */}
                <div className="w-64 h-px bg-gray-200 relative mb-12">
                    <motion.div
                        className="absolute top-0 left-0 h-full w-full bg-blue-500"
                        variants={lineVariants}
                        initial="hidden"
                        animate="visible"
                    />
                </div>

                {/* Animated Dots */}
                <div className="flex space-x-3">
                    {[0, 1, 2].map((dot, index) => (
                        <motion.div
                            key={dot}
                            variants={dotVariants}
                            initial="initial"
                            animate="animate"
                            className="w-2 h-2 rounded-full bg-blue-600"
                            style={{ animationDelay: `${index * 0.15}s` }}
                        />
                    ))}
                </div>

                {/* Optional message */}
                <p className="mt-6 text-sm text-gray-500">{message}</p>
            </div>
        </div>
    );
}