const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const coordinates = require("./coordinates.js");

const app = express();
const port = 3000;

app.use(express.static("public"));

const sequelize = new Sequelize({
  dialect: "postgres",
  database: "ymaps",
  user: "alexey",
  password: "NbGfYt642",
  host: "localhost",
  port: 5432,
  ssl: true,
  clientMinMessages: "notice",
});

const Markers = sequelize.define("markers", {
  ltd: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  lng: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  desc: {
    type: DataTypes.STRING,
  },
  pathId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

const Users = sequelize.define("users", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: false,
  },
  geo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

Users.hasMany(Markers, { onDelete: "cascade" });

app.get("/coordinates", async (req, res) => {
  try {
    const markers = await Markers.findAll();
    res.json(markers);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.get("/", async (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

sequelize.sync();

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
