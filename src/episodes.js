// Human tasks
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
}
var tasks = {
	list: [],
	addTask: function(task) {this.list.push(task);},
	getText: function(curr) {return this.list[curr].txt;},
	getMet: function(curr) {return this.list[curr].met;},
	setStart: function(curr) {this.list[curr].setStart();},
	setEnd: function(curr) {this.list[curr].setEnd();}
};

// Manually store task information
var t;
t = new Task(1, 0, 'Collect 16 eggs', ['eggs',16]);
tasks.addTask(t);
t = new Task(1, 0, "Gather 40 berries (water+bush+'X')", ['berries',40]);
tasks.addTask(t);
t = new Task(1, 0, 'Collect 2 wool (shears+sheep)', ['wool',2]);
tasks.addTask(t);
t = new Task(1, 0, 'Collect 2 milk (empty_bucket+cow)', ['milk',2]);
tasks.addTask(t);

// Crafty.log(task_list[0].txt);
// Crafty.log(task_list[1].txt);















// The treasure chest is located at coordinates (x, y). 
// The 

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


// Sounds
var sounds = {
	play_low: function() {
		Crafty.audio.play('alert_low');
	},
	play_med: function() {
		Crafty.audio.play('alert_med');
	},
	play_high: function() {
		Crafty.audio.play('alert_high');
	},
	play_cow: function() {
		Crafty.audio.play('cow');
	},
	play_sheep: function() {
		Crafty.audio.play('sheep');
	},
	play_stone: function() {
		Crafty.audio.play('stone');
	}
};
