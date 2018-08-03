// Contains the component definitions and rules for the environment

// Game variables
gv = {
	// size of tiles
	tile_sz: 24,
	// score, updated for each frame
	score: 0,
	// tracks player location ['up','down','left','right']
	player: {
		movement: [],
		no_movement: 0
	}, 
	// control current robot action
	robot: {
		speed: 1200,
		movement: [],
		// tracks robot power
		power: 50,
		// how often -10 power
		battery_life: 20000,
		// stops moving if charging == 1
		charging: 0,
		// [-1:none, 0:plant, 1:water, 2:pick]
		task: -1,
		// [0:no alert, 1:an alert]
		alert: 0,
		// content for text bubble 
		incomplete_txt: '',
		txt: ''
	},
	// updated when robot moves to tile
	field: {
		seed_loc_x: [],  seed_loc_y: [],
		wheat_loc_x: [], wheat_loc_y: []
	},
	animal: {
		speed: 1500,
		sheep: {
			movement: [],
			hasWool: 0
		},
		cow: {
			movement: [],
			hasMilk: 0
		},
		chicken: {movement: []},
		snake: {eat_egg: 4000},
		gopher: {disappear: 20000}
	},
	tools:{
		// fill at well [0:empty, 1:full]
		bucket: 0,
		// fill at barrels [0:empty, 1:full]
		seed_bag: 0,
		// switch at stump [0:hammer on stump, 1:shears on stump]
		tools: 0,
		// switch on ground [0:shovel on ground, 1:scythe on ground]
		lgtools: 0
	},
	// has berries [0:no, 1:yes]
	bush: 0,
	// tracks resource quantities, used to update score
	resources: {
		eggs: 0,
		berries: 0,
		wheat: 0,
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

// Grid
Crafty.c('Grid', {
	init: function() {this.attr({ w: gv.tile_sz, h: gv.tile_sz })},
	at: function(x, y) {
		this.attr({ x: x*gv.tile_sz, y: y*gv.tile_sz })
		return this;
	},
	pos: function() { return this.x, this.y; }
});


// Player character
Crafty.c('Player', {
	_back: 1.6,
	init: function() {
		this.requires('2D, Canvas, Grid, Fourway, Keyboard, Collision, Delay, spr_player, SpriteAnimation')
			.attr({ w:gv.tile_sz, h:gv.tile_sz, z:5 })
			.fourway(80) //80
			.onHit('Obstacle', this.stopMovement)
			.onHit('Resource', function() {
				var hitDatas, hitData;
				if ((hitDatas = this.hit('Resource'))) {hitDatas[0].obj.collect();}
			})
			.onHit('Robot', this.pushRobot)
			.reel('PlayerMovingUp', 600, [
				[0,0], [1,0], [2,0]
			])
			.reel('PlayerMovingRight', 500, [
				[0,1], [1,1], [2,1]
			])
			.reel('PlayerMovingDown', 600, [
				[0,2], [1,2], [2,2]
			])
			.reel('PlayerMovingLeft', 500, [
				[0,3], [1,3], [2,3]
			])
			.bind('NewDirection', function(data) {
				var animation_speed = 20;
				if (data.x > 0) {
					this.animate('PlayerMovingRight', animation_speed, -1);
					gv.player.movement.push('right');
				} else if (data.x < 0) {
					this.animate('PlayerMovingLeft', animation_speed, -1);
					gv.player.movement.push('left');
				} else if (data.y > 0) {
					this.animate('PlayerMovingDown', animation_speed, -1);
					gv.player.movement.push('down');
				} else if (data.y < 0) {
					this.animate('PlayerMovingUp', animation_speed, -1);
					gv.player.movement.push('up');
				} else {
					this.pauseAnimation();
				}
				if (gv.player.movement.length > 5) {gv.player.movement.shift();}
			})
			.bind('KeyDown', function(e) {
				if (e.key == Crafty.keys.X) {this.action();} 
				if (e.key == Crafty.keys.R) {this.reset();}
				if (e.key == Crafty.keys.SPACE) {Crafty.trigger('HideRequest');}
			})
			.bind('UpdateFrame', this.noMovement)
	},
	// resets location if off screen
	reset: function() {
		gv.score -= 5;
		this.at(30,16);
	},
	// action triggered by hitting object and pressed 'X'
	action: function() {
		var hitDatas, hitData;
		if ((hitDatas = this.hit('Well'))) {
			Crafty.trigger('FillBucket');
		} else if ((hitDatas = this.hit('Barrel'))) {
			Crafty.trigger('FillSeedBag');
		} else if ((hitDatas = this.hit('Stump'))) {
			Crafty.trigger('SwitchTools');
		} else if ((hitDatas = this.hit('GroundTools'))) {
			Crafty.trigger('SwitchLgTools');
		} else if ((hitDatas = this.hit('Book'))) { 
			Crafty.trigger('OpenBook');
		} else if ((hitDatas = this.hit('RequestScreen'))) {
			Crafty.trigger('ShowRequest');	
		} else if ((hitDatas = this.hit('BerryBush'))) {
			// if the bush has berries, collect berries
			if (gv.bush == 1) {
				Crafty.trigger('CollectBerries');
			// if the bush is empty and the bucket is full, water the bush
			} else if (gv.bush == 0 && gv.tools.bucket == 1) {
				Crafty.trigger('WaterBush');
			} else {sounds.play_low();}
		} else if ((hitDatas = this.hit('Sheep'))) {
			// if the sheep has wool and the holding shears, collect wool
			if (gv.animal.sheep.hasWool == 1 && gv.tools.tools == 0) {
				Crafty.trigger('Sheared');
			} else {sounds.play_low();}
		} else if ((hitDatas = this.hit('Cow'))) {
			// if the cow has milk and the bucket is empty, collect milk
			if (gv.animal.cow.hasMilk == 1 && gv.tools.bucket == 0) {
				Crafty.trigger('Milked');
			} else {sounds.play_low();}
		} else if ((hitDatas = this.hit('Gopher'))) {
			// if holding hammer, hit gopher
			if (gv.tools.tools == 1) {hitDatas[0].obj.hitGopher();}
			else {sounds.play_low();}
		} else if ((hitDatas = this.hit('Snake'))) {
			// if holding hammer, hit snake
			if (gv.tools.tools == 1) {hitDatas[0].obj.hitSnake();}
			else {sounds.play_low();}
		} else if ((hitDatas = this.hit('Chest'))) {
			// if chest is hidden and holding shovel, reveal the chest
			if (task_funcs.chestGetRevealed() == 0 && gv.tools.lgtools == 1) {
				Crafty.trigger('DigChest');
			// if chest is revealed, try to open chest
			} else if (task_funcs.chestGetRevealed() == 1) {
				Crafty.trigger('OpenChest');
			} else {sounds.play_low();}
		} else if ((hitDatas = this.hit('Rock'))) {
			// if holding hammer, break rock
			if (gv.tools.tools == 1) {
				hitDatas[0].obj.break();
			} else {sounds.play_low();}
		} else if ((hitDatas = this.hit('Wheat4'))) {
			// if holding scythe, collect wheat
			if (gv.tools.lgtools == 0) {
				Crafty.trigger('WheatCount');
				hitDatas[0].obj.destroy();
			} else {sounds.play_low();}
		} else if ((hitDatas = this.hit('Oven'))) {
			// ask what to bake
			var bake = prompt('What would you like to bake (bread or muffin)?');
			if (bake == 'bread') {
				// check if have enough resources to make bread
				if (gv.resources.eggs >= gv.recipes.bread.eggs && gv.resources.milk >= gv.recipes.bread.milk && gv.resources.wheat >= gv.recipes.bread.wheat){
					Crafty.trigger('BakeBread');
				} else {sounds.play_low();}
			} else if (bake == 'muffin') {
				// check if have enough resources to make muffin
				if (gv.resources.eggs >= gv.recipes.muffin.eggs && gv.resources.milk >= gv.recipes.muffin.milk && gv.resources.wheat >= gv.recipes.muffin.wheat){
					Crafty.trigger('BakeMuffin');
				} else {sounds.play_low();}	
			} else {sounds.play_low();}
		} else if ((hitDatas = this.hit('SpinningWheel'))) { 
			// check if have enough resources to make thread
			if (gv.resources.wool >= gv.recipes.thread.wool && gv.resources.berries >= gv.recipes.thread.berries) {
				Crafty.trigger('MakeThread');
			} else {sounds.play_low();}
		} else {
			// default plays tone and empties bucket
			sounds.play_low();
			Crafty.trigger('EmptyBucket');
			// Crafty.trigger('ShowRequest');
		}
	},
	// prevents from moving through obstacles
	stopMovement: function() {
		if (gv.player.movement.slice(-1) == 'up') {
			this.attr({ x:this.x, y:this.y+this._back });
		} else if (gv.player.movement.slice(-1) == 'down') {
			this.attr({ x:this.x, y:this.y-this._back });
		} else if (gv.player.movement.slice(-1) == 'right') {
			this.attr({ x:this.x-this._back, y:this.y });
		} else {
			this.attr({ x:this.x+this._back, y:this.y });
		}
	}, 
	// pushes robot
	pushRobot: function() {
		// hands item to robot to trigger robot action
		if (Crafty.s('Keyboard').isKeyDown('X')) {
			// if robot is alerting person, trigger show response
			if (gv.robot.alert == 1) {
				Crafty.trigger('ShowRequest');
			// if seed bag full, set robot task to plant
			} else if (gv.tools.seed_bag == 1) {
				Crafty.trigger('Plant');
				Crafty.trigger('EmptySeedBag');
			// if robot is planting and bucket is full
			} else if (gv.robot.task == 0 && gv.tools.bucket == 1) {
				Crafty.trigger('Water');
				Crafty.trigger('EmptyBucket');
			}
		}
		// slow down player and trigger robot movement
		if (gv.player.movement.slice(-1) == 'up') {
			this.attr({ x:this.x, y:this.y+this._back-.4 });
			Crafty.trigger('RobotUp');
		} else if (gv.player.movement.slice(-1) == 'down') {
			this.attr({ x:this.x, y:this.y-this._back+.4 });
			Crafty.trigger('RobotDown');
		} else if (gv.player.movement.slice(-1) == 'right') {
			this.attr({ x:this.x-this._back+.4, y:this.y });
			Crafty.trigger('RobotRight');
		} else {
			this.attr({ x:this.x+this._back-.4, y:this.y });
			Crafty.trigger('RobotLeft');
		}
	}
});


// Robot character
Crafty.c('Robot', {
	init: function() {
		this.requires('2D, Canvas, Grid, Collision, SpriteAnimation, spr_bot, Tween, Delay, Text')
			.attr({ w: gv.tile_sz+2, h: gv.tile_sz+2, z:1 })
			.delay(this.randomMove, 1500, -1)
			.delay(this.losePower, gv.robot.battery_life, -1)
			.onHit('Solid', this.turnAround)
			.onHit('ChargingStation', this.recharge)
			.reel('AnimateLight', 1000, [
				[1,0], [0,0]
			])
			.bind('RobotUp', this.moveUp)
			.bind('RobotDown', this.moveDown)
			.bind('RobotLeft', this.moveLeft)
			.bind('RobotRight', this.moveRight)
			.bind('Plant', this.plant)
			.bind('Water', this.water)
			.bind('Pick', this.pick)
			.bind('LowAlert', this.lowAlert)
			.bind('MedAlert', this.medAlert)
			.bind('HighAlert', this.highAlert)
			.bind('StopAlert', this.stopAlert)
			.bind('KeyDown', function(e) {if (e.key == Crafty.keys.R) {this.reset();}})
	},
	// resets location if off screen
	reset: function() {this.at(5,10);},
	char: function() {return 'robot';},
	lastMovement: function() {return gv.robot.movement.slice(-1);},
	// checks last movement and does opposite 
	turnAround: function() {
		var movement = this.lastMovement();
		if (movement == 'up') {this.moveDown();}
		else if (movement == 'down') {this.moveUp();}
		else if (movement == 'right') {this.moveLeft();}
		else {this.moveRight();}
	},
	// does random movement
	randomMove: function() {
		if (this.x/gv.tile_sz < 15 && this.y/gv.tile_sz < 15 && this.x/gv.tile_sz > 1 && this.y/gv.tile_sz > 1) {
			this.tendPlants();
		}

		if (this.x/gv.tile_sz < 2) {this.moveRight();}
		else if (this.y/gv.tile_sz < 2) {this.moveDown();}
		else if (this.y/gv.tile_sz > 15) {this.moveUp();}
		else if (this.x/gv.tile_sz > 16) {this.moveLeft();}
		else {
			if (gv.robot.power > 0 && gv.robot.charging == 0) {
				var ra = Math.random()
				if (ra < 0.25) {this.moveUp();}
				else if (ra < 0.50) {this.moveDown();}
				else if (ra < 0.75) {this.moveLeft();}
				else {this.moveRight();}
			}
		}
	},
	moveUp: function() {
		gv.robot.charging = 0;
		this.tween({ x: this.x, y: this.y-gv.tile_sz }, gv.robot.speed)
		gv.robot.movement.push('up');
		if (gv.robot.movement.length > 5) {gv.robot.movement.shift();}
	},
	moveDown: function() {
		gv.robot.charging = 0;
		this.tween({ x: this.x, y: this.y+gv.tile_sz }, gv.robot.speed)
		gv.robot.movement.push('down');
		if (gv.robot.movement.length > 5) {gv.robot.movement.shift();}
	},
	moveLeft: function() {
		gv.robot.charging = 0;
		this.tween({ x: this.x-gv.tile_sz, y: this.y }, gv.robot.speed)
		gv.robot.movement.push('left');
		gv.robot.movement.push('left');
		if (gv.robot.movement.length > 5) {gv.robot.movement.shift();}
	}, 
	moveRight: function() {
		gv.robot.charging = 0;
		this.tween({ x: this.x+gv.tile_sz, y: this.y }, gv.robot.speed)
		gv.robot.movement.push('right');
		gv.robot.movement.push('right');
		if (gv.robot.movement.length > 5) {gv.robot.movement.shift();}
	},
	// -10 robot power
	losePower: function() {
		if (gv.robot.charging == 0) {
			if (gv.robot.power >= 10) {gv.robot.power -= 10;}
			else {gv.robot.power = 0;}
		}
	},
	// adds to robot power
	recharge: function() {
		if (gv.robot.power < 100) {
			gv.robot.power += .05;
			gv.robot.charging = 1;
		} else {
			gv.robot.power = 100;
			gv.robot.charging = 0;
		}
	},
	// either plants, waters, or collects wheat
	tendPlants: function() {
		if (gv.robot.task == 0) {this.plant();}
		else if (gv.robot.task == 1) {this.water();}
		else if (gv.robot.task == 2) {this.pick();}
	},
	plant: function() {
		gv.robot.task = 0;

		var x = Math.round(this.x/gv.tile_sz);
		var y = Math.round(this.y/gv.tile_sz);

		Crafty.e('Wheat2').at(x, y);
		if (gv.field.seed_loc_x.indexOf(x) == -1) {gv.field.seed_loc_x.push(x);}
		if (gv.field.seed_loc_y.indexOf(y) == -1) {gv.field.seed_loc_y.push(y);}
	},
	water: function() {
		gv.robot.task = 1;

		var x = Math.round(this.x/gv.tile_sz);
		var y = Math.round(this.y/gv.tile_sz);

		if (gv.field.seed_loc_x.indexOf(x) != -1 && gv.field.seed_loc_y.indexOf(y) != -1) {
			Crafty.e('Wheat4').at(x, y);
			if (gv.field.wheat_loc_x.indexOf(x) == -1) {gv.field.wheat_loc_x.push(x);}
			if (gv.field.wheat_loc_y.indexOf(y) == -1) {gv.field.wheat_loc_y.push(y);}
		}
	}, 
	pick: function() {
		gv.robot.task = 2;

		var x = Math.round(this.x/gv.tile_sz);
		var y = Math.round(this.y/gv.tile_sz);

		if (gv.field.wheat_loc_x.indexOf(x) != -1 && gv.field.wheat_loc_y.indexOf(y) != -1) {
			Crafty.e('Soil5').at(x, y);
		}
	},
	// flashing light
	lowAlert: function() {
		gv.robot.alert = 1;
		this.animate('AnimateLight', -1);
		this.delay(this.stopAlert, 12000);
	},
	// beeping
	medAlert: function() {
		gv.robot.alert = 1;
		robot_alert_sound();
	},
	// flashing light + beeping
	highAlert: function() {
		gv.robot.alert = 1;
		this.animate('AnimateLight', -1);
		this.delay(this.stopAlert, 12000);
		robot_alert_sound();
	},
	stopAlert: function() {
		this.pauseAnimation();
		gv.robot.alert = 0;
	}
});
// Requests
function update_robot_text(text) {
	gv.robot.txt = text;
	Crafty.trigger('LowAlert');
};
// function type_robot_text(index) {return };
function hide_robot_text() {Crafty.trigger('HideRequest');};
Crafty.c('RobotRequest', {
	init: function() {
		this.requires('2D, DOM, Grid, Color, Text')
			.attr({ w:gv.tile_sz*52, h:gv.tile_sz*13, z:10 })
			.textFont({ size: '20px' })
			.css({ 'padding-top':'200px' })
			.textAlign('center')
			.bind('UpdateText', this.updateText)
			.bind('ShowRequest', this.showRequest)
			.bind('HideRequest', this.hideRequest)
	},
	updateText: function() {this.text(gv.robot.incomplete_txt);},
	showRequest: function() {
		this.color('#FFFFFF', .98)
		var a = 0;
		for (var i = 0; i <= gv.robot.txt.length; i++) {
			setTimeout(function(i) {
				gv.robot.incomplete_txt = 'Robot: '+gv.robot.txt.slice(0,a);
				Crafty.trigger('UpdateText');
				a += 1;
			}, 100*i);
		}

		var type = request_list.getNumber();
		// short notification
		if (type == 1) {setTimeout(hide_robot_text, 10000);}
		// long notification
		else if (type == 2) {setTimeout(hide_robot_text, 32000);}
	},
	hideRequest: function() {this.color("#FFFFFF", 0).text('');}
});


// Animals
Crafty.c('Animal', {
	init: function() {
		this.requires('2D, Canvas, Grid, Collision, Solid, Tween, Delay, SpriteAnimation')
			.attr({ z:3 })
			// animations
			.reel('AnimalMovingUp', 1000, [
				[0,0], [1,0], [2,0], [3,0]
			])
			.reel('AnimalMovingLeft', 1000, [
				[0,1], [1,1], [2,1], [3,1]
			])
			.reel('AnimalMovingDown', 1000, [
				[0,2], [1,2], [2,2], [3,2]
			])
			.reel('AnimalMovingRight', 1000, [
				[0,3], [1,3], [2,3], [3,3]
			])
			.reel('AnimalEatingUp', 2000, [
				[0,4], [1,4], [2,4], [3,4], [0,4]
			])
			.reel('AnimalEatingLeft', 2000, [
				[0,5], [1,5], [2,5], [3,5], [0,5]
			])
			.reel('AnimalEatingDown', 2000, [
				[0,6], [1,6], [2,6], [3,6], [0,6]
			])
			.reel('AnimalEatingRight', 2000, [
				[0,7], [1,7], [2,7], [3,7], [0,7]
			])
	},
	char: function() {return 'animal';},
	// checks last movement and does opposite
	turnAround: function() {
		var movement = this.lastMovement();
		if (movement == 'up') {this.moveDown();}
		else if (movement == 'down') {this.moveUp();}
		else if (movement == 'right') {this.moveLeft();}
		else {this.moveRight();}
	},
	// does random movement
	randomMove: function() {
		var ra = Math.random()
		var animation_speed = 8;

		if (this.y/gv.tile_sz < 2) {
			this.moveDown();
		} else if (this.x/gv.tile_sz >= 50) {
			this.moveLeft();
		} else if (this.y/gv.tile_sz > 22) {
			this.moveUp();
		} else if (ra < 0.12) {this.moveUp();}
		else if (ra < 0.24) {this.moveDown();}
		else if (ra < 0.36) {this.moveLeft();}
		else if (ra < 0.48) {this.moveRight();}
		else {this.eat();}
	},
	// specifies eating animation
	eat: function() {
		var movement = this.lastMovement();
		if (movement == 'up') {this.animate('AnimalEatingUp', 2, -1);} 
		else if (movement == 'down') {this.animate('AnimalEatingDown', 2, -1);} 
		else if (movement == 'right') {this.animate('AnimalEatingRight', 2, -1);} 
		else {this.animate('AnimalEatingLeft', 2, -1);}
	},
	moveUp: function() {
		this.tween({ x: this.x, y: this.y-gv.tile_sz }, gv.animal.speed);
		this.animate('AnimalMovingUp', 8, -1);
		var dir = 'up';
		this.pushMovement(dir);
	},
	moveDown: function() {
		this.tween({ x: this.x, y: this.y+gv.tile_sz }, gv.animal.speed);
		this.animate('AnimalMovingDown', 8, -1);
		var dir = 'down';
		this.pushMovement(dir);
	},
	moveLeft: function() {
		this.tween({ x: this.x-gv.tile_sz, y: this.y }, gv.animal.speed);
		this.animate('AnimalMovingLeft', 8, -1);
		var dir = 'left';
		this.pushMovement(dir);
	}, 
	moveRight: function() {
		this.tween({ x: this.x+gv.tile_sz, y: this.y }, gv.animal.speed);
		this.animate('AnimalMovingRight', 8, -1);
		var dir = 'right';
		this.pushMovement(dir);
	}
});
Crafty.c('Sheep', {
	init: function() {
		this.requires('Animal, spr_sheep5')
			.crop(35, 38, 55, 50)
			.collision(0, 0, 64, 0, 64, 48, 0, 60)
			.attr({ w:32, h:32 })
			.delay(this.randomMove, 3000, -1)
			.delay(this.hasWool, 15000, -1)
			.bind('Sheared', this.sheared)
			.onHit('Solid', this.turnAround)
	},
	pushMovement: function(dir) {
		gv.animal.sheep.movement.push(dir);
		if (gv.animal.sheep.movement.length > 5) {gv.animal.sheep.movement.shift();}
	},
	lastMovement: function() {return gv.animal.sheep.movement.slice(-1);},
	// baas if has wool
	hasWool: function() {
		sounds.play_sheep();
		gv.animal.sheep.hasWool = 1;
	},
	// collect wool
	sheared: function() {
		Crafty.trigger('WoolCount');
		gv.animal.sheep.hasWool = 0;
	}
});
Crafty.c('Cow', {
	init: function() {
		this.requires('Animal, spr_cow13')
			.attr({ w:60, h:60 })
			.delay(this.randomMove, 2000, -1)
			.onHit('Solid', this.turnAround)
			.delay(this.hasMilk, 20000, -1)
			.bind('Milked', this.milked)
	},
	pushMovement: function(dir) {
		gv.animal.cow.movement.push(dir);
		if (gv.animal.cow.movement.length > 5) {gv.animal.cow.movement.shift();}
	},
	lastMovement: function() {return gv.animal.cow.movement.slice(-1);},
	// moos if has milk
	hasMilk: function() {
		sounds.play_cow();
		gv.animal.cow.hasMilk = 1;
	},
	// collect milk
	milked: function() {
		Crafty.trigger('MilkCount');
		gv.animal.cow.hasMilk = 0;
	}
});
Crafty.c('Chicken', {
	init: function() {
		this.requires('Animal, Obstacle, spr_chicken9')
			.attr({ w:24, h:24 })
			.delay(this.randomMove, 1000, -1)
			.onHit('Solid', this.turnAround)
			.onHit('Oven', this.turnAround)
			.onHit('SpinningWheel', this.turnAround)
	},
	pushMovement: function(dir) {
		gv.animal.chicken.movement.push(dir);
		if (gv.animal.chicken.movement.length > 5) {gv.animal.chicken.movement.shift();}
	},
	lastMovement: function() {return gv.animal.chicken.movement.slice(-1);},
	// lays an egg in current square 
	layEgg: function() {
		var x = this.x/gv.tile_sz;
		var y = this.y/gv.tile_sz;
		Crafty.e('Egg').at(x, y);
		sounds.play_chicken();
	}
});
Crafty.c('Butterfly', {
	_dir: '',
	_speed: 600,
	init: function() {
		this.requires('Animal, Resource, spr_butterfly')
			.attr({ w:24, h:24, r:1 })
			.delay(this.butterflyMove, this._speed, -1)
			.bind('UpdateFrame', this.offScreen)
	},
	type: function() { return 'butterfly'; },
	// initial direction
	setDir: function(dir) {this._dir = dir;},
	// deviates from movement with a probability of 0.2
	butterflyMove: function() {
		if (Math.random() < 0.2) {
			var a = Math.random();
			if (a < 0.25){this._dir = 'up';}
			else if (a < 0.5){this._dir = 'down';}
			else if (a < 0.75){this._dir = 'left';}
			else {this._dir = 'right';}
		}

		if (this._dir == 'up') {
			this.animate('AnimalMovingUp');
			this.tween({ x: this.x, y: this.y-gv.tile_sz }, 1000);
		} 
		else if (this._dir == 'down') {
			this.animate('AnimalMovingDown');
			this.tween({ x: this.x, y: this.y+gv.tile_sz }, 1000);
		} 
		else if (this._dir == 'left') {
			this.animate('AnimalMovingRight');
			this.tween({ x: this.x-gv.tile_sz, y: this.y }, 1000);
		}
		else if (this._dir == 'right') {
			this.animate('AnimalMovingLeft');
			this.tween({ x: this.x+gv.tile_sz, y: this.y }, 1000);
		}
	},
	// destroy when it leaves the screen
	offScreen: function() {
		if (this._x < -1 || this._x > gv.tile_sz*54 || this._y < -1 || this._y > gv.tile_sz*22) {
			this.destroy();
			task_funcs.butterflyGone();
		}
		// checks if task complete
		if (task_funcs.butterflyComplete()) {Crafty.trigger('CompletedTask');}
	}
});
Crafty.c('Snake', {
	_dir: '',
	_speed: 700,
	init: function() {
		this.requires('Animal, spr_snake5')
			.attr({ w:24, h:24 })
			.delay(this.eatEgg, gv.snake.eat_egg, -1)
			.delay(this.snakeMove, this._speed, -1)
			.bind('UpdateFrame', this.offScreen)
	},
	type: function() { return 'snake'; },
	// initial direction
	setDir: function(dir) {this._dir = dir;},
	// deviates from movement with a probability of 0.1
	snakeMove: function() {
		if (Math.random() < 0.1) {
			var a = Math.random();
			if (a < 0.25){this._dir = 'up';}
			else if (a < 0.5){this._dir = 'down';}
			else if (a < 0.75){this._dir = 'left';}
			else {this._dir = 'right';}
		}

		if (this._dir == 'up') {
			this.animate('AnimalMovingUp');
			this.tween({ x: this.x, y: this.y-gv.tile_sz }, this._speed);
		} 
		else if (this._dir == 'down') {
			this.animate('AnimalMovingDown');
			this.tween({ x: this.x, y: this.y+gv.tile_sz }, this._speed);
		} 
		else if (this._dir == 'left') {
			this.animate('AnimalMovingLeft');
			this.tween({ x: this.x-gv.tile_sz, y: this.y }, this._speed);
		}
		else if (this._dir == 'right') {
			this.animate('AnimalMovingRight');
			this.tween({ x: this.x+gv.tile_sz, y: this.y }, this._speed);
		}
	},
	// eats egg and/or -0.25 to score
	eatEgg: function() {
		gv.resources.eggs -= 1;
		if (gv.resources.eggs < 0) {gv.resources.eggs=0;}
		gv.score-=.25;
	},
	// destroys snake and checks if task complete
	hitSnake: function() {
		this.destroy();
		sounds.play_whack();
		gv.score+=1;

		task_funcs.snakeHit();
		if (task_funcs.snakeComplete()) {Crafty.trigger('CompletedTask');}
	},
	offScreen: function() {
		if (this._x < -1 || this._x > gv.tile_sz*54 || this._y < -1 || this._y > gv.tile_sz*23) {
			this.destroy();
			task_funcs.snakeGone();
		}
		if (task_funcs.snakeComplete()) {Crafty.trigger('CompletedTask');}
	}
});
Crafty.c('Gopher', {
	init: function() {
		this.requires('Animal, spr_gopher_hole')
			.attr({ w:24, h:24 })
			.delay(this.disappear, gv.gopher.disappear)
			.reel('PopOut', 2000, [
				[0,0], [1,0], [2,0]
			])
			.reel('PopIn', 5000, [
				[2,0], [1,0], [0,0], [3,0]
			])
			.reel('AnimateHit', 500, [
				[2,0], [0,0], [3,0]
			])
			.animate('PopOut')
	},
	type: function() { return 'gopher'; },
	// gopher goes back in hole
	disappear: function() {
		this.animate('PopIn');
		this.destroy();

		task_funcs.gopherGone();
		if (task_funcs.gopherComplete()) {Crafty.trigger('CompletedTask');}
		else {gv.score -= 1;}
	},
	// gopher is hit by player
	hitGopher: function() {
		this.animate('AnimateHit');
		this.destroy();
		sounds.play_whack();
		
		task_funcs.gopherHit();
		if (task_funcs.gopherComplete()) {Crafty.trigger('CompletedTask');}
	}
});


// Resources
Crafty.c('Resource', {
	init: function() {
		this.requires('2D, Canvas, Grid')
			.bind('Collect', this.collect)
	},
	collect: function() {
		if (this.type() == 'egg') { Crafty.trigger('EggCount'); } 
		else if (this.type() == 'bread') { 
			if (this.burned() == false) {Crafty.trigger('BreadCount');}
		} 
		else if (this.type() == 'muffin') {
			if (this.burned() == false) {Crafty.trigger('MuffinCount');}
		}
		else if (this.type() == 'thread') {Crafty.trigger('ThreadCount');}
		else if (this.type() == 'butterfly') {
			task_funcs.butterflyHit();
			gv.score+=this.r;

			if (task_funcs.butterflyComplete()) {Crafty.trigger('CompletedTask');}
		}
		this.destroy();
	}
});
Crafty.c('Egg', {
	init: function() {
		this.requires('Resource, spr_egg')
			.attr({ w:10, h:10, r:.25 })
	},
	type: function() { return 'egg'; }
});
Crafty.c('Wheat', {
	init: function() {
		this.requires('Resource, spr_wheat')
			.attr({ w:16, h:16, r:1 })
	},
	type: function() { return 'wheat'; }
});
Crafty.c('Wool', {
	init: function() {
		this.requires('Resource, spr_wool')
			.attr({ w:16, h:16, r:2 })
	},
	type: function() { return 'wool'; }
});
Crafty.c('Milk', {
	init: function() {
		this.requires('Resource, spr_milk')
			.attr({ w:16, h:16, r:2 })
	},
	type: function() { return 'milk'; }
});
Crafty.c('Bread', {
	_burned: 0,
	init: function() {
		this.requires('Resource, Delay, spr_bread')
			.attr({ w:16, h:16, r:15 })
	},
	type: function() { return 'bread'; },
	bake: function() {this.delay(this.burn, 10000);},
	burn: function() {
		this.sprite('spr_ashes');
		this._burned = 1;
	},
	burned: function() {
		if (this._burned == 1) {return true;}
		else {return false;}
	}
});
Crafty.c('Muffin', {
	_burned: 0,
	init: function() {
		this.requires('Resource, Delay, spr_muffin')
			.attr({ w:16, h:16, r:18 })
	},
	type: function() { return 'muffin'; },
	bake: function() {this.delay(this.burn, 10000);},
	burn: function() {
		this.sprite('spr_ashes');
		this._burned = 1;
	},
	burned: function() {
		if (this._burned == 1) {return true;}
		else {return false;}
	}
});
Crafty.c('Thread', {
	init: function() {
		this.requires('Resource, spr_thread')
			.attr({ w:16, h:16, r:8 })
	},
	type: function() {return 'thread';}
});
Crafty.c('Berries', {
	init: function() {
		this.requires('Resource, spr_berries')
			.attr({ r:.10 })
	},
	type: function() { return 'berry'; }
});


Crafty.c('ResourceLabel', {
	init: function() {
		this.requires('2D, Canvas, Text, Grid')
			.attr({ z:5 })
			.textFont({ size: '16px' })
			.bind('UpdateFrame', this.update)
	},
	update: function() {
		if (this.type() == 'egg') {this.text(gv.resources.eggs);}
		else if (this.type() == 'berry') {this.text(gv.resources.berries);}
		else if (this.type() == 'wheat') {this.text(gv.resources.wheat);}
		else if (this.type() == 'wool') {this.text(gv.resources.wool);}
		else if (this.type() == 'milk') {this.text(gv.resources.milk);}
		else if (this.type() == 'bread') {this.text(gv.resources.bread);}
		else if (this.type() == 'muffin') {this.text(gv.resources.muffin);}
		else if (this.type() == 'thread') {this.text(gv.resources.thread);}
	},
	count: function() {
		gv.score += this.r;
		if (this.type() == 'egg') { gv.resources.eggs+=1; }
		else if (this.type() == 'berry') { gv.resources.berries+=1; }
		else if (this.type() == 'wheat') { gv.resources.wheat+=1; }
		else if (this.type() == 'wool') { gv.resources.wool+=1; }
		else if (this.type() == 'milk') { gv.resources.milk+=1; }
		else if (this.type() == 'bread') { gv.resources.bread+=1; }
		else if (this.type() == 'muffin') { gv.resources.muffin+=1; }
		else if (this.type() == 'thread') { gv.resources.thread+=1; }
		this.update();
	}
});
Crafty.c('EggLabel', {
	init: function(){
		this.requires('ResourceLabel')
			.attr({ r:.25 })
			.bind('EggCount', this.count)
	},
	type: function() { return 'egg'; }
});
Crafty.c('WheatLabel', {
	init: function(){
		this.requires('ResourceLabel')
			.attr({ r:1 })
			.bind('WheatCount', this.count)
	},
	type: function() { return 'wheat'; }
});
Crafty.c('WoolLabel', {
	init: function(){
		this.requires('ResourceLabel')
			.attr({ r:2 })
			.bind('WoolCount', this.count)
	},
	type: function() { return 'wool'; }
});
Crafty.c('MilkLabel', {
	init: function(){
		this.requires('ResourceLabel')
			.attr({ r:2 })
			.bind('MilkCount', this.count)
	},
	type: function() { return 'milk'; }
});
Crafty.c('BreadLabel', {
	init: function(){
		this.requires('ResourceLabel')
			.attr({ r:10 })
			.bind('BreadCount', this.count)
	},
	type: function() { return 'bread'; }
});
Crafty.c('MuffinLabel', {
	init: function(){
		this.requires('ResourceLabel')
			.attr({ r:15 })
			.bind('MuffinCount', this.count)
	},
	type: function() { return 'muffin'; }
});
Crafty.c('ThreadLabel', {
	init: function(){
		this.requires('ResourceLabel')
			.attr({ r:7 })
			.bind('ThreadCount', this.count)
	},
	type: function() { return 'thread'; }
});
Crafty.c('BerryLabel', {
	init: function(){
		this.requires('ResourceLabel')
			.attr({ r:.1 })
			.bind('BerryCount', this.count)
	},
	type: function() { return 'berry'; }
});


// Objects to interact with
Crafty.c('Well', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_well')
			.attr({ w:40, h:40 })
	}
});
Crafty.c('Barrel', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_barrels')
			.attr({ w:40, h:40 })
			.bind('GetSeeds', this.getSeeds);
	}
});
Crafty.c('Stump', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_stump1')
			.attr({ w:30, h:30 })
			.bind('SwitchTools', this.switchTools);
	},
	switchTools: function() {
		if (gv.tools.tools == 0){
			gv.tools.tools = 1;
			this.sprite('spr_stump2');
		} else if (gv.tools.tools == 1) {
			gv.tools.tools = 0;
			this.sprite('spr_stump1');
		}
	}
});
Crafty.c('GroundTools', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_shovel')
			.attr({ w:30, h:30 })
			.bind('SwitchLgTools', this.switchTools);
	},
	switchTools: function() {
		if (gv.tools.lgtools == 0){
			gv.tools.lgtools = 1;
			this.sprite('spr_scythe');
		} else if (gv.tools.lgtools == 1) {
			gv.tools.lgtools = 0;
			this.sprite('spr_shovel');
		}
	}
});
Crafty.c('Book', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_book')
			.attr({ w:20, h:20 })
			.bind('OpenBook', this.open);
	},
	open: function() {
		window.alert('Recipes\nBread: 3 wheat, 3 milk, 6 eggs\nMuffin: 1 wheat, 4 milk, 8 eggs, 10 berries\nThread: 1 wheat, 3 wool, 7 berries');
	}
});
Crafty.c('BerryBush', {
	_on_bush: 0,
	init: function() {
		this.requires('2D, Canvas, Grid, spr_bbush_empty')
			.attr({ w:40, h:30, r:.1 })
			.bind('CollectBerries', this.collect)
			.bind('WaterBush', this.water)
	},
	// collect a berry from the bush if berries on bush
	collect: function() {
		sounds.play_rustle();
		if (this._on_bush > 0) {
			Crafty.trigger('BerryCount');
		}
		this._on_bush -= 1;
		if (this._on_bush == 0) {
			this.sprite('spr_bbush_empty');
			gv.bush = 0;
		}
	},
	// water bush to produce more berries
	water: function() {
		sounds.play_water();
		this.sprite('spr_bbush_full');
		Crafty.trigger('EmptyBucket');
		this._on_bush = 20;
		gv.bush = 1;
	}
});
// Baking in oven
function wait_bake_bread() {eval("Crafty.e('Bread').at(Game.w()-2.8,1.8).bake();");}
function wait_bake_muffin() {eval("Crafty.e('Muffin').at(Game.w()-2.8,1.8).bake();");}
Crafty.c('Oven', {
	init: function() {
		this.requires('2D, Canvas, Grid, SpriteAnimation, spr_oven')
			.attr({ w:50, h:40 })
			.reel('OvenFire', 500, [
				[0,0], [1,0], [2,0], [3,0]
			])
			.animate('OvenFire', -1)
			.bind('BakeBread', this.bakeBread)
			.bind('BakeMuffin', this.bakeMuffin)
	},
	bakeBread: function() {
		gv.resources.wheat-=gv.recipes.bread.wheat;
		gv.resources.milk-=gv.recipes.bread.milk;
		gv.resources.eggs-=gv.recipes.bread.eggs;
		gv.score-=(gv.recipes.bread.wheat*1 + gv.recipes.bread.milk*2 + gv.recipes.bread.milk*.25);
		sounds.play_ding25();
		setTimeout(wait_bake_bread, gv.recipes.bread.time);
	}, 
	bakeMuffin: function() {
		gv.resources.wheat-=gv.recipes.muffin.wheat;
		gv.resources.milk-=gv.recipes.muffin.milk;
		gv.resources.eggs-=gv.recipes.muffin.eggs;
		gv.resources.berries-=gv.recipes.muffin.berries;
		gv.score-=(gv.recipes.muffin.wheat*2 + gv.recipes.muffin.milk*2 + gv.recipes.muffin.eggs*.25 + gv.recipes.muffin.berries*.1);
		sounds.play_ding();
		setTimeout(wait_bake_muffin, gv.recipes.muffin.time);
	}
});
// Spinning thread
function wait_make_thread() {
	eval("Crafty.e('Thread').at(Game.w()-5,2);");
	Crafty.trigger('StopWheel');
}
Crafty.c('SpinningWheel', {
	init: function() {
		this.requires('2D, Canvas, Grid, SpriteAnimation, spr_spinning_wheel')
			.attr({ w:40, h:40 })
			.reel('WheelSpin', 500, [
				[0,0], [1,0]
			])
			.bind('MakeThread', this.makeThread)
			.bind('StopWheel', this.stopAnimation)
	},
	makeThread: function() {
		gv.resources.wool-=gv.recipes.thread.wool;
		gv.resources.berries-=gv.recipes.thread.berries;
		gv.score-=(gv.recipes.thread.wool*2 + gv.recipes.thread.berries*.1);
		this.animate('WheelSpin', -1);
		setTimeout(wait_make_thread, gv.recipes.thread.time);
	},
	stopAnimation: function() {this.pauseAnimation();}
});
Crafty.c('ChargingStation', {
	init: function() {
		this.requires('2D, Canvas, Grid, SpriteAnimation, spr_charging_station')
			.attr({ w:43, h:50, z:0 })
			.bind('UpdateFrame', this.checkCharge)
	},
	checkCharge: function() {
		if (gv.robot.charging == 0) {this.sprite('spr_charging_station');}
		else {this.sprite('spr_charging_station_lit');}
	}
});
// Hidden chest
var exp;
function wait_destroy_chest() {
	Crafty.trigger('ChestExplosion');
	task_funcs.chestIsDestroyed();
};
Crafty.c('ChestExplosion', {
	init: function() {
		this.requires('2D, Canvas, Grid, SpriteAnimation, spr_explosion')
			.attr({ z:-1 })
			.reel('Explode', 3000, [
				[0,0], [0,1], [0,2], [0,3], [0,4]
			])
			.bind('ChestExplosion', function() {
				this.attr({ z:5 });
				this.animate('Explode');
				Crafty.trigger('CompletedTask');
			})
	}
});
Crafty.c('Chest', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_chest_closed')
			// .attr({ w:40, h:40, z:-1 })
			.attr({ w:gv.tile_sz, h:gv.tile_sz, z:-1 })
			.bind('DigChest', this.reveal)
			.bind('OpenChest', this.open)
			.bind('ChestExplosion', this.hide)
	},
	hide: function() {this.attr({ z:-2 });},
	reveal: function() {
		this.attr({ z:2 });
		task_funcs.chestIsRevealed();
		// countdown
		sounds.play_ticking();
		exp = setTimeout(wait_destroy_chest, 65000);
	},
	open: function() {
		if (task_funcs.chestGetOpened() == 0 && task_funcs.chestGetDestroyed() == 0){
			var pin = prompt('Please enter the 7 digit password:');
			if (pin == task_funcs.chestGetPassword()) {
				Crafty.log(pin+' = '+task_funcs.chestGetPassword());
				// open chest
				this.sprite('spr_chest_open');
				task_funcs.chestIsOpen();
				// stop explosion
				clearTimeout(exp);
				sounds.stop_ticking();
				// get reward
				sounds.play_money();
				gv.score+=20;
				
				Crafty.trigger('CompletedTask');
			}
		}
	}
});
Crafty.c('Rock', {
	init: function( ) {
		this.requires('2D, Canvas, Grid, spr_rock')
			.attr({ w:20, h:20, z:0, p:0 })
	},
	break: function() {
		sounds.play_stone();
		this.sprite('spr_rocks');
		if (this.p == 1) {
			this.revealPin();
		}
	}, 
	hasPin: function() {
		this.p = 1;
	},
	revealPin: function() {
		window.alert(task_funcs.chestGetPassword());
	}
});

