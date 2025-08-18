import chalk from 'chalk';
import { trackUsage } from './analytics.js';

/**
 * Track template creation analytics.
 * @param {string} framework - Framework stack.
 * @param {string} type - Type of project.
 */
export async function trackTemplate(framework, type) {
  try {
    await trackUsage('template_created', {
      stack: framework,
      type: type,
    });
  } catch (err) {
    console.error(chalk.red(`ERROR: Failed to track usage analytics`));
    console.error(chalk.red(`Details: ${err.message}`));
  }
}
