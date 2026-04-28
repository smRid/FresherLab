// Per-tool free plan usage limits (MVP)
// For now, limits are checked against the single free_usage counter.
// Later, migrate to a per-tool usage table with monthly resets.

export const USAGE_LIMITS = {
    free: {
        'resume-review': 3,
        'cover-letter': 3,
        'grammar-enhancement': 5,
        'job-email': 3,
        'readme': 5,
        'ats-score': 3,
        'resume-builder': 3,
        'job-description-analysis': 5,
        'learning-plan': 3,
        'code-snippet': 5,
        'linkedin-post': 5,
        'job-applications': 20,
        default: 10,
    },
    premium: {
        // Unlimited for all tools
    }
};

export const getLimit = (plan, toolType) => {
    if (plan === 'premium') return Infinity;
    return USAGE_LIMITS.free[toolType] || USAGE_LIMITS.free.default;
};
