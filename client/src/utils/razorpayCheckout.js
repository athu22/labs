/**
 * Dynamically loads Razorpay Standard Checkout script (https://checkout.razorpay.com/v1/checkout.js).
 */
export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.getElementById('razorpay-checkout-js');
    if (existing) {
      existing.onload = () => resolve(true);
      existing.onerror = () => resolve(false);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const openRazorpayCheckout = async ({
  order,
  eventTitle,
  attendee,
  onSuccess,
  onDismiss,
}) => {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    throw new Error('Failed to load Razorpay Checkout SDK. Please check your internet connection.');
  }

  return new Promise((resolve, reject) => {
    const options = {
      key: order.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'ACLAP Maharashtra',
      description: eventTitle || 'Event Ticket Booking',
      order_id: order.id,
      prefill: {
        name: attendee?.fullName || '',
        email: attendee?.email || '',
        contact: attendee?.phone || '',
      },
      theme: {
        color: '#2563eb',
      },
      modal: {
        ondismiss: () => {
          if (onDismiss) onDismiss();
          resolve({ dismissed: true });
        },
      },
      handler: async (response) => {
        try {
          if (onSuccess) {
            await onSuccess(response);
          }
          resolve({ paid: true, response });
        } catch (err) {
          reject(err);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (failure) => {
      reject(new Error(failure?.error?.description || 'Payment failed in Razorpay Checkout.'));
    });
    rzp.open();
  });
};
