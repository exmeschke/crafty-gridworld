// Human receptivity, robot requests / actions, and state-action information

// save data
var MDP = []; // starting_state [1:16], action [1:4], h_responded [true, false], reward 
var all_states = [19]; // state progression

// requests
// [0:none, 1-4:short notification, 5-7:long notification, 8:text response, 9:low battery, 10-11:task change, 12-13:broken robot, 14:very low battery, 15:emergency]
var request_indices = [];
var all_requests = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];


// STATE OF HUMAN
// definition for receptivity
function HReceptivity (availability, requestNum) {
    // VARIABLES
    // value of human receptivity
    this.val = (5-availability)/4;
    // availability at time of alert
    this.availability = availability;
    // request number
    this.requestNum = requestNum;
    // time = 0
    this.time_i = new Date().getTime()/1000;

    // HELPER FUNCS
    // updates value based on availability, request duration, and time
    this.updateValue = function(time_n) {
        var time = (time_n - this.time_i)/60;
        this.val = Math.exp(-time/5) * ((5-this.availability)/4);
    };
    // returns current value
    this.getValue = function() {return this.val;};
};
// tracks receptivity
var receptivity_list = {
    // receptivity - stores list of receptivity objects, one for each request
    list: [],
    // tracks current receptivity
    r_sum: 0.0,

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

    // STORES
    // another request set - store receptivity and update count + request number 
    setRequest: function(request_num) {
        // update temporary information
        this.request_num = request_num;
        // add receptivity to log
        var r_curr = new HReceptivity(this.availability, this.request_num);
        this.list.push(r_curr);
        // update current receptivity
        this.calcReceptivity();
    },
    // UPDATES
    // updates current information, based on task - called in Task.checkTasK();
    updateState: function(interacting, difficulty, moment, r_status) {
        // save current information
        this.interacting = interacting;
        this.difficulty = difficulty;
        this.moment = moment;

        // already interacting with robot [0]
        if (interacting == true) {
            this.availability = 0;
        }
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
            var r_sum = this.list.slice(-1)[0].getValue();
            Crafty.log(r_sum);
            // var r_sum = 0;

            // loop through receptivity for each request, apply function, and add to r_sum
            for (var i = 0; i < this.list.length-1; i++) {
                // updates receptivity
                var r_i = this.list[i];
                r_i.updateValue(time);
                Crafty.log(i, r_i.val);
                // adds val to sum
                r_sum += r_i.getValue();
            }
            Crafty.log('r_sum = '+r_sum);
            this.r_sum += r_sum;
        // if receptivity is empty
        } else {this.r_sum = 0.0;}
    },
    // returns receptivity as 'low' or 'high'
    getReceptivity: function() {
        var recep_threshold = 0.8;
        if (this.r_sum >= recep_threshold) {return 1;} // low
        else {return 2;} // high
    },
    // returns receptivity value
    getRSum: function() {return this.r_sum;},
    // returns current availability
    getAvailability: function() {return this.availability;},
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
    this.setReceptivity = function(receptivity) {this.receptivity = receptivity;};
    this.dist = -1;
    this.setDist = function(dist) {this.dist = dist;};
    this.doAction = -1;
    this.setDoAction = function(action) {this.doAction = action;};
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
    this.requestOptions[2] = new RRequest(1,1,1,1,false,"Debug any future issues by entering [X5214] at the monitor.");
    this.requestOptions[3] = new RRequest(1,1,1,1,false,'We lose money when I run out of battery!');
    this.requestOptions[4] = new RRequest(1,1,1,1,false,'Sometimes I give you helpful hints.');
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
    this.requestOptions[15] = new RRequest(8,2,2,2,true,"Something short circuited--I'm about to catch on fire! Put it out with 3 buckets of water. Then enter the code [X5214] at the monitor to debug the issue.");

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
    // state progression
    states: [],
    // current state enumerated [1:19]
    curr_state: 19,
    // most recent start state [1:16]
    start_state: -1,
    // experienced negative state
    neg_state: 0,
    // current request, will be pushed to sent after action set
    curr_req: '',

    // UPDATE REQUEST
    // updates this.curr_state
    updateCurrState: function(receptivity, urgency, duration, effort) {
        // starting states 1-16
        if (receptivity == 1 || receptivity == 2) {
            if (urgency == 1) { // low urgency
                if (duration == 1 && effort == 1) { // short duration & low effort
                    if (receptivity == 1) {this.curr_state = 1;} // low receptivity
                    else {this.curr_state = 2;} // high receptivity
                }
                else if (duration == 2 && effort == 1) { // long duration & low effort
                    if (receptivity == 1) {this.curr_state = 3;} // low receptivity
                    else {this.curr_state = 4;} // high receptivity
                }
            }
            else if (urgency == 2) { // med urgency
                if (duration == 1) { // short duration
                    if (effort == 1) { // low effort 
                        if (receptivity == 1) {this.curr_state = 5;} // low receptivity
                        else {this.curr_state = 6;} // high receptivity
                    }
                    else if (effort == 2) { // high effort
                        if (receptivity == 1) {this.curr_state = 7;} // low receptivity
                        else {this.curr_state = 8;} // high receptivity
                    }
                }
                else if (duration == 2) { // long duration
                    if (effort == 1) { // low effort 
                        if (receptivity == 1) {this.curr_state = 9;} // low receptivity
                        else {this.curr_state = 10;} // high receptivity
                    }
                    else if (effort == 2) { // high effort
                        if (receptivity == 1) {this.curr_state = 11;} // low receptivity
                        else {this.curr_state = 12;} // high receptivity
                    }
                }
            }
            if (urgency == 3) { // high urgency
                if (duration == 1 && effort == 1) { // short duration & low effort
                    if (receptivity == 1) {this.curr_state = 13;} // low receptivity
                    else {this.curr_state = 14;} // high receptivity
                }
                else if (duration == 2 && effort == 1) { // long duration & low effort
                    if (receptivity == 1) {this.curr_state = 15;} // low receptivity
                    else {this.curr_state = 16;} // high receptivity
                }
            }
            this.states = [];
        // non-starting states 17-19
        } else {
            if (urgency == 17) {this.curr_state = 17;}
            else if (urgency == 18) {this.curr_state = 18;}
            else if (urgency == 19) {this.curr_state = 19;}
        }
        // add to list of all states
        if (all_states.slice(-1)[0] != this.curr_state) {
            all_states.push(this.curr_state);
            this.states.push(this.curr_state);
            Crafty.log('states: '+all_states);
        }
    },
    // tracks requests that have been sent
    addRequest: function(request_num) {
        // new request = states 1-16
        if (request_num >= 1) {
            var new_req = this.possible[request_num];
            // update receptivity
            var receptivity = receptivity_list.getReceptivity();
            new_req.setReceptivity(receptivity);
            // update this.curr_req
            this.curr_req = new_req;
            // update this.curr_state
            this.updateCurrState(receptivity, new_req.urgency, new_req.duration, new_req.effort);
        }
    },
    // indicates most recent request was checked / responded to
    receivedResponse: function() {this.curr_req.setResponded();},
    // called after request is responded to or alert is stopped
    endRequest: function(h_responded, r_status) {
        if (this.curr_state <= 16) { // if a starting state, update
            this.start_state = this.curr_state; 
        } 
        if (r_status == 2) {
            if (h_responded == true) { // person is interacting
                request_list.updateCurrState(0,17,0,0);
            } else { // completed task, fully operational
                request_list.updateCurrState(0,19,0,0);
            } 
        } else {
            this.neg_state = 1;
            request_list.updateCurrState(0,18,0,0); // not fully operational
        }

        // if (h_responded == true) { 
        //     if (r_status == 2) {
        //         request_list.updateCurrState(0,17,0,0); 
        //     } else {
        //         this.neg_state = 1;
        //         request_list.updateCurrState(0,18,0,0); // not fully operational
        //     }
        // } else {
        //     if (r_status == 2) {request_list.updateCurrState(0,19,0,0);} // fully operational
        //     else {
        //         this.neg_state = 1;
        //         request_list.updateCurrState(0,18,0,0); // not fully operational
        //     } 
        // }
    },

    // RETURN INFORMATION
    // returns current in sent list
    getNumber: function() {return this.curr_req.number;},
    getDuration: function() {return this.curr_req.duration;},
    getText: function() {return this.curr_req.txt;},
    getRequiresResponse: function() {return this.curr_req.requiresResponse;},
    // epsilon is the exploration rate [0.2], returns 0,1,2,3 for the action
    getAction: function() {
        // indicate request is sent, updates receptivity
        receptivity_list.setRequest(this.curr_req.number);
        // grab current request information
        var state_curr = this.curr_state;
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

// SAVE INFORMATION
// ['time', 's0', 'a', 'progression', 'reward', 'task_num', 'dist', 'receptivity'];
var curr_int = []; 
// general information, saved at time of initiating request
function saveHInfo(time, task, dist) {
    for (var i = 0; i < 8; i++) {
        curr_int[i] = '';
    }
    curr_int[0] = time;
    curr_int[5] = task;
    curr_int[6] = dist;
}; 
// update Q-table based on state and action, saved at terminal state
function updateQ() {
    // curr request
    var request = request_list.curr_req;
    // state enumerated = i
    var states = request_list.states;
    var start_state = request_list.start_state;
    var curr_state = request_list.curr_state;
    var neg_state = request_list.neg_state;
    // action enumerated = j
    var action = request.doAction;
    // variables needed
    var urgency = request.urgency;
    var received_resp = request.responded;
    var duration = request.duration;
    var effort = request.effort;
    var receptivity = request.receptivity;
    
    // reward
    var r = 0.0;
    if (action == 0) {  // no action
        r = -1 * (0.5*(urgency-1) + neg_state);
    } else { // some action
        var rR = (0.85*urgency*received_resp) - (0.25*urgency + neg_state);
        var rH = (0.25*duration*effort*received_resp + (action/3)) / (receptivity*urgency);
        r = rR + rH;
    }
    neg_state = 0; // reset
    // Crafty.log(start_state, curr_state);
    Crafty.log('reward = '+r);

    // save data at terminal state
    if (curr_state == 19) {
        request_list.sent.slice(-1)[0].setReward(r); // store value in request
        Q_table[start_state-1][action] += r; // -1 to account for indices starting at 0

        curr_int[1] = start_state;
        curr_int[2] = action;
        curr_int[3] = states;
        curr_int[4] = r;
        MDP.push(curr_int);
        Crafty.log('MDP: '+MDP);
    }
};




