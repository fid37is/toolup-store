/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/payment-pending.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const PaymentPendingPage = () => {
    const router = useRouter();
    const { reference } = router.query;
    const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds
    const [paymentStatus, setPaymentStatus] = useState('pending');
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);

    // Format time left as hours, minutes, seconds
    const formatTimeLeft = () => {
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Check payment status at regular intervals
    useEffect(() => {
        if (!reference) return;
        
        // Initial check
        checkPaymentStatus();
        
        // Set up interval to check payment status every 30 seconds
        const intervalId = setInterval(checkPaymentStatus, 30000);
        
        // Set up countdown timer
        const countdownId = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(countdownId);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        // Cleanup
        return () => {
            clearInterval(intervalId);
            clearInterval(countdownId);
        };
    }, [checkPaymentStatus, reference]);

    // Redirect if payment is confirmed or expired
    useEffect(() => {
        if (paymentStatus === 'confirmed') {
            router.push('/order-confirmation');
        } else if (timeLeft === 0) {
            router.push('/payment-expired');
        }
    }, [paymentStatus, timeLeft, router]);

    // Function to check payment status
    const checkPaymentStatus = useCallback(async () => {
        if (!reference || isCheckingStatus) return;
        
        setIsCheckingStatus(true);
        
        try {
            // In a real app, this would be an API call to your backend
            // to check if the payment has been received
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // For demo purposes, let's say there's a 5% chance the payment is confirmed
            // In a real app, you'd check against your backend
            if (Math.random() < 0.05) {
                setPaymentStatus('confirmed');
            }
            
        } catch (error) {
            console.error('Error checking payment status:', error);
        } finally {
            setIsCheckingStatus(false);
        }
    });

    // Handle manual refresh button click
    const handleRefresh = () => {
        checkPaymentStatus();
    };

    return (
        <>
            <Head>
                <title>Payment Pending</title>
                <meta name="description" content="Your payment is being processed" />
            </Head>
            
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Waiting for Payment</h1>
                        <p className="text-gray-600">
                            We&apos;re waiting to confirm your bank transfer payment.
                        </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Reference:</span>
                            <span className="font-medium">{reference || 'Loading...'}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Status:</span>
                            <span className="font-medium capitalize">{paymentStatus}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Time Remaining:</span>
                            <span className="font-medium">{formatTimeLeft()}</span>
                        </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h2 className="font-medium text-blue-800 mb-2">Payment Instructions</h2>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                            <li>Transfer the exact amount to the bank account provided</li>
                            <li>Include your reference number: <span className="font-medium">{reference}</span></li>
                            <li>Complete the payment within the time remaining</li>
                            <li>The system will automatically detect your payment</li>
                        </ol>
                    </div>
                    
                    <div className="flex flex-col space-y-3">
                        <button
                            onClick={handleRefresh}
                            disabled={isCheckingStatus}
                            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md disabled:bg-blue-400"
                        >
                            {isCheckingStatus ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Refreshing...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Check Payment Status
                                </>
                            )}
                        </button>
                        
                        <button
                            onClick={() => router.push('/checkout')}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-md"
                        >
                            Return to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaymentPendingPage;