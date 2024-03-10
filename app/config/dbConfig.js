const { Sequelize } = require("sequelize")

const sequelize = new Sequelize("ws", "root", "", {
	host: "localhost",
	dialect: "mysql",
})

module.exports = sequelize
