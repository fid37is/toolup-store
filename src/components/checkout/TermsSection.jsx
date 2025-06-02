// components/checkout/TermsSection.jsx
const TermsSection = ({ termsAccepted, setTermsAccepted }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Terms & Conditions</h2>
            <div className="flex items-start">
                <div className="flex h-5 items-center">
                    <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="text-gray-700">
                        I agree to the{' '}
                        <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                            Privacy Policy
                        </a>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default TermsSection;