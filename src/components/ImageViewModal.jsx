// src/components/ImageViewModal.jsx - New component for viewing product images
import { useEffect } from 'react';
import Image from 'next/image';

export default function ImageViewModal({ isOpen, imageUrl, productName, onClose }) {
    // Close modal when pressing ESC key
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    // If modal is not open, don't render anything
    if (!isOpen) return null;

    // Handle click outside the image to close the modal
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
            onClick={handleBackdropClick}
        >
            <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg bg-white">
                {/* Close button */}
                <button 
                    onClick={onClose}
                    className="absolute top-2 right-2 z-10 rounded-full bg-white p-2 text-gray-500 shadow-md hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Close image view"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                {/* Image container */}
                <div className="relative h-[70vh] w-[80vw] max-w-4xl bg-white">
                    <Image
                        src={imageUrl}
                        alt={productName || "Product image"}
                        className="object-contain"
                        fill
                        sizes="(max-width: 768px) 100vw, 80vw"
                        priority
                        unoptimized={true}
                    />
                </div>
                
                {/* Caption */}
                {productName && (
                    <div className="bg-white p-4 text-center">
                        <h3 className="text-lg font-medium text-gray-900">{productName}</h3>
                    </div>
                )}
            </div>
        </div>
    );
}