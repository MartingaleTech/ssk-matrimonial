declare module 'react-native-razorpay' {
  export interface RazorpayOptions {
    key: string;
    name?: string;
    description?: string;
    subscription_id?: string;
    order_id?: string;
    currency?: string;
    amount?: number | string;
    prefill?: { email?: string; contact?: string; name?: string };
    theme?: { color?: string };
  }

  export interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_subscription_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }

  const RazorpayCheckout: {
    open(options: RazorpayOptions): Promise<RazorpayResponse>;
  };

  export default RazorpayCheckout;
}
