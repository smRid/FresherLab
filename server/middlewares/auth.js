import sql from "../config/db.js";

// Middleware to check userId and plan from subscriptions table
export const auth = async (req, res, next) => {
    try {
        const { userId } = req.auth();

        // Get or create subscription record
        let [sub] = await sql`SELECT plan, free_usage FROM subscriptions WHERE user_id = ${userId}`;

        if (!sub) {
            await sql`INSERT INTO subscriptions (user_id, plan, free_usage) VALUES (${userId}, 'free', 0)`;
            sub = { plan: 'free', free_usage: 0 };
        }

        req.plan = sub.plan;
        req.free_usage = sub.free_usage || 0;
        next();

    } catch (error) {
        res.status(401).json({ success: false, message: 'Authentication failed', error: error.message });
    }
}