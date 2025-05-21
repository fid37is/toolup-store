import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { User, Mail, Phone, Calendar, ChevronLeft } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { toast } from 'sonner';

const ProfilePage = () => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
    });

    // Get the full name from first and last name
    const getFullName = (firstName, lastName) => {
        return `${firstName || ''} ${lastName || ''}`.trim();
    };

    // Format the date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';

        try {
            return new Date(dateString).toLocaleDateString();
        } catch (error) {
            console.error("Invalid date format:", error);
            return dateString;
        }
    };

    // Format join date for display
    const formatJoinDate = (dateString) => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            // Return month and year
            return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        } catch (error) {
            console.error("Invalid join date format:", error);
            return dateString;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    // Get user document from Firestore
                    const userDocRef = doc(db, "users", currentUser.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();

                        // Set user state with data from Firestore
                        setUser({
                            uid: currentUser.uid,
                            name: getFullName(userData.firstName, userData.lastName),
                            email: userData.email || currentUser.email,
                            phone: userData.phone || '',
                            dob: userData.dob || '',
                            avatar: currentUser.photoURL || '/default-avatar.png',
                            joinDate: userData.joinDate || new Date().toISOString(),
                            firstName: userData.firstName || '',
                            lastName: userData.lastName || '',
                        });

                        // Also set form data
                        setFormData({
                            firstName: userData.firstName || '',
                            lastName: userData.lastName || '',
                            email: userData.email || currentUser.email,
                            phone: userData.phone || '',
                            dob: userData.dob || '',
                        });
                    } else {
                        console.log("No user document found for this user");
                        // Create default user object from auth data
                        const nameParts = currentUser.displayName ? currentUser.displayName.split(' ') : ['', ''];
                        const defaultUser = {
                            uid: currentUser.uid,
                            name: currentUser.displayName || '',
                            email: currentUser.email,
                            phone: '',
                            dob: '',
                            avatar: currentUser.photoURL || '/default-avatar.png',
                            joinDate: new Date().toISOString(),
                            firstName: nameParts[0] || '',
                            lastName: nameParts.slice(1).join(' ') || '',
                        };

                        setUser(defaultUser);
                        setFormData({
                            firstName: defaultUser.firstName,
                            lastName: defaultUser.lastName,
                            email: defaultUser.email,
                            phone: defaultUser.phone,
                            dob: defaultUser.dob,
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    toast.error("Failed to load profile data", {
                        position: 'top-center',
                        duration: 3000,
                    });
                }
            } else {
                // Redirect to login if not logged in
                router.push('/auth?redirect=/profile');
            }

            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async () => {
        if (!user || !user.uid) {
            toast.error("User not authenticated", {
                position: 'top-center',
                duration: 3000,
            });
            return;
        }

        try {
            setIsLoading(true);

            // Update Firestore document
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                dob: formData.dob,
                lastUpdated: new Date().toISOString()
            });

            // Update local state
            setUser({
                ...user,
                name: getFullName(formData.firstName, formData.lastName),
                email: formData.email,
                phone: formData.phone,
                dob: formData.dob,
                firstName: formData.firstName,
                lastName: formData.lastName,
            });

            setIsEditing(false);
            toast.success("Profile updated successfully!", {
                position: 'top-center',
                duration: 3000,
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile", {
                position: 'top-center',
                duration: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <>
                <Header />
                <div className="container max-w-6xl mx-auto flex-grow px-4 py-8 flex justify-center items-center min-h-[70vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading profile...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!user) {
        return (
            <>
                <Header />
                <div className="container max-w-6xl mx-auto flex-grow px-4 py-8 flex justify-center items-center min-h-[70vh]">
                    <div className="text-center">
                        <p className="text-xl text-gray-700">You need to be logged in to view your profile.</p>
                        <button
                            onClick={() => router.push('/auth?redirect=/profile')}
                            className="mt-4 px-6 py-2 bg-primary-500 text-white rounded hover:bg-primary-700"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="container max-w-6xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-primary-700 hover:text-primary-500 transition-colors font-medium"
                    >
                        <span className="mr-2 text-lg">←</span> Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800 relative">
                        My Profile
                        <span className="block h-1 w-12 bg-accent-500 mt-2 rounded-full"></span>
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
                                    onError={(e) => {
                                        e.target.src = '/default-avatar.png'; // Fallback image
                                    }}
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
                                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <User className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    id="firstName"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    className="pl-10 py-2 block w-full rounded border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <User className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    id="lastName"
                                                    name="lastName"
                                                    value={formData.lastName}
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
                                                    disabled={true} // Email is managed by authentication
                                                />
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">Email can't be changed directly</p>
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
                                                setFormData({
                                                    firstName: user.firstName || '',
                                                    lastName: user.lastName || '',
                                                    email: user.email || '',
                                                    phone: user.phone || '',
                                                    dob: user.dob || '',
                                                });
                                                setIsEditing(false);
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                                            disabled={isLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            className={`px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Saving...
                                                </span>
                                            ) : (
                                                'Save Changes'
                                            )}
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
                                                <p className="text-lg text-gray-800">{user.name || 'Not provided'}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">Email Address</p>
                                            <div className="flex items-center mt-1">
                                                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                                                <p className="text-lg text-gray-800">{user.email || 'Not provided'}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">Phone Number</p>
                                            <div className="flex items-center mt-1">
                                                <Phone className="h-5 w-5 text-gray-400 mr-2" />
                                                <p className="text-lg text-gray-800">{user.phone || 'Not provided'}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500">Date of Birth</p>
                                            <div className="flex items-center mt-1">
                                                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                                                <p className="text-lg text-gray-800">{user.dob ? formatDate(user.dob) : 'Not provided'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-500">Member Since</p>
                                        <p className="text-lg text-gray-800 mt-1">{formatJoinDate(user.joinDate)}</p>
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
            </main>
            <Footer />
        </>
    );
};

export default ProfilePage;