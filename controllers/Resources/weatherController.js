import axios from 'axios';
// import { Weather, WeatherSubscription } from '../../models/index.js';
import { validateLocation } from '../../utils/validators.js';
import SMSService from '../../utils/smsService.js';
import cache from '../../utils/cache.js';
import { Op } from 'sequelize';

/**
 * @desc Get weather forecast
 * @route GET /api/weather/forecast
 * @access Public
 */

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_URL = process.env.WEATHER_API_URL;
const CLIMATE_API_URL = process.env.CLIMATE_API_URL;


const getCurrentWeather = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    // ✅ Log incoming query parameters
    console.log("📍 Latitude:", lat, "Longitude:", lon);

    // ✅ Validate presence
    if (!lat || !lon) {
      return res.status(400).json({ error: "Latitude and longitude are required in query params" });
    }

    // ✅ Convert and validate types
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    if (isNaN(latNum) || isNaN(lonNum)) {
      return res.status(400).json({ error: "Latitude and longitude must be valid numbers" });
    }

    // ✅ Check cache
    const cacheKey = `weather_${lat}_${lon}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log("✅ Serving from cache");
      return res.json(cached);
    }

    // ✅ Make API request to OpenWeather
    const response = await axios.get(WEATHER_API_URL, {
      params: {
        lat: latNum,
        lon: lonNum,
        appid: WEATHER_API_KEY,
        units: 'metric',
      },
    });

    const data = response.data;

    // ✅ Build weather data
    const weatherData = {
      location: data.name || "Unknown",
      temperature: data.main?.temp,
      humidity: data.main?.humidity,
      windSpeed: data.wind?.speed,
      conditions: data.weather?.[0]?.main,
      description: data.weather?.[0]?.description,
      icon: `https://openweathermap.org/img/wn/${data.weather?.[0]?.icon}@2x.png`,
      timestamp: new Date(data.dt * 1000),
    };

    // ✅ Cache and return
    cache.set(cacheKey, weatherData, 1800); // 30 min
    console.log("🆕 New weather data cached");
    // ✅ Return response
    console.log("🌤️ Current weather data:", weatherData);
    return res.json(weatherData);
  } catch (error) {
    console.error("❌ Weather API error:", error?.response?.data || error.message);
    return res.status(500).json({
      error: "Failed to fetch weather data",
      details: error?.message,
    });
  }
};

//get climate change data
const getClimateChangeData = async (req, res) => {
  try {
    // Placeholder for climate change data retrieval logic
    // This could involve fetching from a different API or database
   const response = await axios.get(CLIMATE_API_URL);
   const climateData = response.data;

        // Process and format the data as needed
        const formattedData = climateData.map(item => ({
          date: item.date,
          temperature: item.temperature,
          co2Levels: item.co2Levels,
          seaLevelRise: item.seaLevelRise,
          description: item.description
        }));

        // Cache the data if needed
        cache.set('climate_change_data', formattedData, 3600); // Cache for 1 hour

        res.json(formattedData);
  } catch (error) {
    console.error('Climate change data error:', error);
    res.status(500).json({ error: 'Failed to fetch climate change data' });
  }
};

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

    const response = await get(`${WEATHER_API_URL}/forecast/daily`, {
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
  getWeatherHistory,
  getClimateChangeData
};