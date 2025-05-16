// src/pages/wishlist.jsx
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { notifyEvent } from '../../components/Notification';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const WishlistPage = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    
    // Format price in Nigerian Naira
    const formatNairaPrice = (price) => {
        const exchangeRate = 1500; // Adjust if needed
        const nairaPrice = parseFloat(price) * exchangeRate;
        return new Intl.NumberFormat('en-NG', { 
            style: 'currency', 
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(nairaPrice);
    };

    // Load wishlist items from localStorage
    useEffect(() => {
        try {
            const storedWishlist = localStorage.getItem('wishlist');
            if (storedWishlist) {
                const items = JSON.parse(storedWishlist);
                setWishlistItems(items);
            }
        } catch (error) {
            console.error('Error loading wishlist:', error);
            notifyEvent('Failed to load wishlist', 'error');
        }
    }, []);

    const removeFromWishlist = (productId) => {
        try {
            const storedWishlist = localStorage.getItem('wishlist');
            if (storedWishlist) {
                const items = JSON.parse(storedWishlist);
                const updatedItems = items.filter(item => item.productId !== productId);
                localStorage.setItem('wishlist', JSON.stringify(updatedItems));
                setWishlistItems(updatedItems);
                notifyEvent('Item removed from wishlist', 'success');
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            notifyEvent('Failed to remove item', 'error');
        }
    };

    const addToCart = (item) => {
        try {
            let cartItems = [];
            const storedCart = localStorage.getItem('cart');
            if (storedCart) {
                cartItems = JSON.parse(storedCart);
            }
            const existingItemIndex = cartItems.findIndex(cartItem => cartItem.productId === item.productId);

            if (existingItemIndex >= 0) {
                notifyEvent(`${item.name} is already in your cart.`, 'info');
                return;
            } else {
                cartItems.push({
                    ...item,
                    quantity: 1
                });
                localStorage.setItem('cart', JSON.stringify(cartItems));
                notifyEvent(`${item.name} added to cart!`, 'success');
                window.dispatchEvent(new CustomEvent('cartUpdated'));

                // Optionally remove from wishlist when added to cart
                // removeFromWishlist(item.productId);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            notifyEvent('Failed to add item to cart', 'error');
        }
    };

    const clearWishlist = () => {
        try {
            if (confirm("Are you sure you want to clear your wishlist?")) {
                localStorage.setItem('wishlist', JSON.stringify([]));
                setWishlistItems([]);
                notifyEvent('Wishlist cleared successfully', 'success');
            }
        } catch (error) {
            console.error('Error clearing wishlist:', error);
            notifyEvent('Failed to clear wishlist', 'error');
        }
    };

    return (
        <>
            <Header />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => window.history.back()}
                        className="sticky top-4 z-10 mb-4 inline-flex items-center text-primary-500 hover:text-primary-700 font-medium"
                    >
                        <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">My Wishlist</h1>

                    {wishlistItems.length > 0 && (
                        <button
                            onClick={clearWishlist}
                            className="text-red-600 hover:text-red-800 flex items-center"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Clear All
                        </button>
                    )}
                </div>

                {wishlistItems.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Heart className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Your wishlist is empty</h3>
                        <p className="text-gray-500 mb-6">Items you add to your wishlist will appear here</p>
                        <Link href="/" className="inline-block px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-700">
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                            {wishlistItems.map((item) => (
                                <li key={item.productId} className="p-4 sm:p-6 flex flex-col sm:flex-row items-center">
                                    <div className="flex-shrink-0 w-24 h-24 mb-4 sm:mb-0 sm:mr-6">
                                        <Image
                                            src={item.imageUrl || '/placeholder-product.jpg'}
                                            alt={item.name}
                                            width={96}
                                            height={96}
                                            className="w-full h-full object-cover"
                                            unoptimized={true}
                                        />
                                    </div>

                                    <div className="flex-grow">
                                        <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>

                                        <div className="flex items-center mt-1">
                                            <span className="font-medium text-gray-800">{formatNairaPrice(item.price)}</span>
                                        </div>

                                        <div className="mt-2">
                                            <span className="text-sm text-gray-600">
                                                Added on {new Date(item.addedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center mt-4 sm:mt-0 sm:ml-4 space-y-2 sm:space-y-0 sm:space-x-2">
                                        <button
                                            onClick={() => removeFromWishlist(item.productId)}
                                            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                                            aria-label="Remove from wishlist"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Remove
                                        </button>

                                        <button
                                            onClick={() => addToCart(item)}
                                            className="w-full sm:w-auto px-4 py-2 rounded flex items-center justify-center bg-primary-500 text-white hover:bg-primary-700"
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            Add to Cart
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default WishlistPage;
