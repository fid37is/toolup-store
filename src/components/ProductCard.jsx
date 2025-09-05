import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Eye, Share2, ShoppingCart, Star, Zap, TrendingUp } from 'lucide-react';
import { notifyEvent } from './Notification';
import { formatNairaPrice } from '../utils/currency-formatter';
import useAuthCheck from '../hooks/useAuthCheck';

const ProductCard = ({ product, onViewImage, onShare, isSponsored = false }) => {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { isAuthenticated, loading } = useAuthCheck();

    const promptAuthentication = (action) => {
        notifyEvent(`Please login or register to ${action}`, 'info');
    };

    const isOutOfStock = Number(product.quantity) === 0;
    const isLowStock = Number(product.quantity) > 0 && Number(product.quantity) <= 5;
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercentage = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

    const handleAddToWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            promptAuthentication('add to wishlist');
            return;
        }

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

        if (!isAuthenticated) {
            promptAuthentication('add to cart');
            return;
        }

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

    const handleShare = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onShare) {
            onShare(product, e);
        }
    };

    const handleImageView = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onViewImage(product.imageUrl || '/placeholder-product.jpg', product.name);
    };

    return (
        <div className="group relative h-full">
            {/* Sponsored Badge */}
            {isSponsored && (
                <div className="absolute top-2 left-2 z-20 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    <Zap className="inline w-3 h-3 mr-1" />
                    Sponsored
                </div>
            )}

            <Link href={`/product/${product.id}`} className="block h-full">
                <div 
                    className="h-full bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Image Container */}
                    <div className="relative h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                        {/* Discount Badge */}
                        {hasDiscount && (
                            <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                -{discountPercentage}%
                            </div>
                        )}

                        {/* Stock Status Badge */}
                        {isLowStock && !isOutOfStock && (
                            <div className="absolute top-3 left-3 z-10 bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                                <TrendingUp className="inline w-3 h-3 mr-1" />
                                {product.quantity} left
                            </div>
                        )}

                        {/* Product Image */}
                        <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-500">
                            <Image
                                src={product.imageUrl || '/placeholder-product.jpg'}
                                alt={product.name}
                                className={`object-contain transition-all duration-300 ${
                                    imageLoaded ? 'opacity-100' : 'opacity-0'
                                } ${isHovered ? 'brightness-110' : ''}`}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                quality={85}
                                loading="lazy"
                                placeholder="blur"
                                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4="
                                onLoad={() => setImageLoaded(true)}
                            />
                            
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        {/* Action Buttons Overlay */}
                        <div className={`absolute inset-0 flex items-center justify-center gap-2 transition-all duration-300 ${
                            isHovered ? 'opacity-100 bg-black/20' : 'opacity-0'
                        }`}>
                            <button
                                onClick={handleImageView}
                                className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                                title="Quick view"
                                aria-label="View image"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                            
                            <button
                                onClick={handleShare}
                                className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                                title="Share product"
                                aria-label="Share product"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                        {/* Category & Rating */}
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {product.category || 'Uncategorized'}
                            </span>
                            <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-gray-600">4.5</span>
                            </div>
                        </div>

                        {/* Product Name */}
                        <h2 className="font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base leading-snug group-hover:text-blue-600 transition-colors">
                            {product.name}
                        </h2>

                        {/* Price Section */}
                        <div className="space-y-2">
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg sm:text-xl font-bold text-gray-900">
                                    {formatNairaPrice(product.price)}
                                </span>
                                {hasDiscount && (
                                    <span className="text-sm text-gray-500 line-through">
                                        {formatNairaPrice(product.originalPrice)}
                                    </span>
                                )}
                            </div>
                            
                            {/* Stock Status */}
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                    isOutOfStock ? 'bg-red-400' : 'bg-green-400'
                                }`} />
                                <span className={`text-xs font-medium ${
                                    isOutOfStock ? 'text-red-600' : 'text-green-600'
                                }`}>
                                    {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={handleAddToWishlist}
                                disabled={isAddingToWishlist || loading}
                                className="flex-shrink-0 p-2.5 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors group/wishlist disabled:opacity-50"
                                title={isAuthenticated ? "Add to wishlist" : "Login to add to wishlist"}
                                aria-label={isAuthenticated ? "Add to wishlist" : "Login to add to wishlist"}
                            >
                                <Heart className={`w-4 h-4 transition-colors ${
                                    isAddingToWishlist 
                                        ? 'text-red-500 animate-pulse' 
                                        : 'text-gray-500 group-hover/wishlist:text-red-500'
                                }`} />
                            </button>

                            <button
                                onClick={handleAddToCart}
                                disabled={isOutOfStock || isAddingToCart || loading}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                                    isOutOfStock
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-primary-700 text-white hover:bg-primary-500 active:scale-98 shadow-sm hover:shadow-md'
                                }`}
                                aria-label={isAuthenticated ? "Add to cart" : "Login to add to cart"}
                            >
                                {isAddingToCart ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <ShoppingCart className="w-4 h-4" />
                                )}
                                <span className="hidden md:inline">
                                    {isOutOfStock ? 'Sold Out' : (!isAuthenticated && !loading ? 'Login' : 'Add to Cart')}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;