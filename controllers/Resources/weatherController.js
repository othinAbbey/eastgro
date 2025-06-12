import axios from 'axios';
// import { Weather, WeatherSubscription } from '../../models/index.js';
import { validateLocation } from '../../utils/validators.js';
import SMSService from '../../utils/smsService.js';
import cache from '../../utils/cache.js';
import { Op } from 'sequelize';

// Weather API configuration
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'your_api_key';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * @desc Get current weather for a location
 * @route GET /api/weather/current
 * @access Public
 */
// const getCurrentWeather = async (req, res) => {
//   try {
//     const { location } = req.query;
    
//     // Validate location input
//     const validationResult = validateLocation({ location });
//     if (validationResult.error) {
//       return res.status(400).json({ 
//         error: validationResult.error.details[0].message 
//       });
//     }

//     // Check cache first
//     const cacheKey = `weather_${location}`;
//     const cachedData = cache.get(cacheKey);
//     if (cachedData) {
//       return res.json(cachedData);
//     }

//     // Fetch from weather API
//     const response = await axios.get(`${WEATHER_BASE_URL}/weather`, {
//       params: {
//         q: location,
//         appid: WEATHER_API_KEY,
//         units: 'metric'
//       }
//     });

//     // Transform data to our format
//     const weatherData = {
//       location: response.data.name,
//       temperature: response.data.main.temp,
//       humidity: response.data.main.humidity,
//       windSpeed: response.data.wind.speed,
//       conditions: response.data.weather[0].main,
//       description: response.data.weather[0].description,
//       icon: `https://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png`,
//       timestamp: new Date(response.data.dt * 1000)
//     };

//     // Cache for 30 minutes
//     cache.set(cacheKey, weatherData, 1800);

//     // Save to database
//     // await Weather.create({
//     //   farmerId: req.user?.id,
//     //   location,
//     //   ...weatherData
//     // });

//     res.json(weatherData);
//   } catch (error) {
//     console.error('Weather API error:', error);
    
//     // Try to get last known weather if API fails
//     // try {
//     //   const lastWeather = await Weather.findOne({ 
//     //     where: { location: req.query.location },
//     //     order: [['createdAt', 'DESC']]
//     //   });
      
//     //   if (lastWeather) {
//     //     return res.json(lastWeather);
//     //   }
//     // } catch (dbError) {
//     //   console.error('Database fallback error:', dbError);
//     // }

//     // res.status(500).json({ 
//     //   error: 'Failed to fetch weather data',
//     //   details: error.message 
//     // });
//   }
// };

// const axios = require('axios');
// const NodeCache = require('node-cache');
// const cache = new NodeCache();

const getCurrentWeather = async (req, res) => {
  try {
    let { location, lat, lon } = req.query;

    // If location not given, try to reverse geocode using coordinates
    if (!location && lat && lon) {
      const geoRes = await axios.get(`http://api.openweathermap.org/geo/1.0/reverse`, {
        params: {
          lat,
          lon,
          limit: 1,
          appid: WEATHER_API_KEY
        }
      });

      if (geoRes.data && geoRes.data.length > 0) {
        location = geoRes.data[0].name;
      } else {
        return res.status(400).json({ error: 'Failed to reverse geocode coordinates.' });
      }
    }

    // Validate location (now guaranteed to be present or we return early)
    const validationResult = validateLocation({ location });
    if (validationResult.error) {
      return res.status(400).json({ 
        error: validationResult.error.details[0].message 
      });
    }

    // Check cache first
    const cacheKey = `weather_${location}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Fetch weather
    const response = await axios.get(`${WEATHER_BASE_URL}/weather`, {
      params: {
        q: location,
        appid: WEATHER_API_KEY,
        units: 'metric'
      }
    });

    const weatherData = {
      location: response.data.name,
      temperature: response.data.main.temp,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      conditions: response.data.weather[0].main,
      description: response.data.weather[0].description,
      icon: `https://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png`,
      timestamp: new Date(response.data.dt * 1000)
    };

    // Cache for 30 mins
    cache.set(cacheKey, weatherData, 1800);

    // Optional DB save
    // await Weather.create({
    //   farmerId: req.user?.id,
    //   location,
    //   ...weatherData
    // });

    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error.message);

    // Optional fallback to latest from DB
    // try {
    //   const lastWeather = await Weather.findOne({ 
    //     where: { location: req.query.location },
    //     order: [['createdAt', 'DESC']]
    //   });
    //   if (lastWeather) {
    //     return res.json(lastWeather);
    //   }
    // } catch (dbError) {
    //   console.error('DB fallback failed:', dbError.message);
    // }

    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      details: error.message 
    });
  }
};

