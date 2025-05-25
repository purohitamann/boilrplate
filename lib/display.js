import chalk from 'chalk';
import ora from 'ora';
import figlet from 'figlet';
import gradient from 'gradient-string';
import { setTimeout } from 'timers/promises';

/**
 * Displays a welcome banner with ASCII art and gradient colors
 */
export async function displayWelcomeBanner() {
  console.clear();
  
  // Display ASCII art banner with gradient colors
  console.log('\n');
  const text = figlet.textSync('boilrplate', { 
    font: 'Standard', 
    horizontalLayout: 'full' 
  });
  const coloredText = gradient(['#11998e', '#38ef7d']).multiline(text);
  console.log(coloredText);
  
  console.log('\n');
  console.log(gradient(['#11998e', '#38ef7d'])('  The modern fullstack project generator'));
  console.log('\n');
  
  // Small delay for visual effect
  await setTimeout(500);
}

/**
 * Creates and returns a spinner with a consistent style
 * @param {string} text - The text to display next to the spinner
 * @returns {object} - An ora spinner instance
 */
export function createSpinner(text) {
  return ora({
    text,
    color: 'cyan',
    spinner: 'dots'
  });
}

/**
 * Displays a completion animation when project scaffolding is done
 * @param {string} appName - Name of the created application
 */
export async function displayCompletionAnimation(appName) {
  const frames = ['🚀 ', '🚀 .', '🚀 ..', '🚀 ...', '🚀 ....'];
  
  const spinner = ora({
    text: 'Finalizing project...',
    spinner: {
      frames,
      interval: 120,
    },
    color: 'green'
  }).start();
  
  await setTimeout(1500);
  spinner.succeed('Project successfully created!');
  
  console.log('\n');
  console.log(gradient(['#11998e', '#38ef7d']).multiline(figlet.textSync('Done!', { 
    font: 'Speed',
    horizontalLayout: 'fitted',
  })));
  
  console.log('\n');
  console.log(chalk.cyan(`Next Steps:`));
  console.log(chalk.white(`  cd ${appName} && code .`));
  console.log('\n');
}

/**
 * Displays AI analysis steps with animated spinners
 * @param {object} config - Configuration object from AI
 */
export async function displayAIAnalysis(config) {
  console.log('\n');
  console.log(chalk.bgCyan.black(' AI INTERPRETATION '));
  
  // Create a blinking effect for the selected frameworks
  const spinner = ora({
    text: 'Analyzing...',
    spinner: 'dots',
    color: 'cyan'
  }).start();
  
  await setTimeout(800);
  spinner.stop();
  
  // Display interpretation with highlighting
  console.log(chalk.cyan('Frontend: ') + chalk.white(config.frontend || 'Not specified'));
  console.log(chalk.cyan('Backend: ') + chalk.white(config.backend || 'Not specified'));
  console.log(chalk.cyan('Database: ') + chalk.white(config.database || 'Not specified'));
  console.log('\n');
  
  // Brief delay for readability
  await setTimeout(500);
}

/**
 * Displays an error message with formatting
 * @param {string} message - Error message to display
 */
export function displayError(message) {
  console.log('\n');
  console.log(chalk.bgRed.white(' ERROR '));
  console.log(chalk.red(message));
  console.log('\n');
  console.log(chalk.yellow('For help, visit: https://heyboilrplate.com/docs'));
  console.log('\n');
}