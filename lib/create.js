const path = require('path');
const fs = require('fs-extra');
const { execa } = require('execa');

async function createFullstackApp(appName, backendChoice) {
  const appDir = path.join(process.cwd(), appName);
  const frontendDir = path.join(appDir, 'frontend');
  const backendDir = path.join(appDir, 'backend');
  await fs.mkdirp(appDir);
  console.log(`🚀 Creating frontend (Next.js)...`);
  await execa('npx', ['create-next-app@latest', 'frontend'], { cwd: appDir, stdio: 'inherit' });

  console.log(`🔧 Setting up backend (${backendChoice})...`);
  fs.mkdirSync(backendDir, { recursive: true });

  // Copy template based on backend
  const templateDir = path.join(__dirname, '../templates/', backendChoice.toLowerCase());
  await fs.copy(templateDir, backendDir);

  console.log(`✅ Fullstack app created at ${appDir}`);
}

module.exports = { createFullstackApp };
