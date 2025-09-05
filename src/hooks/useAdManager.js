import { useState } from 'react';

// Ad Manager Hook - Manages ad display logic
export const useAdManager = () => {
    const [adsEnabled, setAdsEnabled] = useState(true);
    const [closedAds, setClosedAds] = useState(new Set());

    const closeAd = (adId) => {
        setClosedAds(prev => new Set([...prev, adId]));
    };

    const shouldShowAd = (adId) => {
        return adsEnabled && !closedAds.has(adId);
    };

    return {
        adsEnabled,
        setAdsEnabled,
        closeAd,
        shouldShowAd
    };
};