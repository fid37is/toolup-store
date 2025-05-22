import { useState, useEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LoadingScreen from '../../components/LoadingScreen';
import SocialHead from '../../components/SocialHead';
import { formatNairaPrice } from '../../utils/currency-formatter';
import { generateProductSocialData } from '../../utils/socialUtils';
import { toast } from 'sonner';
import { Share } from 'lucide-react';

// Lazy load non-critical components
const AuthFlowModal = lazy(() => import('../../components/AuthFlowModal'));
const ShareModal = lazy(() => import('../../components/ShareModal'));

export default function ProductDetail() {
    const router = useRouter();
    const { id } = router.query;

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [generatedDescription, setGeneratedDescription] = useState('');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [socialData, setSocialData] = useState(null);

    const quantityNum = Number(product?.quantity || 0);
    const isOutOfStock = quantityNum === 0;
    const isLowStock = quantityNum > 0 && quantityNum <= 4;

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = () => {
            const authStatus = localStorage.getItem('isAuthenticated') === 'true';
            setIsAuthenticated(authStatus);
        };
        checkAuth();
    }, []);

    // Generate social data when product is loaded
    useEffect(() => {
        if (product && router.asPath) {
            const data = generateProductSocialData(product, router);
            setSocialData(data);
        }
    }, [product, router.asPath]);

    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                const controller = new AbortController();
                const signal = controller.signal;

                const response = await fetch(`/api/products/${id}`, { signal });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const data = await response.json();
                setProduct(data);
                generateProductDescription(data);

                return () => {
                    controller.abort();
                };
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error(`Failed to fetch product ${id}:`, err);
                    setError(err);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // Function to generate AI-like description
    const generateProductDescription = (productData) => {
        if (!productData) return;

        const { name, category, price } = productData;

        const descriptionTemplates = [
            `The ${name} is a premium quality ${category || 'tool'} designed for both professionals and enthusiasts. Featuring exceptional durability and performance, this ${price > 100 ? 'high-end' : 'affordable'} product will exceed your expectations while maintaining excellent value for money.`,

            `Discover the versatility of our ${name}, a standout ${category || 'product'} that combines innovative design with practical functionality. Whether you're a seasoned professional or just starting out, this ${price > 100 ? 'investment-grade' : 'budget-friendly'} tool delivers reliable performance for all your projects.`,

            `Meet the ${name} - the perfect addition to any ${category || 'toolbox'}. With its ergonomic design and precision engineering, this ${price > 100 ? 'professional-grade' : 'cost-effective'} solution offers unmatched performance and durability that will serve you for years to come.`,
        ];

        const randomIndex = Math.floor(Math.random() * descriptionTemplates.length);
        setGeneratedDescription(descriptionTemplates[randomIndex]);
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value > 0) {
            setQuantity(value);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to add items to your cart');
            return;
        }

        if (!product || !id) {
            console.error("Product or product ID is missing");
            return;
        }

        try {
            let cartItems = [];
            try {
                const storedCart = localStorage.getItem('cart');
                if (storedCart) {
                    cartItems = JSON.parse(storedCart);
                }
            } catch (err) {
                console.error('Error parsing stored cart:', err);
            }

            const existingItemIndex = cartItems.findIndex(item => item.productId === id);

            if (existingItemIndex >= 0) {
                cartItems[existingItemIndex].quantity += quantity;
            } else {
                cartItems.push({
                    productId: id,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    quantity: quantity
                });
            }

            localStorage.setItem('cart', JSON.stringify(cartItems));

            try {
                const response = await fetch('/api/cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        productId: id,
                        quantity: quantity
                    }),
                });
            } catch (err) {
                // API call failed, but cart was saved to localStorage
            }

            toast.success(`${product.name} added to cart`);
            window.dispatchEvent(new CustomEvent('cartUpdated'));
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add item to cart. Please try again.');
        }
    };

    const handleBuyNow = () => {
        if (!product || !id) {
            console.error("Product or product ID is missing");
            return;
        }

        if (isAuthenticated) {
            directCheckout();
        } else {
            setIsAuthModalOpen(true);
        }
    };

    const directCheckout = () => {
        try {
            const checkoutItem = {
                productId: id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity: quantity
            };

            localStorage.setItem('directPurchaseItem', JSON.stringify(checkoutItem));
            router.push('/checkout?mode=direct');
        } catch (error) {
            console.error('Error processing direct purchase:', error);
            toast.error('Failed to proceed to checkout. Please try again.');
        }
    };

    const handleGuestCheckout = () => {
        localStorage.setItem('guestCheckout', 'true');
        setIsAuthModalOpen(false);
        directCheckout();
    };

    const handleLoginRegister = () => {
        setIsAuthModalOpen(false);

        const checkoutItem = {
            productId: id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: quantity
        };

        localStorage.setItem('directPurchaseItem', JSON.stringify(checkoutItem));
        router.push(`/auth?redirect=${encodeURIComponent('/checkout?mode=direct')}`);
    };

    const handleShare = () => {
        setIsShareModalOpen(true);
    };

    const closeShareModal = () => {
        setIsShareModalOpen(false);
    };

    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                toast.success('Link copied to clipboard!');
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
                toast.error('Failed to copy link');
            });
    };

    if (isLoading) {
        return <LoadingScreen message="Loading product details..." />;
    }

    if (error || !product) {
        return (
            <div className="flex min-h-screen flex-col">
                <SocialHead
                    title="Product Not Found | ToolUp Store"
                    description="Sorry, we couldn't find the product you're looking for."
                    imageUrl="/og-image-store.jpg"
                    url={`/product/${id}`}
                />
                <Header />
                <div className="container mx-auto my-16 px-4 flex-grow">
                    <div className="rounded-lg bg-red-50 p-6 text-center">
                        <h1 className="mb-4 text-2xl font-bold text-red-700">Product Not Found</h1>
                        <p className="mb-6 text-gray-700">
                            Sorry, we couldn't find the product you're looking for.
                            {error && <span className="block mt-2 text-sm text-red-600">Error: {error.message}</span>}
                        </p>
                        <Link
                            href="/"
                            className="rounded-lg bg-primary-500 px-6 py-2 text-white hover:bg-primary-700"
                        >
                            Return to Home
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            {/* Enhanced Social Head with all meta tags */}
            {socialData && (
                <SocialHead
                    title={socialData.title}
                    description={generatedDescription || socialData.description}
                    imageUrl={socialData.imageUrl}
                    url={socialData.url}
                    type={socialData.type}
                    price={socialData.price}
                    availability={socialData.availability}
                />
            )}

            <Header />

            <main className="container mx-auto flex-grow px-4 py-8">
                <div className="mb-6 flex justify-between">
                    <Link
                        href="/"
                        className="inline-flex items-center text-primary-500 hover:underline"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Products
                    </Link>

                    <button
                        onClick={handleShare}
                        className="inline-flex items-center text-primary-500 hover:underline"
                        aria-label="Share this product"
                    >
                        <Share className="w-4 h-4 mr-2" />
                        Share
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {/* Product Image */}
                    <div className="relative min-h-[300px] overflow-hidden rounded-lg bg-gray-100 md:min-h-[500px]">
                        <Image
                            src={product.imageUrl || '/placeholder-product.jpg'}
                            alt={product.name}
                            className="object-contain"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                            loading="eager"
                            quality={80}
                        />
                    </div>

                    {/* Product Info */}
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-gray-900">{product.name}</h1>

                        {product.category && (
                            <p className="mb-4 text-sm text-gray-500">
                                Category: <span className="font-medium">{product.category}</span>
                            </p>
                        )}

                        <div className="mb-6 mt-4">
                            <p className="text-3xl font-bold text-gray-900">{formatNairaPrice(product.price)}</p>

                            <div className="mt-4">
                                {isOutOfStock ? (
                                    <span className="inline-block rounded-full bg-red-100 px-4 py-1 text-sm font-medium text-red-800">
                                        Out of Stock
                                    </span>
                                ) : isLowStock ? (
                                    <span className="inline-block rounded-full bg-amber-100 px-4 py-1 text-sm font-medium text-amber-800">
                                        Only {product.quantity} left
                                    </span>
                                ) : (
                                    <span className="inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-800">
                                        In Stock
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* AI-Generated Description */}
                        <div className="mb-6">
                            <h2 className="mb-2 text-lg font-medium">Description</h2>
                            <p className="text-gray-700">{generatedDescription || product.description || "Product description unavailable."}</p>
                        </div>

                        {product.specs && (
                            <div className="mb-6">
                                <h2 className="mb-2 text-lg font-medium">Specifications</h2>
                                <p className="text-gray-700">{product.specs}</p>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="mb-6">
                            <label htmlFor="quantity" className="mb-2 block text-sm font-medium text-gray-700">
                                Quantity
                            </label>
                            <div className="flex items-center">
                                <input
                                    type="number"
                                    id="quantity"
                                    name="quantity"
                                    min="1"
                                    max={product.quantity || 1}
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    disabled={isOutOfStock}
                                    className="h-10 w-24 rounded-lg border border-gray-300 bg-white py-2 px-3 text-center text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <button
                                onClick={handleAddToCart}
                                className={`rounded-lg px-6 py-3 font-medium text-white transition-colors ${isOutOfStock || !isAuthenticated
                                        ? 'cursor-not-allowed bg-gray-400'
                                        : 'bg-primary-500 hover:bg-primary-700'
                                    }`}
                                disabled={isOutOfStock || !isAuthenticated}
                                title={!isAuthenticated ? "Login to add items to cart" : ""}
                            >
                                Add to Cart
                            </button>

                            <button
                                onClick={handleBuyNow}
                                className={`rounded-lg px-6 py-3 font-medium text-white transition-colors ${isOutOfStock
                                        ? 'cursor-not-allowed bg-gray-400'
                                        : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                disabled={isOutOfStock}
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            <Suspense fallback={<div>Loading...</div>}>
                {isAuthModalOpen && (
                    <AuthFlowModal
                        isOpen={isAuthModalOpen}
                        onClose={closeAuthModal}
                        onGuestCheckout={handleGuestCheckout}
                        onLoginRegister={handleLoginRegister}
                    />
                )}

                {isShareModalOpen && socialData && (
                    <ShareModal
                        isOpen={isShareModalOpen}
                        onClose={closeShareModal}
                        productName={product.name}
                        shareUrl={socialData.url}
                        imageUrl={product.imageUrl}
                        onCopyLink={() => copyToClipboard(socialData.url)}
                    />
                )}
            </Suspense>

            <Footer />
        </div>
    );
}