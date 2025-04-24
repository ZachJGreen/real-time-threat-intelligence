/**
 * Calculates time-weighted risk score
 * @param {number} likelihood - Risk likelihood (1 to 5)
 * @param {number} impact - Risk impact (1 to 5)
 * @param {string | Date} lastSeen - ISO timestamp or Date of last detection
 * @param {Object} [options] - Optional configuration parameters
 * @param {number} [options.decayRate=0.05] - Daily decay rate (default: 5% per day)
 * @param {number} [options.minDecay=0.1] - Minimum decay factor (default: 0.1)
 * @returns {number} - Adjusted risk score (rounded to 2 decimal places)
 * @throws {Error} - If likelihood or impact are outside valid range or lastSeen is invalid
 */
function calculateRiskScore(likelihood, impact, lastSeen, options = {}) {
    // Validate inputs
    if (!Number.isFinite(likelihood) || likelihood < 1 || likelihood > 5) {
        throw new Error('Likelihood must be a number between 1 and 5');
    }

    if (!Number.isFinite(impact) || impact < 1 || impact > 5) {
        throw new Error('Impact must be a number between 1 and 5');
    }

    // Set default options
    const { decayRate = 0.05, minDecay = 0.1 } = options;

    // Constants
    const MS_PER_DAY = 86400000; // 1000 * 60 * 60 * 24

    // Process dates
    const now = new Date();
    let seenDate;

    try {
        seenDate = lastSeen instanceof Date ? lastSeen : new Date(lastSeen);

        // Check if date is valid
        if (isNaN(seenDate.getTime())) {
            throw new Error('Invalid date');
        }
    } catch (error) {
        throw new Error('Invalid lastSeen date format');
    }

    // Calculate days since last seen (using more precise Math.max to ensure non-negative)
    const daysSinceLastSeen = Math.max(0, Math.floor((now - seenDate) / MS_PER_DAY));

    // Calculate decay factor (capped at minimum value)
    const decayFactor = Math.max(minDecay, 1 - (decayRate * daysSinceLastSeen));

    // Calculate score
    const rawScore = likelihood * impact;
    const adjustedScore = rawScore * decayFactor;

    // Round to 2 decimal places (using more reliable method)
    return Math.round(adjustedScore * 100) / 100;
}

module.exports = { calculateRiskScore };