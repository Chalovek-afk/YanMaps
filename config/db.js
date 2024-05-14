import Sequelize from 'sequelize'

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


export default sequelize;