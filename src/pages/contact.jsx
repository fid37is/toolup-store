// src/pages/contact.jsx

import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Phone, Mail, MapPin, MessageCircle, Clock, FileText, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function Contact() {
    const faqs = [
        {
            question: "What payment methods do you accept?",
            answer: "We accept credit/debit cards, bank transfers, and mobile money payments. All transactions are secure and encrypted."
        },
        {
            question: "Do you offer delivery services?",
            answer: "Yes, we offer nationwide delivery across Nigeria. Delivery fees vary based on location and order size."
        },
        {
            question: "What is your return policy?",
            answer: "We offer a 30-day return policy for unused items in their original packaging. Please contact our support team to initiate a return."
        },
        {
            question: "How can I track my order?",
            answer: "Once your order is shipped, you'll receive a tracking number via email. You can use this number to track your order on our website."
        },
        {
            question: "Do you offer warranties on your products?",
            answer: "Yes, most of our tools come with manufacturer warranties. The warranty period varies by product and is specified on each product page."
        }
    ];

    return (
        <div className="flex min-h-screen flex-col">
            <Head>
                <title>Contact & Support | ToolUp Store</title>
                <meta name="description" content="Get help and support from ToolUp Store" />
            </Head>

            <Header />

            <main className="flex-grow bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-gray-900">Contact & Support</h1>
                        <p className="mt-4 text-xl text-gray-600">We're here to help with any questions or concerns</p>
                    </div>

                    {/* Support Options Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                                <Phone className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Call Us</h3>
                            <p className="text-gray-600 mb-4">Speak directly with our support team</p>
                            <a href="tel:+2348085952266" className="text-blue-600 font-medium hover:text-blue-800">
                                +234 808 595 2266
                            </a>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">WhatsApp</h3>
                            <p className="text-gray-600 mb-4">Chat with us on WhatsApp</p>
                            <a 
                                href="https://wa.me/2348085952266" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-green-600 font-medium hover:text-green-800"
                            >
                                Message Us
                            </a>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-4">
                                <Mail className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Email Us</h3>
                            <p className="text-gray-600 mb-4">Send us an email anytime</p>
                            <a href="mailto:support@toolupstore.com" className="text-purple-600 font-medium hover:text-purple-800">
                                support@toolupstore.com
                            </a>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="mb-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            {faqs.map((faq, index) => (
                                <div key={index} className={`p-6 ${index < faqs.length - 1 ? 'border-b border-gray-200' : ''}`}>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                                    <p className="text-gray-600">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-6">
                            <Link href="/faqs" className="inline-flex items-center text-primary-600 hover:text-primary-800 font-medium">
                                View all FAQs
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {/* Store Info */}
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Visit Our Store</h2>
                            <div className="flex items-start mb-3">
                                <MapPin className="w-5 h-5 text-gray-500 mr-3 mt-1" />
                                <div className="text-gray-600">
                                    <span className="font-medium">ToolUp Store</span><br/>
                                    123 Industrial Avenue<br/>
                                    Asaba, Delta State<br/>
                                    Nigeria
                                </div>
                            </div>
                            <div className="flex items-center mb-3">
                                <Phone className="w-5 h-5 text-gray-500 mr-3" />
                                <span className="text-gray-600">+234 808 595 2266</span>
                            </div>
                            <div className="flex items-center">
                                <Clock className="w-5 h-5 text-gray-500 mr-3" />
                                <div className="text-gray-600">
                                    <div>Mon-Fri: 8:00 AM - 9:00 PM</div>
                                    <div>Sat: 9:00 AM - 9:00 PM</div>
                                    <div>Sun: Closed</div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white shadow-lg rounded-lg p-6 space-y-4 md:col-span-2">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Send Us a Message</h2>
                            <form className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            className="block w-full rounded border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                        Subject
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="general">General Inquiry</option>
                                        <option value="order">Order Status</option>
                                        <option value="return">Returns & Refunds</option>
                                        <option value="product">Product Information</option>
                                        <option value="technical">Technical Support</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows="4"
                                        required
                                        className="block w-full rounded border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                    ></textarea>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded text-white bg-primary-500 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    >
                                        Send Message
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Additional Resources */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-12">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Resources</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <Link href="/shipping-policy" className="flex items-center p-3 rounded-md hover:bg-gray-50 border border-gray-200">
                                <FileText className="w-5 h-5 text-gray-500 mr-3" />
                                <span>Shipping Policy</span>
                            </Link>
                            <Link href="/return-policy" className="flex items-center p-3 rounded-md hover:bg-gray-50 border border-gray-200">
                                <FileText className="w-5 h-5 text-gray-500 mr-3" />
                                <span>Return Policy</span>
                            </Link>
                            <Link href="/warranty-information" className="flex items-center p-3 rounded-md hover:bg-gray-50 border border-gray-200">
                                <FileText className="w-5 h-5 text-gray-500 mr-3" />
                                <span>Warranty Information</span>
                            </Link>
                            <Link href="/product-manuals" className="flex items-center p-3 rounded-md hover:bg-gray-50 border border-gray-200">
                                <FileText className="w-5 h-5 text-gray-500 mr-3" />
                                <span>Product Manuals</span>
                            </Link>
                            <Link href="/care-instructions" className="flex items-center p-3 rounded-md hover:bg-gray-50 border border-gray-200">
                                <FileText className="w-5 h-5 text-gray-500 mr-3" />
                                <span>Tool Care Instructions</span>
                            </Link>
                            <Link href="/track-order" className="flex items-center p-3 rounded-md hover:bg-gray-50 border border-gray-200">
                                <FileText className="w-5 h-5 text-gray-500 mr-3" />
                                <span>Track Your Order</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}