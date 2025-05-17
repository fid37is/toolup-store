// src/components/LoadingScreen.jsx
import { motion } from 'framer-motion';

export default function LoadingScreen({ message = 'Loading...' }) {
    // Circular loader animation
    const circleVariants = {
        initial: { rotate: 0 },
        animate: {
            rotate: 360,
            transition: {
                duration: 1.5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop"
            }
        }
    };

    // Progress line animation
    const lineVariants = {
        hidden: { scaleX: 0, originX: 0 },
        visible: {
            scaleX: 1,
            transition: {
                duration: 1.8,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 0.2
            }
        }
    };

    // Animated bar variants
    const barVariants = {
        initial: { scaleY: 0.2, opacity: 0.6 },
        animate: index => ({
            scaleY: [0.2, 1, 0.2],
            opacity: [0.6, 1, 0.6],
            transition: {
                duration: 1.2,
                repeat: Infinity,
                delay: index * 0.1,
                ease: "easeInOut"
            }
        })
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="flex flex-col items-center space-y-12">

                {/* Animated Bars */}
                <div className="flex items-end space-x-2">
                    {[0, 1, 2, 3, 4].map((bar, index) => (
                        <motion.div
                            key={bar}
                            custom={index}
                            variants={barVariants}
                            initial="initial"
                            animate="animate"
                            className="w-1.5 h-12 bg-primary-400 rounded-full"
                            style={{ transformOrigin: 'bottom' }}
                        />
                    ))}
                </div>

                {/* Optional message */}
                <p className="text-sm text-gray-500">{message}</p>
            </div>
        </div>
    );
}