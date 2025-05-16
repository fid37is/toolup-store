import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notifyEvent } from './Notification';
import { formatNairaPrice } from '../utils/currency-formatter';

const ProductCard = ({ product, onViewImage }) => {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

    const handleAddToWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsAddingToWishlist(true);

        try {
            let wishlistItems = [];
            const storedWishlist = localStorage.getItem('wishlist');
            if (storedWishlist) wishlistItems = JSON.parse(storedWishlist);

            const exists = wishlistItems.find(item => item.productId === product.id);
            if (exists) {
                notifyEvent('This product is already in your wishlist!', 'info');
                return;
            }

            wishlistItems.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                addedAt: new Date().toISOString()
            });

            localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
            notifyEvent('Product added to wishlist!', 'success');
        } catch (error) {
            console.error('Wishlist error:', error);
            notifyEvent('Failed to add to wishlist.', 'error');
        } finally {
            setIsAddingToWishlist(false);
        }
    };

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsAddingToCart(true);

        try {
            let cartItems = [];
            const storedCart = localStorage.getItem('cart');
            if (storedCart) cartItems = JSON.parse(storedCart);

            const existingIndex = cartItems.findIndex(item => item.productId === product.id);
            if (existingIndex >= 0) {
                cartItems[existingIndex].quantity += 1;
            } else {
                cartItems.push({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    quantity: 1
                });
            }

            localStorage.setItem('cart', JSON.stringify(cartItems));
            notifyEvent('Product added to cart!', 'success');
            window.dispatchEvent(new CustomEvent('cartUpdated'));
        } catch (error) {
            console.error('Cart error:', error);
            notifyEvent('Failed to add to cart.', 'error');
        } finally {
            setIsAddingToCart(false);
        }
    };

    return (
        <div className="h-full">
            <Link href={`/product/${product.id}`} className="block h-full">
                <div className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow transition-shadow hover:shadow-md">
                    <div className="relative h-48 w-full bg-gray-100">
                        <Image
                            src={product.imageUrl || '/placeholder-product.jpg'}
                            alt={product.name}
                            className="object-contain"
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            unoptimized={true}
                        />
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onViewImage(product.imageUrl || '/placeholder-product.jpg', product.name);
                            }}
                            className="absolute top-2 right-2 rounded-full bg-white bg-opacity-60 p-1.5 hover:bg-opacity-90"
                            aria-label="View image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-4">
                        <h2 className="mb-1 line-clamp-2 text-sm font-medium text-gray-900 md:text-base">{product.name}</h2>
                        <p className="mb-2 text-xs text-gray-500 md:text-sm">
                            {product.category || 'Uncategorized'}
                        </p>

                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-base font-bold md:text-lg">{formatNairaPrice(product.price)}</span>
                                {Number(product.quantity) === 0 ? (
                                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">Out of Stock</span>
                                ) : (
                                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">In Stock</span>
                                )}
                            </div>

                            <div className="flex justify-between pt-2">
                                <button
                                    onClick={handleAddToWishlist}
                                    disabled={isAddingToWishlist}
                                    className={`flex flex-1 items-center justify-center rounded-l bg-gray-50 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 md:text-sm
                                        ${isAddingToWishlist ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    aria-label="Add to wishlist"
                                >
                                    {isAddingToWishlist ? (
                                        <svg className="h-4 w-4 md:mr-1 animate-spin text-red-500" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="md:mr-1 h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    )}
                                    <span className="hidden md:inline">Wishlist</span>
                                </button>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAddingToCart || Number(product.quantity) === 0}
                                    className={`flex flex-1 items-center justify-center rounded-r py-1.5 text-xs font-medium text-white transition md:text-sm
                                        ${Number(product.quantity) === 0
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-primary-700 hover:bg-primary-500'} 
                                        ${isAddingToCart ? 'opacity-50 cursor-wait' : ''}`}
                                    aria-label="Add to cart"
                                >
                                    {isAddingToCart ? (
                                        <svg className="h-4 w-4 md:mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="md:mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    )}
                                    <span className="hidden md:inline">Add to Cart</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;