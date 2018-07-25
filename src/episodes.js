var states = {
	robot: {
		urgency: ['low','med','high'],
		duration: ['short','long'],
		effort: ['low','high']
	},
	human: {
		availability: [0,1,2,3,4],
		receptiveness: ['low','high']
	}
}

// Alerts
var sounds = {
	play_low: function() {
		Crafty.audio.play('alert_low');
	},
	play_med: function() {
		Crafty.audio.play('alert_med');
	},
	play_high: function() {
		Crafty.audio.play('alert_high');
	},
	play_cow: function() {
		Crafty.audio.play('cow');
	},
	play_sheep: function() {
		Crafty.audio.play('sheep');
	}
}

// Human tasks
var tasks = {
	curr: 0,
	text: [
		'Gather 20 eggs.',
		'Make bread.'
	]
}
// The treasure chest is located at coordinates (x, y). 
// The 

// this.request = Crafty.e('RobotRequest').at(6,9);
// this.robot.attach(this.request);


// var person = prompt("Please enter your name", "Harry Potter");
// if (person == null || person == "") {
//     txt = "User cancelled the prompt.";
// } else {
//     txt = "Hello " + person + "! How are you today?";
// }

// Snake 
// this.snake = Crafty.e('Snake').at(42,8);