// Bottom panel
Crafty.c('Score', {
	init: function() {
		this.requires('2D, Canvas, Grid, Text')
			.attr({ w:100, h:40 })
			.textFont({ size: '24px' })
			.bind('UpdateFrame', this.updateScore)
	},
	updateScore: function() {this.text('$ '+gv.score.toFixed(2));}
});
Crafty.c('Bucket', {
	init: function() {
		this.requires('2D, Canvas, Grid, Solid, spr_bucket_empty, Collision')
			.attr({ w:gv.tile_sz*2.5, h:gv.tile_sz*2.5 })
			.bind('FillBucket', this.fill)
			.bind('EmptyBucket', this.empty)
	},
	fill: function() {
		sounds.play_well_water();
		this.sprite('spr_bucket_full');
		gv.tools.bucket = 1;
	},
	empty: function() {
		this.sprite('spr_bucket_empty');
		gv.tools.bucket = 0;
	}
});
Crafty.c('SeedBag', {
	init: function() {
		this.requires('2D, Canvas, Grid, Solid, spr_seed_bag_empty, Collision')
			.attr({ w:gv.tile_sz*2.5, h:gv.tile_sz*2.5 })
			.bind('FillSeedBag', this.fill)
			.bind('EmptySeedBag', this.empty)
	},
	fill: function() {
		sounds.play_grain();
		this.sprite('spr_seed_bag_full');
		gv.tools.seed_bag = 1;
	},
	empty: function() {
		this.sprite('spr_seed_bag_empty');
		gv.tools.seed_bag = 0;
	}
});
Crafty.c('Tools', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_tools2')
			.attr({ w:gv.tile_sz*2.5, h:gv.tile_sz*2.5 })
			.bind('SwitchTools', this.switchTools);
	}, 
	switchTools: function() {
		if (gv.tools.tools == 0){ // hammer
			this.sprite('spr_tools2');
		} else if (gv.tools.tools == 1) { // shears
			this.sprite('spr_tools1');
		}
	}
});
Crafty.c('LgTools', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_scythe')
			.attr({ w:gv.tile_sz*2.5, h:gv.tile_sz*2.5 })
			.bind('SwitchLgTools', this.switchTools);
	}, 
	switchTools: function() {
		if (gv.tools.lgtools == 0){ // shovel
			this.sprite('spr_scythe');
		} else if (gv.tools.lgtools == 1) { // scythe
			this.sprite('spr_shovel');
		}
	}
});

