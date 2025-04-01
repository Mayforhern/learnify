import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/stripe-js';
import StripeService, { Course } from '../services/StripeService';
import WalletService, { WalletBalance } from '../services/WalletService';
import { InjectedConnector } from '@web3-react/injected-connector';

interface PaymentModalProps {
  course: Course;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ course, onClose, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'wallet'>('stripe');
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stripeService = StripeService.getInstance();
  const walletService = WalletService.getInstance();

  useEffect(() => {
    const loadWalletBalance = async () => {
      try {
        const connector = new InjectedConnector({
          supportedChainIds: [1, 3, 4, 5, 42],
        });
        await walletService.connect(connector);
        const balance = await walletService.getBalance();
        setWalletBalance(balance);
      } catch (error) {
        console.error('Error loading wallet balance:', error);
      }
    };

    if (paymentMethod === 'wallet') {
      loadWalletBalance();
    }
  }, [paymentMethod]);

  const handleStripePayment = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      const { clientSecret } = await stripeService.createPaymentIntent(course.id);
      await stripeService.confirmPayment(clientSecret);
      onSuccess();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletPayment = async () => {
    if (!walletBalance) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert course price to ETH (you'll need to implement this)
      const ethAmount = course.price / walletBalance.usd;
      
      // Send transaction to your contract address
      await walletService.sendTransaction(
        'YOUR_CONTRACT_ADDRESS',
        ethAmount.toString()
      );
      
      onSuccess();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Purchase Course</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
          <p className="text-gray-600 mb-4">{course.description}</p>
          <p className="text-xl font-bold">${course.price}</p>
        </div>

        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <button
              className={`flex-1 py-2 px-4 rounded ${
                paymentMethod === 'stripe'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => setPaymentMethod('stripe')}
            >
              Credit Card
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded ${
                paymentMethod === 'wallet'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => setPaymentMethod('wallet')}
            >
              Wallet
            </button>
          </div>

          {paymentMethod === 'stripe' ? (
            <div className="border rounded p-4">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="border rounded p-4">
              {walletBalance ? (
                <div>
                  <p className="text-sm text-gray-600">Wallet Balance:</p>
                  <p className="text-lg font-semibold">
                    {walletBalance.eth} ETH (${walletBalance.usd.toFixed(2)})
                  </p>
                </div>
              ) : (
                <p className="text-gray-600">Connecting wallet...</p>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-600 mb-4">{error}</div>
        )}

        <div className="flex gap-4">
          <button
            className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded"
            onClick={paymentMethod === 'stripe' ? handleStripePayment : handleWalletPayment}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 