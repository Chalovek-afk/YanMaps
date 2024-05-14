import DataTypes from "sequelize";
import sequelize from "../config/db.js";
import Markers from "./markers.js";
import Review from "./review.js";

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
Users.hasMany(Review, { onDelete: "cascade"});
Review.belongsTo(Users);

export default Users;
