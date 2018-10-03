// PLAYER CHARACTER
function set_h_info() {
	var time = gv.time[0]+':'+gv.time[1];
	var dist = dist_robot_player(); // distance between robot and human
	var task_num = task_list.getNum(); // human task 
	saveHInfo(time, task_num, dist); // save at initial time of alert 
};
function dist_robot_player () {
	Crafty.trigger('GetLocation'); // updates locations
	var xx = gv.player.loc[0] - gv.robot.loc[0];
	var yy = gv.player.loc[1] - gv.robot.loc[1];
	var dist = Math.round(Math.sqrt(Math.pow(xx,2)+Math.pow(yy,2)));
	return dist;
};

// ROBOT CHARACTER
// sound for robot alert
function robot_alert_sound(saliency) {
	sounds.play_med();
	for (var i = 0; i < gv.robot.alerts.len[saliency]; i++) {
	    setTimeout(function() {
	    	// stop alert if player responds
	    	if (gv.robot.is_alerting == false) {return;}
	    	else {sounds.play_med();}
	    }, gv.robot.alerts.freq[saliency]*i);
	}
};
// indicates request was sent
function set_request(time) {
	// set trigger for new request
	setTimeout(function() {
		// get information and update text
		var text = request_list.getText();
		update_robot_text(text);
		// initialize action (alert)
		var action = request_list.getAction();
		// var action = 0;
		// do chosen action
		if (action == 0) {Crafty.trigger('StopAlert');}
		else if (action == 1) {Crafty.trigger('LowAlert');}
		else if (action == 2) {Crafty.trigger('MedAlert');}
		else if (action == 3) {Crafty.trigger('HighAlert');}
		// save human information
		set_h_info();
		// output to console
		Crafty.log(text, action);
	}, time);
};
// sets speed depending on status
function set_robot_speed(status) {
	gv.robot.status = status;
	Crafty.trigger('SetSpeed');
};
// establishes that the robot is not fully operational
function not_operational(dead) {
	if (dead == 0) {set_robot_speed(0);}
	else {set_robot_speed(1);}
	request_list.endRequest(gv.player.interacting, gv.robot.status);
	// set for speed to return to normal
	setTimeout(function() {terminal_state();}, 30000);
};
// request timed out, still end state
function request_timeout(req_num) {
	var curr_state = request_list.curr_state;
	var start_state = request_list.start_state; // check current start state
	Crafty.log(req_num, start_state);
	if (req_num == start_state) { // stuck on request, end automatically
		var time = gv.time[0]+':'+gv.time[1]; // get time
		set_robot_speed(2); // reset speed
		gv.player.interacting = false; // no longer interacting
		request_list.endRequest(gv.player.interacting, gv.robot.status); // update state
		updateQ(time); // update Q-table with reward
	}
};
// establishes that the state progression is over
function terminal_state() {
	var time = gv.time[0]+':'+gv.time[1]; // get time
	// notify user that request complete
	sounds.play_correct();
	gv.score += 1;
	set_robot_speed(2); // reset speed
	gv.player.interacting = false; // no longer interacting
	request_list.endRequest(gv.player.interacting, gv.robot.status); // update state
	updateQ(time); // update Q-table with reward
};

// REQUESTS
function update_robot_text(text) {gv.robot.txt = text;};
function hide_robot_text() {Crafty.trigger('HideRequest');};
Crafty.c('RobotRequest', {
	_incomplete_txt: '', // shows text one letter at a time
	init: function() {
		this.requires('2D, DOM, Grid, Color, Text')
			.attr({ w:gv.tile_sz*52, h:gv.tile_sz*13, z:10 })
			.textFont({ size: '20px' })
			.css({ 'font-family':'Courier', 'padding-top':'200px' })
			.textAlign('center')
			.bind('UpdateText', this.updateText)
			.bind('ShowRequest', this.showRequest)
			.bind('HideRequest', this.hideRequest)
			.bind('UpdateFrame', this.waitForResponse)
	},
	updateText: function() {this.text(gv.robot.incomplete_txt);},
	showRequest: function() {
		// indicates player responded
		gv.player.interacting = true;
		request_list.receivedResponse();
		// stops alert
		Crafty.trigger('StopAlert');
		// shows popup
		this.color('#D7E0DA', .98);
		var a = 0;
		for (var i = 0; i <= gv.robot.txt.length; i++) {
			setTimeout(function(i) {
				gv.robot.incomplete_txt = gv.robot.txt.slice(0,a);
				Crafty.trigger('UpdateText');
				a += 1;
			}, 100*i);
		}
		setTimeout(hide_robot_text, (gv.robot.txt.length+40)*100);
	},
	hideRequest: function() {
		this.color("#FFFFFF", 0).text('');
		gv.robot.txt = '';
		// if no response required, player no longer interacting
		var requiresResponse = request_list.getRequiresResponse();
		if (requiresResponse == false) {terminal_state();}
	}
});

Crafty.c('RequestScreen', {
	init: function() {
		this.requires('2D, Canvas, Grid, Delay, SpriteAnimation, spr_screen')
			.attr( {w:50, h:42, z:1 })
			.reel('ScreenFlash', 1000, [ [1,0], [0,0] ])
			.bind('ReceiveResponse', this.receiveResponse)
	},
	receiveResponse: function() {
		// collects response
		var resp = prompt('Enter response here: ');
		if (resp == 'yes') {
			if (request_list.getNumber() == 5) {
				gv.robot.switch_task = 'yes';

			}
		} else if (resp == 'no') {
			if (request_list.getNumber() == 5) {terminal_state();}
		} else if (resp == 'X91R23Q7') { // password for high cognitive load request
			if (request_list.getNumber() == 6) {terminal_state();}
		} else if (resp == 'X5214') { // password to reset robot speed
			if (request_list.getNumber() == 8) {terminal_state();}
			set_robot_speed(2);
		}
	}
});