//TASKS
Crafty.c('Task', {
	_initial: 0,
	init: function() {
		this.requires('2D, DOM, Grid, Text')
			.attr( { w:230, h:200 })
			.textFont({ size: '16px' })
			// .textAlign('center')
			.bind('UpdateQuant', this.updateQuant)
			.bind('CompletedTask', this.completedTask)
			.bind('UpdateTask', this.updateTask)
			.bind('UpdateFrame', this.checkTask)
	},
	updateTask: function() {
		// set initial quantity
		if (typeof task_list.getCurr() != undefined){
			var met = task_list.getMet();
			var resource = met[0];
			if (resource == 'eggs') {_initial = gv.resources.eggs;}
			else if (resource == 'wheat') {_initial = gv.resources.wheat;}
			else if (resource == 'wool') {_initial = gv.resources.wool;}
			else if (resource == 'milk') {_initial = gv.resources.milk;}
			else if (resource == 'bread') {_initial = gv.resources.bread;}
			else if (resource == 'muffin') {_initial = gv.resources.muffin;}
			else if (resource == 'thread') {_initial = gv.resources.thread;}
			else if (resource == 'berries') {_initial = gv.resources.berries;}

			this.text(task_list.getText());
			task_list.setStart();

			// sets events in motion
			task_list.runCommand();	
		}
	},
	checkTask: function() {
		var met = task_list.getMet();
		var resource = met[0];
		var quantity = met[1];
		var _current = this._quant;

		if (resource == 'eggs') {_current = gv.resources.eggs-_initial;}
		else if (resource == 'wheat') {_current = gv.resources.wheat-_initial;}
		else if (resource == 'wool') {_current = gv.resources.wool-_initial;}
		else if (resource == 'milk') {_current = gv.resources.milk-_initial;}
		else if (resource == 'bread') {_current = gv.resources.bread-_initial;}
		else if (resource == 'muffin') {_current = gv.resources.muffin-_initial;}
		else if (resource == 'thread') {_current = gv.resources.thread-_initial;}
		else if (resource == 'berries') {_current = gv.resources.berries-_initial;}

		// update text
		var txt = task_list.getText();
		var new_txt = '';
		var len = txt.replace(/[0-9]/g, '').length;
		if (txt.length - len == 1) {new_txt = txt.replace(/[0-9]/g, quantity-_current);}
		else if (txt.length - len == 2) {
			var index = txt.search(/\d/);
			new_txt = txt.replace(/[0-9]/g, '');
			var num = quantity-_current;
			new_txt = new_txt.substr(0, index) + num + new_txt.substr(index);
		}
		this.text(new_txt);

		if (quantity <= _current) {this.completedTask();}
	},
	completedTask: function() {
		task_list.setEnd();
		task_list.nextTask();
		this._quant = 0;
		this.updateTask();
	}
});

