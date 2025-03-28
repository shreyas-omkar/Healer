import express from 'express';
import { WebhookEvent } from '../types';
import logger from '../utils/logger';

const router = express.Router();

/**
 * GitHub webhook handler
 * This endpoint receives GitHub webhook events for processing
 */
router.post('/', async (req, res) => {
  try {
    const event: WebhookEvent = req.body;
    
    // Log the webhook event
    logger.info(`Received webhook event: ${JSON.stringify(event, null, 2)}`);
    
    // Process based on webhook event type
    if (event.action === 'opened' && event.pull_request) {
      // Handle PR opened event
      const prNumber = event.pull_request.number;
      const repoName = event.repository?.name;
      const owner = event.repository?.owner.login;
      
      logger.info(`Processing PR #${prNumber} from ${owner}/${repoName}`);
      
      // In a real implementation, this would trigger code analysis
      // on the PR code and post comments with suggestions
      
      // Respond with success
      return res.status(200).json({
        status: 'success',
        message: `Processing PR #${prNumber}`,
        pr: {
          number: prNumber,
          url: event.pull_request.html_url
        }
      });
    }
    
    // Default response for other webhook events
    return res.status(200).json({
      status: 'success',
      message: 'Webhook received but no action taken'
    });
    
  } catch (error) {
    logger.error('Error processing webhook:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process webhook'
    });
  }
});

export default router; 