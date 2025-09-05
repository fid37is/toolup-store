import { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';

// Banner Ad Component - Top/Bottom placement
export const BannerAd = ({ adSlot, position = 'top', onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  useEffect(() => {
    if (isVisible && typeof window !== 'undefined' && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className={`w-full bg-gradient-to-r ${
        position === 'top'
          ? 'from-blue-50 to-indigo-50 border-b border-blue-100'
          : 'from-gray-50 to-slate-50 border-t border-gray-100'
      } py-3 px-4 relative overflow-hidden`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
            data-ad-slot={adSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          title="Close ad"
          aria-label="Close advertisement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-50" />
    </div>
  );
};

// Sidebar Ad Component - Appears between products
export const SidebarAd = ({ adSlot, size = 'medium' }) => {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, []);

  const sizeClasses = {
    small: 'h-32',
    medium: 'h-48',
    large: 'h-64',
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all duration-300 ${sizeClasses[size]}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-full">
        <div className="absolute top-2 left-2 z-10 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
          Sponsored
        </div>
        <div className="relative h-full flex flex-col justify-center p-4 text-center">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
            data-ad-slot={adSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>
      </div>
    </div>
  );
};

// Native Ad Component - Looks like a product card
export const NativeAd = ({ adSlot }) => {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, []);

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300 h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-2 right-2 z-10 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium border border-yellow-200">
        Sponsored
      </div>
      <div className="p-4">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </div>
    </div>
  );
};

// Floating Ad Component - Appears after scroll
export const FloatingAd = ({ adSlot, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      if (scrollPosition > windowHeight * 2) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isVisible && !isMinimized && typeof window !== 'undefined' && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [isVisible, isMinimized]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isMinimized ? 'w-16 h-16' : 'w-80'}`}
    >
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        {isMinimized ? (
          <div
            className="w-full h-full flex items-center justify-center bg-primary-700 cursor-pointer"
            onClick={() => setIsMinimized(false)}
          >
            <span className="text-white text-xs">Ad</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-600">Sponsored</span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  title="Minimize"
                  aria-label="Minimize ad"
                >
                  <div className="w-3 h-3 border border-current rounded-sm" />
                </button>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  title="Close"
                  aria-label="Close ad"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
                data-ad-slot={adSlot}
                data-ad-format="auto"
                data-full-width-responsive="true"
              ></ins>
            </div>
          </>
        )}
      </div>
    </div>
  );
};