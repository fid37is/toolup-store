
import { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';

// Banner Ad Component - Top/Bottom placement
export const BannerAd = ({ position = 'top', onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  // Get the correct ad slot based on position
  const getAdSlot = () => {
    return position === 'top' ? '9492804374' : '9172421936';
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
            data-ad-client="ca-pub-3908400190376942"
            data-ad-slot={getAdSlot()}
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
export const SidebarAd = ({ size = 'medium' }) => {
  const [setIsHovered] = useState(false);

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
            data-ad-client="ca-pub-3908400190376942"
            data-ad-slot="4159768405"
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        </div>
      </div>
    </div>
  );
};

// Native Ad Component - Looks like a product card
export const NativeAd = () => {
  const [ setIsHovered] = useState(false);

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
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300 h-full relative"
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
          data-ad-client="ca-pub-3908400190376942"
          data-ad-slot="1781017078"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </div>
    </div>
  );
};

// Floating Ad Component - Uses sidebar ad slot, appears after scroll
export const FloatingAd = ({ onClose }) => {
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
            className="w-full h-full flex items-center justify-center bg-blue-600 cursor-pointer"
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
                data-ad-client="ca-pub-3908400190376942"
                data-ad-slot="4159768405"
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

// Demo Component to show all ad types
const AdComponentsDemo = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Banner Ad */}
      <BannerAd position="top" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">ToolUp Ad Components Demo</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Sample Content</h2>
              <p className="text-gray-600 mb-4">
                This is sample content to demonstrate how the ad components integrate with your site.
              </p>
              
              {/* Native Ad integrated with content */}
              <div className="my-6">
                <NativeAd />
              </div>
              
              <p className="text-gray-600">
                More content continues here. The native ad blends seamlessly with your content.
              </p>
            </div>
          </div>
          
          {/* Sidebar with Ads */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Sidebar Content</h3>
              <p className="text-gray-600 text-sm">Regular sidebar content goes here.</p>
            </div>
            
            {/* Sidebar Ad */}
            <SidebarAd size="medium" />
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">More Sidebar</h3>
              <p className="text-gray-600 text-sm">Additional sidebar content.</p>
            </div>
          </div>
        </div>
        
        {/* Add some height to trigger floating ad */}
        <div className="mt-16 space-y-8">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Content Section {i + 1}</h3>
              <p className="text-gray-600">
                Scroll down to see the floating ad appear. This simulates a long page with lots of content.
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom Banner Ad */}
      <BannerAd position="bottom" />
      
      {/* Floating Ad */}
      <FloatingAd />
    </div>
  );
};

//