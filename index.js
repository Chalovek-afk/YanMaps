const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
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
});

Users.hasMany(Markers, { onDelete: "cascade" });

app.get("/coordinates", async (req, res) => {
  try {
    const user = await Users.findOne({
      where: { username: req.body.username },
    });
    try {
      const markers = await Markers.findAll({
        where: {
          pathId: [1, 2, 3, user.id + 2],
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
          pathId: [1, 2, 3],
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
      id : req.session.user,
    }
  }
  next()
})


app.get("/login", (req, res) => {
  res.render("login");
});

app.get('/logout', (req, res) => {
  req.session.user = '';
  res.redirect('/login')
});

app.post('/login', async (req, res) => {
  const user = await Users.findOne({where : {username: req.body.username}})
  if (user.username == req.body.username && user.password == req.body.password){
    req.session.user = user.username;
    res.redirect('/')
    return
  }
  res.redirect('/login')
});


app.get("/", auth, async (req, res) => {
  await Users.findOne({where: {
    username: req.session.user
  }}).then(user => {
    const model = {
      username: user.username,
    }
    res.render("index", model);
  });
});

app.get("/reg", (req, res) => {
  res.render("reg");
});

app.post("/reg", async (req, res) => {
  if (await Users.findOne({where: {username: req.body.username}})) {
    const model = {
      e: 'Такой пользователь уже существует'
    }
    res.render('reg', model)
    return
  }
  const user = new Users();
  user.username = req.body.username;
  user.password = req.body.password;
  await user.save();
  res.redirect("/");
});

sequelize.sync();

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
