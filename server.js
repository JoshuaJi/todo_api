var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js')

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
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};

	if (!matchedTodo) {
		return res.status(404).send();
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	}

	if (body.hasOwnProperty('description' && _.isString(body.description) && body.description.trim().length > 0)) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	_.extend(matchedTodo, validAttributes);
	res.json(matchedTodo);

})

db.sequelize.sync().then(function(){
	app.listen(PORT, function() {
		console.log('express listening on ' + PORT);
})
})

