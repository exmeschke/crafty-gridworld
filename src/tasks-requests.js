// Generates human task list, human availability function, robot requests / actions, and state-action information

// set tasks for game
// [0:none, 1:wheat, 2:berries, 3:eggs, 4:wool, 5:milk, 6:gophers, 7:butterflies, 8:snakes, 9:chest, 10:bread, 11:muffin, 12:thread]
// var task_indices = [1,2,3,4,5,6,7,8,9,10,11,12,0];
var task_indices = [1,0,2,3,4,0,5,6,7,8,0,9,0,10,11,12,0];
// set requests for game
// [0:none, 1-4:short notification, 5-7:long notification, 8:text response, 9:low battery, 10-11:task change, 12-13:broken robot, 14:very low battery, 15:emergency]
var request_indices = [];
var all_requests = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];


// HUMAN TASKS
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
    this.taskOptions[8] = new HTask(4, 2, 'Hurry and hit the snakes with your hammer. Each snake steals an egg every two seconds!', ['',0], 'snake_task();');
    this.taskOptions[9] = new HTask(5, 1, 'Grab you shovel and open the treasure chest burried under a tuft of grass (ticking means it might explode!)', ['',0], 'chest_task();');
    this.taskOptions[10] = new HTask(6, 2, 'Bake a loaf of bread.', ['bread',1], '');
    this.taskOptions[11] = new HTask(6, 2, 'Bake a muffin.', ['muffin',1], '');
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
        loc_x: [44, 32, 46, 39, 12, 24, 48],
        loc_y: [10, 20, 18, 2, 19, 16, 11],
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
    // checks whether gopher task is complete
    gopherComplete: function() {
        if (this.gopher.hit + this.gopher.gone >= this.gopher.num) {return true;}
        else {return false;}
    },
    // butterfly task
    butterfly: {
        // number of butterflies that will appear
        num: 8,
        // direction of flight
        direction: ['right', 'down', 'right', 'left', 'down', 'left', 'down', 'left'],
        // location coordinates
        loc_x: [0, 14, 0, 52, 46, 52, 12, 52],
        loc_y: [10, 0, 2, 19,  0,  3,  0, 4],
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
        if (this.butterfly.hit + this.butterfly.gone >= this.butterfly.num) {return true;}
        else {return false;}
    },
    // snake task
    snake: {
        // number of snakes that will appear
        num: 6,
        // direction of movement
        direction: ['down', 'right', 'left', 'down', 'left', 'down'],
        // location coordinates
        loc_x: [17, 0, 52, 33, 52, 7, 52],
        loc_y: [0,  5, 11,  0, 18, 0, 7],
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
        if (this.snake.hit + this.snake.gone >= this.snake.num) {return true;}
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
        Crafty.log('chest: '+x+','+y);

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


// STATE OF HUMAN
// definition for receptivity
function HReceptivity (availability, requestNum) {
    // value of human receptivity
    this.val = 0;
    // availability at time of alert
    this.availability = availability;
    // request number
    this.requestNum = requestNum;

    // time = 0
    this.timeSent = new Date().getTime()/1000;
    // time = current
    this.timeCurr = 0;
    // time since request sent
    this.timeSince = 0;

    // initialize value
    this.updateValue();

    // helper functions
    // updates how much time has passed
    this.timePassed = function() {
        this.timeCurr = new Date().getTime()/1000;
        this.timeSince = this.timeCurr - this.timeSent;
    };
    // updates value based on availability, request duration, and time
    this.updateValue = function() {
        var factor = -1; // TBD
        Math.exp(factor * (this.timePassed())) * (this.availability);
    };
    // returns current value
    this.getValue = function() {return this.val;};
};
// tracks receptivity 
var receptivity = {
    // tracks number of requests sent
    curr: 0,
    // receptivity - [0:interacting, 1:low, 2:high]
    receptivity: [],

    // CURRENT VARIABLES
    // request number - [0:8]
    request_num: -1,
    // availability - [0:interacting, 1, 2, 3, 4]
    availability: -1,
    // interacting - [true, false]
    interacting: false,
    // difficulty - task difficulty [0:none, 1:low, 2:high]
    difficulty: -1,
    // moment - moment of interruption ['break', 'middle']
    moment: '',

    // another request sent - update count, request number, and store receptivity
    sentRequest: function(request_num) {
        this.curr += 1;
        this.request_num = request_num;
        this.receptivityFunc();
    },
    // returns most recent receptivity
    getReceptivity: function() {this.receptivity[-1];},

    // implements receptivity function and adds new receptivity to end of list
    receptivityFunc: function() {
        // most recent receptivity
        var r_curr = new HReceptivity(this.availability, this.request_num);
        // summed receptivity
        var r_sum = 0;

        // loop through receptivity for each request, apply function, and add to r_sum
        for (var i = 0; i < this.curr; i++) {
            // gets updated receptivity
            var r_i = this.receptivity[i].updateValue();
            // adds to sum
            r_sum += r_i.getValue();
        }
        // push current receptivity to log of receptivity
        this.receptivity.push(r_sum);
    },
    // updates current information - always up to date in Task.checkTasK();
    updateState: function(interacting, difficulty, moment) {
        // save current information
        this.interacting = interacting;
        this.difficulty = difficulty;
        this.moment = moment;

        // already interacting with robot [0]
        if (interacting == true) {this.availability = 0;}
        // not interacting
        else if (interacting == false) {
            // no task --> very available [4]
            if (difficulty == 0) {this.availability = 4;}
            // low difficulty task
            else if (difficulty == 1) {
                // breakpoint --> somewhat available [3]
                if (moment == 'break') {this.availability = 3;}
                // middle --> not very available [2]
                else if (moment == 'middle') {this.availability = 2;}
            }
            // high difficulty taks
            else if (difficulty == 2) {
                // breakpoint --> somewhat available [3]
                if (moment == 'break') {this.availability = 3;}
                // middle --> unavailable [1]
                if (moment == 'middle') {this.availability = 1;}
            }
        }
        Crafty.log('A',this.availability, 'I',this.interacting, 'D',this.difficulty, 'M',this.moment);
    }
};  


// STATE OF ROBOT
// robot request definition
//      number - request number
//      urgency - [0, 1:low, 2:med, 3:high]
//      duration - [0, 1:short, 2:long]
//      effort - [0, 1:low, 2:high]
//      text - text to show to player
//      requiresResponse - [true, false]
function RRequest(number, urgency, duration, effort, resp, text) {
    this.number = number;
    this.urgency = urgency;
    this.duration = duration;
    this.effort = effort;
    this.txt = text;
    this.requiresResponse = resp;

    this.receivedResponse = false;
    this.receivedResponse = function() {this.receivedResponse = true;};
};
// stores all possible requests in list, returns list of desired request indices
function RRequestList(indices) {    
    this.requestOptions = [];
    // state 0: no request
    this.requestOptions[0] = new RRequest(0,0,0,0,false,'');
    // state 1: low urgency, short duration, low effort, no response
    this.requestOptions[1] = new RRequest(1,1,1,1,false,'Baked goods can burn!');
    this.requestOptions[2] = new RRequest(1,1,1,1,false,"Debug any issues by entering [X5214] at the monitor.");
    this.requestOptions[3] = new RRequest(1,1,1,1,false,'We lose money when I run out of battery!');
    this.requestOptions[4] = new RRequest(1,1,1,1,false,'Sometimes I can give you helpful hints.');
    // state 2: low urgency, long duration, low effort, no response
    this.requestOptions[5] = new RRequest(2,1,2,1,false,'A locked treasure chest is burried somewhere under a tuft of grass. You have to be carrying your shovel to dig it up. And be careful, it will explode a minute after it is revealed! If you open it, you get $20, so you need to figure out how to open it quickly.');
    this.requestOptions[6] = new RRequest(2,1,2,1,false,'Different resources are worth different amounts of money. Try to make bread; you get $15 per loaf! The recipe is 6 eggs, 4 milk, and 2 wheat. You can also make muffins to earn $18, with 10 berries, 8 eggs, 4 milk, and 1 wheat. If you forget the recipes, open the book near the well.');
    this.requestOptions[7] = new RRequest(2,1,2,1,false,'Animals will occasionally pop up in your environment. Gophers and snakes are pesky. Gophers will steal $1 if they disappear and snakes will steal an egg from you every 5 seconds. But you get a one dollar reward for each one you catch! The same goes for butterflies, but they do not steal any of your resources.')
    // state 3: med urgency, short duration, low effort, requires response
    this.requestOptions[8] = new RRequest(3,2,1,1,true,"In which direction should I take 5 steps [up, down, left, right]? Type your response at the monitor.");
    // state 4: med urgency, short duration, high effort, requires response
    this.requestOptions[9] = new RRequest(4,2,1,2,true,'My battery is less than 20%.');
    // state 5: med urgency, long duration, low effort, requires response
    this.requestOptions[10] = new RRequest(5,2,2,1,true,'I want to start planting. Can you bring me seeds from the barrels?');
    this.requestOptions[11] = new RRequest(5,2,2,1,true,'I need to water the plants. Can you bring me water from the well?');
    // state 6: med urgency, long duration, high effort, requires response
    this.requestOptions[12] = new RRequest(6,2,2,1,true,'One of my parts is missing! Push me around the field and use me as a metal detector to find it.');
    this.requestOptions[13] = new RRequest(6,2,2,1,true,'Enter the password [X91R23Q7] at the monitor to update my software!');
    // state 7: high urgency, short duration, high effort, requires response
    this.requestOptions[14] = new RRequest(7,2,1,2,true,'My battery is less than 5%!');
    // state 8: high urgency, long duration, high effort, requires response
    this.requestOptions[15] = new RRequest(8,2,2,2,true,"Something's short circuited--I'm about to catch on fire! Put it out with 3 buckets of water. Then enter the password [X5214] at the monitor to debug the issue.");

    this.requests = []
    for (var i = 0; i < indices.length; i++) {
        var request_num = indices[i];
        this.requests.push(this.requestOptions[request_num]);
    }
    return this.requests;
};
// stores robot action list
var request_list = {
    // index for current / next task
    curr: 0,
    // request options
    possible: new RRequestList(all_requests),
    // list of requests sent (empty at beginning)
    sent: new RRequestList(request_indices),
    
    // add request to beginning of sent
    addRequest: function(request_num) {
        if (this.sent[this.curr] != this.possible[request_num] && request_num != -1) {
            this.sent.push(this.possible[request_num]);
            // this.sent.splice(this.curr, 0, this.possible[request_num]);
        }
    },
    // indicates request was sent
    sentRequest: function() {
        // update current request number for both request record...
        this.curr += 1;
        // and receptivity record
        receptivity.sentRequest(this.sent[-1].number);        
    },
    // indicates request was checked / responded to
    receivedResponse: function() {this.sent[this.curr].receivedResponse();},

    // getters -- returns current in sent list
    getNumber: function() {return this.sent[this.curr].number;},
    getDuration: function() {return this.sent[this.curr].duration;},
    getText: function() {return this.sent[this.curr].txt;},
    getRequiresResponse: function() {return this.sent[this.curr].requiresResponse;},
    // epsilon is the exploration rate, returns 0,1,2,3 for the action
    getAction: function() {
        // // find the highest Q value action
        // var maxAction = 0;
        // for (var j = 1; j < actions; j++) {
        //     if (Q_table[state_curr][j] > Q_table[state_curr][maxAction]) {
        //         maxAction = j;
        //     }
        // }
        // // determine whether to explore to optimize
        // var rand = Math.random();
        // if (rand < epsilon) { // explore
        //     var non_maxAction = [];
        //     for (j = 0; j < actions; j++) { // determine options
        //         if (j != maxAction) {
        //             non_maxAction.push(j);
        //         }
        //     }
        //     // choose random from non max actions
        //     var exploreAction = getRandomInt(3);
        //     return non_optact[exploreAction];
        // } else {
        //     // go with best action
        //     return maxAction;
        // }
        var rand = Math.random();
        if (rand < 0.33) {return 1;}
        else if (rand < 0.66) {return 2;}
        else {return 3;}
    }
};



