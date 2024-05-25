import express from "express";
import { Op } from "sequelize";
import bodyParser from "body-parser";
import session from "express-session";
import { Liquid } from "liquidjs";
import sequelize from "./config/db.js";
import Markers from "./models/markers.js";
import Users from "./models/users.js";
import Review from "./models/review.js";
import "dotenv/config";

var engine = new Liquid();

const app = express();
const port = 3000;

app.engine("liquid", engine.express());
app.set("views", "./public/views");
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

app.get("/users", async (req, res) => {
  const user = await Users.findOne({ where: { username: req.session.user } });
  res.json(user);
});

app.put("/users", async (req, res) => {
  const user = await Users.findOne({
    where: { username: req.session.user },
  });
  user.fav = req.body;
  await user.save();
});

app.post("/get_rec", async (req, res) => {
  var paths;
  if (req.body.paths) paths = req.body.paths;
  {
    if (req.body.rates == "1") {
      var result = await Markers.findAll({
        where: { pathId: paths},
      });
    } else {
      var result = await Markers.findAll({
        where: { pathId: paths, review: { [Op.gte]: req.body.rates } },
      });
    }
  }

  res.json(result);
});

app.get("/profile", async (req, res) => {
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
        key: process.env.KEY,
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
    res.render("profile", model);
  });
});

app.get("/reviews", async (req, res) => {
  const markers = await Markers.findAll({
    where: {
      review: { [Op.not]: null },
    },
    include: {
      model: Review,
      where: {
        id: { [Op.not]: null },
      },
      order: [["createdAt", "ASC"]],
      include: {
        model: Users,
        where: { id: { [Op.not]: 0 } },
      },
    },
  });
  res.json(markers);
});

app.get("/my_reviews", async (req, res) => {
  console.log(req.session.user);
  const user = await Users.findOne({ where: { username: req.session.user } });
  const reviews = await Review.findAll({
    where: { userId: user.id },
    include: {
      model: Markers,
    },
  });
  res.json(reviews);
});

app.get("/coordinates", async (req, res) => {
  try {
    const user = await Users.findOne({
      where: { username: req.session.user },
    });
    try {
      const markers = await Markers.findAll({
        order: [
          ["id", "ASC"], // Замените 'propertyName' на свойство, по которому вы хотите отсортировать данные
        ],
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
        order: [
          ["id", "ASC"], // Замените 'propertyName' на свойство, по которому вы хотите отсортировать данные
        ],
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
  let model = {
    key: process.env.KEY,
  };
  res.render("login", model);
});

app.get("/logout", (req, res) => {
  delete req.session.user;
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
    model['userId'] = user.id + 7
    model["addr"] = user.geo;
    Review.findAll({
      attributes: [
        "markerId", // Поле, по которому группируем
        [sequelize.fn("AVG", sequelize.col("mark")), "averageRating"], // Вычисляем среднюю оценку
      ],
      group: ["markerId"],
    }).then((averages) => {
      // Обновляем записи в таблице точек с средними оценками
      averages.forEach((average) => {
        Markers.update(
          { review: average.dataValues.averageRating },
          { where: { id: average.dataValues.markerId } }
        );
      });
    });
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

app.post("/markers", async (req, res) => {
  const user = Users.findOne({ where: { username: req.session.user } })
    .then((res) => {
      const usId = res.id;
      if (req.body.isPrivate === "1") {
        Markers.create({
          ltd: req.body.ltd,
          lng: req.body.lng,
          pathId: usId + 7,
          userId: usId,
          desc: req.body.desc,
          address: req.body.addr,
          isPrivate: true,
          rating: 0,
        });
      } else {
        Markers.create({
          ltd: req.body.ltd,
          lng: req.body.lng,
          pathId: 7,
          userId: usId,
          desc: req.body.desc,
          address: req.body.addr,
          isPrivate: false,
          rating: 0,
        });
      }
    })
    .catch((err) => console.log(err));
  res.redirect("/");
});

app.post("/review", async (req, res) => {
  const rev = await Review.findAll().then((result) => {
    const user = Users.findOne({ where: { username: req.session.user } }).then(
      (us) => {
        var flag = result.every((revi) => {
          if (
            revi.markerId === req.body.markerId &&
            revi.userId === us.dataValues.id
          ) {
            return false;
          } else {
            return true;
          }
        });
        if (flag) {
          Review.create({
            mark: req.body.mark,
            text: req.body.text,
            markerId: req.body.markerId,
            userId: us.dataValues.id,
          });
        }
      }
    );
  });
  res.redirect("/");
});

sequelize.sync();

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
