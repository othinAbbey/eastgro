import { Router } from 'express';
const router = Router();
import { getCurrentWeather, getWeatherForecast, getWeatherAlerts, subscribeToAlerts, getWeatherHistory } from '../controllers/Resources/weatherController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

// Public routes
router.get('/current', getCurrentWeather);
router.get('/forecast', getWeatherForecast);
router.get('/alerts', getWeatherAlerts);

// Protected routes (require farmer authentication)
// router.use(authenticateUser);
router.post('/subscribe',authenticateUser , subscribeToAlerts);
router.get('/history', authenticateUser ,getWeatherHistory);

export default router;