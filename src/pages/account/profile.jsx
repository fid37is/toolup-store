import { useState } from 'react';
import Image from 'next/image';
import { User, Mail, Phone, Calendar, ChevronLeft } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const ProfilePage = () => {
    const [user, setUser] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+234 803 555 1234',
        dob: '1990-06-15',
        avatar: '/fav 1.png',
        joinDate: 'January 2022',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...user });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = () => {
        setUser({ ...formData });
        setIsEditing(false);
        // Here you would typically send the updated user data to your API
        alert('Profile updated successfully!');
    };

    return (
        <><Header />
            <div className="container max-w-6xl mx-auto flex-grow px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center text-primary-500 hover:text-primary-700 font-medium"
                    >
                        <ChevronLeft className="h-5 w-5 mr-1" />
                        Back
                    </button>

                    <h1 className="text-3xl font-bold text-gray-800 text-right ml-auto">
                        My Profile
                    </h1>
                </div>


                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-primary-500 h-32"></div>

                    <div className="px-6 py-8 relative">
                        <div className="absolute -top-16 left-6">
                            <div className="relative">
                                <Image
                                    src={user.avatar}
                                    alt={user.name}
                                    width={96}
                                    height={96}
                                    className="rounded-full border-4 border-white shadow-md"
                                />
                                {!isEditing && (
                                    <button
                                        className="absolute bottom-0 right-0 bg-primary-500 text-white rounded-full p-1 shadow-md hover:bg-primary-700"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mt-12">
                            {isEditing ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <User className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="pl-10 py-2 block w-full rounded border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Mail className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="pl-10 py-2 block w-full rounded border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Phone className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="pl-10 py-2 block w-full rounded border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Calendar className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="date"
                                                    id="dob"
                                                    name="dob"
                                                    value={formData.dob}
                                                    onChange={handleChange}
                                                    className="pl-10 py-2 block w-full rounded border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({ ...user });
                                                setIsEditing(false);
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-sm text-gray-500">Full Name</p>
                                            <div className="flex items-center mt-1">
                                                <User className="h-5 w-5 text-gray-400 mr-2" />
                                                <p className="text-lg text-gray-800">{user.name}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">Email Address</p>
                                            <div className="flex items-center mt-1">
                                                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                                                <p className="text-lg text-gray-800">{user.email}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">Phone Number</p>
                                            <div className="flex items-center mt-1">
                                                <Phone className="h-5 w-5 text-gray-400 mr-2" />
                                                <p className="text-lg text-gray-800">{user.phone}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">Date of Birth</p>
                                            <div className="flex items-center mt-1">
                                                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                                                <p className="text-lg text-gray-800">{new Date(user.dob).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Member Since</p>
                                        <p className="text-lg text-gray-800 mt-1">{user.joinDate}</p>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                        >
                                            Edit Profile
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ProfilePage;