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

// this.request = Crafty.e('RobotRequest').at(6,9);
// this.robot.attach(this.request);