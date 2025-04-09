const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function copyTemplate(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  fs.readdirSync(srcDir).forEach(file => {
    const src = path.join(srcDir, file);
    const dest = path.join(destDir, file);

    if (fs.lstatSync(src).isDirectory()) {
      copyTemplate(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  });
}

function generateBoilerplate([stack = "menn"]) {
  const templatePath = path.join(__dirname, '../templates', stack);
//   const destPath = path.resolve(process.cwd(), stack + '-app');
const destPath = path.resolve(process.cwd())

  if (!fs.existsSync(templatePath)) {
    console.error(`❌ Stack "${stack}" is not supported.`);
    return;
  }

  console.log(`🚧 Creating ${stack.toUpperCase()} boilerplate...`);
  copyTemplate(templatePath, destPath);
  console.log(`✅ Done! Your ${stack} app is ready at ${destPath}`);
}

module.exports = { generateBoilerplate };
