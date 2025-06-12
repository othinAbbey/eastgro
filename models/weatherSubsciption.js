const WeatherSubscription = (sequelize, DataTypes) => {
    const WeatherSubscription = sequelize.define('WeatherSubscription', {
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
      phone: {
        type: DataTypes.STRING,
        allowNull: false
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    });
  
    return WeatherSubscription;
  };

  export default WeatherSubscription;