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
 * @param {int}     num         Task number
 * @param {int}     diff        Enumerates tasks (difficulty, type):
 *                                  1 = (easy, gather), 2 = (hard, gather) 
 *                                  3 = (easy, chase),  4 = (hard, chase) 
 *                                  5 = (easy, combo),  6 = (hard, combo)
 * @param {str}     txt         The prompt shown to the player.
 * @param {arr}     met         The condition(s) the player must meet to fulfill the task [resource, number]
 * @param {str}     cmd         A function to call from event-components.js to start the event sequence. 
 **/
function HTask(num, diff, order, txt, cmd) {
    this.num = num;
    this.diff = diff;
    this.order = order;
    this.txt = txt;
    this.command = cmd;

    // timers
    this.times = [0,0];
    this.durations = 0;
    this.complete = false;

    // SETTERS
    this.setQuant = function(quant) {this.order[1] = quant;}
    this.setStart = function() {this.times[1]= new Date().getTime()/1000;}; 
    this.setEnd = function() {
    	this.times[1] = new Date().getTime()/1000;
    	this.duration = (this.times[1] - this.times[0]);
        this._complete = true;
    };
    this.callCommand = function() {eval(this.command);} // runs command to start event
};

// Stores all possible human tasks.
// var all_tasks = [
//     new HTask(0, 0, '', ['none',1], ''),
//     new HTask(1, 1, 'Harvest 8 wheat with your scythe.', ['wheat',8], ''),
//     new HTask(1, 1, 'Gather 40 berries (fill up your bucket at the well and water the bush to grow berries)', ['berries',40], ''),
//     new HTask(1, 1, 'Collect 16 more eggs.', ['eggs',16], ''),
//     new HTask(1, 1, 'Collect 2 wool from the sheep with your shears.', ['wool',2], ''),
//     new HTask(1, 1, 'Collect 2 milk (make sure your bucket is empty).', ['milk',2], ''),
//     new HTask(2, 2, 'Hit the gophers with your hammer before they disappear and steal one dollar!', ['',0], 'animal_task(0);'),
//     new HTask(3, 1, 'Collect butterflies for a one dollar reward per butterfly!', ['',0], 'animal_task(1);'),
//     new HTask(4, 2, 'Hurry and hit the snakes with your hammer. Each snake steals an egg every four seconds!', ['',0], 'animal_task(2);'),
//     new HTask(6, 2, 'Bake a loaf of bread. The oven will be on for less than two minutes. Make sure you collect the bread before it burns!', ['bread',1], ''),
//     new HTask(6, 2, 'Bake a muffin. The oven will be on for less than two minutes. Make sure you collect the muffin before it burns!', ['muffin',1], ''),
//     new HTask(6, 2, 'Make a spool of thread.', ['thread',1], ''),
//     new HTask(5, 1, 'Grab your shovel and open the treasure chest burried under a tuft of grass (Hint: Try hitting rocks with your hammer).', ['',0], 'chest_task();'),
// ];
var resource_tasks = [
    new HTask(1, 1, 'wheat', 'Harvest wheat using your scythe.', ''),
    new HTask(2, 1, 'tomatos', 'Pick tomatos.', ''),
    new HTask(3, 1, 'potatos', 'Pick potatos.', ''),
    new HTask(4, 1, 'berries', 'Fill up your bucket at the well and water the bush to grow berries.', ''),
    new HTask(5, 1, 'eggs', '0 more eggs.', ''),
    new HTask(6, 1, 'wool', 'Collect wool from the sheep with your shears.', 'wool', ''),
    new HTask(7, 1, 'milk', 'Collect milk (make sure your bucket is empty).', 'milk', ''),
    new HTask(8, 6, 'bread', 'Pick up some firewood to start the oven. Make sure you collect the bread before it burns!', ''),
    new HTask(9, 6, 'muffin', 'Pick up some firewood to start the oven. Make sure you collect the muffin before it burns!', ''),
    new HTask(10, 6, 'thread', 'Make a spool of thread.', '')
];
var event_tasks = [
    new HTask(11, 2, '', 'Hit the gophers with your hammer before they disappear and steal a dollar!', 'animal_task(0);'),
    new HTask(12, 3, '', 'Collect butterflies for a one dollar reward per butterfly!', 'animal_task(1);'),
    new HTask(13, 4, '', 'Hurry and hit the snakes with your hammer. Each snake steals an egg every four seconds!', 'animal_task(2);'),
    new HTask(14, 5, '', 'Grab your shovel and open the treasure chest burried under a tuft of grass for a big reward!', '', 'chest_task();')
]

// Tracks history of human tasks. 
var task_list = {
    done_chest: false,
    completed: [],

    getRandTask: function(type) {
        if (type == 'resource') {return resource_tasks[getRandomInt(0,7)];}
        else {
            if (this.done_chest == false) return event_tasks[getRandomInt(0,3)];
            else return event_tasks[getRandomInt(0,2)];
        }
    },
    addToCompleted: function(task_object) {
        this.completed.push(task_object);
    }
};

// Stores information for task specific functions
var xmax = 55;
var task_animals = {
    // stores information for each animal: 0 = gophers, 1 = butterflies, 2 = snakes
    num: [7, 8, 7],
    loc_x: [[49, 32, 46, 44, 41, 29, 54], [xmax, 39, 30, 44, 56, xmax, 47, xmax], [46, 29, xmax, 52, 54, 44, xmax]],
    loc_y: [[10, 20, 18,  2, 21, 16, 11], [  20,  1, 23, 23,  1,    3,  1,   12], [ 1, 23,   11,  1, 18, 23,    7]],
    direction: [[], ['l','d','u','u','d','l','d','l'], ['d','u','l','d','u','r','l']],
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
