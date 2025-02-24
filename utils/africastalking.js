import dotenv from 'dotenv';
dotenv.config();
import africastalking from 'africastalking';

const africasTalking = africastalking({
  apiKey: process.env.AT_API_KEY, // Your Africa's Talking API key
  username: process.env.AT_USERNAME, // Your Africa's Talking username
});

export default africasTalking;
