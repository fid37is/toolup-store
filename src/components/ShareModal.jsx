// components/ShareModal.jsx
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * ShareModal Component
 * 
 * Displays a compact dropdown-style modal for sharing a product
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to call when closing the modal
 * @param {string} productName - Name of the product being shared
 * @param {string} shareUrl - URL to share
 * @param {string} imageUrl - Product image URL
 * @param {function} onCopyLink - Function to handle copying the link
 * @param {object} buttonPosition - Position of the share button {top, left, height, width}
 */
export default function ShareModal({
    isOpen,
    onClose,
    productName,
    shareUrl,
    imageUrl,
    onCopyLink,
    buttonPosition
}) {
    const modalRef = useRef(null);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        // Handle ESC key to close
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

    // Function to handle social media sharing
    const handleSocialShare = (platform) => {
        let shareLink = '';
        const encodedUrl = encodeURIComponent(shareUrl);
        const encodedTitle = encodeURIComponent(`Check out ${productName} on ToolUp Store!`);

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
            case 'email':
                shareLink = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
                break;
            default:
                return;
        }

        window.open(shareLink, '_blank', 'width=600,height=400');
    };

    // Only render if open and on client-side
    if (!isOpen || typeof window === 'undefined') {
        return null;
    }

    // Calculate position based on button location
    const getModalPosition = () => {
        if (!buttonPosition) {
            // Default position if buttonPosition is not provided
            return { top: '80px', right: '16px' };
        }
        
        // Calculate position below the button
        return {
            top: `${buttonPosition.top + buttonPosition.height + 8}px`,
            left: `${buttonPosition.left - 220 + buttonPosition.width}px`
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
                className="w-64 rounded-lg bg-white shadow-lg animate-dropdown"
                style={{
                    animationDuration: '0.2s',
                    transformOrigin: 'top right',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Modal header */}
                <div className="border-b border-gray-100 px-4 py-3">
                    <h2 id="modal-title" className="text-sm font-medium text-gray-700">Share</h2>
                </div>

                {/* Share options */}
                <div className="grid grid-cols-4 gap-2 p-4">
                    {/* Facebook */}
                    <button
                        onClick={() => handleSocialShare('facebook')}
                        className="flex flex-col items-center justify-center rounded-lg p-2 hover:bg-gray-50"
                        aria-label="Share on Facebook"
                    >
                        <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                            </svg>
                        </div>
                        <span className="text-xs">FB</span>
                    </button>

                    {/* Twitter */}
                    <button
                        onClick={() => handleSocialShare('twitter')}
                        className="flex flex-col items-center justify-center rounded-lg p-2 hover:bg-gray-50"
                        aria-label="Share on Twitter"
                    >
                        <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                            </svg>
                        </div>
                        <span className="text-xs">X</span>
                    </button>

                    {/* WhatsApp */}
                    <button
                        onClick={() => handleSocialShare('whatsapp')}
                        className="flex flex-col items-center justify-center rounded-lg p-2 hover:bg-gray-50"
                        aria-label="Share on WhatsApp"
                    >
                        <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.2.56-1.24 1.1-1.7 1.12-.46.03-.47.36-2.96-.73-2.49-1.09-3.99-3.75-4.11-3.92-.12-.17-.96-1.38-.92-2.61.05-1.22.69-1.8.95-2.04.24-.26.51-.29.68-.26h.6c.22.02.32.11.43.38.1.26.43 1.18.47 1.27.04.09.07.2.02.31-.05.11-.11.19-.2.29-.09.1-.16.18-.27.29-.11.1-.228.21-.07.421.14.21.62.89 1.32 1.44 1.004.78 1.804 1.03 2.1 1.14.32.11.43.095.58-.09.15-.18.63-.73.8-.981.17-.25.3-.21.5-.13l1.39.65z M12.007 2.002a9.998 9.998 0 0 0-8.512 15.327l-1.242 4.532c-.1.422.318.826.734.698l4.498-1.512a9.998 9.998 0 1 0 4.522-19.055z" />
                            </svg>
                        </div>
                        <span className="text-xs">WA</span>
                    </button>

                    {/* Email */}
                    <button
                        onClick={() => handleSocialShare('email')}
                        className="flex flex-col items-center justify-center rounded-lg p-2 hover:bg-gray-50"
                        aria-label="Share via Email"
                    >
                        <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                        </div>
                        <span className="text-xs">Email</span>
                    </button>
                </div>

                {/* Copy link section */}
                <div className="border-t border-gray-100 p-4">
                    <div className="flex rounded-md border border-gray-200 overflow-hidden">
                        <input
                            type="text"
                            readOnly
                            value={shareUrl}
                            className="w-full bg-transparent text-xs text-gray-500 px-2 py-1 focus:outline-none truncate"
                            aria-label="Share URL"
                        />
                        <button
                            onClick={onCopyLink}
                            className="flex-shrink-0 bg-primary-500 px-3 py-1 text-xs font-medium text-white hover:bg-primary-600 focus:outline-none"
                        >
                            Copy
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}