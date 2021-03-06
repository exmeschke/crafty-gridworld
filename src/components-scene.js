/**
 * Defines basic scene components.
 *		Grid @ line 11
 *		Animals @ line 25
 *		Resources @ line 375 
 *		Resource Labels @ line 477
 * 		Scene components @ line 574
 */


// Grid
Crafty.c('Grid', {
	init: function() {
		this.attr({ w:gv.tile_sz, h:gv.tile_sz });
	},
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
			.delay(this.hasWool, 17000, -1)
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
			.delay(this.hasMilk, 21000, -1)
			.onHit('Solid', this.turnAround)
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
Crafty.c('Gopher', {
	_animal: 2,
	init: function() {
		this.requires('Animal, spr_gopher_hole')
			.attr({ w:24, h:24, z:4 })
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

		task_animals.countGone(this._animal);
		if (task_animals.checkComplete(this._animal)) {Crafty.trigger('CompletedTask');}
		else {gv.score -= 1;}
	},
	// gopher is hit by player
	hitGopher: function() {
		this.animate('AnimateHit');
		this.destroy();
		sounds.play_whack();
		
		task_animals.countHit(this._animal);
		if (task_animals.checkComplete(this._animal)) {Crafty.trigger('CompletedTask');}
	}
});
Crafty.c('Butterfly', {
	_dir: '',
	_speed: 600,
	_animal: 1,
	init: function() {
		this.requires('Animal, Resource, spr_butterfly')
			.attr({ w:24, h:24, r:1, z:4 })
			.delay(this.butterflyMove, this._speed, -1)
			.bind('UpdateFrame', this.offScreen)
	},
	type: function() { return 'butterfly'; },
	// initial direction
	setDir: function(dir) {
		if (dir === 'u') {this._dir = 'up';}
		else if (dir === 'd') {this._dir = 'down';}
		else if (dir === 'l') {this._dir = 'left';}
		else if (dir === 'r') {this._dir = 'right';}
	},
	// deviates from movement with a probability of 0.1
	butterflyMove: function() {
		// random move
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
		// overridden by turning around
		if (this._y < 2*gv.tile_sz) {this._dir = 'down';}
		else if (this._y > 22*gv.tile_sz) {this._dir = 'up';}
		else if (this._x > 56*gv.tile_sz) {this._dir = 'left';}
		else if (this._x < 24*gv.tile_sz) {this._dir = 'right';}

		else if (this._x > 46*gv.tile_sz && this._y < 13*gv.tile_sz) {this._dir = 'right';} 
		else if (this._x < 46*gv.tile_sz && this._y < 13*gv.tile_sz) {this._dir = 'down';}

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
		if (this._x < -1 || this._x > gv.tile_sz*57 || this._y < -1 || this._y > gv.tile_sz*25) {
			this.destroy();
			task_animals.countGone(this._animal);
		}
		// checks if task complete
		if (task_animals.checkComplete(this._animal)) {Crafty.trigger('CompletedTask');}
	}
});
Crafty.c('Snake', {
	_dir: '',
	_speed: 700,
	_animal: 2,
	init: function() {
		this.requires('Animal, spr_snake5')
			.attr({ w:24, h:24, z:4 })
			.delay(this.eatEgg, gv.animal.snake.eat_egg, -1)
			.delay(this.snakeMove, this._speed, -1)
			.bind('UpdateFrame', this.offScreen)
	},
	type: function() { return 'snake'; },
	// initial direction
	setDir: function(dir) {
		if (dir === 'u') {this._dir = 'up';}
		else if (dir === 'd') {this._dir = 'down';}
		else if (dir === 'l') {this._dir = 'left';}
		else if (dir === 'r') {this._dir = 'right';}
	},
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
		// overridden by turning around
		if (this._y < 2*gv.tile_sz) {this._dir = 'down';}
		else if (this._y > 22*gv.tile_sz) {this._dir = 'up';}
		else if (this._x > 56*gv.tile_sz) {this._dir = 'left';}
		else if (this._x < 24*gv.tile_sz) {this._dir = 'right';}

		else if (this._x < 44*gv.tile_sz && this._y < 13*gv.tile_sz) {this._dir = 'right';} 
		else if (this._x < 44*gv.tile_sz && this._y >= 13*gv.tile_sz) {this._dir = 'down';}

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

		task_animals.countHit(this._animal);
		if (task_animals.checkComplete(this._animal)) {Crafty.trigger('CompletedTask');}
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
			task_animals.countHit(this._animal);
			gv.score+=this.r;
			play_money();

			if (task_animals.checkComplete(this._animal)) {Crafty.trigger('CompletedTask');}
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
	bake: function() {this.delay(this.burn, 20000);},
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
	bake: function() {this.delay(this.burn, 15000);},
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


// Rescoure Labels
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
		else if (this.type() == 'tomato') {this.text(gv.resources.tomatos);}
		else if (this.type() == 'potato') {this.text(gv.resources.potatos);}
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
		else if (this.type() == 'tomato') { gv.resources.tomatos+=1; }
		else if (this.type() == 'potato') { gv.resources.potatos+=1; }
		else if (this.type() == 'wool') { gv.resources.wool+=1; }
		else if (this.type() == 'milk') { gv.resources.milk+=1; }
		else if (this.type() == 'bread') { gv.resources.bread+=1; }
		else if (this.type() == 'muffin') { gv.resources.muffin+=1; }
		else if (this.type() == 'thread') { gv.resources.thread+=1; }
		this.update();
	}
});
Crafty.c('TomatoLabel', {
	init: function(){
		this.requires('ResourceLabel')
			.attr({ r:1 })
			.bind('TomatoCount', this.count)
	},
	type: function() { return 'wheat'; }
});
Crafty.c('PotatoLabel', {
	init: function(){
		this.requires('ResourceLabel')
			.attr({ r:1 })
			.bind('PotatoCount', this.count)
	},
	type: function() { return 'potato'; }
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
function wait_grow_berries() {
	eval("Crafty.trigger('FillBush');");
	gv.bush = 10;
}
Crafty.c('BerryBush', {
	_on_bush: 0,
	init: function() {
		this.requires('2D, Canvas, Grid, Delay, spr_bbush_empty')
			.attr({ w:40, h:30, r:.1 })
			.bind('CollectBerries', this.collect)
			.bind('WaterBush', this.water)
			.bind('FillBush', this.fill)
	},
	// collect a berry from the bush if berries on bush
	collect: function() {
		sounds.play_rustle();
		if (gv.bush > 0) {Crafty.trigger('BerryCount');}
		gv.bush -= 1;
		if (gv.bush == 0) {this.sprite('spr_bbush_empty');}
	},
	// water bush to produce more berries
	water: function() {
		sounds.play_water();
		Crafty.trigger('EmptyBucket');
		setTimeout(wait_grow_berries, 12000);
	},
	fill: function() {this.sprite('spr_bbush_full');}
});
// Baking in oven
var bake;
function wait_bake_bread() {eval("Crafty.e('Bread').at(Game.w()-2.8,1.8).bake();");}
function wait_bake_muffin() {eval("Crafty.e('Muffin').at(Game.w()-2.8,1.8).bake();");}
Crafty.c('Wood', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_logs')
			.attr({ w:32, h:32 })
	}
});
Crafty.c('Oven', {
	init: function() {
		this.requires('2D, Canvas, Grid, SpriteAnimation, spr_oven_off')
			.attr({ w:50, h:40 })
			.reel('OvenFire', 500, [[0,1], [1,1], [2,1], [3,1]])
			.bind('BakeBread', this.bakeBread)
			.bind('BakeMuffin', this.bakeMuffin)
			.bind('StartOven', this.startOven)
			.bind('StopOven', this.stopOven)
	},
	startOven: function() {
		this.animate('OvenFire', -1);
		gv.tools.oven_on = true;
	},
	stopOven: function() {
		this.pauseAnimation();
		this.sprite('spr_oven_off');
		gv.tools.oven_on = false;
		if (bake != undefined) {clearTimeout(bake);}
	},
	bakeBread: function() {
		gv.resources.wheat-=gv.recipes.bread.wheat;
		gv.resources.milk-=gv.recipes.bread.milk;
		gv.resources.eggs-=gv.recipes.bread.eggs;
		gv.score-=(gv.recipes.bread.wheat*1 + gv.recipes.bread.milk*2 + gv.recipes.bread.milk*.25);
		sounds.play_ding25();
		bake = setTimeout(wait_bake_bread, gv.recipes.bread.time);
	}, 
	bakeMuffin: function() {
		gv.resources.wheat-=gv.recipes.muffin.wheat;
		gv.resources.milk-=gv.recipes.muffin.milk;
		gv.resources.eggs-=gv.recipes.muffin.eggs;
		gv.resources.berries-=gv.recipes.muffin.berries;
		gv.score-=(gv.recipes.muffin.wheat*1 + gv.recipes.muffin.milk*2 + gv.recipes.muffin.eggs*.25 + gv.recipes.muffin.berries*.1);
		sounds.play_ding();
		bake = setTimeout(wait_bake_muffin, gv.recipes.muffin.time);
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
			.bind('LightOn', this.lightOn)
			.bind('LightOff', this.lightOff)
	},
	lightOn: function() {this.sprite('spr_charging_station_lit');}, 
	lightOff: function() {this.sprite('spr_charging_station');}
});
// Hidden chest
var exp;
function wait_destroy_chest() {
	Crafty.trigger('ChestExplosion');
	task_chest.setDestroyed();
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
		task_chest.setRevealed();
		// countdown
		sounds.play_ticking();
		exp = setTimeout(wait_destroy_chest, 65000);
	},
	open: function() {
		if (task_chest.opened == 0 && task_chest.destroyed == 0){
			var pin = prompt('Please enter the 7 digit password:');
			if (pin == task_chest.password) {
				// open chest
				this.sprite('spr_chest_open');
				task_chest.setOpen();
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
	revealPin: function() {window.alert(task_chest.password);}
});

// Bottom panel
Crafty.c('Score', {
	init: function() {
		this.requires('2D, DOM, Grid, Text')
			.attr({ w:100, h:40 })
			.textFont({ size: '20px' })
			.bind('UpdateFrame', this.updateScore)
	},
	updateScore: function() {this.text('$ '+gv.score.toFixed(2));}
});
Crafty.c('Time', {
	init: function() {
		this.requires('2D, DOM, Grid, Text, Delay')
			.attr({ w:100, h:40 })
			.textFont({ size: '20px' })
			// time keeping
			.delay(this.updateMin, 60000, -1)
			.delay(this.updateSec, 1000, -1)
			.bind('UpdateFrame', this.updateTime)
	},
	updateTime: function() {
		var min = gv.time[0];
		var sec = gv.time[1];
		if (gv.time[0] < 10) {min = '0'+min;}
		if (gv.time[1] < 10) {sec = '0'+sec;}
		this.text(min+':'+sec);
		// this.text('0'+gv.time[0]+':'+gv.time[1]);
	},
	updateMin: function() {gv.time[0] += 1;},
	updateSec: function() {
		gv.time[1] += 1;
		if (gv.time[1] == 60) {gv.time[1] = 0;}
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
Crafty.c('BoxUp', {init: function() {this.requires('2D, Canvas, Grid, spr_box_up').attr({ w:125, h:605, z:0 })}});
Crafty.c('Box', {init: function() {this.requires('2D, Canvas, Grid, spr_box').attr({ w:800, h:120, z:0 })}});
Crafty.c('Scroll', {init: function() {this.requires('2D, Canvas, Grid, spr_scroll').attr({ w:485, h:120, z:0 })}});
Crafty.c('SqrBlock', {init: function() {this.requires('2D, Canvas, Grid, spr_block').attr({ w:120, h:120, z:0 })}});
// Crafty.c('Orders', {init: function() {this.requires('2D, Canvas, Grid, spr_orders').attr({ w:135, h:610, z:0 })}});

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
Crafty.c('Grass2', {init: function() {this.requires('Ground, spr_grass2')}});
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

Crafty.c('Tomato1', {init: function() {this.requires('2D, Canvas, Grid, spr_tomato1')}});
Crafty.c('Tomato2', {init: function() {this.requires('2D, Canvas, Grid, spr_tomato2')}});
Crafty.c('Tomato3', {init: function() {this.requires('2D, Canvas, Grid, spr_tomato3')}});
Crafty.c('Tomato4', {init: function() {this.requires('2D, Canvas, Grid, spr_tomato4')}});
Crafty.c('Tomato5', {init: function() {this.requires('2D, Canvas, Grid, spr_tomato5')}});

Crafty.c('Potato1', {init: function() {this.requires('2D, Canvas, Grid, spr_potato1')}});
Crafty.c('Potato2', {init: function() {this.requires('2D, Canvas, Grid, spr_potato2')}});
Crafty.c('Potato3', {init: function() {this.requires('2D, Canvas, Grid, spr_potato3')}});
Crafty.c('Potato4', {init: function() {this.requires('2D, Canvas, Grid, spr_potato4')}});
Crafty.c('Potato5', {init: function() {this.requires('2D, Canvas, Grid, spr_potato5')}});




