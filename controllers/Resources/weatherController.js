import axios from 'axios';
import { validateLocation } from '../../utils/validators.js';
import SMSService from '../../utils/smsService.js';
import cache from '../../utils/cache.js';
import { query, getClient } from "../../config/database.js";

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_URL = process.env.WEATHER_API_URL;
const CLIMATE_API_URL = process.env.CLIMATE_API_URL;

/**
 * @desc Get weather forecast
 * @route GET /api/weather/forecast
 * @access Public
 */
const getCurrentWeather = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    // ✅ Log incoming query parameters
    console.log("📍 Latitude:", lat, "Longitude:", lon);

    // ✅ Validate presence
    if (!lat || !lon) {
      return res.status(400).json({ 
        success: false,
        error: "Latitude and longitude are required in query params" 
      });
    }

    // ✅ Convert and validate types
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    if (isNaN(latNum) || isNaN(lonNum)) {
      return res.status(400).json({ 
        success: false,
        error: "Latitude and longitude must be valid numbers" 
      });
    }

    // ✅ Check cache
    const cacheKey = `weather_${lat}_${lon}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log("✅ Serving from cache");
      return res.json({
        success: true,
        ...cached,
        cached: true
      });
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
    return res.json({
      success: true,
      ...weatherData,
      cached: false
    });
  } catch (error) {
    console.error("❌ Weather API error:", error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch weather data",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get climate change data
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

    res.json({
      success: true,
      data: formattedData,
      count: formattedData.length
    });
  } catch (error) {
    console.error('Climate change data error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch climate change data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getWeatherForecast = async (req, res) => {
  try {
    const { location, days = 3 } = req.query;
    
    // Validate input
    const { error } = validateLocation({ location });
    if (error) return res.status(400).json({ 
      success: false,
      error: error.details[0].message 
    });
    
    if (days > 7) return res.status(400).json({ 
      success: false,
      error: 'Maximum 7 day forecast' 
    });

    const cacheKey = `forecast_${location}_${days}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json({
      success: true,
      ...cachedData,
      cached: true
    });

    const response = await axios.get(`${WEATHER_API_URL}/forecast/daily`, {
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

    cache.set(cacheKey, forecast, 3600); // Cache for 1 hour
    
    res.json({
      success: true,
      forecast,
      location,
      days,
      cached: false
    });
  } catch (error) {
    console.error('Forecast error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch forecast',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
    if (error) return res.status(400).json({ 
      success: false,
      error: error.details[0].message 
    });

    const response = await axios.get(`${WEATHER_API_URL}/onecall`, {
      params: {
        lat: req.query.lat,
        lon: req.query.lon,
        exclude: 'current,minutely,hourly,daily',
        appid: WEATHER_API_KEY
      }
    });

    res.json({
      success: true,
      alerts: response.data.alerts || []
    });
  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch alerts',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc Subscribe to weather SMS alerts
 * @route POST /api/weather/subscribe
 * @access Private (Farmer)
 */
const subscribeToAlerts = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { phone, location } = req.body;
    
    // Validate input
    if (!phone || !location) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: 'Phone and location are required' 
      });
    }

    // Check if farmer exists (assuming req.user.id is set from auth middleware)
    if (!req.user || !req.user.id) {
      await client.query('ROLLBACK');
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }

    const farmerCheck = await client.query(
      'SELECT id FROM farmers WHERE id = $1',
      [req.user.id]
    );

    if (farmerCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false,
        error: 'Farmer not found' 
      });
    }

    // Save subscription to database using SQL
    const subscriptionResult = await client.query(
      `INSERT INTO weather_subscriptions (farmer_id, phone, location, is_active, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING id, farmer_id as "farmerId", phone, location, is_active as "isActive", created_at`,
      [req.user.id, phone, location, true]
    );

    // Send confirmation SMS
    await SMSService.sendSMS({
      to: phone,
      message: `You have subscribed to weather alerts for ${location}. Reply STOP to unsubscribe.`
    });

    await client.query('COMMIT');

    res.json({ 
      success: true,
      message: 'Subscription successful',
      subscription: subscriptionResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Subscription error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to subscribe',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
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
    
    if (!location || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false,
        error: 'Location, startDate, and endDate are required' 
      });
    }

    const historyResult = await query(
      `SELECT id, location, temperature, humidity, wind_speed as "windSpeed", 
              conditions, description, timestamp, created_at
       FROM weather_history 
       WHERE location = $1 AND timestamp BETWEEN $2 AND $3 
       ORDER BY timestamp ASC`,
      [location, new Date(startDate), new Date(endDate)]
    );

    res.json({
      success: true,
      history: historyResult.rows,
      count: historyResult.rows.length
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch history',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Additional useful functions

const getSubscriptionsByFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;

    const subscriptionsResult = await query(
      `SELECT id, phone, location, is_active as "isActive", created_at
       FROM weather_subscriptions 
       WHERE farmer_id = $1 
       ORDER BY created_at DESC`,
      [farmerId]
    );

    res.json({
      success: true,
      subscriptions: subscriptionsResult.rows,
      count: subscriptionsResult.rows.length
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch subscriptions',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const unsubscribeFromAlerts = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { subscriptionId } = req.params;

    // Check if subscription exists
    const subscriptionCheck = await client.query(
      'SELECT id FROM weather_subscriptions WHERE id = $1',
      [subscriptionId]
    );

    if (subscriptionCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false,
        error: 'Subscription not found' 
      });
    }

    // Unsubscribe by setting is_active to false
    await client.query(
      'UPDATE weather_subscriptions SET is_active = false, updated_at = NOW() WHERE id = $1',
      [subscriptionId]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Successfully unsubscribed from weather alerts'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Unsubscribe error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to unsubscribe',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

const saveWeatherData = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { location, temperature, humidity, windSpeed, conditions, description } = req.body;

    if (!location || temperature === undefined) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: 'Location and temperature are required' 
      });
    }

    const weatherResult = await client.query(
      `INSERT INTO weather_history (location, temperature, humidity, wind_speed, conditions, description, timestamp) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING id, location, temperature, humidity, wind_speed as "windSpeed", 
                conditions, description, timestamp`,
      [location, temperature, humidity, windSpeed, conditions, description]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Weather data saved successfully',
      weather: weatherResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving weather data:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to save weather data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

export {
  getCurrentWeather,
  getWeatherForecast,
  getWeatherAlerts,
  subscribeToAlerts,
  getWeatherHistory,
  getClimateChangeData,
  getSubscriptionsByFarmer,
  unsubscribeFromAlerts,
  saveWeatherData
};