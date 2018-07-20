// Game variables
gv = {
	tile_sz: 24,
	player: {
		movement: []
	}, 
	robot: {
		movement: [],
		charging: 0,
		power: 100,
		speed: 1200
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
		}
	},
	score: 0,
	resources: {
		tools: 0,
		bucket: 0,
		eggs: 0,
		wool: 0,
		milk: 0
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
	atX: function() {
		return this.x/gv.tile_sz;
	}, 
	atY: function() {
		return this.y/gv.tile_sz;
	}
});

// Player character
Crafty.c('Player', {
	init: function() {
		this.requires('2D, Canvas, Grid, Fourway, Keyboard, Collision, Delay, spr_player, SpriteAnimation')
			.attr({ w:gv.tile_sz, h:gv.tile_sz, z:2 })
			.fourway(50)
			.onHit('Obstacle', this.stopMovement)
			.onHit('Resource', this.collectResource)
			.onHit('Robot', this.pushRobot)
			.reel('PlayerMovingUp', 1000, [
				[0,0], [1,0], [2,0]
			])
			.reel('PlayerMovingRight', 1000, [
				[0,1], [1,1], [2,1]
			])
			.reel('PlayerMovingDown', 1000, [
				[0,2], [1,2], [2,2]
			])
			.reel('PlayerMovingLeft', 1000, [
				[0,3], [1,3], [2,3]
			])
			.bind('NewDirection', function(data) {
				var animation_speed = 8;
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
					this.fill();
					this.gather();
				} else if (e.key == Crafty.keys.C) {
					this.emptyBucket();
				} else if (e.key == Crafty.keys.V) {
					this.emptySeedBag();
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
	fill: function() {
		var hitDatas, hitData;
		if ((hitDatas = this.hit('Well'))) {
			Crafty.trigger('FillBucket');
		} else if ((hitDatas = this.hit('Barrel'))) {
			Crafty.trigger('FillSeedBag');
		} else if ((hitDatas = this.hit('Stump'))) {
			Crafty.trigger('SwitchTools');
		}
	},
	gather: function() {
		var hitDatas, hitData;
		if ((hitDatas = this.hit('Sheep'))) {
			if (gv.animal.sheep.hasWool == 1 && gv.resources.tools == 0) {
				Crafty.log('sheep');
				Crafty.trigger('Sheared');
			}
		} else if ((hitDatas = this.hit('Cow'))) {
			if (gv.animal.cow.hasMilk == 1 && gv.resources.bucket == 0) {
				Crafty.trigger('Milked');
			}
		}
	},
	emptyBucket: function() {
		Crafty.trigger('EmptyBucket');
	},
	emptySeedBag: function() {
		Crafty.trigger('EmptySeedBag');
	},
	stopMovement: function() {
		if (gv.player.movement.slice(-1) == 'up') {
			this.attr({ x:this.x, y:this.y+1 });
		} else if (gv.player.movement.slice(-1) == 'down') {
			this.attr({ x:this.x, y:this.y-1 });
		} else if (gv.player.movement.slice(-1) == 'right') {
			this.attr({ x:this.x-1, y:this.y });
		} else {
			this.attr({ x:this.x+1, y:this.y });
		}
	}, 
	pushRobot: function() {
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
	}
});

// Robot character
Crafty.c('Robot', {
	init: function() {
		this.requires('2D, Canvas, Grid, Collision, spr_bot, Tween, Delay, Text')
			.attr({ w: gv.tile_sz, h: gv.tile_sz, z:1 })
			.onHit('Resource', this.collectResource)
			.onHit('Solid', this.turnAround)
			.onHit('ChargingStation', this.recharge)
			.bind('RobotUp', this.moveUp)
			.bind('RobotDown', this.moveDown)
			.bind('RobotLeft', this.moveLeft)
			.bind('RobotRight', this.moveRight)
			.bind('Recharge', this.recharge)
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
			this.plant();
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
	plant: function() {
		var x = this.x/gv.tile_sz;
		var y = this.y/gv.tile_sz;
		Crafty.e('Wheat1').at(x, y);
	},
	water: function() {
		var x = this.x/gv.tile_sz;
		var y = this.y/gv.tile_sz;
		Crafty.e('Wheat2').at(x, y);
	// }, 
	// pick: function() {
	// 	var x = this.x/gv.tile_sz;
	// 	var y = this.y/gv.tile_sz;
	// 	Crafty.e('Egg').at(x, y);
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
			.reel('AnimalEatingUp', 1000, [
				[0,4], [1,4], [2,4], [3,4], [0,4]
			])
			.reel('AnimalEatingLeft', 1000, [
				[0,5], [1,5], [2,5], [3,5], [0,5]
			])
			.reel('AnimalEatingDown', 1000, [
				[0,6], [1,6], [2,6], [3,6], [0,6]
			])
			.reel('AnimalEatingRight', 1000, [
				[0,7], [1,7], [2,7], [3,7], [0,7]
			])
			.onHit('Oven', this.turnAround)
			// .debugStroke('black')
	},
	char: function() {
		return 'animal';
	}, 
	turnAround: function() {
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
	},
	randomMove: function() {
		var ra = Math.random()
		var animation_speed = 8;
		if (ra < 0.12) {
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
		if (movement == 'up') {
			this.animate('AnimalEatingUp', 2, -1);
		} else if (movement == 'down') {
			this.animate('AnimalEatingDown', 2, -1);
		} else if (movement == 'right') {
			this.animate('AnimalEatingRight', 2, -1);
		} else {
			this.animate('AnimalEatingLeft', 2, -1);
		}
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
			.attr({ w:32, h:32, z:1, r:2 })
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
		Crafty.log('has wool');
		gv.animal.sheep.hasWool = 1;
	},
	sheared: function() {
		Crafty.log('sheared');
		gv.score += this.r;
		Crafty.trigger('WoolCount');
		gv.animal.sheep.hasWool = 0;
		// MAKE NOISE
	}
});
Crafty.c('Cow', {
	init: function() {
		this.requires('Animal, spr_cow13')
			.attr({ w:60, h:60, z:1, r:2 })
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
		gv.animal.cow.hasMilk = 1;
	},
	milked: function() {
		gv.animal.cow.hasMilk = 0;
		gv.score += this.r;
		Crafty.trigger('MilkCount');
		// MAKE NOISE
	}
});
Crafty.c('Chicken', {
	init: function() {
		this.requires('Animal, spr_chicken9')
			// .collision(0, 0, 5, 0, 5, 5, 0, 5)
			.attr({ w:24, h:24, z:1 })
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
	}
});


// Resources
Crafty.c('Resource', {
	init: function() {
		this.requires('2D, Canvas, Grid')
			.bind('Collect', this.collect)
	},
	collect: function() {
		if (this.type() == 'egg') {
			gv.score += this.r;
			Crafty.trigger('EggCount');
		} 
		this.destroy();
	}
});
Crafty.c('Egg', {
	init: function() {
		this.requires('Resource, spr_egg')
			.attr({ w:16, h:16, r:1 })
	},
	type: function() {
		return 'egg';
	}
});
Crafty.c('Wool', {
	init: function() {
		this.requires('Resource, spr_wool')
			.attr({ w:16, h:16, r:2 })
	},
	type: function() {
		return 'wool';
	}
});
Crafty.c('Milk', {
	init: function() {
		this.requires('Resource, spr_milk')
			.attr({ w:16, h:16, r:2 })
	},
	type: function() {
		return 'milk';
	}
});


Crafty.c('ResourceLabel', {
	init: function() {
		this.requires('2D, Canvas, Text, Grid')
			.attr({ z:5 })
			.textFont({ size: '16px' })
	}
});
Crafty.c('EggLabel', {
	init: function(){
		this.requires('ResourceLabel')
			.bind('EggCount', this.eggCount)
	},
	eggCount: function() {
		gv.resources.eggs = gv.resources.eggs+1;
		this.text(gv.resources.eggs);
	}
});
Crafty.c('WoolLabel', {
	init: function(){
		this.requires('ResourceLabel')
			.bind('WoolCount', this.woolCount)
	},
	woolCount: function() {
		Crafty.log('woolCount');
		gv.resources.wool = gv.resources.wool+1;
		this.text(gv.resources.wool);
	}
});
Crafty.c('MilkLabel', {
	init: function(){
		this.requires('ResourceLabel')
			.bind('MilkCount', this.milkCount)
	},
	milkCount: function() {
		gv.resources.milk = gv.resources.milk+1;
		this.text(gv.resources.milk);
	}
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
Crafty.c('Oven', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_oven')
			.attr({ w:64-10, h:54-10 })
	}
});
Crafty.c('SpinningWheel', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_spinning_wheel')
			.attr({ w:40, h:40 })
	}
});
Crafty.c('ChargingStation', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_charging_station')
			.attr({ w:30, h:50 })
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
		this.text('$    '+gv.score);
		// this.text('Power: '+gv.robot.power);
	}
});
// Crafty.c('RobotPower', {
// 	init: function() {
// 		this.requires('2D, Canvas, Grid, spr_health1')
// 			.attr({ w:100, h:20 })
// 			// .textFont({ size: '20px' })
// 			.bind('UpdateFrame', this.updatePower)
// 	},
// 	updatePower: function() {
// 		// this.replace('Robot Power: '+String(gv.robot.power))
// 		if (gv.robot.power < 75) {
// 			this.sprite('spr_health2');
// 		} else if (gv.robot.power < 50) {
// 			this.sprite('spr_health3');
// 		} else if (gv.robot.power < 25) {
// 			this.sprite('spr_health4');
// 		} else if (gv.robot.power < 50) {
// 			this.sprite('spr_health5');
// 		}
// 	}
// });
Crafty.c('Bucket', {
	init: function() {
		this.requires('2D, Canvas, Grid, Solid, spr_bucket_empty, Collision')
			.attr({ w:gv.tile_sz*2.5, h:gv.tile_sz*2.5 })
			.bind('FillBucket', this.fill)
			.bind('EmptyBucket', this.empty)
	},
	fill: function() {
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
		this.sprite('spr_seed_bag_full');
	},
	empty: function() {
		this.sprite('spr_seed_bag_empty');
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



// Scenery
Crafty.c('Blank', {
	init: function() {
		this.requires('2D, Canvas, Grid, Color')
			.color('white')
			// .attr({ z:-1 })
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
Crafty.c('Tree', {
	init: function() {
		this.requires('Obstacle, spr_tree')
	}
});
Crafty.c('Fence1', {
	init: function() {
		this.requires('Obstacle, spr_fence1')
	}
});
Crafty.c('Fence2', {
	init: function() {
		this.requires('Obstacle, spr_fence2')
	}
});
Crafty.c('Fence3', {
	init: function() {
		this.requires('Obstacle, spr_fence3')
	}
});
Crafty.c('Fence4', {
	init: function() {
		this.requires('Obstacle, spr_fence4')
	}
});
Crafty.c('Fence5', {
	init: function() {
		this.requires('Obstacle, spr_fence5')
	}
});
Crafty.c('Fence6', {
	init: function() {
		this.requires('Obstacle, spr_fence6')
	}
});
Crafty.c('Fence7', {
	init: function() {
		this.requires('Obstacle, spr_fence7')
	}
});
Crafty.c('Fence8', {
	init: function() {
		this.requires('Obstacle, spr_fence8')
	}
});
Crafty.c('Fence9', {
	init: function() {
		this.requires('Obstacle, spr_fence9')
	}
});
Crafty.c('Fence10', {
	init: function() {
		this.requires('Obstacle, spr_fence10')
	}
});
Crafty.c('Fence11', {
	init: function() {
		this.requires('Obstacle, spr_fence11')
	}
});
Crafty.c('Fence12', {
	init: function() {
		this.requires('Obstacle, spr_fence12')
	}
});

Crafty.c('Ground', {
	init: function() {
		this.requires('2D, Canvas, Grid')
	}
});
Crafty.c('Grass', {
	init: function() {
		this.requires('Ground, spr_grass')
	}
});
Crafty.c('Soil1', {
	init: function() {
		this.requires('Ground, spr_soil1')
	}
});
Crafty.c('Soil2', {
	init: function() {
		this.requires('Ground, spr_soil2')
	}
});
Crafty.c('Soil3', {
	init: function() {
		this.requires('Ground, spr_soil3')
	}
});
Crafty.c('Soil4', {
	init: function() {
		this.requires('Ground, spr_soil4')
	}
});
Crafty.c('Soil5', {
	init: function() {
		this.requires('Ground, spr_soil5')
	}
});
Crafty.c('Soil6', {
	init: function() {
		this.requires('Ground, spr_soil6')
	}
});
Crafty.c('Soil7', {
	init: function() {
		this.requires('Ground, spr_soil7')
	}
});
Crafty.c('Soil8', {
	init: function() {
		this.requires('Ground, spr_soil8')
	}
});
Crafty.c('Soil9', {
	init: function() {
		this.requires('Ground, spr_soil9')
	}
});
Crafty.c('Wheat1', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_wheat1')
	}
});
Crafty.c('Wheat2', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_wheat2')
	}
});
Crafty.c('Wheat3', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_wheat3')
	}
});
Crafty.c('Wheat4', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_wheat4')
	}
});



