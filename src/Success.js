import React, { useEffect } from 'react';

import { useShoppingCart } from 'use-shopping-cart';

const Success = () => {
  const { clearCart } = useShoppingCart();

  useEffect(() => clearCart(), []);

  return (
    <main>
      <h1>Thanks for your purchase ❤️</h1>
    </main>
  );
};

export default Success;
