// src/pages/payment-expired.jsx
import { useRouter } from 'next/router';
import Head from 'next/head';

const PaymentExpiredPage = () => {
    const router = useRouter();

    return (
        <>
            <Head>
                <title>Payment Expired</title>
                <meta name="description" content="Your payment session has expired" />
            </Head>
            
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    
                    <h1 className="text-2xl font-bold mb-4">Payment Session Expired</h1>
                    
                    <p className="text-gray-600 mb-6">
                        Your payment session has expired. Please return to checkout and try again.
                    </p>
                    
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/checkout')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md"
                        >
                            Return to Checkout
                        </button>
                        
                        <button
                            onClick={() => router.push('/')}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-md"
                        >
                            Go to Homepage
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaymentExpiredPage;