import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';

const WishlistPage = () => {
    const [wishlistItems, setWishlistItems] = useState([
        {
            id: 1,
            name: "DeWalt Power Drill Kit",
            price: 129.99,
            originalPrice: 149.99,
            image: "/api/placeholder/200/200",
            inStock: true
        },
        {
            id: 2,
            name: "Stanley Tool Set (145 Pieces)",
            price: 89.99,
            originalPrice: 99.99,
            image: "/api/placeholder/200/200",
            inStock: true
        },
        {
            id: 3,
            name: "Milwaukee Circular Saw",
            price: 159.99,
            originalPrice: 159.99,
            image: "/api/placeholder/200/200",
            inStock: false
        },
        {
            id: 4,
            name: "Bosch Impact Driver",
            price: 79.99,
            originalPrice: 89.99,
            image: "/api/placeholder/200/200",
            inStock: true
        }
    ]);

    const removeFromWishlist = (itemId) => {
        setWishlistItems(wishlistItems.filter(item => item.id !== itemId));
    };

    const addToCart = (item) => {
        // In a real app, this would dispatch an action to add to cart
        // For now, we'll just show an alert
        alert(`Added ${item.name} to cart!`);

        // Optionally, you could remove the item from wishlist after adding to cart
        // removeFromWishlist(item.id);
    };

    const clearWishlist = () => {
        if (confirm("Are you sure you want to clear your wishlist?")) {
            setWishlistItems([]);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
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
                    <Link href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {wishlistItems.map((item) => (
                            <li key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-center">
                                <div className="flex-shrink-0 w-24 h-24 mb-4 sm:mb-0 sm:mr-6">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        width={96}
                                        height={96}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="flex-grow">
                                    <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>

                                    <div className="flex items-center mt-1">
                                        <span className="font-medium text-gray-800">₦{item.price.toFixed(2)}</span>
                                        {item.originalPrice > item.price && (
                                            <span className="ml-2 text-sm text-gray-500 line-through">₦{item.originalPrice.toFixed(2)}</span>
                                        )}
                                    </div>

                                    <div className="mt-2">
                                        {item.inStock ? (
                                            <span className="text-sm text-green-600">In Stock</span>
                                        ) : (
                                            <span className="text-sm text-red-600">Out of Stock</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center mt-4 sm:mt-0 sm:ml-4 space-y-2 sm:space-y-0 sm:space-x-2">
                                    <button
                                        onClick={() => removeFromWishlist(item.id)}
                                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                                        aria-label="Remove from wishlist"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Remove
                                    </button>

                                    <button
                                        onClick={() => addToCart(item)}
                                        disabled={!item.inStock}
                                        className={`w-full sm:w-auto px-4 py-2 rounded-md flex items-center justify-center ${item.inStock
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default WishlistPage;