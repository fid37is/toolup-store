import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { FaWhatsapp } from 'react-icons/fa';
import UserAvatarDropdown from './UserAvatarDropdown';
import { useRouter } from 'next/router';
import useAuthCheck from '../hooks/useAuthCheck';
import { notifyEvent } from './Notification';

const Header = () => {
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cartItemCount, setCartItemCount] = useState(0);
    const { isAuthenticated, loading } = useAuthCheck();

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    useEffect(() => {
        const fetchCartItemCount = () => {
            if (typeof window === 'undefined' || !isAuthenticated) {
                setCartItemCount(0);
                return;
            }

            try {
                const cartData = localStorage.getItem('cart');
                const cart = cartData ? JSON.parse(cartData) : [];
                const count = cart.reduce((sum, item) => sum + item.quantity, 0);
                setCartItemCount(count);
            } catch (err) {
                console.error('Error parsing cart from localStorage:', err);
                setCartItemCount(0);
            }
        };

        fetchCartItemCount();

        window.addEventListener('cartUpdated', fetchCartItemCount);
        return () => window.removeEventListener('cartUpdated', fetchCartItemCount);
    }, [isAuthenticated]);

    // Handle cart click with proper authentication check
    const handleCartClick = () => {
        if (isAuthenticated) {
            router.push('/cart');
        } else {
            notifyEvent('Please login to view your cart', 'info');
            // No redirect, just notify the user
        }
    };

    return (
        <header className="sticky top-0 z-10 bg-white shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <div className="flex items-center space-x-2">
                            <Image
                                src="/logo-2.png"
                                alt="ToolUp Store Logo"
                                width={33}
                                height={33}
                                priority
                                className="rounded h-auto w-auto" // ✅ maintain aspect ratio
                            />
                            {/* Mobile: smaller text, Desktop: full size */}
                            <span className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-700">
                                <span className="block sm:hidden">ToolUp</span>
                                <span className="hidden sm:block">ToolUp Store</span>
                            </span>
                        </div>
                    </Link>

                    <nav className="hidden md:block">
                        <ul className="flex space-x-8 items-center">
                            <li>
                                <a
                                    href="https://wa.me/+2348085952266"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-green-600 hover:text-green-700 transition-colors"
                                >
                                    <FaWhatsapp className="text-green-600 mr-1" size={20} />
                                    Support: +234 (808) 595-0080
                                </a>
                            </li>
                            <li>
                                <Link href="/" className="text-gray-700 hover:text-primary-700 transition-colors">Home</Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-700 hover:text-primary-700 transition-colors">Contact</Link>
                            </li>
                            <li>
                                <UserAvatarDropdown />
                            </li>
                        </ul>
                    </nav>

                    <div className="flex items-center">
                        <button
                            className="relative p-2 mr-2 text-gray-700 hover:text-primary-700 transition-colors"
                            onClick={handleCartClick}
                            aria-label={isAuthenticated ? "View cart" : "Login to view cart"}
                            disabled={loading}
                        >
                            <ShoppingCart />
                            {isAuthenticated && cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-700 text-xs text-white">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>

                        <button
                            className="md:hidden p-2"
                            onClick={toggleMobileMenu}
                            aria-label="Toggle menu"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <nav className="md:hidden border-t border-gray-200 py-4">
                        <ul className="space-y-4">
                            <li>
                                <a
                                    href="https://wa.me/+2348085952266"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-green-600 hover:text-green-700 transition-colors"
                                >
                                    <FaWhatsapp className="text-green-600 mr-1" size={20} />
                                    Support: +234 (808) 595-0080
                                </a>
                            </li>
                            <li>
                                <Link href="/" className="block px-4 py-2 text-gray-700 hover:text-primary-700 transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                            </li>
                            <li>
                                <Link href="/contact" className="block px-4 py-2 text-gray-700 hover:text-primary-700 transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                            </li>
                            <li className="px-4 py-2">
                                <UserAvatarDropdown />
                            </li>
                        </ul>
                    </nav>
                )}
            </div>
        </header>
    );
};

export default Header;