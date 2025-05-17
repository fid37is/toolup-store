import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import {
    MoreVertical,
    MoreHorizontal,
    User,
    LogOut,
    DollarSign,
    ShoppingBag,
    Heart,
    CreditCard,
    Map,
    Settings,
    HelpCircle,
    LogIn
} from 'lucide-react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
// Import auth directly instead of using getFirebaseAuth helper function

const UserAvatarDropdown = () => {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);
    const router = useRouter();

    // Check auth state when component mounts
    useEffect(() => {
        // Use getAuth() directly from firebase/auth
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const toggleUserMenu = () => {
        setUserMenuOpen(prev => !prev);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            // Use getAuth() directly from firebase/auth
            const auth = getAuth();
            await auth.signOut();
            localStorage.clear();
            setUserMenuOpen(false);
            router.push('/');
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const handleLogin = () => {
        setUserMenuOpen(false);
        router.push('/auth');
    };

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="relative">
                <button className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 transition-colors">
                    <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-blue-500 animate-spin"></div>
                </button>
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleUserMenu}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label="User menu"
            >
                {userMenuOpen ? <MoreHorizontal /> : <MoreVertical />}
            </button>

            {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {currentUser ? (
                        // Authenticated user view
                        <>
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                        {currentUser.photoURL ? (
                                            <Image
                                                src={currentUser.photoURL}
                                                alt="User"
                                                width={40}
                                                height={40}
                                                className="rounded-full"
                                            />
                                        ) : (
                                            <User className="w-5 h-5 text-blue-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            {currentUser.displayName || currentUser.email || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-500">{currentUser.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="py-2">
                                <Link href="/account/profile" className="flex items-center px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
                                    <User className="w-4 h-4 mr-3 text-gray-500" /> My Profile
                                </Link>
                                <Link href="/account/orders" className="flex items-center px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
                                    <ShoppingBag className="w-4 h-4 mr-3 text-gray-500" /> My Orders
                                </Link>
                                <Link href="/account/wishlist" className="flex items-center px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
                                    <Heart className="w-4 h-4 mr-3 text-gray-500" /> Wishlist
                                </Link>
                                <Link href="/account/payment-methods" className="flex items-center px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
                                    <CreditCard className="w-4 h-4 mr-3 text-gray-500" /> Payment Methods
                                </Link>
                                <Link href="/account/addresses" className="flex items-center px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
                                    <Map className="w-4 h-4 mr-3 text-gray-500" /> Shipping Addresses
                                </Link>
                            </div>

                            <div className="border-t border-gray-200 py-2">
                                <div className="flex items-center px-4 py-2 text-sm text-gray-500">
                                    <DollarSign className="w-4 h-4 mr-3 text-gray-500" /> Currency: NGN
                                </div>
                                <Link href="/account/settings" className="flex items-center px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
                                    <Settings className="w-4 h-4 mr-3 text-gray-500" /> Account Settings
                                </Link>
                                <Link href="/help" className="flex items-center px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
                                    <HelpCircle className="w-4 h-4 mr-3 text-gray-500" /> Help & Support
                                </Link>
                            </div>

                            <div className="border-t border-gray-200 py-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left flex items-center px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                                >
                                    <LogOut className="w-4 h-4 mr-3" /> Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        // Non-authenticated user view
                        <>
                            <div className="p-4 border-b border-gray-200">
                                <div className="text-center">
                                    <h3 className="font-medium text-gray-800">Welcome to ToolUp Store</h3>
                                    <p className="text-xs text-gray-500 mt-1">Sign in to access your account</p>
                                </div>
                            </div>

                            <div className="py-2">
                                <button
                                    onClick={handleLogin}
                                    className="w-full text-left flex items-center px-4 py-2 hover:bg-gray-100 text-sm text-blue-600"
                                >
                                    <LogIn className="w-4 h-4 mr-3" /> Log In / Register
                                </button>
                            </div>

                            <div className="border-t border-gray-200 py-2">
                                <Link href="/help" className="flex items-center px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
                                    <HelpCircle className="w-4 h-4 mr-3 text-gray-500" /> Help & Support
                                </Link>
                                <div className="flex items-center px-4 py-2 text-sm text-gray-500">
                                    <DollarSign className="w-4 h-4 mr-3 text-gray-500" /> Currency: NGN
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserAvatarDropdown;