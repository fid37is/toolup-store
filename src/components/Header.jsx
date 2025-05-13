// src/components/Header.jsx - Fixed with proper cart count handling
import { useState, useEffect } from 'react';
import Link from 'next/link';
import CartModal from './CartModal';
import { ShoppingCart } from 'lucide-react';

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [cartItemCount, setCartItemCount] = useState(0);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const toggleCart = () => {
        setCartOpen(!cartOpen);
    };

    useEffect(() => {
        const fetchCartItemCount = () => {
            if (typeof window === 'undefined') return;

            try {
                const cartData = localStorage.getItem('cart');
                const cart = cartData ? JSON.parse(cartData) : [];
                const count = cart.reduce((sum, item) => sum + item.quantity, 0);
                setCartItemCount(count);
            } catch (err) {
                console.error('Error parsing cart from localStorage:', err);
            }
        };

        fetchCartItemCount();

        window.addEventListener('cartUpdated', fetchCartItemCount);
        return () => window.removeEventListener('cartUpdated', fetchCartItemCount);
    }, []);

    const fetchCartItemCount = async () => {
        try {
            // Try to get count from API first
            try {
                const response = await fetch('/api/cart/count');
                if (response.ok) {
                    const data = await response.json();
                    setCartItemCount(data.count);
                    return;
                }
            } catch (err) {
                console.log('API count fetch failed, falling back to localStorage');
            }

            // Fall back to localStorage if API fails
            let count = 0;
            try {
                const cartData = localStorage.getItem('cart');
                if (cartData) {
                    const cart = JSON.parse(cartData);
                    count = cart.reduce((sum, item) => sum + item.quantity, 0);
                }
            } catch (err) {
                console.error('Error calculating cart count:', err);
            }

            setCartItemCount(count);
        } catch (error) {
            console.error('Failed to fetch cart count:', error);
            setCartItemCount(0); // Set to 0 as fallback
        }
    };

    return (
        <>
            <header className="sticky top-0 z-10 bg-white shadow-md">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center">
                            <span className="text-xl font-bold text-blue-600">ToolUp Store</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:block">
                            <ul className="flex space-x-8">
                                <li>
                                    <Link
                                        href="/"
                                        className="text-gray-700 hover:text-blue-600"
                                    >
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href="https://wa.me/+15551234567"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-green-600 hover:text-green-700"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        Support: +1 (555) 123-4567
                                    </a>
                                </li>
                                <li>
                                    <Link
                                        href="/contact"
                                        className="text-gray-700 hover:text-blue-600"
                                    >
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </nav>

                        {/* Cart Icon & Mobile Menu Button */}
                        <div className="flex items-center">

                            {/* Cart Button */}
                            <button
                                className="relative p-2 mr-2 text-gray-700 hover:text-blue-600"
                                onClick={toggleCart}
                                aria-label="Open cart"
                            >
                                <ShoppingCart />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                                        {cartItemCount}
                                    </span>
                                )}
                            </button>

                            {/* Mobile Menu Button */}
                            <button
                                className="md:hidden p-2"
                                onClick={toggleMobileMenu}
                                aria-label="Toggle menu"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    className="h-6 w-6"
                                >
                                    {mobileMenuOpen ? (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    ) : (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <nav className="md:hidden border-t border-gray-200 py-4">
                            <ul className="space-y-4">
                                <li>
                                    <Link
                                        href="/"
                                        className="block px-4 py-2 text-gray-700 hover:text-blue-600"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href="https://wa.me/+15551234567"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center px-4 py-2 text-green-600 hover:text-green-700"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        Support: +1 (555) 123-4567
                                    </a>
                                </li>
                                <li>
                                    <Link
                                        href="/contact"
                                        className="block px-4 py-2 text-gray-700 hover:text-blue-600"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    )}
                </div>
            </header>

            {/* Cart Modal */}
            <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </>
    );
};

export default Header;