import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    User,
    LogOut,
    DollarSign,
    ShoppingBag,
    Heart,
    CreditCard,
    Map,
    Settings,
    HelpCircle
} from 'lucide-react';

const UserAvatarDropdown = () => {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleUserMenu = () => {
        setUserMenuOpen(!userMenuOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        const router = useRouter();
        alert('Logging out...');
        localStorage.clear(); // or your logout logic
        router.push('/');
    };
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleUserMenu}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label="User menu"
            >
                <Image
                    src="/fav 1.png"
                    alt="User"
                    width={32}
                    height={32}
                    className="rounded-full"
                />
            </button>

            {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <Image
                                src="/fav 1.png"
                                alt="User"
                                width={40}
                                height={40}
                                className="rounded-full mr-3"
                            />
                            <div>
                                <p className="font-medium text-gray-800">John Doe</p>
                                <p className="text-xs text-gray-500">john.doe@example.com</p>
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
                </div>
            )}
        </div>
    );
};

export default UserAvatarDropdown;