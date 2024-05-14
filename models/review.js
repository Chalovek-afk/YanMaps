import DataTypes from "sequelize";
import sequelize from "../config/db.js";

const Review = sequelize.define("review", {
    text: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mark: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
  });
  
  export default Review;