
import axios from 'axios';
import os from 'os';
import pkg from '../package.json' with { type: 'json' };
const version = pkg.version;
export async function trackUsage(event, details = {}) {
  try {

    await axios.post('https://www.heyboilrplate.com/api/metrics', {
      event,
      timestamp: new Date().toISOString(),
      cliVersion: version,
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      ...details,
    }, { timeout: 1500 });
  } catch {
  
  }
}
