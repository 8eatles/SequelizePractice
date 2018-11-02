const fs = require('fs');
const Sequelize = require("sequelize");
const restify = require('restify');

// Reading Config
const conf = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const serverconf = conf.server;
const dbconf = conf.database;

// Initing DB Connection
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

// Checking DB Connection
sequelize.authenticate().catch(err => {
	console.error('Unable to connect to the database:', err);
	process.exit();
});

// Defining Database Models
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

// Building Database Structure
User.sync({force: true}).then(() => {});

// Create API Server
let server = restify.createServer();

// Enable Body Data Parser for POST Request
server.use(restify.plugins.bodyParser());

// Select All Users
server.get('/user', function(req, res, next) {
	User.findAll().then(users => {
		res.send({
			status: 0,
			message: '',
			data: users
		});
	}).catch(() => {
		res.send({
			status: 1,
			message: 'there is no users',
			data: {}
		});
	});  
  return next();
});

// Select Special User
server.get('/user/:id', function(req, res, next) {
	User.findById(req.params.id).then(user => {
		res.send({
			status: 0,
			message: '',
			data: user
		});
	}).catch(() => {
		res.send({
			status: 1,
			message: 'cannot find this id.',
			data: {}
		});
	});  
  return next();
});

// Create USer
server.post('/user', function(req, res, next) {
	//parameter check;
	if(req.params.firstname == null || req.params.firstname == '')
	{
		res.send({
			status: 2,
			message: 'firstname is empty.',
			data: {}
		});
	}
	else if(req.params.lastname == null || req.params.lastname == '')
	{
		res.send({
			status: 3,
			message: 'lastname is empty.',
			data: {}
		});
	}
	else
	{
		User.create({ firstname: req.params.firstname, lastname: req.params.lastname, gender: (req.params.gender == 'female') ? 'female' : 'male' }).then(user =>{
			res.send({
				status: 0,
				message: 'created.',
				data: user
			});
		}).catch(()=>{
			res.send({
				status: 1,
				message: 'db error',
				data: {}
			});
		});
	}
  return next();
});

// API Server Start
server.listen(serverconf.port, function() {
  console.log('%s listening at %s', server.name, server.url);
});







