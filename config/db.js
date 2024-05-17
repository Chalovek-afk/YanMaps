import Sequelize from 'sequelize'
import 'dotenv/config'
const sequelize = new Sequelize({
  dialect: "postgres",
  database: "ymaps",
  user: "alexey",
  password: process.env.DB,
  host: "localhost",
  port: 5432,
  ssl: true,
  clientMinMessages: "notice",
});


export default sequelize;