// Screen
Crafty.c('RequestScreen', {
	init: function() {
		this.requires('2D, Canvas, Grid, Delay, SpriteAnimation, spr_screen')
			.attr( {w:50, h:42, z:1 })
			.reel('ScreenFlash', 1000, [
				[1,0], [0,0]
			])
			// .bind('ShowRequest', this.showRequest)
			// .bind('LowAlert', this.flash)
			// .bind('HighAlert', this.flash)
			// .bind('StopAlert', this.stopAlert)
	},
	// flash: function() {
		// this.animate('ScreenFlash', -1);
		// this.delay(this.stopAlert, 12000);
	// },
	// stopAlert: function() {
		// this.pauseAnimation();
		// this.sprite('spr_screen');
	// },
	showRequest: function() {
		// if (confirm(gv.robot.txt)) {
		// } else {
		// }
		alert(gv.robot.txt);
		// Crafty.trigger('StopAlert');
	}
});

// Scenery
Crafty.c('Blank', {init: function() {this.requires('2D, Canvas, Grid, Color').color('white')}});
Crafty.c('Box', {init: function() {this.requires('2D, Canvas, Grid, spr_box').attr({ w:480, h:120, z:0 })}});
Crafty.c('Scroll', {init: function() {this.requires('2D, Canvas, Grid, spr_scroll').attr({ w:450, h:120, z:0 })}});
Crafty.c('SqrBlock', {init: function() {this.requires('2D, Canvas, Grid, spr_block').attr({ w:120, h:120, z:0 })}});

