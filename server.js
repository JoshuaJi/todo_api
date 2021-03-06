var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');

app.get('/', function(req, res) {
	res.send('todo api root');
})

app.use(bodyParser.json());

// GET /todos
app.get('/todos', function(req, res) {
	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('completed') && query.completed === 'true'){
		where.completed = true;
	}else if (query.hasOwnProperty('completed') && query.completed === 'false'){
		where.completed = false;
	}

	if (query.hasOwnProperty('q') && (query.q.length > 0)){
		where.description = {
			$like: '%'+query.q+'%'
		};
	}

	db.todo.findAll({where:where}).then(function(todos){
		res.json(todos);
	}, function(e){
		res.status(500).send();
	});

})

// GET /todos:id
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.findById(todoId).then(function (todo){
		if (!!todo){
			res.json(todo.toJSON());
		}else{
			console.log("not found");
			res.status(404).send();
		}
	}, function(e){
		res.status(500).send();
	})

})

// POST 
app.post('/todos', function(req, res) {
	var body = req.body;

	db.todo.create(body).then(function(todo){
		res.json(todo.toJSON());
	}, function(e){
		res.status(400).json(e);
	})

})

// DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function(todo){
		if (todo === 0){
			res.status(404).send();
		}else{
			res.status(204).send();
		}
	});
})

// PUT /todos/:id
app.put('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};


	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	} 

	if (body.hasOwnProperty('description' )) {
		attributes.description = body.description;
	} 

	db.todo.findById(todoId).then(function(todo){
		if (todo){
			todo.update(attributes).then(function(todo){
				res.json(todo.toJSON());
			}, function(e){
				res.status(400).json(e);
			})
		}else{
			res.status(404).send();
		}
	}, function(){
		res.status(500).sned();
	})
})

app.post('/users', function(req, res){
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user) {
		res.json(user.toPublicJSON())
	}, function (e){
		res.status(400).json(e);
	})
});

app.post('/users/login', function(req, res){
	var body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body).then(function(user){
		res.json(user.toPublicJSON());
	}, function(e){
		res.status(401).send();
	})

	
});

db.sequelize.sync().then(function(){
	app.listen(PORT, function() {
		console.log('express listening on ' + PORT);
})
})

