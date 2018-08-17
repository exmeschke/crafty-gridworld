// Generates human task list, human availability function, robot requests / actions, and state-action information

// SET FOR GAME
// tasks
// [0:none, 1:wheat, 2:berries, 3:eggs, 4:wool, 5:milk, 6:gophers, 7:butterflies, 8:snakes, 9:chest, 10:bread, 11:muffin, 12:thread]
var task_indices = [7,0,1,2,3,0,0,4,6,8,9,0,8,11,3,5,0];
// requests
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
    this.taskOptions[9] = new HTask(5, 1, 'Grab your shovel and open the treasure chest burried under a tuft of grass (ticking means it might explode!)', ['',0], 'chest_task();');
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


// STATE OF HUMAN
// definition for receptivity
function HReceptivity (availability, duration, requestNum) {
    // VARIABLES
    // value of human receptivity
    this.val = availability/2;
    // availability at time of alert
    this.availability = availability;
    // duration of alert
    this.duration = duration;
    // request number
    this.requestNum = requestNum;
    // time = 0
    this.time_i = new Date().getTime()/1000;

    // HELPER FUNCS
    // updates value based on availability, request duration, and time
    this.updateValue = function(time_n) {
        var factor = -1; // TBD
        this.val = Math.exp(factor * (time_n-this.time_i)) * (this.availability/(2*this.duration));
    };
    // returns current value
    this.getValue = function() {return this.val;};
};
// tracks receptivity
var receptivity_list = {
    // receptivity - stores list of receptivity objects, one for each request
    list: [],
    // tracks current receptivity
    r_sum: 1.0,

    // CURRENT VARIABLES
    // request number - [0:8]
    request_num: -1,
    // duration - [0:none, 1:short, 2:long]
    duration: -1,
    // availability - [0:interacting, 1, 2, 3, 4]
    availability: -1,
    // interacting - [true, false]
    interacting: false,
    // difficulty - task difficulty [0:none, 1:low, 2:high]
    difficulty: -1,
    // moment - moment of interruption ['break', 'middle']
    moment: '',

    // STORES
    // another request set - store receptivity and update count + request number 
    setRequest: function(request_num, duration) {
        // update temporary information
        this.request_num = request_num;
        this.duration = duration;
        // add receptivity to log
        var r_curr = new HReceptivity(this.availability, this.request_num);
        this.list.push(r_curr);
        // update current receptivity
        this.calcReceptivity();
    },
    // UPDATES
    // updates current information, based on task - called in Task.checkTasK();
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
    },
    // RETURNS
    // implements receptivity function
    calcReceptivity: function() {
        // if receptivity is not empty
        if (this.list.length != 0) {
            // current time
            var time = new Date().getTime()/1000;
            // summed receptivity
            // var r_sum = this.list.slice(-1)[0].getValue();
            var r_sum = 0;

            // loop through receptivity for each request, apply function, and add to r_sum
            for (var i = 0; i < this.list.length; i++) {
                // updates receptivity
                var r_i = this.list[i];
                r_i.updateValue(time);
                // adds val to sum
                r_sum += r_i.getValue();
            }
            Crafty.log('r_sum = '+r_sum);
            this.r_sum += r_sum;
        // if receptivity is empty
        } else {this.r_sum = 1.0;}
    },
    // returns receptivity as 'low' or 'high'
    getReceptivity: function() {
        var recep_threshold = 0.5;
        if (this.r_sum > recep_threshold) {return 2;}
        else {return 1;}
    },
    // PRINTS
    printState: function() {Crafty.log(this.availability, this.interacting, this.difficulty, this.moment);}
};  