Crafty.c('Obstacle', {init: function() {this.requires('2D, Canvas, Grid, Solid, Collision').attr({ w:gv.tile_sz, h:gv.tile_sz})}});
Crafty.c('Tree', {init: function() {this.requires('Obstacle, spr_tree').attr({w:24,h:24})}});
Crafty.c('Fence1', {init: function() {this.requires('Obstacle, spr_fence1')}});
Crafty.c('Fence2', {init: function() {this.requires('Obstacle, spr_fence2')}});
Crafty.c('Fence3', {init: function() {this.requires('Obstacle, spr_fence3')}});
Crafty.c('Fence4', {init: function() {this.requires('Obstacle, spr_fence4')}});
Crafty.c('Fence5', {init: function() {this.requires('Obstacle, spr_fence5')}});
Crafty.c('Fence6', {init: function() {this.requires('Obstacle, spr_fence6')}});
Crafty.c('Fence7', {init: function() {this.requires('Obstacle, spr_fence7')}});
Crafty.c('Fence8', {init: function() {this.requires('Obstacle, spr_fence8')}});
Crafty.c('Fence9', {init: function() {this.requires('Obstacle, spr_fence9')}});
Crafty.c('Fence10', {init: function() {this.requires('Obstacle, spr_fence10')}});
Crafty.c('Fence11', {init: function() {this.requires('Obstacle, spr_fence11')}});
Crafty.c('Fence12', {init: function() {this.requires('Obstacle, spr_fence12')}});

