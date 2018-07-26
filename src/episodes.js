// HUMAN TASKS
// general task definition
function Task(num, diff, txt, met) {
    this.num = num;
    this.diff = diff;
    this.txt = txt;
    this.met = met;
    this.time = { begin:0, end:0, duration:0 };
    this.moment = 0;
    this.completed = false; 
    // setters
    this.setStart = function() {this.time.begin = new Date().getTime()/1000;};
    this.setEnd = function() {
    	this.time.end = new Date().getTime()/1000;
    	this.time.duration = this.time.end - this.time.begin;
    };
};
// task list
var task_list = {
	list: [],
	addTask: function(task) {this.list.push(task);},
	addTask: function(task, index) {this.list.splice(index,0,task);},
	addTasks: function(list) {this.list = list;},

	getText: function(curr) {return this.list[curr].txt;},
	getMet: function(curr) {return this.list[curr].met;},
	setStart: function(curr) {this.list[curr].setStart();},
	setEnd: function(curr) {this.list[curr].setEnd();}
};
// manually add tasks to list
var tasks = [];
tasks[4] = new Task(1, 0, 'Collect 16 eggs', ['eggs',16]);
tasks[1] = new Task(1, 0, "Gather 40 berries (water+bush)", ['berries',40]);
tasks[2] = new Task(1, 0, 'Collect 2 wool (shears+sheep)', ['wool',2]);
tasks[3] = new Task(1, 0, 'Collect 2 milk (empty bucket+cow)', ['milk',2]);
tasks[0] = new Task(2, 1, 'Hit 5 pesky gophers with your hammer', ['gophers',5]);
task_list.addTasks(tasks);


// spawn_gopher(0);
// ROBOT REQUESTS









// The treasure chest is located at coordinates (x, y). 

// this.request = Crafty.e('RobotRequest').at(6,9);
// this.robot.attach(this.request);


// var person = prompt("Please enter your name", "Harry Potter");
// if (person == null || person == "") {
//     txt = "User cancelled the prompt.";
// } else {
//     txt = "Hello " + person + "! How are you today?";
// }

// Snake 
// this.snake = Crafty.e('Snake').at(40,9);
// this.snake.delay(this.snake.snakeMove('up'), 500, -1);
// Gopher
// this.gopher = Crafty.e('Gopher').at(44,10);


// SOUNDS
var sounds = {
	play_low: function() {Crafty.audio.play('alert_low');},
	play_med: function() {Crafty.audio.play('alert_med');},
	play_high: function() {Crafty.audio.play('alert_high');},
	play_cow: function() {Crafty.audio.play('cow');},
	play_sheep: function() {Crafty.audio.play('sheep');},
	play_chicken: function() {Crafty.audio.play('chicken');},
	play_crow: function() {Crafty.audio.play('chicken');},
	play_stone: function() {Crafty.audio.play('stone');},
	play_whack: function() {Crafty.audio.play('whack');},
	play_well_water: function() {Crafty.audio.play('well_water');},
	play_water: function() {Crafty.audio.play('water');},
	play_grain: function() {Crafty.audio.play('grain');},
	play_rustle: function() {Crafty.audio.play('rustle');}
};
