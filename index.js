const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const { Op } = require("sequelize");
const bodyParser = require("body-parser");
const coordinates = require("./coordinates.js");
const session = require("express-session");
var { Liquid } = require("liquidjs");
var engine = new Liquid();

const app = express();
const port = 3000;

app.engine("liquid", engine.express());
app.set("views", "./public");
app.set("view engine", "liquid");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);

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

const Rating = sequelize.define("rating", {
  mark: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      max: 5,
      min: 1,
    },
  },
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
  rating: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});

const Users = sequelize.define("users", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
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
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  surname: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isSuper: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

Users.hasMany(Markers, { onDelete: "cascade" });
Markers.belongsTo(Users);
Markers.hasMany(Rating, { onDelete: "cascade", foreignKey: Markers.rating });
Rating.belongsTo(Markers);

Rating.findAll({
  attributes: [
    "markerId", // Поле, по которому группируем
    [sequelize.fn("AVG", sequelize.col("mark")), "averageRating"], // Вычисляем среднюю оценку
  ],
  group: ["markerId"],
}).then((averages) => {
  // Обновляем записи в таблице точек с средними оценками
  averages.forEach((average) => {
    Markers.update(
      { rating: average.dataValues.averageRating },
      { where: { id: average.dataValues.markerId } }
    );
  });
});

app.get("/coordinates", async (req, res) => {
  try {
    const user = await Users.findOne({
      where: { username: req.session.user },
    });
    try {
      const markers = await Markers.findAll({
        where: {
          [Op.or]: [
            { [Op.and]: [{ userId: user.id }, { isPrivate: true }] },
            { isPrivate: false },
          ],
        },
      });
      res.json(markers);
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  } catch {
    try {
      const markers = await Markers.findAll({
        where: {
          isPrivate: false,
        },
      });
      res.json(markers);
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  }
});

function auth(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect("login");
  }
}

app.use((req, res, next) => {
  if (req.session.user) {
    req.user = {
      id: req.session.user,
    };
  }
  next();
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  req.session.user = "";
  res.redirect("/login");
});

app.post("/login", async (req, res) => {
  const user = await Users.findOne({ where: { username: req.body.username } });
  if (
    user.username == req.body.username &&
    user.password == req.body.password
  ) {
    req.session.user = user.username;
    res.redirect("/");
    return;
  }
  res.redirect("/login");
});

app.get("/", auth, async (req, res) => {
  await Users.findOne({
    where: {
      username: req.session.user,
    },
  }).then((user) => {
    var model;
    if (user.name && user.surname) {
      model = {
        name: user.name,
        surname: user.surname,
      };
    } else if (user.name) {
      model = {
        name: user.name,
      };
    } else {
      model = {
        name: user.username,
      };
    }
    model["addr"] = user.geo;
    res.render("index", model);
  });
});

app.get("/reg", (req, res) => {
  res.render("reg");
});

app.get("/upd", (req, res) => {
  res.render("upd");
});

app.post("/upd", async (req, res) => {
  const user = await Users.findOne({ where: { username: req.session.user } });
  if (req.body.name) user.name = req.body.name;
  if (req.body.surname) user.surname = req.body.surname;
  if (req.body.addr) user.geo = req.body.addr;
  await user.save();
  res.redirect("/");
});

app.post("/reg", async (req, res) => {
  if (await Users.findOne({ where: { username: req.body.username } })) {
    const model = {
      e: "Такой пользователь уже существует",
    };
    res.render("reg", model);
    return;
  }
  const user = new Users();
  user.username = req.body.username;
  user.password = req.body.password;
  user.isSuper = false;
  await user.save();
  res.redirect("/");
});

app.post("/create", async (req, res) => {
  const user = Users.findOne({ where: { username: req.session.user } })
    .then((res) => {
      const usId = res.id;
      if (req.body.isPrivate === "1") {
        Markers.create({
          ltd: req.body.ltd,
          lng: req.body.lng,
          pathId: usId + 4,
          userId: usId,
          desc: req.body.desc,
          address: req.body.addr,
          isPrivate: true,
          rating: 0,
        });
      }
    })
    .catch((err) => console.log(err));
  res.redirect("/");
});

sequelize.sync();

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
