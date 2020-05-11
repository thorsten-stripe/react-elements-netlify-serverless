# Faster Checkout with Digital Wallet Payments

Modern browser APIs like the Payment Request API allow you to access payment credentials stored in your customer's digital wallets like Apple Pay, Google Pay, or even Chrome.

Stripe provides a Payment Request button element that securely tokenizes these stored credentials for a convenient checkout experience on mobile devices.

## Set up a new React project

To scaffold a new React project we use `create-react-app`:

```bash
npx create-react-app my-app
cd my-app
```

You can of course use other toolchains like Gatsby or Next.js as well. See the React docs for a [list of recommendations](https://reactjs.org/docs/create-a-new-react-app.html#recommended-toolchains).

### Install additional dependencies

To make use of Stripe Elements in React, install both the `stripe-js` and the `react-stripe-js` module:

```bash
npm install --save @stripe/react-stripe-js @stripe/stripe-js
```

To communicate with the Stripe API from our Netlify function, install the `stripe-node` module:

```bash
npm install --save stripe
```

In our demo application we're additionally using the `use-shopping-cart` library, which isn't a required dependency, but makes managing your shopping cart logic a lot easier.

## Create a GitHub repository and get our changes pushed to it

copy from https://www.netlify.com/blog/2020/04/13/learn-how-to-accept-money-on-jamstack-sites-in-38-minutes/

## Create a new Netlify site using the command line

copy from https://www.netlify.com/blog/2020/04/13/learn-how-to-accept-money-on-jamstack-sites-in-38-minutes/

> Your build command
> `yarn build`
> Directory to deploy
> `build`

## Use Netlify environment variables for local development

copy mostly from https://www.netlify.com/blog/2020/04/13/learn-how-to-accept-money-on-jamstack-sites-in-38-minutes/

`ntl open:admin` > Site Settings > Build & Deploy > Environment

add `REACT_APP_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` from your [Stripe Dashboard]()

Run `ntl dev` and see your environment variables being pulled in

## Add Stripe.js and Elements to your page

To use Element components, wrap the root of your React app in an Elements provider. Call `loadStripe` with your publishable key and pass the returned `Promise` to the `Elements` provider.

`index.js`

```jsx
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

ReactDOM.render(
  <Elements stripe={stripePromise}>
    <App />
  </Elements>,
  document.getElementById('root')
);
```

## Create a Payment Request object

The Payment Request object is used to communicate the payment details to the digital wallet. We can only create the payment request once Stripe.js has loaded. Therefore we need to wrap it into a `useEffect` hook with `stripe` as a dependency.

`App.js`

```jsx
import React, { useState, useEffect } from 'react';
import {
  PaymentRequestButtonElement,
  useStripe,
} from '@stripe/react-stripe-js';

const App = () => {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState(null);

  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: 'Demo total',
          amount: 1350,
        },
        requestPayerName: true,
        requestPayerEmail: true,
        requestShipping: true,
        shippingOptions: [
          {
            id: 'standard-global',
            label: 'Global shipping',
            detail: 'Arrives in 5 to 7 days',
            amount: 350,
          },
        ],
      });
    }
  }, [stripe]);

  // Use a traditional checkout form.
  return 'Insert your form or button component here.';
};
```

The parameters `requestPayerName`, `requestPayerEmail`, `requestShipping` allow you to collect stored billing and shipping details which can speed up the checkout process significantly.

## Check if a digital wallet is available and render the button
