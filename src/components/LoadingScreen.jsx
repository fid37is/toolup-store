import { motion } from 'framer-motion';
import Image from 'next/image';
import logo from '/public/favy.png'; // Make sure this is placed in the /public folder

export default function LoadingScreen({ message = 'Loading...' }) {
    const ringSpecs = [
        { color: '#ffbb33', size: 80 }, // Accent (inner)
        { color: '#003380', size: 70 }, // Primary (outer)
    ];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="relative w-[100px] h-[100px] flex items-center justify-center mb-6">
                {ringSpecs.map(({ color, size }, index) => (
                    <motion.div
                        key={index}
                        className="absolute rounded-full"
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            border: `14px solid ${color}`,
                            background: 'transparent',
                            zIndex: 1,
                        }}
                        animate={{
                            scale: [1, 1.12, 1],
                            opacity: [1, 0.8, 1],
                        }}
                        transition={{
                            duration: 1.4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: index * 0.2,
                        }}
                    />
                ))}

                {/* Center logo */}
                <div className="relative z-50 bg-white rounded-full w-16 h-16 flex items-center justify-center shadow">
                    <Image
                        src={logo}
                        alt="ToolUp Logo"
                        width={80}
                        height={80}
                        className="object-contain"
                    />
                </div>
            </div>

            {/* Message below */}
            <p className="text-sm text-gray-500">{message}</p>
        </div>
    );
}