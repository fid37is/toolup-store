// components/ShareModal.jsx
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ShareModal({
    isOpen,
    onClose,
    productName,
    shareUrl,
    imageUrl,
    onCopyLink,
    buttonPosition,
    product
}) {
    const modalRef = useRef(null);
    const [safeShareUrl, setSafeShareUrl] = useState('');
    const [finalImageUrl, setFinalImageUrl] = useState('');
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Use store logo as placeholder for better branding
    const PLACEHOLDER_IMAGE = '/logo-2.png';

    // Simplified image URL logic - just use the first available valid URL
    useEffect(() => {
        if (isOpen) {
            console.log('ShareModal - Product data:', product);
            console.log('ShareModal - Image URL prop:', imageUrl);
            
            // Priority order for image selection
            const imageUrls = [
                product?.imageUrl,
                imageUrl,
                product?.image
            ].filter(url => 
                url && 
                url !== 'undefined' && 
                !url.includes('undefined') && 
                url.trim() !== ''
            );

            console.log('ShareModal - Available image URLs:', imageUrls);

            if (imageUrls.length > 0) {
                let selectedUrl = imageUrls[0];
                
                // Handle Google Drive URLs
                if (selectedUrl.includes('drive.google.com')) {
                    const fileIdMatch = selectedUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
                    if (fileIdMatch) {
                        selectedUrl = `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
                    }
                }
                
                // Ensure proper URL format
                if (!selectedUrl.startsWith('http') && !selectedUrl.startsWith('/')) {
                    selectedUrl = `/${selectedUrl}`;
                }
                
                console.log('ShareModal - Selected image URL:', selectedUrl);
                setFinalImageUrl(selectedUrl);
            } else {
                console.log('ShareModal - No valid image found, using placeholder');
                setFinalImageUrl(PLACEHOLDER_IMAGE);
            }
        }
    }, [product?.imageUrl, product?.image, imageUrl, isOpen]);

    // Generate safe URL with proper fallbacks
    useEffect(() => {
        if (isOpen) {
            let url = shareUrl;

            // If shareUrl is provided and valid, use it
            if (url && url !== 'undefined' && !url.includes('undefined') && url.startsWith('http')) {
                setSafeShareUrl(url);
                return;
            }

            // Generate URL if not provided or invalid
            if (typeof window !== 'undefined') {
                const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

                if (product?.id) {
                    url = `${baseUrl}/products/${product.id}`;
                } else if (product?.slug) {
                    url = `${baseUrl}/products/${product.slug}`;
                } else {
                    // Extract product ID from current URL
                    const currentPath = window.location.pathname;
                    const pathMatch = currentPath.match(/\/products?\/([^\/\?]+)/);
                    if (pathMatch) {
                        url = `${baseUrl}/products/${pathMatch[1]}`;
                    } else {
                        url = window.location.href.split('#')[0].split('?')[0];
                    }
                }
            } else {
                // Server-side fallback
                const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.toolup.store';
                url = product?.id ? `${baseUrl}/products/${product.id}` : baseUrl;
            }

            // Final validation
            if (url && !url.includes('undefined')) {
                setSafeShareUrl(url);
            } else {
                setSafeShareUrl(typeof window !== 'undefined' ? window.location.origin : 'https://www.toolup.store');
            }
        }
    }, [isOpen, shareUrl, product?.id, product?.slug]);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, onClose]);

    // Generate rich sharing text - works for all users
    const generateShareText = (platform) => {
        const baseText = `Check out ${productName || 'this product'} at ToolUp Store!`;
        const priceText = product?.price ? ` Only ₦${product.price.toLocaleString()}` : '';
        const stockText = product?.quantity > 0 ? ' - In Stock!' : ' - Limited Availability!';

        switch (platform) {
            case 'twitter':
                return `🛠️ ${baseText}${priceText}${stockText} #ToolUpStore #Tools #Nigeria`;
            case 'whatsapp':
                return `${baseText}${priceText}${stockText}\n\n🔗 Shop now:`;
            case 'facebook':
                return `${baseText}${priceText}${stockText}`;
            case 'linkedin':
                return `${baseText}${priceText}${stockText} #ToolUpStore #Nigeria`;
            case 'telegram':
                return `🛠️ ${baseText}${priceText}${stockText}`;
            default:
                return baseText;
        }
    };

    // Function to handle social media sharing
    const handleSocialShare = (platform) => {
        if (!safeShareUrl) {
            console.error('No valid share URL available');
            return;
        }

        const shareText = generateShareText(platform);
        let shareLink = '';
        const encodedUrl = encodeURIComponent(safeShareUrl);
        const encodedTitle = encodeURIComponent(shareText);

        switch (platform) {
            case 'facebook':
                shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
            case 'twitter':
                shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
                break;
            case 'whatsapp':
                shareLink = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
                break;
            case 'linkedin':
                shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
                break;
            case 'telegram':
                shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
                break;
            case 'email':
                const emailSubject = encodeURIComponent(`${productName || 'Product'} - ToolUp Store`);
                const emailBody = encodeURIComponent(`${shareText}\n\n${safeShareUrl}\n\nShop more at ToolUp Store!`);
                shareLink = `mailto:?subject=${emailSubject}&body=${emailBody}`;
                break;
            default:
                return;
        }

        if (platform === 'email') {
            window.location.href = shareLink;
        } else {
            window.open(shareLink, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
        }
    };

    // Enhanced native sharing - works for all users
    const handleNativeShare = async () => {
        if (!safeShareUrl) {
            console.error('No valid share URL available');
            return;
        }

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${productName || 'Product'} - ToolUp Store`,
                    text: generateShareText('native'),
                    url: safeShareUrl,
                });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    handleCopyLink();
                }
            }
        } else {
            handleCopyLink();
        }
    };

    // Enhanced copy link function
    const handleCopyLink = async () => {
        if (!safeShareUrl) {
            console.error('No valid share URL available');
            return;
        }

        try {
            await navigator.clipboard.writeText(safeShareUrl);
            if (onCopyLink) {
                onCopyLink();
            }
        } catch (error) {
            const textArea = document.createElement('textarea');
            textArea.value = safeShareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            if (onCopyLink) {
                onCopyLink();
            }
        }
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
        setImageError(false);
    };

    const handleImageError = (e) => {
        console.warn('Image failed to load:', e.target.src);
        setImageError(true);
        setImageLoaded(false);
        
        // Only set to placeholder if not already using it
        if (e.target.src !== PLACEHOLDER_IMAGE && !e.target.src.includes('logo-2.png')) {
            console.log('Switching to placeholder image');
            setFinalImageUrl(PLACEHOLDER_IMAGE);
        }
    };

    // Only render if open and we have a valid URL
    if (!isOpen || typeof window === 'undefined' || !safeShareUrl) {
        return null;
    }

    // Calculate position based on button location
    const getModalPosition = () => {
        if (!buttonPosition) {
            return { top: '80px', right: '16px' };
        }

        return {
            top: `${buttonPosition.top + buttonPosition.height + 8}px`,
            left: `${buttonPosition.left - 280 + buttonPosition.width}px`
        };
    };

    const modalPosition = getModalPosition();

    return createPortal(
        <div
            className="fixed z-50"
            style={{
                top: modalPosition.top,
                left: modalPosition.left,
                right: modalPosition.right
            }}
        >
            <div
                ref={modalRef}
                className="w-80 rounded-lg bg-white shadow-xl border border-gray-200 animate-dropdown"
                style={{
                    animationDuration: '0.2s',
                    transformOrigin: 'top right',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 z-10"
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Modal header with preview */}
                <div className="border-b border-gray-100 p-4">
                    <h2 id="modal-title" className="text-lg font-semibold text-gray-800 mb-2">Share Product</h2>

                    {/* Preview card */}
                    <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 relative">
                                {/* Image container */}
                                <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
                                    {finalImageUrl ? (
                                        <img
                                            src={finalImageUrl}
                                            alt={productName || 'Product'}
                                            className="w-12 h-12 object-cover rounded-md"
                                            onLoad={handleImageLoad}
                                            onError={handleImageError}
                                        />
                                    ) : (
                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {productName || 'Product'}
                                </p>
                                {product?.price && (
                                    <p className="text-sm text-green-600 font-semibold">
                                        ₦{product.price.toLocaleString()}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 truncate">
                                    ToolUp Store
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Share options */}
                <div className="p-4">
                    <div className="grid grid-cols-4 gap-3 mb-4">
                        {/* Facebook */}
                        <button
                            onClick={() => handleSocialShare('facebook')}
                            className="flex flex-col items-center justify-center rounded-lg p-3 hover:bg-gray-50 transition-colors"
                            aria-label="Share on Facebook"
                        >
                            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                                </svg>
                            </div>
                            <span className="text-xs font-medium">Facebook</span>
                        </button>

                        {/* Twitter */}
                        <button
                            onClick={() => handleSocialShare('twitter')}
                            className="flex flex-col items-center justify-center rounded-lg p-3 hover:bg-gray-50 transition-colors"
                            aria-label="Share on Twitter"
                        >
                            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-black">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </div>
                            <span className="text-xs font-medium">Twitter</span>
                        </button>

                        {/* WhatsApp */}
                        <button
                            onClick={() => handleSocialShare('whatsapp')}
                            className="flex flex-col items-center justify-center rounded-lg p-3 hover:bg-gray-50 transition-colors"
                            aria-label="Share on WhatsApp"
                        >
                            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.2.56-1.24 1.1-1.7 1.12-.46.03-.47.36-2.96-.73-2.49-1.09-3.99-3.75-4.11-3.92-.12-.17-.96-1.38-.92-2.61.05-1.22.69-1.8.95-2.04.24-.26.51-.29.68-.26h.6c.22.02.32.11.43.38.1.26.43 1.18.47 1.27.04.09.07.2.02.31-.05.11-.11.19-.2.29-.09.1-.16.18-.27.29-.11.1-.228.21-.07.421.14.21.62.89 1.32 1.44 1.004.78 1.804 1.03 2.1 1.14.32.11.43.095.58-.09.15-.18.63-.73.8-.981.17-.25.3-.21.5-.13l1.39.65z M12.007 2.002a9.998 9.998 0 0 0-8.512 15.327l-1.242 4.532c-.1.422.318.826.734.698l4.498-1.512a9.998 9.998 0 1 0 4.522-19.055z" />
                                </svg>
                            </div>
                            <span className="text-xs font-medium">WhatsApp</span>
                        </button>

                        {/* More Options */}
                        <button
                            onClick={handleNativeShare}
                            className="flex flex-col items-center justify-center rounded-lg p-3 hover:bg-gray-50 transition-colors"
                            aria-label="More sharing options"
                        >
                            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                </svg>
                            </div>
                            <span className="text-xs font-medium">More</span>
                        </button>
                    </div>
                </div>

                {/* Copy link section */}
                <div className="border-t border-gray-100 p-4">
                    <div className="flex rounded border border-gray-200 overflow-hidden bg-gray-50">
                        <input
                            type="text"
                            readOnly
                            value={safeShareUrl}
                            className="flex-1 bg-transparent text-sm text-gray-600 px-3 py-2 focus:outline-none"
                            aria-label="Share URL"
                        />
                        <button
                            onClick={handleCopyLink}
                            className="flex-shrink-0 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none transition-colors"
                        >
                            Copy Link
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}