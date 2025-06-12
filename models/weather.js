// import axios from 'axios';
// router.get('/weather', async (req, res) => {
//   const { location } = req.query;
//   const response = await axios.get(
//     `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=YOUR_API_KEY`
//   );
//   res.json(response.data);
// });

export default (sequelize, DataTypes) => {
  const Weather = sequelize.define('Weather', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    farmerId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Farmers',
        key: 'id'
      }
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    temperature: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    humidity: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    windSpeed: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    conditions: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['location']
      },
      {
        fields: ['timestamp']
      },
      {
        fields: ['farmerId']
      }
    ]
  });

  return Weather;
};