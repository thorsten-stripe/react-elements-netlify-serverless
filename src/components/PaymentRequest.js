import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useShoppingCart } from 'use-shopping-cart';

import {
  PaymentRequestButtonElement,
  useStripe,
} from '@stripe/react-stripe-js';

const PaymentRequest = () => {
  const history = useHistory();
  const { cartItems, cartDetails, cartCount } = useShoppingCart();
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);

  const handleButtonClicked = async (event) => {
    if (!cartCount) {
      event.preventDefault();
      alert('Cart is empty!');
      return;
    }
    if (clientSecret) {
      // As the payment amount might have changed we need to unsubscribe
      // the listener until we have a new client-secret.
      paymentRequest.off('paymentmethod');
    }
    // Create PaymentIntent
    const response = await fetch('/.netlify/functions/create-payment-intent', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cartDetails),
    })
      .then((res) => {
        return res.json();
      })
      .catch((error) => {
        console.log(error);
      });
    setClientSecret(response.clientSecret);
  };

  const handlePaymentMethodReceived = async (event) => {
    // Confirm the PaymentIntent with the payment method returned from the payment request.
    const { error } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: event.paymentMethod.id,
        shipping: {
          name: event.shippingAddress.recipient,
          phone: event.shippingAddress.phone,
          address: {
            line1: event.shippingAddress.addressLine[0],
            city: event.shippingAddress.city,
            postal_code: event.shippingAddress.postalCode,
            state: event.shippingAddress.region,
            country: event.shippingAddress.country,
          },
        },
      },
      { handleActions: false }
    );
    if (error) {
      // Report to the browser that the payment failed.
      console.log(error);
      event.complete('fail');
    } else {
      // Report to the browser that the confirmation was successful, prompting
      // it to close the browser payment method collection interface.
      event.complete('success');
      // Let Stripe.js handle the rest of the payment flow, including 3D Secure if needed.
      const { paymentIntent } = await stripe.confirmCardPayment(clientSecret);
      if (paymentIntent.status === 'succeeded') {
        history.push('/success');
      }
    }
  };

  useEffect(() => {
    if (stripe && paymentRequest === null) {
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: 'Demo total',
          amount: cartItems.reduce((sum, { price }) => sum + price, 350),
          pending: true,
        },
        requestPayerName: true,
        requestPayerEmail: true,
        requestShipping: true,
        shippingOptions: [
          {
            id: 'standard-global',
            label: 'Global shipping',
            detail: 'Handling and delivery fee',
            amount: 350,
          },
        ],
      });
      // Check the availability of the Payment Request API first.
      pr.canMakePayment().then((result) => {
        if (result) {
          setPaymentRequest(pr);
        }
      });
    }
  }, [stripe]);

  useEffect(() => {
    if (paymentRequest) {
      paymentRequest.update({
        total: {
          label: 'Demo total',
          amount: cartItems.reduce((sum, { price }) => sum + price, 350),
          pending: false,
        },
      });
    }
  }, [cartItems]);

  useEffect(() => {
    if (clientSecret) {
      // The client-secret is set, we can now subscribe the listener.
      paymentRequest.on('paymentmethod', handlePaymentMethodReceived);
    }
  }, [clientSecret]);

  if (paymentRequest) {
    return (
      <div className="payment-request-button">
        <PaymentRequestButtonElement
          options={{ paymentRequest }}
          onClick={handleButtonClicked}
        />
        --- OR ---
      </div>
    );
  }

  return '';
};

export default PaymentRequest;
