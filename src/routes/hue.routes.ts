import { Router, Request, Response } from 'express';
import { PhilipsHueService } from '../services/philips-hue.service';

const router = Router();
const hueService = PhilipsHueService.getInstance();

// Discover bridge
router.get('/bridge/discover', async (_req: Request, res: Response) => {
  try {
    const bridgeIp = await hueService.getBridgeIp();
    res.json({ success: true, bridgeIp });
  } catch (error) {
    console.error('Error discovering bridge:', error);
    res.status(500).json({ error: 'Failed to discover Hue bridge' });
  }
});

// Create user (link button must be pressed first)
router.post('/bridge/link', async (_req: Request, res: Response) => {
  try {
    const username = await hueService.createUser();
    res.json({ 
      success: true, 
      username,
      message: 'Successfully linked with Hue bridge. Save these credentials in your .env file:',
      env: {
        PHILIPS_HUE_USERNAME: username,
        PHILIPS_HUE_BRIDGE_IP: await hueService.getBridgeIp()
      }
    });
  } catch (error: any) {
    const message = error.message || 'Failed to link with Hue bridge';
    if (message.includes('link button not pressed')) {
      res.status(400).json({ 
        error: 'Please press the link button on your Hue bridge first',
        details: message
      });
    } else {
      res.status(500).json({ error: message });
    }
  }
});

// Test connection
router.get('/test', async (_req: Request, res: Response) => {
  try {
    const lights = await hueService.getAllLights();
    res.json({ 
      success: true, 
      message: 'Successfully connected to Hue bridge',
      lights 
    });
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({ error: 'Failed to connect to Hue bridge' });
  }
});

export default router;
