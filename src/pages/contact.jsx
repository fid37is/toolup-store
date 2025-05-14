// src/pages/contact.jsx

import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Contact() {
    return (
        <div className="flex min-h-screen flex-col">
            <Head>
                <title>Contact Us | ToolUp Store</title>
                <meta name="description" content="Get in touch with ToolUp Store" />
            </Head>

            <Header />

            <main className="flex-grow bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-10">Contact Us</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Store Address */}
                        <div className="bg-white shadow-lg rounded-lg p-6 md:col-span-1">
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">Stop By Our Store</h2>
                            <div className="text-sm text-gray-600">
                                <span className='text-lg font-medium'>ToolUp Store</span><br/>
                                <span>123 Industrial Avenue</span><br/>
                                <span>Asaba, Delta State</span><br/>
                                <span>Nigeria</span><br/>
                                <span>Phone: +234 808 595 2266</span>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white shadow-lg rounded-lg p-8 space-y-6 md:col-span-2">
                            <form className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-accent-500 focus:border-accent-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-accent-500 focus:border-accent-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows="5"
                                        required
                                        className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-accent-500 focus:border-accent-500"
                                    ></textarea>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-700"
                                    >
                                        Send Message
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="mt-12 text-center text-sm text-gray-500">
                        <p>
                            Or reach out directly via WhatsApp:{' '}
                            <a
                                href="https://wa.me/2348085952266"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-700 font-medium"
                            >
                                +234 808 595 2266
                            </a>
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
