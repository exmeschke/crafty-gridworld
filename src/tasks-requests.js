// HUMAN TASKS
// general task definition
//      num - the task number
//      diff - task difficulty [0 = low, 1 = high]
//      txt - the prompt shown to player
//      met - the conditions that need to be met to complete task
//      cmd - the command to start the event
function Task(num, diff, txt, met, cmd) {
    this.num = num;
    this.diff = diff;
    this.txt = txt;
    this.met = met;
    this.command = cmd;
    // time it takes to complete task
    this.time = { begin:0, end:0, duration:0 };
    // moment in task [0 = breakpoint, 1 = mid]
    this.moment = 1;
    // whether completed
    this.completed = 0; 

    // setters
    this.setStart = function() {this.time.begin = new Date().getTime()/1000;};
    this.setEnd = function() {
    	this.time.end = new Date().getTime()/1000;
    	this.time.duration = this.time.end - this.time.begin;
    };
    // runs command to start event
    this.runCode = function() {eval(this.command);}
};
// store information for task specific functions
var task_funcs = {
    // gopher task
    gopher: {
        // number of gophers that pop up
        num: 7,
        // location coordinates
        loc_x: [44, 32, 46, 39, 12, 24, 48],
        loc_y: [10, 20, 18, 2, 19, 16, 11],
        // number hit
        hit: 0,
        // number disappear
        gone: 0
        // whether completed or not
        // completed: 0
    },
    // returns gopher coordinates
    gopherCoord: function(i) {return [this.gopher.loc_x[i], this.gopher.loc_y[i]];},
    // records gopher hit
    gopherHit: function() {this.gopher.hit+=1;},
    // records gopher disappears
    gopherGone: function() {this.gopher.gone+=1;},
    // checks whether gopher task is complete
    gopherComplete: function() {
        if (this.gopher.hit + this.gopher.gone >= this.gopher.num) {
            // Crafty.log(this.gopher.completed);
            // this.gopher.completed+=1;
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
    runCommand: function() {this.list[this.curr].runCode();},

    getCurr: function() {return this.curr;},
	getText: function() {return this.list[this.curr].txt;},
	getMet: function() {return this.list[this.curr].met;},
	setStart: function() {this.list[this.curr].setStart();},
	setEnd: function() {this.list[this.curr].setEnd();}
};
// manually add tasks to list
var tasks = [];
tasks[0] = new Task(1, 0, 'Collect 16 eggs', ['eggs',2], '');
tasks[0] = new Task(1, 0, "Gather 40 berries (water+bush)", ['berries',40], '');
tasks[0] = new Task(1, 0, 'Collect 2 wool (shears+sheep)', ['wool',2], '');
tasks[0] = new Task(1, 0, 'Collect 2 milk (empty bucket+cow)', ['milk',2], '');
tasks[0] = new Task(2, 1, 'Hit gophers with hammer', ['gophers',5], 'gopher_task();');
tasks[0] = new Task(5, 0, 'Find and open the chest hidden under a tuft of grass.', ['chest',1], 'robot_notif();');
tasks[0] = new Task(6, 1, 'Bake a loaf of bread (recipe in book)', ['bread',1], '');
tasks[0] = new Task(6, 1, 'Bake a muffin (recipe in book)', ['muffin',1], '');
tasks[0] = new Task(6, 1, 'Make a spool of thread (recipe in book)', ['thread',1], '');
task_list.addTasks(tasks);




// ROBOT REQUESTS
// make sure to include response trigger







// The treasure chest is located at coordinates (x, y). 

// this.request = Crafty.e('RobotRequest').at(6,9);
// this.robot.attach(this.request);






