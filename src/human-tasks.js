// HUMAN TASKS

// [0:none, 1:wheat, 2:berries, 3:eggs, 4:wool, 5:milk, 6:gophers, 7:butterflies, 8:snakes, 9:chest, 10:bread, 11:muffin, 12:thread]
var task_indices = [1,2,3,4,5,0,6,7,0,8,0,6,12,11,5,2,9,10,3,6,12,8,4,1,7,7,2,10,8,12,0,10,4,0,0];
// var task_indices = [9,7,7,0,8,8,0,0,10];

// human task definition
//      num - task number [1:easy gather, 2:hard gather, 3:easy chase, 4:hard chase, 5:easy combo, 6:hard combo]
//      diff - task difficulty [0:none, 1:low, 2:high]
//      txt - the prompt shown to player
//      met - the conditions that need to be met to complete task
//      cmd - the command to start the event
function HTask(num, diff, txt, met, cmd) {
    this.num = num;
    this.diff = diff;
    this.txt = txt;
    this.met = met;
    this.command = cmd;
    // time it takes to complete task
    this.time = { begin:0, end:0, duration:0 };
    // whether completed
    this.completed = 0;

    // setters
    this.setStart = function() {this.time.begin = new Date().getTime()/1000;};
    this.setEnd = function() {
    	this.time.end = new Date().getTime()/1000;
    	this.time.duration = this.time.end - this.time.begin;
        this.completed = 1;
    };
    // runs command to start event
    this.runCode = function() {eval(this.command);}
};
// stores possible human tasks and generates list of task objects given list of indices
//      indices - populates list of tasks based on task_indices defined in ln 6
function HTaskList(indices) {
    this.taskOptions = [];
    this.taskOptions[0] = new HTask(0, 0, '', ['none',1], '');
    this.taskOptions[1] = new HTask(1, 1, 'Harvest 5 wheat with your scythe.', ['wheat',5], '');
    this.taskOptions[2] = new HTask(1, 1, 'Gather 40 berries (fill up your bucket at the well and water the bush to grow berries)', ['berries',40], '');
    this.taskOptions[3] = new HTask(1, 1, 'Collect 16 more eggs.', ['eggs',16], '');
    this.taskOptions[4] = new HTask(1, 1, 'Collect 2 wool from the sheep with your shears.', ['wool',2], '');
    this.taskOptions[5] = new HTask(1, 1, 'Collect 2 milk (make sure your bucket is empty).', ['milk',2], '');
    this.taskOptions[6] = new HTask(2, 2, 'Hit the gophers with your hammer before they disappear and steal one dollar!', ['',0], 'gopher_task();');
    this.taskOptions[7] = new HTask(3, 1, 'Collect butterflies for a one dollar reward per butterfly!', ['',0], 'butterfly_task();');
    this.taskOptions[8] = new HTask(4, 2, 'Hurry and hit the snakes with your hammer. Each snake steals an egg every four seconds!', ['',0], 'snake_task();');
    this.taskOptions[9] = new HTask(5, 1, 'Grab your shovel and open the treasure chest burried under a tuft of grass (ticking means it might explode!)', ['',0], 'chest_task();');
    this.taskOptions[10] = new HTask(6, 2, 'Bake a loaf of bread (Hint: It burns in twenty seconds).', ['bread',1], '');
    this.taskOptions[11] = new HTask(6, 2, 'Bake a muffin (Hint: It burns in fifteen seconds).', ['muffin',1], '');
    this.taskOptions[12] = new HTask(6, 2, 'Make a spool of thread.', ['thread',1], '');

    this.tasks = []
    for (var i = 0; i < indices.length; i++) {
        var task_num = indices[i];
        this.tasks.push(this.taskOptions[task_num]);
    }
    return this.tasks;
};
// stores task list and task retrieval functions
var task_list = {
    // current task index
    curr: 0,
    // holds tasks
	list: new HTaskList(task_indices),
    // adds task to end of list
	addTask: function(task) {this.list.push(task);},
    // adds task to certain index in list
	addTask: function(task, index) {this.list.splice(index,0,task);},
    // rewrites this.list with new list
	addTasks: function(list) {this.list = list;},

    // indicates next task
    nextTask: function() {this.curr = this.curr+1;},
    // runs current task command
    runCommand: function() {this.list[this.curr].runCode();},

    // getters 
    getCurr: function() {return this.list[this.curr];},
    getNum: function() {return this.list[this.curr].num;},
    getDiff: function() {return this.list[this.curr].diff;},
	getText: function() {return this.list[this.curr].txt;},
	getMet: function() {return this.list[this.curr].met;},
    // setters
	setStart: function() {this.list[this.curr].setStart();},
	setEnd: function() {this.list[this.curr].setEnd();}
};
// stores information for task specific functions
var task_funcs = {
    // gopher task
    gopher: {
        // number of gophers that pop up
        num: 7,
        // location coordinates
        loc_x: [44, 32, 46, 39, 36, 24, 48],
        loc_y: [10, 20, 18, 2, 21, 16, 11],
        // number hit
        hit: 0,
        // number disappear
        gone: 0
    },
    // returns gopher coordinates
    gopherCoord: function(i) {return [this.gopher.loc_x[i], this.gopher.loc_y[i]];},
    // records gopher hit
    gopherHit: function() {this.gopher.hit+=1;},
    // records gopher disappears
    gopherGone: function() {this.gopher.gone+=1;},
    // checks whether gopher task is complete, resets if so
    gopherComplete: function() {
        if (this.gopher.hit + this.gopher.gone >= this.gopher.num) {
            this.gopher.hit = 0;
            this.gopher.gone = 0;
            return true;
        }
        else {return false;}
    },
    // butterfly task
    butterfly: {
        // number of butterflies that will appear
        num: 8,
        // direction of flight
        direction: ['left', 'down', 'up', 'up', 'down', 'left', 'down', 'left'],
        // location coordinates
        loc_x: [52, 39, 30, 44, 46, 52, 47, 52],
        loc_y: [20, 1, 23, 23,  1,  3,  1, 12],
        // number hit
        hit: 0,
        // number disappear
        gone: 0,
    },
    butterflyDir: function(i) {return this.butterfly.direction[i];},
    butterflyCoord: function(i)  {return [this.butterfly.loc_x[i], this.butterfly.loc_y[i]];},
    butterflyHit: function() {this.butterfly.hit+=1;},
    butterflyGone: function() {this.butterfly.gone+=1;},
    butterflyComplete: function() {
        if (this.butterfly.hit + this.butterfly.gone >= this.butterfly.num) {
            this.butterfly.hit = 0;
            this.butterfly.gone = 0;
            return true;
        }
        else {return false;}
    },
    // snake task
    snake: {
        // number of snakes that will appear
        num: 6,
        // direction of movement
        direction: ['down', 'up', 'left', 'down', 'up', 'down'],
        // location coordinates
        loc_x: [48, 29, 52, 42, 52, 44, 52],
        loc_y: [1,  23, 11,  1, 18, 23, 7],
        // number hit
        hit: 0,
        // number disappear
        gone: 0,
    },
    snakeDir: function(i) {return this.snake.direction[i];},
    snakeCoord: function(i)  {return [this.snake.loc_x[i], this.snake.loc_y[i]];},
    snakeHit: function() {this.snake.hit+=1;},
    snakeGone: function() {this.snake.gone+=1;},
    snakeComplete: function() {
        if (this.snake.hit + this.snake.gone >= this.snake.num) {
            this.snake.hit = 0;
            this.snake.gone = 0;
            return true;
        }
        else {return false;}
    },
    // chest task
    chest: {
        location: [],
        // [0:hidden, 1:revealed]
        revealed: 0,
        // [0:closed, 1:opened]
        opened: 0,
        // [0:intact, 1:destroyed]
        destroyed: 0,
        // password
        password: 0
    },
    // initializes location and generates password
    chestInitialize: function(x, y) {
        this.chest.location.push(x);
        this.chest.location.push(y);

        var num = '';
        for (var i = 0; i < 7; i++) {
            var temp = Math.floor(Math.random()*10);
            num = '' + num + temp;
        }
        this.chest.password = num;
        Crafty.log(this.chest.password);
    },
    // setters
    chestIsRevealed: function() {this.chest.revealed = 1;},
    chestIsOpen: function() {this.chest.opened = 1;},
    chestIsDestroyed: function() {this.chest.destroyed = 1;},
    // getters
    chestGetLocation: function() {return this.chest.location;},
    chestGetPassword: function() {return this.chest.password;},
    chestGetRevealed: function() {return this.chest.revealed;},
    chestGetOpened: function() {return this.chest.opened;},
    chestGetDestroyed: function() {return this.chest.destroyed;}
};
