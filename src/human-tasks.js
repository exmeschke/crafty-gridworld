/**
 * The game dynamics for human tasks. 
 * 
 * Includes functions to define the Human Tasks and set the order the tasks will appear. 
 * Enumerated tasks:    
 *      0 = none
 *      1 = gather wheat, 2 = gather berries, 3 = gather eggs, 4 = gather wool, 5 = gather milk
 *      6 = gather gophers, 7 = chase butterflies, 8 = chase snakes
 *      9 = make bread, 10 = make muffin, 11 = make thread
 *      12 = find chest
 * 
 * HTask            Constructor function to define a human task.
 * all_tasks        Array that stores all possible human tasks. 
 * task_list        Object that tracks human task history.
 * task_animals     Object that stores information about animal-related tasks.
 * task_chest       Object that stores information about chest task. 
 */


/**
 * HTask - Constructor function to define a human task.
 * 
 * @param {int}     num         Enumerates tasks (difficulty, type):
 *                                  1 = (easy, gather), 2 = (hard, gather) 
 *                                  3 = (easy, chase),  4 = (hard, chase) 
 *                                  5 = (easy, combo),  6 = (hard, combo)
 * @param {int}     diff        Task difficulty: 0 = no task, 1 = easy task, 2 = hard task
 * @param {str}     txt         The prompt shown to the player.
 * @param {arr}     met         The condition(s) the player must meet to fulfill the task [resource, number]
 * @param {str}     cmd         A function to call from event-components.js to start the event sequence. 
 **/
function HTask(num, diff, txt, met, cmd) {
    this.num = num;
    this.diff = diff;
    this.txt = txt;
    this.met = met;
    this.command = cmd;
    // timers
    this.startTimes = [];
    this.endTimes = [];
    this.durations = [];

    // SETTERS
    this.addStart = function() {this.startTimes.push(new Date().getTime()/1000);}; 
    this.addEnd = function() {
    	this.endTimes.push(new Date().getTime()/1000);
    	this.durations.push(this.endTimes.slice(-1)[0] - this.startTimes.slice(-1)[0]);
    };
    this.callCommand = function() {eval(this.command);} // runs command to start event
};

// Stores all possible human tasks.
var all_tasks = [
    new HTask(0, 0, '', ['none',1], ''),
    new HTask(1, 1, 'Harvest 5 wheat with your scythe.', ['wheat',5], ''),
    new HTask(1, 1, 'Gather 40 berries (fill up your bucket at the well and water the bush to grow berries)', ['berries',40], ''),
    new HTask(1, 1, 'Collect 16 more eggs.', ['eggs',16], ''),
    new HTask(1, 1, 'Collect 2 wool from the sheep with your shears.', ['wool',2], ''),
    new HTask(1, 1, 'Collect 2 milk (make sure your bucket is empty).', ['milk',2], ''),
    new HTask(2, 2, 'Hit the gophers with your hammer before they disappear and steal one dollar!', ['',0], 'gopher_task();'),
    new HTask(3, 1, 'Collect butterflies for a one dollar reward per butterfly!', ['',0], 'butterfly_task();'),
    new HTask(4, 2, 'Hurry and hit the snakes with your hammer. Each snake steals an egg every four seconds!', ['',0], 'snake_task();'),
    new HTask(6, 2, 'Bake a loaf of bread. The oven will be on for less than two minutes. Make sure you collect the bread before it burns!', ['bread',1], ''),
    new HTask(6, 2, 'Bake a muffin. The oven will be on for less than two minutes. Make sure you collect the muffin before it burns!', ['muffin',1], ''),
    new HTask(6, 2, 'Make a spool of thread.', ['thread',1], ''),
    new HTask(5, 1, 'Grab your shovel and open the treasure chest burried under a tuft of grass (Hint: Try hitting rocks with your hammer).', ['',0], 'chest_task();'),
];

// Tracks history of human tasks. 
var task_list = {
    curr: 0,  // current task index
	list: [1,2,3,4,5,0], // contains ordered list of enumerated human tasks for game

    // adds task to this.list
	addTask: function(index) {this.list.push(index);},
    addRandTask: function() {
        if (this.curr == 12) {this.list.push(12)} // complete chesk task once
        else {this.list.push(getRandomInt(0,11))}; // random for other tasks
    },
    // runs current task command
    runCommand: function() {all_tasks[this.list[this.curr]].callCommand();}, 
    // indicates next task
    nextTask: function() {this.curr = this.curr+1;}, 

    // getters 
    getCurr: function() {return all_tasks[this.list[this.curr]];},
    getNum: function() {return all_tasks[this.list[this.curr]].num;},
    getDiff: function() {return all_tasks[this.list[this.curr]].diff;},
	getText: function() {return all_tasks[this.list[this.curr]].txt;},
	getMet: function() {return all_tasks[this.list[this.curr]].met;},
    // setters
	setStart: function() {all_tasks[this.list[this.curr]].addStart();},
	setEnd: function() {all_tasks[this.list[this.curr]].addEnd();}
};

// Stores information for task specific functions
var task_animals = {
    // stores information for each animal: 0 = gophers, 1 = butterflies, 2 = snakes
    num: [7, 8, 6],
    loc_x: [[44, 32, 46, 39, 36, 24, 48], [52, 39, 30, 44, 46, 52, 47, 52], [48, 29, 52, 42, 52, 44, 52]],
    loc_y: [[10, 20, 18,  2, 21, 16, 11], [20,  1, 23, 23,  1,  3,  1, 12], [ 1, 23, 11,  1, 18, 23,  7]],
    direction: [[], ['l','d','u','u','d','l','d','l'], ['d','u','l','d','u','d']],
    hit: [0, 0, 0],
    gone: [0, 0, 0],

    // getters
    getCoord: function(animal, i) {return [this.loc_x[animal][i], this.loc_y[animal][i]];},
    getDir: function(animal, i) {return this.direction[animal][i];},
    // setters
    countHit: function(animal) {return this.hit[animal] += 1;},
    countGone: function(animal) {return this.gone[animal] += 1;},
    // check status
    checkComplete: function(animal) {
        if (this.hit[animal] + this.gone[animal] >= this.num[animal]) {
            this.hit[animal] = 0;
            this.gone[animal] = 0;
            return true;
        } 
        else {return false;}
    }
};

// Stores information about status of chest task. 
var task_chest = {
    // randomly generated
    location: [],
    password: 0,
    // track status
    revealed: 0, // 0 = hidden, 1 = revealed
    opened: 0, // 0 = closed, 1 = opened
    destroyed: 0, // 0 = intact, 1 = destroyed

    // sets location and generates password
    chestInitialize: function(x, y) { 
        this.location.push(x);
        this.location.push(y);

        var num = '';
        for (var i = 0; i < 7; i++) {
            num = '' + num + getRandomInt(0,9);
        }
        this.password = num;
    },
    // setters
    setRevealed: function() {this.revealed = 1;},
    setOpen: function() {this.opened = 1;},
    setDestroyed: function() {this.destroyed = 1;}
}
