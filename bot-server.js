
/**
 * This is a simple startup script for the bot server
 * It simply imports and runs the actual server from its location in the src directory
 */

// Set the current working directory to the directory of this script
process.chdir(__dirname);

console.log('Starting bot server...');

try {
  // Import the bot server from the correct location
  require('./src/server-bot/bot-server.js');
  console.log('Bot server started successfully');
  console.log(`Server is running at http://localhost:${process.env.PORT || process.env.SERVER_PORT || 5000}/api/status`);
} catch (error) {
  console.error('Failed to start bot server:', error.message);
  console.error('Stack trace:', error.stack);
  
  // Provide helpful debugging information
  console.log('\nTroubleshooting tips:');
  console.log('1. Make sure all dependencies are installed (npm install)');
  console.log('2. Check if the server file exists at: ./src/server-bot/bot-server.js');
  console.log('3. Set the SERVER_PORT environment variable if port 5000 is in use');
  console.log('4. Check if TELEGRAM_BOT_TOKEN is set (optional for Telegram functionality)\n');
  
  // Exit with error code
  process.exit(1);
}
