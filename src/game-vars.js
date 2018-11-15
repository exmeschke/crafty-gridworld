
// Game variables -- need to be accessed before entities defined
gv = {
	x_min: 5,
	y_max: 23,
	tile_sz: 24, // size of tiles

	score: 0, // score, updated each frame
	time: [0, 0], // time [min, sec], updated each frame
	player: {
		loc: [30, 16], // x and y coordinates
		interacting: false, // interacting with robot [true, false]
		difficulty: 0, // task difficulty [0:none, 1:low, 2:high]
		moment: '', // moment in task ['break','middle']
		energy: 100 // energy 
	}, 
	// track status of robot
	robot: {
		loc: [10, 5], // x and y coordinates
		status: 2, // [0:not operational, 1:slow, 2:normal]
		switch_task: 'no', // task
		// REQUEST - general
		alerts: {
			stop: 30000,
			len: [15, 30, 60], // number of beeps and/or blinks
			freq: [2000, 1000, 500] // frequency of beeps and/or blinks
		},
		is_alerting: false, // currently is alerting w/beep, blink, or both
		txt: '', // content for text bubble 
		incomplete_txt: '',
		// REQUEST - counts buckets if on fire [-1:no fire, 0-3:on fire]
		fire: -1, 
		// REQUEST - direction to move 5x
		direction: '',
		num_moved: 0,
		// REQUEST - part location
		part: {loc_x: -1, loc_y: -1}
	},
	// updated when robot moves to tile, field is 14 x 15
	field: {
		seed: [],
		wheat: []
	},
	// animal actions
	animal: {
		speed: 1500,
		sheep: {hasWool: 0},
		cow: {hasMilk: 0},
		snake: {eat_egg: 4000},
		gopher: {disappear: 12000}
	},
	tools:{
		bucket: 0, // fill at well [0:empty, 1:full]
		seed_bag: 0, // fill at barrels [0:empty, 1:full]
		tools: 0, // switch at stump [0:hammer on stump, 1:shears on stump]
		lgtools: 0, // switch on ground [0:shovel on ground, 1:scythe on ground]
		oven_on: false
	},
	// has berries [0:no, 1:yes]
	bush: 0,
	// tracks resource quantities, used to update score
	resources: {
		eggs: 0,
		berries: 0,
		wheat: 0,
		tomatos: 0,
		potatos: 0,
		wool: 0,
		milk: 0,
		bread: 0,
		muffin: 0,
		thread: 0
	},
	// resources needed to make items
	recipes: {
		bread: {
			wheat: 3, milk: 3, eggs: 6, 
			time: 25000
		}, 
		muffin: {
			wheat: 1, milk: 4, eggs: 8, berries: 10,
			time: 20000
		},
		thread: {
			wool: 3, berries: 7,
			time: 15000
		}
	}
}
for (var i = 0; i < 15; i++) {
	gv.field.wheat[i] = [];
	gv.field.seed[i] = [];
	for (var j = 0; j < 14; j++) {
		gv.field.wheat[i][j] = '';
		gv.field.seed[i][j] = '';
	}
}
