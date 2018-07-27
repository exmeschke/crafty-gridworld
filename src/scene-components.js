// Sounds
sounds = {
	play_low: function() {Crafty.audio.play('alert_low');},
	play_med: function() {Crafty.audio.play('alert_med');},
	play_high: function() {Crafty.audio.play('alert_high');},
	play_cow: function() {Crafty.audio.play('cow');},
	play_sheep: function() {Crafty.audio.play('sheep');},
	play_chicken: function() {Crafty.audio.play('chicken');},
	play_crow: function() {Crafty.audio.play('chicken');},
	play_stone: function() {Crafty.audio.play('stone');},
	play_whack: function() {Crafty.audio.play('whack');},
	play_well_water: function() {Crafty.audio.play('well_water');},
	play_water: function() {Crafty.audio.play('water');},
	play_grain: function() {Crafty.audio.play('grain');},
	play_rustle: function() {Crafty.audio.play('rustle');},
	play_ding: function() {Crafty.audio.play('oven');},
	play_ding25: function() {Crafty.audio.play('oven25');}
};
// Game variables
gv = {
	tile_sz: 24,
	player: {
		movement: []
	}, 
	robot: {
		movement: [],
		charging: 0,
		task: -1,
		power: 100,
		speed: 1200
	},
	field: {
		seed_loc_x: [],
		seed_loc_y: [],
		wheat_loc_x: [],
		wheat_loc_y: []
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
		chicken: {
			movement: []
		}, 
		snake: {
			speed: 500,
			movement: []
		},
		crow: {
			speed: 900,
			movement: []
		}
	},
	score: 0,
	resources: {
		bucket: 0,
		seed_bag: 0,
		tools: 0,
		lgtools: 0,
		bush: 0,
		eggs: 0,
		berries: 0,
		wheat: 0,
		wool: 0,
		milk: 0,
		bread: 0,
		muffin: 0,
		thread: 0
	},
	recipes: {
		bread: {
			wheat: 3,
			milk: 3,
			eggs: 6,
			time: 20000
		}, 
		muffin: {
			wheat: 1,
			milk: 4,
			eggs: 8,
			berries: 10,
			time: 25000
		},
		thread: {
			wool: 3,
			berries: 7
		}
	},
	chest: {
		revealed: 0,
		open: 0,
		pin: 673824
	}
}

// Grid
Crafty.c('Grid', {
	init: function() {
		this.attr({ w: gv.tile_sz, h: gv.tile_sz })
	},
	at: function(x, y) {
		this.attr({ x: x*gv.tile_sz, y: y*gv.tile_sz })
		return this;
	},
	pos: function() { return this.x, this.y; }
});


