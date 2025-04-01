import Stripe from 'stripe';
import DatabaseService from '../services/DatabaseService';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function createPaymentIntent(courseId: string, userId: string) {
  try {
    // Get course details from database
    const db = DatabaseService.getInstance();
    const courses = await db.query('courses', { id: courseId });
    
    if (courses.length === 0) {
      throw new Error('Course not found');
    }

    const course = courses[0];

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(course.price * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        courseId,
        userId,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

export async function handleWebhook(event: Stripe.Event) {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { courseId, userId } = paymentIntent.metadata;

        // Update user's purchased courses
        const db = DatabaseService.getInstance();
        await db.execute('INSERT', 'user_courses', {
          user_id: userId,
          course_id: courseId,
          purchase_date: new Date().toISOString(),
        });

        break;
      }

      case 'payment_intent.payment_failed': {
        // Handle failed payment
        console.log('Payment failed:', event.data.object);
        break;
      }
    }

    return { received: true };
  } catch (error) {
    console.error('Error handling webhook:', error);
    throw error;
  }
}

export async function getCourses() {
  try {
    const db = DatabaseService.getInstance();
    const courses = await db.query('courses');
    return courses;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
} 