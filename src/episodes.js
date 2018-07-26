// Human tasks
// var tasks = {
// 	curr: 0,
// 	text: [
// 		'Gather 16 eggs.',
// 		'Make bread.'
// 	]
// }

// Task structure
var task = {
	num: 0,
	// difficulty - [0:low, 1:high]
	diff: 0,
	// cue for player
	txt: '',
	// check if met
	met: [],
	// timing 
	time: {
		start: 0,
		end: 0,
		duration: 0
	},
	// moment - [0:break, 1:mid]
	moment: 0,
	// task completed - [0:no, 1:yes]
	completed: 0,

	// functions
	getCompleted: function() { return completed; },

	setStartTime: function() { time.start = new Date().getTime() / 1000; },
	setEndTime: function() { 
		time.end = new Date().getTime() / 1000; 
		time.duration = time.end - time.start;
	},
	updateMoment: function() {
		
	}
	
}
var task_list = {
	curr: 0,
	list: [],
	nextTask: function() {
		curr+=1;
	},
}

// Manually store task information
c = 0;
t = task;
t.num = 1;
t.diff = 0;
t.txt = 'Collect 16 eggs.';
t.met = ['eggs', 16];
task_list[c] = t;

c = 1;
t = task;
t.num = 1;
t.diff = 0;
t.txt = 'Gather 40 berries.';
t.met = ['berries', 40];
task_list[c] = t;

c = 2;
t = task;
t.num = 1;
t.diff = 0;
t.txt = 'Collect 2 wool (shears + sheep).';
t.met = ['wool', 2];
task_list[c] = t;

c = 3;
t = task;
t.num = 1;
t.diff = 0;
t.txt = 'Collect 2 milk (empty bucket + cow).';
t.met = ['milk', 2];
task_list[c] = t;

// c = 3;
// t = task;
// t.num = 1;
// t.diff = 0;
// t.txt = 'Collect 1 wool (shears + sheep) and 1 milk (empty bucket + cow).';
// task_list[c] = t;

// t.diff = 0;
// t.txt = 'Gather 40 berries.'














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