// Player characters
Crafty.c('Player', {
	init: function() {
		this.requires('2D, Canvas, Grid, Fourway, Keyboard, Collision, Delay, spr_player, SpriteAnimation')
			.attr({ w:gv.tile_sz, h:gv.tile_sz, z:5 })
			.fourway(200) //60
			.onHit('Obstacle', this.stopMovement)
			.onHit('Resource', this.collectResource)
			.onHit('Robot', this.pushRobot)
			// .onHit('Snake', this.pushAnimal)
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
				if (gv.player.movement.length > 5) {
					gv.player.movement.shift();
				}
			})
			.bind('KeyDown', function(e) {
				if (e.key == Crafty.keys.X) {
					this.action();
				} 
			})
	},
	collectResource: function() {
		var hitDatas, hitData;
		if ((hitDatas = this.hit('Resource'))) {
			hitData = hitDatas[0];
			hitData.obj.collect();
		}
	},
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
		} else if ((hitDatas = this.hit('BerryBush'))) {
			if (gv.resources.bush == 1 && gv.resources.bucket == 0) {
				Crafty.trigger('CollectBerries');
			} else if (gv.resources.bush == 0 && gv.resources.bucket == 1) {
				Crafty.trigger('WaterBerries');
			}
		} else if ((hitDatas = this.hit('Sheep'))) {
			if (gv.animal.sheep.hasWool == 1 && gv.resources.tools == 0) {
				Crafty.trigger('Sheared');
			} else {sounds.play_low();}
		} else if ((hitDatas = this.hit('Cow'))) {
			if (gv.animal.cow.hasMilk == 1 && gv.resources.bucket == 0) {
				Crafty.trigger('Milked');
			} else {sounds.play_low();}
		} else if ((hitDatas = this.hit('Gopher'))) {
			if (gv.resources.tools == 1) {hitDatas[0].obj.hitGopher();}
			else {sounds.play_low();}
		} else if ((hitDatas = this.hit('Snake'))) {
			if (gv.resources.tools == 1) {hitDatas[0].obj.hitSnake();}
			else {sounds.play_low();}
		} else if ((hitDatas = this.hit('Chest'))) {
			if (gv.chest.revealed == 0 && gv.resources.lgtools == 1) {
				Crafty.trigger('DigChest');
			} else if (gv.chest.revealed == 1) {
				Crafty.trigger('OpenChest');
			} else {sounds.play_low();}
		} else if ((hitDatas = this.hit('Rock'))) {
			if (gv.resources.tools == 1) {
				hitDatas[0].obj.break();
			} else {sounds.play_low();}
		} else if ((hitDatas = this.hit('Wheat4'))) {
			if (gv.resources.lgtools == 0) {
				Crafty.trigger('WheatCount');
				hitDatas[0].obj.destroy();
			}
		} else if ((hitDatas = this.hit('Oven'))) {
			var bake = prompt('What would you like to bake (bread or muffin)?');
			if (bake == 'bread') {
				if (gv.resources.eggs >= gv.recipes.bread.eggs && gv.resources.milk >= gv.recipes.bread.milk && gv.resources.wheat >= gv.recipes.bread.wheat){
					Crafty.trigger('BakeBread');
				} else {sounds.play_low();}
			} else if (bake == 'muffin') {
				if (gv.resources.eggs >= gv.recipes.muffin.eggs && gv.resources.milk >= gv.recipes.muffin.milk && gv.resources.wheat >= gv.recipes.muffin.wheat){
					Crafty.trigger('BakeMuffin');
				} else {sounds.play_low();}	
			} else {sounds.play_low();}
		} else if ((hitDatas = this.hit('SpinningWheel'))) { 
			if (gv.resources.wool >= gv.recipes.thread.wool && gv.resources.berries >= gv.recipes.thread.berries) {
				Crafty.trigger('MakeThread');
			} else {sounds.play_low();}
		} else {
			sounds.play_low();
			Crafty.trigger('EmptyBucket');
			Crafty.trigger('RobotRequest');
		}
	},
	stopMovement: function() {
		var back = 1.2;
		if (gv.player.movement.slice(-1) == 'up') {
			this.attr({ x:this.x, y:this.y+back });
		} else if (gv.player.movement.slice(-1) == 'down') {
			this.attr({ x:this.x, y:this.y-back });
		} else if (gv.player.movement.slice(-1) == 'right') {
			this.attr({ x:this.x-back, y:this.y });
		} else {
			this.attr({ x:this.x+back, y:this.y });
		}
	}, 
	pushRobot: function() {
		if (Crafty.s('Keyboard').isKeyDown('X')) {
			if (gv.robot.task == -1 && gv.resources.seed_bag == 1) {
				Crafty.trigger('Plant');
				Crafty.trigger('EmptySeedBag');
			} else if (gv.robot.task == 0 && gv.resources.bucket == 1) {
				Crafty.trigger('Water');
				Crafty.trigger('EmptyBucket');
			}
		}

		if (gv.player.movement.slice(-1) == 'up') {
			this.attr({ x:this.x, y:this.y+1 });
			Crafty.trigger('RobotUp');
		} else if (gv.player.movement.slice(-1) == 'down') {
			this.attr({ x:this.x, y:this.y-1 });
			Crafty.trigger('RobotDown');
		} else if (gv.player.movement.slice(-1) == 'right') {
			this.attr({ x:this.x-1, y:this.y });
			Crafty.trigger('RobotRight');
		} else {
			this.attr({ x:this.x+1, y:this.y });
			Crafty.trigger('RobotLeft');
		}
	},
	pushAnimal: function() {
		var hitDatas = this.hit('Animal');
		if (gv.player.movement.slice(-1) == 'up') {
			this.attr({ x:this.x, y:this.y+1 });
			hitDatas[0].obj.moveUp();
		} else if (gv.player.movement.slice(-1) == 'down') {
			this.attr({ x:this.x, y:this.y-1 });
			hitDatas[0].obj.moveDown();
		} else if (gv.player.movement.slice(-1) == 'right') {
			this.attr({ x:this.x-1, y:this.y });
			hitDatas[0].obj.moveRight();
		} else {
			this.attr({ x:this.x+1, y:this.y });
			hitDatas[0].obj.moveLeft();
		}
	}
});