// [Keep other functions unchanged...]


/**
 * @desc Get weather forecast
 * @route GET /api/weather/forecast
 * @access Public
 */
const getWeatherForecast = async (req, res) => {
  try {
    const { location, days = 3 } = req.query;
    
    // Validate input
    const { error } = validateLocation({ location });
    if (error) return res.status(400).json({ error: error.details[0].message });
    if (days > 7) return res.status(400).json({ error: 'Maximum 7 day forecast' });

    const cacheKey = `forecast_${location}_${days}`;
    const cachedData = _get(cacheKey);
    if (cachedData) return res.json(cachedData);

    const response = await get(`${WEATHER_BASE_URL}/forecast/daily`, {
      params: {
        q: location,
        cnt: days,
        appid: WEATHER_API_KEY,
        units: 'metric'
      }
    });

    const forecast = response.data.list.map(day => ({
      date: new Date(day.dt * 1000),
      temp: {
        day: day.temp.day,
        min: day.temp.min,
        max: day.temp.max
      },
      humidity: day.humidity,
      conditions: day.weather[0].main,
      description: day.weather[0].description,
      icon: day.weather[0].icon
    }));

    set(cacheKey, forecast, 3600); // Cache for 1 hour
    res.json(forecast);
  } catch (error) {
    console.error('Forecast error:', error);
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
};

/**
 * @desc Get weather alerts for a location
 * @route GET /api/weather/alerts
 * @access Public
 */
const getWeatherAlerts = async (req, res) => {
  try {
    const { location } = req.query;
    const { error } = validateLocation({ location });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const response = await get(`${WEATHER_BASE_URL}/onecall`, {
      params: {
        lat: req.query.lat,
        lon: req.query.lon,
        exclude: 'current,minutely,hourly,daily',
        appid: WEATHER_API_KEY
      }
    });

    res.json(response.data.alerts || []);
  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
};

/**
 * @desc Subscribe to weather SMS alerts
 * @route POST /api/weather/subscribe
 * @access Private (Farmer)
 */
const subscribeToAlerts = async (req, res) => {
  try {
    const { phone, location } = req.body;
    
    // Validate input
    if (!phone || !location) {
      return res.status(400).json({ error: 'Phone and location are required' });
    }

    // Save subscription to database
    await WeatherSubscription.create({
      farmerId: req.user.id,
      phone,
      location,
      isActive: true
    });

    // Send confirmation SMS
    await SMSService.sendSMS({
      to: phone,
      message: `You have subscribed to weather alerts for ${location}. Reply STOP to unsubscribe.`
    });

    res.json({ message: 'Subscription successful' });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
};

/**
 * @desc Get historical weather data
 * @route GET /api/weather/history
 * @access Private (Farmer)
 */
const getWeatherHistory = async (req, res) => {
  try {
    const { location, startDate, endDate } = req.query;
    
    const history = await Weather.findAll({
      where: {
        location,
        timestamp: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      },
      order: [['timestamp', 'ASC']]
    });

    res.json(history);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};


export {
  getCurrentWeather,
  getWeatherForecast,
  getWeatherAlerts,
  subscribeToAlerts,
  getWeatherHistory
};