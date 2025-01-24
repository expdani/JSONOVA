# JSONOVA (JSON-Oriented Virtual Assistant)

A smart integration platform that combines Philips Hue, Google services (Gmail and Calendar), and AI capabilities through a JSON-based communication.

## Requirements

- Node.js (v22)
- yarn package manager
  
## Requirements for integrations

- Philips Hue Bridge on your local network 
- Google Cloud Platform account

## Installation

1. Clone the repository
2. Install dependencies:
```bash
yarn install
```

3. Create a `.env` file in the project root with the following variables:
```env
PORT=3000                         # Backend server port
CLIENT_URL=http://localhost:3000  # Frontend URL
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
PHILIPS_HUE_BRIDGE_IP=           # Will be discovered automatically
PHILIPS_HUE_USERNAME=            # Will be generated during setup
```

## Setup Process

### 1. Start the Server
```bash
yarn build
yarn start
```
The server will start on port 3000 (HTTP) and 3001 (WebSocket).

### 2. Google Authentication Setup

1. Visit `http://localhost:3000/auth/google` in your browser
2. Complete the Google OAuth flow
3. After successful authentication, you'll be redirected back to the application
4. The Google tokens will be automatically stored in cookies

### 3. Philips Hue Setup

1. Ensure your Hue Bridge is connected to your local network
2. Make API calls in the following order:

   a. Discover Bridge:
   ```
   GET http://localhost:3000/hue/bridge/discover
   ```
   This will return your bridge's IP address.

   b. Link with Bridge:
   1. Press the physical link button on your Hue Bridge
   2. Within 30 seconds, make this API call:
   ```
   POST http://localhost:3000/hue/bridge/link
   ```
   3. The response will include your `username` and `bridge_ip`. Add these to your `.env` file.

   c. Test Connection:
   ```
   GET http://localhost:3000/hue/test
   ```
   This will return a list of your Hue lights if everything is set up correctly.