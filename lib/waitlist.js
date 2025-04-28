export function randomWaitlistMessage() {
    const messages = [
      "🚧 Our AI brain is still warming up. Stay tuned for magic!",
      "👷‍♂️ Building something awesome takes time. Sit tight!",
      "🛠️ Laying the foundation for AI-powered setups. Coming soon!",
      "🚀 Our custom AI feature is in the hangar. Launching shortly!",
      "💡 Good things take time. Check our docs while we build!"
    ];
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  }
  