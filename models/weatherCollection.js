import axios from 'axios';
router.get('/weather', async (req, res) => {
  const { location } = req.query;
  const response = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=YOUR_API_KEY`
  );
  res.json(response.data);
});