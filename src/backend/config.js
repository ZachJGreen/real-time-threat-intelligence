require('dotenv').config();

module.exports = {
    SHODAN_API_KEY: process.env.SHODAN_API_KEY,
    githubToken: process.env.GITHUB_TOKEN,
    githubRepo: process.env.GITHUB_REPO,
};