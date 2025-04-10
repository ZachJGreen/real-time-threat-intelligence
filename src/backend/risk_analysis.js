/**
 * Cost-Benefit Analysis module for risk treatment decisions
 * Compares the cost of security measures against potential loss reduction
 */

// Calculate ALE (Annual Loss Expectancy)
function calculateALE(assetValue, aro) {
    // ALE = Asset Value × ARO (Annual Rate of Occurrence)
    return assetValue * aro;
}

// Calculate cost-benefit ratio
function calculateCBA(alePrior, alePost, securityControlCost) {
    // Benefit = Reduction in expected loss
    const benefit = alePrior - alePost;
    
    // Cost = Annual cost of security control
    const cost = securityControlCost;
    
    // Return on Security Investment (ROSI)
    const rosi = ((benefit - cost) / cost) * 100;
    
    return {
        initialRisk: alePrior,
        residualRisk: alePost,
        riskReduction: benefit,
        controlCost: cost,
        netBenefit: benefit - cost,
        rosi: rosi,
        recommendation: rosi > 0 ? 'Implement control' : 'Reconsider control'
    };
}

// Evaluates multiple security controls to find optimal solution
async function evaluateSecurityControls(threatId, assetValue, controls) {
    try {
        const results = [];
        
        for (const control of controls) {
            const alePrior = calculateALE(assetValue, control.riskBefore);
            const alePost = calculateALE(assetValue, control.riskAfter);
            
            results.push({
                controlName: control.name,
                ...calculateCBA(alePrior, alePost, control.annualCost),
                description: control.description
            });
        }
        
        // Sort by ROSI (Return on Security Investment)
        return results.sort((a, b) => b.rosi - a.rosi);
    } catch (error) {
        console.error('Error evaluating security controls:', error);
        throw error;
    }
}

// Example security controls for specific threat types
const securityControlsByThreatType = {
    'SQL Injection': [
        {
            name: 'Web Application Firewall',
            riskBefore: 0.3, // 30% chance per year
            riskAfter: 0.05, // 5% chance per year
            annualCost: 5000,
            description: 'Implement a WAF to filter malicious SQL queries'
        },
        {
            name: 'Parameterized Queries',
            riskBefore: 0.3,
            riskAfter: 0.02,
            annualCost: 8000,
            description: 'Refactor codebase to use parameterized queries and prevent SQL injection'
        }
    ],
    'Phishing': [
        {
            name: 'Email Filtering Service',
            riskBefore: 0.5,
            riskAfter: 0.2,
            annualCost: 3000,
            description: 'Implement advanced email filtering to block phishing attempts'
        },
        {
            name: 'Security Awareness Training',
            riskBefore: 0.5,
            riskAfter: 0.15,
            annualCost: 7500,
            description: 'Conduct regular security awareness training for all employees'
        }
    ],
    'DDoS Attack': [
        {
            name: 'DDoS Protection Service',
            riskBefore: 0.2,
            riskAfter: 0.05,
            annualCost: 12000,
            description: 'Subscribe to a cloud-based DDoS protection service'
        },
        {
            name: 'Load Balancer Implementation',
            riskBefore: 0.2,
            riskAfter: 0.1,
            annualCost: 9000,
            description: 'Implement load balancing to distribute traffic during attacks'
        }
    ]
};

// Get default controls for a threat if no custom controls provided
function getDefaultControls(threatType) {
    return securityControlsByThreatType[threatType] || [];
}

module.exports = {
    calculateALE,
    calculateCBA,
    evaluateSecurityControls,
    getDefaultControls
};