// Robot character
Crafty.c('Robot', {
	init: function() {
		this.requires('2D, Canvas, Grid, Collision, SpriteAnimation, spr_bot, Tween, Delay, Text')
			.attr({ w: gv.tile_sz+2, h: gv.tile_sz+2, z:1 })
			.delay(this.randomMove, 1500, -1)
			.delay(this.losePower, 10000, -1)
			.onHit('Resource', this.collectResource)
			.onHit('Solid', this.turnAround)
			.onHit('ChargingStation', this.recharge)
			.reel('AnimateLight', 1000, [
				[0,0], [1,0]
			])
			.bind('RobotUp', this.moveUp)
			.bind('RobotDown', this.moveDown)
			.bind('RobotLeft', this.moveLeft)
			.bind('RobotRight', this.moveRight)
			.bind('Recharge', this.recharge)
			.bind('Plant', this.plant)
			.bind('Water', this.water)
			.bind('Pick', this.pick)
			.bind('RobotRequest', this.request)
			.bind('StopRequest', this.stopRequest)
	},
	char: function() {
		return 'robot';
	},
	lastMovement: function() {
		return gv.robot.movement.slice(-1);
	}, 
	turnAround: function() {
		if (this.char() == 'robot') {
			var movement = this.lastMovement();
			if (movement == 'up') {
				this.moveDown();
			} else if (movement == 'down') {
				this.moveUp();
			} else if (movement == 'right') {
				this.moveLeft();
			} else {
				this.moveRight()
			}
		}
	},
	randomMove: function() {
		if (this.x/gv.tile_sz < 15 && this.y/gv.tile_sz < 15 && this.x/gv.tile_sz > 1 && this.y/gv.tile_sz > 1) {
			this.tendPlants();
		}

		if (this.x/gv.tile_sz < 2) {
			this.moveRight();
		} else if (this.y/gv.tile_sz < 2) {
			this.moveDown();
		} else {
			if (gv.robot.power > 0 && gv.robot.charging == 0) {
				var ra = Math.random()
				if (ra < 0.25) {
					this.moveUp();
				} else if (ra < 0.50) {
					this.moveDown();
				} else if (ra < 0.75) {
					this.moveLeft();
				} else {
					this.moveRight();
				}
			}
		}
	},
	moveUp: function() {
		gv.robot.charging = 0;
		this.tween({ x: this.x, y: this.y-gv.tile_sz }, gv.robot.speed)
		gv.robot.movement.push('up');
		if (gv.robot.movement.length > 5) {
			gv.robot.movement.shift();
		}
	},
	moveDown: function() {
		gv.robot.charging = 0;
		this.tween({ x: this.x, y: this.y+gv.tile_sz }, gv.robot.speed)
		gv.robot.movement.push('down');
		if (gv.robot.movement.length > 5) {
			gv.robot.movement.shift();
		}
	},
	moveLeft: function() {
		gv.robot.charging = 0;
		this.tween({ x: this.x-gv.tile_sz, y: this.y }, gv.robot.speed)
		gv.robot.movement.push('left');
		gv.robot.movement.push('left');
		if (gv.robot.movement.length > 5) {
			gv.robot.movement.shift();
		}
	}, 
	moveRight: function() {
		gv.robot.charging = 0;
		this.tween({ x: this.x+gv.tile_sz, y: this.y }, gv.robot.speed)
		gv.robot.movement.push('right');
		gv.robot.movement.push('right');
		if (gv.robot.movement.length > 5) {
			gv.robot.movement.shift();
		}
	},
	collectResource: function() {
		var hitDatas, hitData;
		if ((hitDatas = this.hit('Resource'))) {
			hitData = hitDatas[0];
			hitData.obj.collect();
		}
	},
	losePower: function() {
		if (gv.robot.charging == 0) {
			if (gv.robot.power >= 10){
				gv.robot.power -= 10
			} else {
				gv.robot.power = 0;
			}
		}
	},
	recharge: function() {
		if (gv.robot.power < 100) {
			gv.robot.power += .01;
			gv.robot.charging = 1;
		} else {
			gv.robot.power = 100;
			gv.robot.charging = 0;
		}
	},
	tendPlants: function() {
		if (gv.robot.task == 0) {
			this.plant();
		} else if (gv.robot.task == 1) {
			this.water();
		} else if (gv.robot.task == 2) {
			this.pick();
		}
	},
	plant: function() {
		gv.robot.task = 0;

		var x = Math.round(this.x/gv.tile_sz);
		var y = Math.round(this.y/gv.tile_sz);

		Crafty.e('Wheat2').at(x, y);
		if (gv.field.seed_loc_x.indexOf(x) == -1) {
			gv.field.seed_loc_x.push(x);
		}
		if (gv.field.seed_loc_y.indexOf(y) == -1) {
			gv.field.seed_loc_y.push(y);
		}
	},
	water: function() {
		gv.robot.task = 1;

		var x = Math.round(this.x/gv.tile_sz);
		var y = Math.round(this.y/gv.tile_sz);

		if (gv.field.seed_loc_x.indexOf(x) != -1 && gv.field.seed_loc_y.indexOf(y) != -1) {
			Crafty.e('Wheat4').at(x, y);
			if (gv.field.wheat_loc_x.indexOf(x) == -1) {
				gv.field.wheat_loc_x.push(x);
			}
			if (gv.field.wheat_loc_y.indexOf(y) == -1) {
				gv.field.wheat_loc_y.push(y);
			}
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
	request: function() {
		// if (this.request.getType(gv.requests.curr)) {

		// }
		this.animate('AnimateLight', -1);
	},
	stopRequest: function() {
		this.pauseAnimation();
	}
});
Crafty.c('RobotRequest', {
	init: function() {
		this.requires('2D, Canvas, Grid, Color, Text')
			.attr({ z:1 })
			.color('white')
			.text('Look at me!')
			.dynamicTextGeneration(true)
	}
});


// Animals
Crafty.c('Animal', {
	init: function() {
		this.requires('2D, Canvas, Grid, Collision, Solid, Tween, Delay, SpriteAnimation') //WiredHitBox
			.attr({ z:3 })
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
			.onHit('Oven', this.turnAround)
			.onHit('SpinningWheel', this.turnAround)
			// .debugStroke('black')
	},
	char: function() {
		return 'animal';
	}, 
	turnAround: function() {
		var movement = this.lastMovement();
		if (movement == 'up') {this.moveDown();}
		else if (movement == 'down') {this.moveUp();}
		else if (movement == 'right') {this.moveLeft();}
		else {this.moveRight();}
	},
	randomMove: function() {
		var ra = Math.random()
		var animation_speed = 8;
		// var animal_speed = 1500;

		if (this.y/gv.tile_sz <= 2) {
			this.moveDown();
		} else if (this.x/gv.tile_sz >= 50) {
			this.moveLeft();
		} else if (this.y/gv.tile_sz >= 23) {
			this.moveUp();
		} else if (ra < 0.12) {
			this.moveUp();
		} else if (ra < 0.24) {
			this.moveDown();
		} else if (ra < 0.36) {
			this.moveLeft();
		} else if (ra < 0.48) {
			this.moveRight();
		} else {
			this.eat();
		}
	},
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
	},
	collectResource: function() {
		var hitDatas, hitData;
		if ((hitDatas = this.hit('Resource'))) {
			hitData.obj.collect();
		}
	}
});
Crafty.c('Sheep', {
	init: function() {
		this.requires('Animal, spr_sheep5')
			.crop(35, 38, 55, 50)
			.collision(0, 0, 64, 0, 64, 48, 0, 60)
			.attr({ w:32, h:32 })
			.delay(this.randomMove, 3000, -1)
			.onHit('Solid', this.turnAround)
			.delay(this.hasWool, 15000, -1)
			.bind('Sheared', this.sheared)
	},
	pushMovement: function(dir) {
		gv.animal.sheep.movement.push(dir);
		if (gv.animal.sheep.movement.length > 5) {
			gv.animal.sheep.movement.shift();
		}
	},
	lastMovement: function() {
		return gv.animal.sheep.movement.slice(-1);
	},
	hasWool: function() {
		sounds.play_sheep();
		gv.animal.sheep.hasWool = 1;
	},
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
		if (gv.animal.cow.movement.length > 5) {
			gv.animal.cow.movement.shift();
		}
	},
	lastMovement: function() {
		return gv.animal.cow.movement.slice(-1);
	},
	hasMilk: function() {
		sounds.play_cow();
		gv.animal.cow.hasMilk = 1;
	},
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
	},
	pushMovement: function(dir) {
		gv.animal.chicken.movement.push(dir);
		if (gv.animal.chicken.movement.length > 5) {
			gv.animal.chicken.movement.shift();
		}
	},
	lastMovement: function() {
		return gv.animal.chicken.movement.slice(-1);
	}, 
	layEgg: function() {
		var x = this.x/gv.tile_sz;
		var y = this.y/gv.tile_sz;
		Crafty.e('Egg').at(x, y);
		sounds.play_chicken();
	}
});
Crafty.c('Snake', {
	_dir: '',
	init: function() {
		this.requires('Animal, spr_snake5')
			.attr({ w:24, h:24 })
			.delay(this.eatEgg, 5000, -1)
			.delay(this.snakeMove, 600, -1)
			.bind('UpdateFrame', this.offScreen)
	},
	type: function() { return 'snake'; },
	setDir: function(dir) {this._dir = dir;},
	snakeMove: function() {
		if (this._dir == 'up') {
			this.animate('AnimalMovingUp');
			this.tween({ x: this.x, y: this.y-gv.tile_sz }, 500);
		} 
		else if (this._dir == 'down') {
			this.animate('AnimalMovingDown');
			this.tween({ x: this.x, y: this.y+gv.tile_sz }, 500);
		} 
		else if (this._dir == 'left') {
			this.animate('AnimalMovingLeft');
			this.tween({ x: this.x-gv.tile_sz, y: this.y }, 500);
		}
		else if (this._dir == 'right') {
			this.animate('AnimalMovingRight');
			this.tween({ x: this.x+gv.tile_sz, y: this.y }, 500);
		}
	},
	pushMovement: function(dir) {
		gv.animal.snake.movement.push(dir);
		if (gv.animal.snake.movement.length > 5) {gv.animal.snake.movement.shift();}
	},
	lastMovement: function() {return gv.animal.snake.movement.slice(-1);
	}, 
	eatEgg: function() {
		gv.resources.eggs -= 1;
		if (gv.resources.eggs < 0) {gv.resources.eggs=0;}
		gv.score-=.25;
	},
	hitSnake: function() {
		this.destroy();
		sounds.play_whack();
	},
	offScreen: function() {
		if (this._x < -1 || this._x > gv.tile_sz*54 || this._y < -1 || this._y > gv.tile_sz*30) {
			this.destroy();
		}
	}
});
Crafty.c('Crow', {
	_dir: '',
	init: function() {
		this.requires('Animal, spr_crow')
			.attr({ w:24, h:24 })
			.delay(this.eatBerry, 5000, -1)
			.delay(this.snakeMove, 600, -1)
			.bind('UpdateFrame', this.offScreen)
	},
	type: function() { return 'snake'; },
	setDir: function(dir) {this._dir = dir;},
	snakeMove: function() {
		if (this._dir == 'up') {
			this.animate('AnimalMovingUp');
			this.tween({ x: this.x, y: this.y-gv.tile_sz }, 500);
		} 
		else if (this._dir == 'down') {
			this.animate('AnimalMovingDown');
			this.tween({ x: this.x, y: this.y+gv.tile_sz }, 500);
		} 
		else if (this._dir == 'left') {
			this.animate('AnimalMovingLeft');
			this.tween({ x: this.x-gv.tile_sz, y: this.y }, 500);
		}
		else if (this._dir == 'right') {
			this.animate('AnimalMovingRight');
			this.tween({ x: this.x+gv.tile_sz, y: this.y }, 500);
		}
	},
	pushMovement: function(dir) {
		gv.animal.snake.movement.push(dir);
		if (gv.animal.snake.movement.length > 5) {gv.animal.snake.movement.shift();}
	},
	lastMovement: function() {return gv.animal.snake.movement.slice(-1);
	}, 
	eatBerry: function() {
		gv.resources.berries -= 1;
		if (gv.resources.berries < 0) {gv.resources.berries=0;}
		gv.score-=.1;
	},
	offScreen: function() {
		if (this._x < -1 || this._x > gv.tile_sz*54 || this._y < -1 || this._y > gv.tile_sz*30) {
			this.destroy();
		}
	}
});
Crafty.c('Gopher', {
	init: function() {
		this.requires('Animal, spr_gopher_hole')
			.attr({ w:24, h:24 })
			.delay(this.disappear, 20000)
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
	disappear: function() {
		this.animate('PopIn');
		this.destroy();

		task_funcs.gopherGone();
		if (task_funcs.gopherComplete()) {
			if (task_funcs.gopherNext() == 1) {Crafty.trigger('CompletedTask');}
		} else {gv.score -= 1;}
	},
	hitGopher: function() {
		this.animate('AnimateHit');
		this.destroy();
		sounds.play_whack();
		
		task_funcs.gopherHit();
		if (task_funcs.gopherComplete()) {
			if (task_funcs.gopherNext() == 1) {Crafty.trigger('CompletedTask');}
		}
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
			else {gv.score -= this.r;}
		} 
		else if (this.type() == 'muffin')
			if (this.burned() == false) {Crafty.trigger('MuffinCount');}
			else {gv.score -= this.r;}
		else if (this.type() == 'thread') { Crafty.trigger('ThreadCount'); }
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
	bake: function() {this.delay(this.burn, 3000);},
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
	bake: function() {this.delay(this.burn, 3000);},
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
		if (gv.resources.tools == 0){
			gv.resources.tools = 1;
			this.sprite('spr_stump2');
		} else if (gv.resources.tools == 1) {
			gv.resources.tools = 0;
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
		if (gv.resources.lgtools == 0){
			gv.resources.lgtools = 1;
			this.sprite('spr_scythe');
		} else if (gv.resources.lgtools == 1) {
			gv.resources.lgtools = 0;
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
		window.alert('Bread: 3 wheat, 3 milk, 6 eggs\nMuffin: 1 wheat, 4 milk, 8 eggs, 10 berries\nThread: 1 wheat, 3 wool, 7 berries');
	}
});
Crafty.c('BerryBush', {
	_on_bush: 0,
	init: function() {
		this.requires('2D, Canvas, Grid, spr_bbush_empty')
			.attr({ w:40, h:30, r:.1 })
			.bind('CollectBerries', this.collect)
			.bind('WaterBerries', this.water)
	},
	collect: function() {
		sounds.play_rustle();
		if (this._on_bush > 0) {
			Crafty.trigger('BerryCount');
		}
		this._on_bush -= 1;
		if (this._on_bush == 0) {
			this.sprite('spr_bbush_empty');
			gv.resources.bush = 0;
		}
	},
	water: function() {
		sounds.play_water();
		this.sprite('spr_bbush_full');
		Crafty.trigger('EmptyBucket');
		this._on_bush = 20;
		gv.resources.bush = 1;
	}
});
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
		sounds.play_ding();
		setTimeout(wait_bake_bread,20000);
	}, 
	bakeMuffin: function() {
		gv.resources.wheat-=gv.recipes.muffin.wheat;
		gv.resources.milk-=gv.recipes.muffin.milk;
		gv.resources.eggs-=gv.recipes.muffin.eggs;
		gv.resources.berries-=gv.recipes.muffin.berries;
		gv.score-=(gv.recipes.muffin.wheat*2 + gv.recipes.muffin.milk*2 + gv.recipes.muffin.eggs*.25 + gv.recipes.muffin.berries*.1);
		sounds.play_ding25();
		setTimeout(wait_bake_muffin,25000);
	}
});
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
		setTimeout(wait_make_thread,15000);
	},
	stopAnimation: function() {this.pauseAnimation();}
});
Crafty.c('ChargingStation', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_charging_station')
			.attr({ w:30, h:50 })
	}
});
Crafty.c('Chest', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_chest_closed')
			.attr({ w:40, h:40, z:-1 })
			.bind('DigChest', this.reveal)
			.bind('OpenChest', this.open)
	},
	reveal: function() {
		this.attr({ z:2 });
		Crafty.log('reveal');
		gv.chest.revealed = 1;
	},
	open: function() {
		var pin = prompt('Please enter the 6 digit pin number:');
		if (pin == null || pin == "") {
		} else if (pin == gv.chest.pin) {
			this.sprite('spr_chest_open');
		}
		gv.chest.open = 1;
	}
});
Crafty.c('Rock', {
	init: function( ) {
		this.requires('2D, Canvas, Grid, spr_rock')
			.attr({ w:20, h:20, z:4, p:0 })
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
		window.alert(gv.chest.pin);
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
	updateScore: function() {
		this.text('$ '+gv.score.toFixed(2));
		// this.text('Power: '+gv.robot.power);
	}
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
		gv.resources.bucket = 1;
	},
	empty: function() {
		this.sprite('spr_bucket_empty');
		gv.resources.bucket = 0;
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
		gv.resources.seed_bag = 1;
	},
	empty: function() {
		this.sprite('spr_seed_bag_empty');
		gv.resources.seed_bag = 0;
	}
});
Crafty.c('Tools', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_tools2')
			.attr({ w:gv.tile_sz*2.5, h:gv.tile_sz*2.5 })
			.bind('SwitchTools', this.switchTools);
	}, 
	switchTools: function() {
		if (gv.resources.tools == 0){ // hammer
			this.sprite('spr_tools2');
		} else if (gv.resources.tools == 1) { // shears
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
		if (gv.resources.lgtools == 0){ // shovel
			this.sprite('spr_scythe');
		} else if (gv.resources.lgtools == 1) { // scythe
			this.sprite('spr_shovel');
		}
	}
});

