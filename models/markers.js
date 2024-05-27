import DataTypes from "sequelize";
import sequelize from "../config/db.js";
import Review from "./review.js";

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
  review: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  fullDesc: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  schedule: {
    type: DataTypes.STRING,
    allowNull: true,
  }
});


Markers.hasMany(Review, { onDelete: "cascade", foreignKey: Markers.review });
Review.belongsTo(Markers);

export default Markers;
