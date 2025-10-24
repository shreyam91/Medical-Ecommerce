import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PaymentButton from '../components/Payment/PaymentButton';
import CartTest from '../components/CartTest';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotal, getTotalItems, getSubtotal } = useCart();
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  
  // Form states
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  
  const [deliveryOption, setDeliveryOption] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('phonepe');
  const [orderNotes, setOrderNotes] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Delivery charges
  const deliveryCharges = {
    standard: 0,
    express: 50,
  };

  useEffect(() => {
    // Load user data and saved address
    const loadUserData = () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const savedAddress = JSON.parse(localStorage.getItem('shippingAddress') || '{}');
        
        setShippingAddress({
          fullName: savedAddress.fullName || user.name || '',
          phone: savedAddress.phone || user.mobile || user.phone || '',
          email: savedAddress.email || user.email || '',
          address: savedAddress.address || '',
          city: savedAddress.city || '',
          state: savedAddress.state || '',
          pincode: savedAddress.pincode || '',
          landmark: savedAddress.landmark || ''
        });
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Error loading user data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleAddressChange = (field, value) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveAddress = () => {
    localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
    toast.success('Address saved');
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return cartItems.length > 0;
      case 2:
        return shippingAddress.fullName && 
               shippingAddress.phone && 
               shippingAddress.address && 
               shippingAddress.city && 
               shippingAddress.pincode;
      case 3:
        return deliveryOption;
      case 4:
        return paymentMethod && agreeToTerms;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, 4));
      if (activeStep === 2) saveAddress();
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 1));
  };

  const handlePaymentInitiated = (response) => {
    localStorage.setItem('pendingPayment', JSON.stringify({
      merchantTransactionId: response.merchantTransactionId,
      orderId: response.payment.order_id,
      amount: response.payment.amount,
      shippingAddress,
      deliveryOption,
      orderNotes
    }));
  };

  const handlePrescriptionUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) { // 5MB limit
        toast.error('File size should be less than 3MB');
        return;
      }
      setPrescriptionFile(file);
      toast.success('Prescription uploaded');
    }
  };

  const getDeliveryCharge = () => deliveryCharges[deliveryOption] || 0;
  const getFinalTotal = () => getSubtotal() + getDeliveryCharge();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to your cart to proceed with checkout</p>
          
          {/* Test component for development */}
          <div className="mb-6">
            <CartTest />
          </div>
          
          <button
            onClick={() => navigate('/products')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-2 sm:py-4 lg:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center justify-center overflow-x-auto">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-shrink-0">
                <div className={`
                  w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium
                  ${activeStep >= step 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`
                    w-8 sm:w-12 lg:w-16 h-0.5 sm:h-1 mx-1 sm:mx-2
                    ${activeStep > step ? 'bg-green-600' : 'bg-gray-200'}
                  `}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <div className="text-xs sm:text-sm text-gray-600 text-center px-2">
              {activeStep === 1 && 'Review Cart'}
              {activeStep === 2 && 'Shipping Address'}
              {activeStep === 3 && 'Delivery Options'}
              {activeStep === 4 && 'Payment'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
              
              {/* Step 1: Cart Review */}
              {activeStep === 1 && (
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Review Your Order</h2>
                  <div className="space-y-4">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex flex-row items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded"
                        />
                        <div className="flex-grow">
                          <h3 className="text-sm sm:text-base">{item.name}</h3>
                          <div className="text-gray-600 text-xs sm:text-sm flex items-center gap-2">
                            <span className="font-bold text-gray-900">₹{Number(item.price).toFixed(2)}</span>
                            {item.actual_price && Number(item.actual_price) > Number(item.price) && (
                              <>
                                <span className="line-through text-gray-400 text-xs">₹{Number(item.actual_price).toFixed(2)}</span>
                                <span className="text-green-600 text-xs font-semibold ml-1">
                                  -{Math.round(((Number(item.actual_price) - Number(item.price)) / Number(item.actual_price)) * 100)}%
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs sm:text-sm text-gray-600">Qty: {item.quantity}</span>
                            {item.size && <span className="text-xs sm:text-sm text-gray-600">• Size: {item.size}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800 text-sm sm:text-base">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Shipping Address */}
              {activeStep === 2 && (
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Shipping Address</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.fullName}
                        onChange={(e) => handleAddressChange('fullName', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => handleAddressChange('phone', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={shippingAddress.email}
                        onChange={(e) => handleAddressChange('email', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Address *
                      </label>
                      <textarea
                        value={shippingAddress.address}
                        onChange={(e) => handleAddressChange('address', e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.pincode}
                        onChange={(e) => handleAddressChange('pincode', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Landmark
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.landmark}
                        onChange={(e) => handleAddressChange('landmark', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Delivery Options */}
              {activeStep === 3 && (
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Delivery Options</h2>
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      { id: 'standard', name: 'Standard Delivery', time: '5-7 business days', price: 0 },
                      { id: 'express', name: 'Express Delivery', time: '2-3 business days', price: 50 },
                    ].map((option) => (
                      <div key={option.id} className="border rounded-lg p-3 sm:p-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="delivery"
                            value={option.id}
                            checked={deliveryOption === option.id}
                            onChange={(e) => setDeliveryOption(e.target.value)}
                            className="mr-2 sm:mr-3"
                          />
                          <div className="flex-grow">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                              <div className="mb-2 sm:mb-0">
                                <h3 className="font-medium text-gray-800 text-sm sm:text-base">{option.name}</h3>
                                <p className="text-xs sm:text-sm text-gray-600">{option.time}</p>
                              </div>
                              <div className="text-left sm:text-right">
                                <p className="font-semibold text-gray-800 text-sm sm:text-base">
                                  {option.price === 0 ? 'Free' : `₹${option.price}`}
                                </p>
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Prescription Upload */}
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm sm:text-base">Upload Prescription (Optional)</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3">
                      If you're ordering prescription medicines, please upload your prescription
                    </p>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handlePrescriptionUpload}
                      className="w-full text-xs sm:text-sm text-gray-600 file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {prescriptionFile && (
                      <p className="text-xs sm:text-sm text-green-600 mt-2">
                        ✓ {prescriptionFile.name} uploaded
                      </p>
                    )}
                  </div>

                  {/* Order Notes */}
                  <div className="mt-4 sm:mt-6">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      rows="3"
                      placeholder="Any special instructions for delivery..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Payment */}
              {activeStep === 4 && (
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Payment Method</h2>
                  
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div className="border rounded-lg p-3 sm:p-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="phonepe"
                          checked={paymentMethod === 'phonepe'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-2 sm:mr-3"
                        />
                        <div className="flex items-center">
                          <img 
                            src="https://logoeps.com/wp-content/uploads/2013/03/phonepe-vector-logo.png" 
                            alt="PhonePe" 
                            className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3"
                          />
                          <div>
                            <h3 className="font-medium text-gray-800 text-sm sm:text-base">PhonePe</h3>
                            <p className="text-xs sm:text-sm text-gray-600">Pay securely with PhonePe</p>
                          </div>
                        </div>
                      </label>
                    </div>

                    <div className="border rounded-lg p-3 sm:p-4 opacity-50">
                      <label className="flex items-center cursor-not-allowed">
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          disabled
                          className="mr-2 sm:mr-3"
                        />
                        <div>
                          <h3 className="font-medium text-gray-800 text-sm sm:text-base">Cash on Delivery</h3>
                          <p className="text-xs sm:text-sm text-gray-600">Pay when you receive (Coming Soon)</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="mb-4 sm:mb-6">
                    <label className="flex items-start sm:items-center">
                      <input
                        type="checkbox"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        className="mr-2 mt-1 sm:mt-0"
                      />
                      <span className="text-xs sm:text-sm text-gray-600">
                        I agree to the{' '}
                        <a href="/terms-and-conditions" className="text-green-600 hover:underline">
                          Terms and Conditions
                        </a>{' '}
                        and{' '}
                        <a href="/privacy-policy" className="text-green-600 hover:underline">
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                  </div>

                  {paymentMethod === 'phonepe' && agreeToTerms && (
                    <PaymentButton
                      orderId={`ORDER_${Date.now()}`}
                      amount={getFinalTotal()}
                      userId={shippingAddress.phone || `guest_${Date.now()}`}
                      mobileNumber={shippingAddress.phone}
                      onPaymentInitiated={handlePaymentInitiated}
                      disabled={!agreeToTerms}
                      className="w-full"
                    />
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                {activeStep > 1 && (
                  <button
                    onClick={prevStep}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                )}
                {activeStep < 4 && (
                  <button
                    onClick={nextStep}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ml-auto"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <span>₹{getSubtotal().toFixed(2)}</span>
                </div>
                
                {/* <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span>{getDeliveryCharge() === 0 ? 'Free' : `₹${getDeliveryCharge()}`}</span>
                </div> */}
                
                {cartItems.some(item => item.actual_price && Number(item.actual_price) > Number(item.price)) && (
                  <div className="flex justify-between text-green-600">
                    <span>Total Savings</span>
                    <span>
                      -₹{(
                        cartItems.reduce((sum, item) => 
                          sum + ((Number(item.actual_price) - Number(item.price)) * item.quantity || 0), 
                        0)
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
                
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{getFinalTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address Preview */}
              {activeStep > 2 && shippingAddress.address && (
                <div className="mt-6 pt-4 border-t">
                  <h3 className="font-medium text-gray-800 mb-2">Delivery Address</h3>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{shippingAddress.fullName}</p>
                    <p>{shippingAddress.address}</p>
                    <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
                    <p>{shippingAddress.phone}</p>
                  </div>
                </div>
              )}

              {/* Security Badge */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Secure & encrypted payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;