// TASKS
Crafty.c('Task', {
	_initial: 0,
	init: function() {
		this.requires('2D, DOM, Grid, Text')
			.attr( { w:200, h:200 })
			.textFont({ size: '18px' })
			.textAlign('center')
			.bind('UpdateQuant', this.updateQuant)
			.bind('CompletedTask', this.completedTask)
			.bind('UpdateTask', this.updateTask)
			.bind('UpdateFrame', this.checkTask)
	},
	updateTask: function() {
		// set initial quantity
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

		if (typeof task_list.getText != 'undefined'){
			this.text(task_list.getText());
			task_list.setStart();
		}	
		// sets events in motion
		task_list.runCommand();	
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

		if (quantity <= _current) {this.completedTask();}
	},
	completedTask: function() {
		task_list.setEnd();
		task_list.nextTask();
		this._quant = 0;
		this.updateTask();
	}
});


// Scenery
Crafty.c('Blank', {
	init: function() {
		this.requires('2D, Canvas, Grid, Color')
			.color('white')
	}
});
Crafty.c('Box', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_box')
			.attr({ w:480, h:120, z:0 })
	}
});
Crafty.c('Scroll', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_scroll')
			.attr({ w:450, h:120, z:0 })
	}
});
Crafty.c('SqrBlock', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_block')
			.attr({ w:120, h:120, z:0 })
	}
});

Crafty.c('Obstacle', {
	init: function() {
		this.requires('2D, Canvas, Grid, Solid, Collision')
			.attr({ w:gv.tile_sz, h:gv.tile_sz})
	}
});
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



