var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;
var bodyParser = require('body-parser');
var _ = require('underscore');

app.get('/', function(req,res){
	res.send('todo api root');
})

app.use(bodyParser.json());

// GET /todos
app.get('/todos', function(req, res){
	res.json(todos);
})

// GET /todos:id
app.get('/todos/:id', function(req, res){
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if (matchedTodo){
		res.json(matchedTodo);
	}else{
		res.status(404).send();
	}
})

// POST 
app.post('/todos', function(req,res){
	var body = req.body;

	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}

	body.description = body.description.trim();
	body.id = todoNextId++;
	todos.push(body);
	res.json(body);

})

app.delete('/todos/:id', function(req,res){
	var todoId = parseInt(req.params.id, 10);
	matchedTodo = _.findWhere(todos, {id:todoId});
	if(matchedTodo){
		todos = _.without(todos, matchedTodo);	
		res.json(matchedTodo);
	}else{
		res.status(404).json({'error': 'no todo found'});
	}
	
})

app.listen(PORT, function(){
	console.log('express listening on '+ PORT);
})