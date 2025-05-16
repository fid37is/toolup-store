// src/components/checkout/EmptyCart.jsx
import { useRouter } from 'next/router';
import Header from '../Header';
import Footer from '../Footer';

export default function EmptyCart() {
    const router = useRouter();
    
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <div className="container mx-auto my-16 px-4 flex-grow">
                <div className="rounded-lg bg-gray-50 p-6 text-center">
                    <h1 className="mb-4 text-2xl font-bold text-gray-700">Your Cart is Empty</h1>
                    <p className="mb-6 text-gray-600">
                        You don&apos;t have any items in your cart to checkout.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="rounded-lg bg-primary-700 px-6 py-2 text-white hover:bg-primary-500"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
}