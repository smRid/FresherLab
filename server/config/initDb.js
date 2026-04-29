import sql from "./db.js";

const initDb = async () => {
    await sql`
        CREATE TABLE IF NOT EXISTS creations (
            id SERIAL PRIMARY KEY,
            user_id TEXT NOT NULL,
            prompt TEXT NOT NULL,
            content TEXT NOT NULL,
            type TEXT NOT NULL,
            publish BOOLEAN NOT NULL DEFAULT false,
            likes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `;

    await sql`
        CREATE INDEX IF NOT EXISTS creations_user_id_created_at_idx
        ON creations (user_id, created_at DESC)
    `;

    await sql`
        CREATE INDEX IF NOT EXISTS creations_publish_created_at_idx
        ON creations (publish, created_at DESC)
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS job_applications (
            id SERIAL PRIMARY KEY,
            user_id TEXT NOT NULL,
            company TEXT NOT NULL,
            role TEXT NOT NULL,
            job_url TEXT,
            location TEXT,
            salary_range TEXT,
            status TEXT NOT NULL DEFAULT 'Applied',
            source TEXT,
            contact_name TEXT,
            contact_email TEXT,
            notes TEXT,
            follow_up_date DATE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `;

    await sql`
        CREATE INDEX IF NOT EXISTS job_applications_user_id_idx
        ON job_applications (user_id, created_at DESC)
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS subscriptions (
            id SERIAL PRIMARY KEY,
            user_id TEXT NOT NULL UNIQUE,
            stripe_customer_id TEXT,
            stripe_subscription_id TEXT,
            plan TEXT NOT NULL DEFAULT 'free',
            status TEXT NOT NULL DEFAULT 'active',
            free_usage INT NOT NULL DEFAULT 0,
            current_period_end TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `;

    await sql`
        CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx
        ON subscriptions (user_id)
    `;

    await sql`
        CREATE INDEX IF NOT EXISTS subscriptions_stripe_customer_id_idx
        ON subscriptions (stripe_customer_id)
    `;
};

export default initDb;