Crafty.c('Ground', {init: function() {this.requires('2D, Canvas, Grid')}});
Crafty.c('Grass', {init: function() {this.requires('Ground, spr_grass')}});
Crafty.c('Soil1', {init: function() {this.requires('Ground, spr_soil1')}});
Crafty.c('Soil2', {init: function() {this.requires('Ground, spr_soil2')}});
Crafty.c('Soil3', {init: function() {this.requires('Ground, spr_soil3')}});
Crafty.c('Soil4', {init: function() {this.requires('Ground, spr_soil4')}});
Crafty.c('Soil5', {init: function() {this.requires('Ground, spr_soil5')}});
Crafty.c('Soil6', {init: function() {this.requires('Ground, spr_soil6')}});
Crafty.c('Soil7', {init: function() {this.requires('Ground, spr_soil7')}});
Crafty.c('Soil8', {init: function() {this.requires('Ground, spr_soil8')}});
Crafty.c('Soil9', {init: function() {this.requires('Ground, spr_soil9')}});

Crafty.c('Wheat1', {init: function() {this.requires('2D, Canvas, Grid, spr_wheat1')}});
Crafty.c('Wheat2', {init: function() {this.requires('2D, Canvas, Grid, spr_wheat2')}});
Crafty.c('Wheat3', {init: function() {this.requires('2D, Canvas, Grid, spr_wheat3')}});
Crafty.c('Wheat4', {init: function() {this.requires('2D, Canvas, Grid, spr_wheat4')}});



