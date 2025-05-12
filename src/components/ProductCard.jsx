// src/components/Header.jsx
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
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
                                <Link
                                    href="/categories"
                                    className="text-gray-700 hover:text-blue-600"
                                >
                                    Categories
                                </Link>
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

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <nav className="md:hidden border-t border-gray-200 py-4">
                        <ul className="space-y-4">
                            <li>
                                <Link
                                    href="/"
                                    className="block py-2 text-gray-700 hover:text-blue-600"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/categories"
                                    className="block py-2 text-gray-700 hover:text-blue-600"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Categories
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="block py-2 text-gray-700 hover:text-blue-600"
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
    );
};

export default Header;