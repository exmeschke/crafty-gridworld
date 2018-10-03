/**
 * The game dynamics for robot requests. 
 *                                 
 Enumerates requests (urgency, duration, effort):
 *		0 = no request
 *      1 = low urgency,  short duration,  low effort, [1-4]
 *      2 = low urgency,  long duration,   low effort, [5-7]
 *      3 = med urgency,  short duration,  low effort, [8]
 *      4 = med urgency,  short duration,  high effort [9]
 *      5 = med urgency,  long duration,   low effort  [10-11]
 *      6 = med urgency,  long duration,   high effort [12-13]
 *      7 = high urgency, short duration,  high effort [14]
 *      8 = high urgency, long duration,   high effort [15]
 *
 * RRequest 		Constructor function to define a robot request.
 * request_list		Stores all possible robot requests and returns new 
 **/

/**
 * RRequest - Constructor function to define a robot request.
 * 
 * @param {int}     number				Request enumerated [0:8]
 * @param {int}     urgency				[0 = no request, 1 = low, 2 = med, 3 = high]
 * @param {int}     duration			[0 = no request, 1 = short, 2 = long]
 * @param {int}     effort      		[0 = no request, 1 = low, 2 = high]
 * @param {str}     text        		Text to show to player. 
 * @param {bool}	requiresResponse 	Whether the player must respond or not
 * @param {int} 	
 **/
function RRequest(number, urgency, duration, effort, text) {
    this.number = number;
    this.urgency = urgency;
    this.duration = duration;
    this.effort = effort;
    this.txt = text;
    this.requiresResponse = function() {
    	if (this.number < 3) {return false;}
    	else {return true;}
    };

    // updated upon sending request
    this.receptivity = -1;
    this.dist = -1;
    this.doAction = -1;
    this.responded = 0;
    this.reward = 0;
    this.setReceptivity = function(receptivity) {this.receptivity = receptivity;};
    this.setDist = function(dist) {this.dist = dist;};
    this.setDoAction = function(action) {this.doAction = action;};
    this.setResponded = function() {this.responded = 1;};
    this.setReward = function(R) {this.reward = R;};
};

// Stores all possible robot requests and returns request at index given.
function newRequest(index) {
	switch (index) {
		case 0:
			return new RRequest(0,0,0,0,'');
		case 1:
			return new RRequest(1,1,1,1,'Baked goods can burn!');
		case 2:
			return new RRequest(1,1,1,1,"Debug any future issues by entering [X5214] at the monitor.");
		case 3:
			return new RRequest(1,1,1,1,'We lose money when I run out of battery!');
		case 4:
			return new RRequest(1,1,1,1,'You can break rocks with your hammer.');
		case 5:
			return new RRequest(2,1,2,1,'A locked treasure chest is burried somewhere under a tuft of grass. You have to be carrying your shovel to dig it up. And be careful, it will explode a minute after it is revealed! If you open it, you get $20, so you need to figure out how to open it quickly.');
		case 6:
			return new RRequest(2,1,2,1,'Different resources are worth different amounts of money. Try to make bread; you get $15 per loaf! The recipe is 6 eggs, 4 milk, and 2 wheat. You can also make muffins to earn $18, with 10 berries, 8 eggs, 4 milk, and 1 wheat. If you forget the recipes, open the book near the well.');
		case 7:
			return new RRequest(2,1,2,1,'Animals will occasionally pop up in your environment. Gophers and snakes are pesky. Gophers will steal $1 if they disappear and snakes will steal an egg from you every 4 seconds. But you get a one dollar reward for each one you catch! The same goes for butterflies, but they do not steal any of your resources.');
		case 8:
			return new RRequest(3,2,1,1,'I want to start planting. Can you bring me seeds from the barrels?');
		case 9:
			return new RRequest(3,2,1,1,'I need to water the plants. Can you bring me water from the well?');
		case 10:
			return new RRequest(4,2,1,2,'My battery is less than 20%. Push or pull me over to the charging station to recharge my battery.');
		case 11:
			return new RRequest(5,2,2,1,"Should I switch tasks? Enter your response [yes, no] at the monitor. If your answer is yes, bring me seeds from the barrels to switch to planting and water from the well to switch to watering.");
		case 12:
			return new RRequest(6,2,2,2,'One of my parts is missing! Push or pull me around the field; I will beep faster the closer you are.');
		case 13:
			return new RRequest(6,2,2,2,'Enter the password [X91R23Q7] at the monitor to update my software!');
		case 14:
			return new RRequest(7,3,1,2,'My battery is less than 5%! Push or pull me over to the charging station to recharge my battery.');
		case 15:
			return new RRequest(8,3,2,2,"Something short circuited--I'm about to catch on fire! Put it out with 3 buckets of water. Then enter the code [X5214] at the monitor to debug the issue.");
		default:
			return new RRequest(0,0,0,0,'');
	}
};


