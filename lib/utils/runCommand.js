import chalk from 'chalk';
import { execaCommand } from 'execa';

export async function runCommand(command, options = {}) {
  const finalOptions = { stdio: 'inherit', shell: true, ...options };
  console.log(chalk.gray(`→ Executing: ${command}`));
  try {
    const result = await execaCommand(command, finalOptions);
    console.log(chalk.green(`✅ Finished: ${command}`));
    return result;
  } catch (error) {
    console.error(chalk.red(`❌ Failed: ${command}`));
    throw error;
  }
}
