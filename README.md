# react-elements-netlify-serverless

## Install

```bash
yarn
```

## Setup env

```bash
cp .env.example .env
```

Add your Stripe keys

## Run

```bash
ntl dev
```

## Test Payment Request Button

See requirements in [docs](https://stripe.com/docs/stripe-js/elements/payment-request-button#react-prerequisites)

```bash
ngrok http 3000
```

## Listen to webhooks

```bash
stripe listen --forward-to localhost:8888/.netlify/functions/webhooks
```
