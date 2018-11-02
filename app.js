const fs = require('fs');
const Sequelize = require("sequelize");

const dbconf = JSON.parse(fs.readFileSync('config.json', 'utf8')).database;
const sequelize = new Sequelize(dbconf.database, dbconf.user, dbconf.password, {
  host: dbconf.host,
  dialect: "mysql",
  operatorsAliases: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstname: {
    type: Sequelize.STRING
  },
  lastname: {
		type: Sequelize.STRING,
		unique: true
  },
  gender: {
    type: Sequelize.STRING,
    defaultValue: "male"
  }
});

sequelize.authenticate().catch(err => {
	console.error('Unable to connect to the database:', err);
	process.exit();
});

User.sync({force: true}).then(() => {
	User.create({ firstname: "Kim", lastname: "Jongchan" });
	User.create({ firstname: "Lee", lastname: "Minhwan" }).then(() => {
		User.findAll().then(users => {
			console.log(users);
		})
	});
});