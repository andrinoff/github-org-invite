// /api/add.js
import { Octokit } from '@octokit/rest';

// Initialize Octokit client. It's best practice to do this outside the handler
// so it can be reused across function invocations.
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// The main serverless function handler
export default async function handler(req, res) {
    // Set CORS headers to allow requests from any origin
    // In a production environment, you should restrict this to your frontend's domain
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Respond to preflight requests (sent by browsers for CORS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // We only want to handle POST requests for this function
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // --- Main Logic ---
    const orgName = process.env.GITHUB_ORG;
    const teamSlug = process.env.GITHUB_TEAM_SLUG;
    
    // Get the username from the request body
    const { github: username } = req.body;

    // Basic validation
    if (!username) {
        return res.status(400).json({ message: 'GitHub username is required.' });
    }

    if (!process.env.GITHUB_TOKEN || !orgName || !teamSlug) {
      console.error('Server configuration error: Missing environment variables.');
      return res.status(500).json({ message: 'Server configuration error.' });
    }

    console.log(`Attempting to add user '${username}' to team '${teamSlug}' in org '${orgName}'...`);

    try {
        // Use Octokit to add the user to the team
        await octokit.rest.teams.addOrUpdateMembershipForUserInOrg({
            org: orgName,
            team_slug: teamSlug,
            username: username,
            role: 'member',
        });

        // Send a success response
        return res.status(200).json({ message: `Invitation sent to ${username}. They should check their email.` });

    } catch (error) {
        console.error('GitHub API Error:', error);
        // Forward the status code from the GitHub API error, or default to 500
        const status = error.status || 500;
        return res.status(status).json({ message: `Failed to add user. GitHub API responded with: ${error.message}` });
    }
}
