// Contains the component definitions and rules for the environment

// Game variables -- need to be accessed before entities defined
gv = {
	// size of tiles
	tile_sz: 24,
	// score, updated for each frame
	score: 0,
	player: {
		// interacting with robot [true, false]
		interacting: false,
		// task difficulty [0:none, 1:low, 2:high]
		difficulty: 0,
		// moment in task ['break','middle']
		moment: '',
	}, 
	// track status of robot
	robot: {
		status: 2, // [0:not operational, 1:slow, 2:normal]
		// REQUEST - general
		alert_len: 20, // number of beeps and/or blinks
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
	// updated when robot moves to tile
	field: {
		seed_loc_x: [],  seed_loc_y: [],
		wheat_loc_x: [], wheat_loc_y: []
	},
	// animal actions
	animal: {
		speed: 1500,
		sheep: {hasWool: 0},
		cow: {hasMilk: 0},
		snake: {eat_egg: 4000},
		gopher: {disappear: 20000}
	},
	tools:{
		bucket: 0, // fill at well [0:empty, 1:full]
		seed_bag: 0, // fill at barrels [0:empty, 1:full]
		tools: 0, // switch at stump [0:hammer on stump, 1:shears on stump]
		lgtools: 0 // switch on ground [0:shovel on ground, 1:scythe on ground]
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
	_movement: [],
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
		this._movement.push(dir);
		if (this._movement.length > 5) {this._movement.shift();}
	},
	lastMovement: function() {return this._movement.slice(-1);},
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
	_movement: [],
	init: function() {
		this.requires('Animal, spr_cow13')
			.attr({ w:60, h:60 })
			.delay(this.randomMove, 2000, -1)
			.onHit('Solid', this.turnAround)
			.delay(this.hasMilk, 20000, -1)
			.bind('Milked', this.milked)
	},
	pushMovement: function(dir) {
		this._movement.push(dir);
		if (this._movement.length > 5) {this._movement.shift();}
	},
	lastMovement: function() {return this._movement.slice(-1);},
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
	_movement: [],
	init: function() {
		this.requires('Animal, Obstacle, spr_chicken9')
			.attr({ w:24, h:24 })
			.delay(this.randomMove, 1000, -1)
			.onHit('Solid', this.turnAround)
			.onHit('Oven', this.turnAround)
			.onHit('SpinningWheel', this.turnAround)
	},
	pushMovement: function(dir) {
		this._movement.push(dir);
		if (this._movement.length > 5) {this._movement.shift();}
	},
	lastMovement: function() {return this._movement.slice(-1);},
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
	// deviates from movement with a probability of 0.1
	butterflyMove: function() {
		if (Math.random() < 0.1) {
			var a = Math.random();
			if (this._dir == 'up' || this._dir == 'down') {
				if (a < 0.5) {this._dir = 'left';}
				else {this._dir = 'right';}
			} else {
				if (a < 0.5) {this._dir = 'up';}
				else {this._dir = 'down';}
			}
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
			.delay(this.eatEgg, gv.animal.snake.eat_egg, -1)
			.delay(this.snakeMove, this._speed, -1)
			.bind('UpdateFrame', this.offScreen)
	},
	type: function() { return 'snake'; },
	// initial direction
	setDir: function(dir) {this._dir = dir;},
	// deviates from movement with a probability of 0.05
	snakeMove: function() {
		if (Math.random() < 0.05) {
			var a = Math.random();
			if (this._dir == 'up' || this._dir == 'down') {
				if (a < 0.5) {this._dir = 'left';}
				else {this._dir = 'right';}
			} else if (this._dir == 'left' || this._dir == 'right') {
				if (a < 0.5) {this._dir = 'up';}
				else {this._dir = 'down';}
			}
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
			.delay(this.disappear, gv.animal.gopher.disappear)
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
		if (this._on_bush > 0) {Crafty.trigger('BerryCount');}
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
			.reel('OvenFire', 500, [[0,0], [1,0], [2,0], [3,0]])
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
		gv.score-=(gv.recipes.muffin.wheat*1 + gv.recipes.muffin.milk*2 + gv.recipes.muffin.eggs*.25 + gv.recipes.muffin.berries*.1);
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
				// open chest
				this.sprite('spr_chest_open');
				task_funcs.chestIsOpen();
				// stop explosion
				clearTimeout(exp);
				sounds.stop_ticking();
				// get reward
				sounds.play_money();
				gv.score+=20;
				// trigger task complete
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
	hasPin: function() {this.p = 1;},
	revealPin: function() {window.alert(task_funcs.chestGetPassword());}
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
		if (gv.tools.tools == 0){ // holding hammer
			this.sprite('spr_tools2');
		} else if (gv.tools.tools == 1) { // holding shears
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
		if (gv.tools.lgtools == 0){ // holding scythe
			this.sprite('spr_scythe');
		} else if (gv.tools.lgtools == 1) { // holding shovel
			this.sprite('spr_shovel');
		}
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



