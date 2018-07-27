// HUMAN TASKS
// general task definition
function Task(num, diff, txt, met, cmd) {
    this.num = num;
    this.diff = diff;
    this.txt = txt;
    this.met = met;
    this.command = cmd;
    this.time = { begin:0, end:0, duration:0 };
    this.moment = 0;
    this.completed = 0; 
    // setters
    this.setStart = function() {this.time.begin = new Date().getTime()/1000;};
    this.setEnd = function() {
    	this.time.end = new Date().getTime()/1000;
    	this.time.duration = this.time.end - this.time.begin;
    };
};
// task specific functions
var task_funcs = {
    gopher: {
        num: 7,
        loc_x: [44, 32, 46, 39, 12, 24, 48],
        loc_y: [10, 20, 18, 2, 19, 16, 11],
        hit: 0,
        gone: 0,
        completed: 0
    },
    gopherCoord: function(i) {return [this.gopher.loc_x[i], this.gopher.loc_y[i]];},
    gopherHit: function() {this.gopher.hit+=1;},
    gopherGone: function() {this.gopher.gone+=1;},
    gopherComplete: function() {
        if (this.gopher.hit + this.gopher.gone >= this.gopher.num) {
            this.gopher.completed+=1;
            return true;
        }
        else {return false;}
    },
    gopherNext: function() {
        if (this.gopher.completed == 1) {return true;}
        else {return false;}
    }
};
// task list
var task_list = {
    curr: 0,
	list: [],
	addTask: function(task) {this.list.push(task);},
	addTask: function(task, index) {this.list.splice(index,0,task);},
	addTasks: function(list) {this.list = list;},

    nextTask: function() {this.curr = this.curr+1;},
    // completed: function() {this.list[this.curr].completed += 1;},
    // checkCompleted: function() {return this.list[this.curr].completed;},

    getCurr: function() {return this.curr;},
	getText: function() {return this.list[this.curr].txt;},
	getMet: function() {return this.list[this.curr].met;},
    getCommand: function() {return this.list[this.curr].command},
	setStart: function() {this.list[this.curr].setStart();},
	setEnd: function() {this.list[this.curr].setEnd();}
};
// manually add tasks to list
var tasks = [];
tasks[4] = new Task(1, 0, 'Collect 16 eggs', ['eggs',16], '');
tasks[1] = new Task(1, 0, "Gather 40 berries (water+bush)", ['berries',40], '');
tasks[2] = new Task(1, 0, 'Collect 2 wool (shears+sheep)', ['wool',2], '');
tasks[3] = new Task(1, 0, 'Collect 2 milk (empty bucket+cow)', ['milk',2], '');
tasks[0] = new Task(2, 1, 'Hit gophers with your hammer', ['gophers',5], 'gopher_task();');
task_list.addTasks(tasks);




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



