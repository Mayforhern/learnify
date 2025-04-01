import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
}

export interface PaymentIntent {
  clientSecret: string;
  courseId: string;
}

class StripeService {
  private static instance: StripeService;
  private stripe: any;

  private constructor() {}

  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  public async initialize() {
    this.stripe = await stripePromise;
  }

  public async createPaymentIntent(courseId: string): Promise<PaymentIntent> {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  public async confirmPayment(clientSecret: string) {
    try {
      const { error } = await this.stripe.confirmCardPayment(clientSecret);
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  public async getCourses(): Promise<Course[]> {
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }
}

export default StripeService; 