// STATE OF ROBOT
// robot request definition
//      number - request number
//      urgency - [0, 1:low, 2:med, 3:high]
//      duration - [0, 1:short, 2:long]
//      effort - [0, 1:low, 2:high]
//      text - text to show to player
//      requiresResponse - [true, false]
//      doAction - the action the robot chooses to use [-1, 0:4]
function RRequest(number, urgency, duration, effort, resp, text) {
    this.number = number;
    this.urgency = urgency;
    this.duration = duration;
    this.effort = effort;
    this.txt = text;
    this.requiresResponse = resp;

    // updated upon sending request
    this.receptivity = -1;
    this.setReceptivity = function(receptivity) {this.receptivity = receptivity;}
    this.doAction = -1;
    this.setDoAction = function(action) {this.doAction = action;}
    this.responded = 0;
    this.setResponded = function() {this.responded = 1;};
    // reward for request
    this.reward = 0;
    this.setReward = function(R) {this.reward = R;}
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
    // request options
    possible: new RRequestList(all_requests),
    // list of requests sent (empty at beginning)
    sent: [],

    // CURRENT VARIABLES
    // current state enumerated [0:19], 0 is no request
    curr_state: 0,
    // current request, will be pushed to sent after action set
    curr_req: '',

    // UPDATE REQUEST
    // updates this.curr_state
    updateCurrState: function(receptivity, urgency, duration, effort) {
        // low urgency
        if (urgency == 1) {
            // short duration & low effort
            if (duration == 1 && effort == 1) {
                // low receptivity
                if (receptivity == 1) {this.curr_state = 1;}
                // high receptivity
                else {this.curr_state = 2;}
            }
            // long duration & low effort
            else if (duration == 2 && effort == 1) {
                // low receptivity
                if (receptivity == 1) {this.curr_state = 3;}
                // high receptivity
                else {this.curr_state = 4;}
            }
        }
        // med urgency
        else if (urgency == 2) {
            // short duration
            if (duration == 1) {
                // low effort 
                if (effort == 1) {
                    // low receptivity
                    if (receptivity == 1) {this.curr_state = 5;}
                    // high receptivity
                    else {this.curr_state = 6;}
                }
                // high effort
                else if (effort == 2) {
                    // low receptivity
                    if (receptivity == 1) {this.curr_state = 7;}
                    // high receptivity
                    else {this.curr_state = 8;}
                }
            }
            // long duration
            else if (duration == 2) {
                // low effort 
                if (effort == 1) {
                    // low receptivity
                    if (receptivity == 1) {this.curr_state = 9;}
                    // high receptivity
                    else {this.curr_state = 10;}
                }
                // high effort
                else if (effort == 2) {
                    // low receptivity
                    if (receptivity == 1) {this.curr_state = 11;}
                    // high receptivity
                    else {this.curr_state = 12;}
                }
            }
        }
        // high urgency
        if (urgency == 3) {
            // short duration & low effort
            if (duration == 1 && effort == 1) {
                // low receptivity
                if (receptivity == 1) {this.curr_state = 13;}
                // high receptivity
                else {this.curr_state = 14;}
            }
            // long duration & low effort
            else if (duration == 2 && effort == 1) {
                // low receptivity
                if (receptivity == 1) {this.curr_state = 15;}
                // high receptivity
                else {this.curr_state = 16;}
            }
        }
    },
    // tracks requests that have been sent
    addRequest: function(request_num) {
        // new request
        if (request_num != -1) {
            var new_request = this.possible[request_num];
            // grab information
            var urgency = new_request.urgency;
            var duration = new_request.duration;
            var effort = new_request.effort;
            // update receptivity
            var receptivity = receptivity_list.getReceptivity();
            new_request.setReceptivity(receptivity);
            // update this.curr_req
            this.curr_req = new_request;
            Crafty.log(this.curr_req);
            // update this.curr_state
            this.updateCurrState(receptivity, urgency, duration, effort);
        }
    },
    // indicates most recent request was checked / responded to
    receivedResponse: function() {this.curr_req.setResponded();},

    // RETURN INFORMATION
    // returns current in sent list
    getNumber: function() {return this.curr_req.number;},
    getDuration: function() {return this.curr_req.duration;},
    getText: function() {return this.curr_req.txt;},
    getRequiresResponse: function() {return this.curr_req.requiresResponse;},
    // epsilon is the exploration rate, returns 0,1,2,3 for the action
    getAction: function() {
        // indicate request is sent, updates receptivity
        receptivity_list.setRequest(this.curr_req.number, this.curr_req.duration);
        // grab current request information
        var state_curr = this.curr_state;
        var epsilon = 0.2;
        var doAction = -1;
        // find the highest Q value action
        var maxAction = 0;
        for (var j = 1; j < actions; j++) {
            if (Q_table[state_curr][j] > Q_table[state_curr][maxAction]) {
                maxAction = j;
            }
        }
        // determine whether to explore or optimize
        var rand = Math.random();
        // explore
        if (rand < epsilon) { 
            var non_maxAction = [];
            for (j = 0; j < actions; j++) { // determine options
                if (j != maxAction) {
                    non_maxAction.push(j);
                }
            }
            // choose random from non max actions
            var exploreAction = Math.floor(Math.random() * 3);
            doAction = exploreAction;
        // go with best action
        } else {
            doAction = maxAction;
        }
        // update request object action
        this.curr_req.setDoAction(doAction);
        // log in sent list
        this.sent.push(this.curr_req);
        // return action to perform
        return doAction;
    }
};

// SAVE
// state progression - starting state, state progression, action, reward 
function saveStates() {
    // current vars
    var request = request_list.curr_req;
    
};

// update Q-table based on state and action
function updateQ() {
    // curr request
    var request = request_list.curr_req;
    // state enumerated = i
    var state_curr = request_list.curr_state;
    // action enumerated = j
    var action = request.doAction;
    // variables needed
    var urgency = request.urgency;
    var received_resp = request.responded;
    var duration = request.duration;
    var receptivity = request.receptivity;
    // R = reward - cost
    var R = 0.0;
    var reward = urgency*received_resp;
    var cost = (action*duration)/(receptivity*urgency);
    R = reward - cost;
    Crafty.log(urgency+'*'+received_resp, '-', '('+action+'*'+duration+')/('+receptivity+'*'+urgency+')');
    Crafty.log(reward+'-'+cost);
    // store value in request
    request_list.sent.slice(-1)[0].setReward(R);
    // update Q-table
    Q_table[state_curr][action] += R;
};




