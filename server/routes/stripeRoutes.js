import express from 'express';
import Stripe from 'stripe';
import sql from '../config/db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const stripeRouter = express.Router();

// ─── Create Checkout Session ─────────────────────────────────
stripeRouter.post('/create-checkout-session', async (req, res) => {
    try {
        const { userId } = req.auth();
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        // Get or create subscription record
        let [sub] = await sql`SELECT * FROM subscriptions WHERE user_id = ${userId}`;
        let customerId = sub?.stripe_customer_id;

        if (!customerId) {
            const customer = await stripe.customers.create({ metadata: { userId } });
            customerId = customer.id;

            if (!sub) {
                await sql`INSERT INTO subscriptions (user_id, stripe_customer_id) VALUES (${userId}, ${customerId})`;
            } else {
                await sql`UPDATE subscriptions SET stripe_customer_id = ${customerId} WHERE user_id = ${userId}`;
            }
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
            success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/#pricing`,
            metadata: { userId },
        });

        res.json({ success: true, url: session.url });
    } catch (error) {
        console.log('Stripe Checkout Error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─── Subscription Status ─────────────────────────────────────
stripeRouter.get('/subscription-status', async (req, res) => {
    try {
        const { userId } = req.auth();
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const [sub] = await sql`SELECT plan, status, free_usage, current_period_end FROM subscriptions WHERE user_id = ${userId}`;

        res.json({
            success: true,
            plan: sub?.plan || 'free',
            status: sub?.status || 'active',
            free_usage: sub?.free_usage || 0,
            current_period_end: sub?.current_period_end || null,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─── Customer Portal ─────────────────────────────────────────
stripeRouter.post('/customer-portal', async (req, res) => {
    try {
        const { userId } = req.auth();
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const [sub] = await sql`SELECT stripe_customer_id FROM subscriptions WHERE user_id = ${userId}`;
        if (!sub?.stripe_customer_id) {
            return res.status(400).json({ success: false, message: 'No subscription found' });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: sub.stripe_customer_id,
            return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`,
        });

        res.json({ success: true, url: session.url });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─── Webhook (called from server.js with raw body) ──────────
export const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.log('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const userId = session.metadata?.userId;
                const subscriptionId = session.subscription;
                const customerId = session.customer;

                if (userId && subscriptionId) {
                    await sql`
                        INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, plan, status)
                        VALUES (${userId}, ${customerId}, ${subscriptionId}, 'premium', 'active')
                        ON CONFLICT (user_id) DO UPDATE SET
                            stripe_customer_id = ${customerId},
                            stripe_subscription_id = ${subscriptionId},
                            plan = 'premium',
                            status = 'active',
                            updated_at = NOW()
                    `;
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const status = subscription.status;
                const plan = status === 'active' ? 'premium' : 'free';
                const periodEnd = new Date(subscription.current_period_end * 1000);

                await sql`
                    UPDATE subscriptions
                    SET plan = ${plan}, status = ${status}, current_period_end = ${periodEnd}, updated_at = NOW()
                    WHERE stripe_subscription_id = ${subscription.id}
                `;
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                await sql`
                    UPDATE subscriptions
                    SET plan = 'free', status = 'canceled', updated_at = NOW()
                    WHERE stripe_subscription_id = ${subscription.id}
                `;
                break;
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.log('Webhook handler error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

export default stripeRouter;
