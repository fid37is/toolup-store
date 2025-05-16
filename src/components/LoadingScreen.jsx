// src/components/LoadingScreen.jsx
import { motion } from 'framer-motion';
import { Headphones } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

export default function LoadingScreen({ message = 'Loading...' }) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <div className="container mx-auto flex flex-grow items-center justify-center py-16">
                <div className="text-center">
                    <motion.div
                        animate={{ y: [-10, 10, -10], rotate: [0, 15, -15, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="mx-auto mb-4 w-16 h-16 text-accent-600"
                    >
                        <Headphones className="w-full h-full" />
                    </motion.div>
                    <p className="text-gray-600">{message}</p>
                </div>
            </div>
            <Footer />
        </div>
    );
}
