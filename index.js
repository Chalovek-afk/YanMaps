const express = require('express');
const { Sequelize, DataTypes} = require('sequelize');
const coordinates = require('./coordinates.js')

const app = express();
const port = 3000;


const sequelize = new Sequelize({
    dialect: 'postgres',
    database: 'ymaps',
    user: 'postgres',
    password: 'NbGfYt642',
    host: 'localhost',
    port: 5432,
    ssl: true,
    clientMinMessages: 'notice',
  });

// const sequelize = new Sequelize('postgres://postgres:NbGfYt642@localhost:5432/ymaps')

const Marker = sequelize.define('Marker', {
    lng: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    ltd: {
        type: DataTypes.FLOAT,
      allowNull: false,
      
    },
    desc: {
        type: DataTypes.STRING
    }
  });
  
const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: false
    },
    geo: {
        type: DataTypes.STRING,
        allowNull: true,
    }
  });

  User.hasMany(Marker, { onDelete: "cascade" }); 



app.get('/coordinates', (req, res) => {
    res.json(coordinates);
});


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});





sequelize.sync();

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})