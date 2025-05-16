// src/components/LoadingScreen.jsx
import Header from './Header';
import Footer from './Footer';

export default function LoadingScreen({ message = 'Loading...' }) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <div className="container mx-auto flex flex-grow items-center justify-center py-16">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-accent-600"></div>
                    <p className="text-gray-600">{message}</p>
                </div>
            </div>
            <Footer />
        </div>
    );
}