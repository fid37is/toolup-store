// hooks/useCheckoutForm.js - FIXED VERSION
import { useState, useEffect } from 'react';
import { useCheckoutAddress } from './useCheckoutAddress';

export const useCheckoutForm = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isGuestCheckout, setIsGuestCheckout] = useState(false);
    const [userId, setUserId] = useState('');
    const [formIsValid, setFormIsValid] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const { checkoutData, setCheckoutData } = useCheckoutAddress();

    // Form data
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: ''
    });

    // Address management state
    const [defaultAddress, setDefaultAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [useDefaultAddress, setUseDefaultAddress] = useState(true);

    const loadAuthAndUserData = async () => {
        const authStatus = localStorage.getItem('isAuthenticated');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const guestCheckout = localStorage.getItem('guestCheckout');

        setIsAuthenticated(authStatus === 'true');
        setIsGuestCheckout(guestCheckout === 'true');

        if (user && user.id) {
            setUserId(user.id);

            if (authStatus === 'true') {
                try {
                    const response = await fetch(`/api/users/profile/${user.id}`);
                    if (response.ok) {
                        const userProfile = await response.json();

                        setFormData(prevState => ({
                            ...prevState,
                            email: userProfile.email || user.email || '',
                            firstName: userProfile.firstName || user.name?.split(' ')[0] || '',
                            lastName: userProfile.lastName || user.name?.split(' ').slice(1).join(' ') || '',
                            phoneNumber: userProfile.phoneNumber || user.phone || ''
                        }));

                        // Set default address
                        if (userProfile.defaultAddress) {
                            setDefaultAddress(userProfile.defaultAddress);
                            setUseDefaultAddress(true);
                        } else {
                            // No default address, show form
                            setShowAddressForm(true);
                            setUseDefaultAddress(false);
                        }
                    } else {
                        setFormData(prevState => ({
                            ...prevState,
                            email: user.email || '',
                            firstName: user.name?.split(' ')[0] || '',
                            lastName: user.name?.split(' ').slice(1).join(' ') || '',
                            phoneNumber: user.phone || ''
                        }));
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    setFormData(prevState => ({
                        ...prevState,
                        email: user.email || '',
                        firstName: user.name?.split(' ')[0] || '',
                        lastName: user.name?.split(' ').slice(1).join(' ') || '',
                        phoneNumber: user.phone || ''
                    }));
                }
            }
        } else {
            setUserId(`guest-${Date.now()}`);
            // For guests, always show address form
            setShowAddressForm(true);
            setUseDefaultAddress(false);
        }
    };

    const validateForm = (paymentMethod, paymentVerified) => {
        const requiredContactFields = [
            'email',
            'firstName',
            'lastName',
            'phoneNumber'
        ];

        const requiredAddressFields = [
            'address',
            'state',
            'lga'
        ];

        const invalidContactFields = requiredContactFields.filter(field =>
            !formData[field] || formData[field].trim() === ''
        );

        let invalidAddressFields = [];
        
        // Skip address validation for pickup
        if (paymentMethod !== 'pay_at_pickup') {
            if (useDefaultAddress && defaultAddress) {
                // Using default address - check if it has required fields
                invalidAddressFields = requiredAddressFields.filter(field =>
                    !defaultAddress[field] || defaultAddress[field].trim() === ''
                );
            } else {
                // Using custom address - check checkoutData
                invalidAddressFields = requiredAddressFields.filter(field =>
                    !checkoutData[field] || checkoutData[field].trim() === ''
                );
            }
        }

        const allFieldsFilled = invalidContactFields.length === 0 && invalidAddressFields.length === 0;
        setFormIsValid(allFieldsFilled && paymentVerified && termsAccepted);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleAddressToggle = () => {
        setShowAddressForm(!showAddressForm);
        setUseDefaultAddress(!showAddressForm);
        
        if (!showAddressForm && defaultAddress) {
            // Switching to custom address, clear form
            setCheckoutData({
                address: '',
                city: '',
                state: '',
                lga: '',
                town: '',
                zip: '',
                additionalInfo: ''
            });
        }
    };

    // Restore form data if returning from auth
    useEffect(() => {
        const savedFormData = localStorage.getItem('checkoutFormData');
        const savedAddressData = localStorage.getItem('checkoutAddressData');

        if (savedFormData) {
            try {
                const parsed = JSON.parse(savedFormData);
                setFormData(prevState => ({ ...prevState, ...parsed }));
                localStorage.removeItem('checkoutFormData');
            } catch (error) {
                console.error('Error restoring form data:', error);
            }
        }

        if (savedAddressData) {
            try {
                const parsed = JSON.parse(savedAddressData);
                setCheckoutData(prevState => ({ ...prevState, ...parsed }));
                localStorage.removeItem('checkoutAddressData');
            } catch (error) {
                console.error('Error restoring address data:', error);
            }
        }
    }, [setCheckoutData]);

    // ✅ FIXED: Added setFormData to the return statement
    return {
        isAuthenticated,
        isGuestCheckout,
        userId,
        formData,
        setFormData,        // ✅ Added this missing function
        formIsValid,
        setFormIsValid,     // ✅ Added this too for completeness
        termsAccepted,
        setTermsAccepted,
        defaultAddress,
        setDefaultAddress,  // ✅ Added this too
        showAddressForm,
        useDefaultAddress,
        checkoutData,
        setCheckoutData,
        loadAuthAndUserData,
        validateForm,
        handleInputChange,
        handleAddressToggle
    };
};