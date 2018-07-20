// Game variables
gv = {
	tile_sz: 24,
	player: {
		movement: []
	}, 
	robot: {
		movement: [],
		power: 100,
		speed: 1200
	},
	animal: {
		speed: 1500,
		sheep: {
			movement: []
		},
		cow: {
			movement: []
		},
		chicken: {
			movement: []
		}
	},
	score: 0,
	resources: {
		eggs: 0
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
					this.getTools();
				} else if (e.key == Crafty.keys.V) {
					this.emptyBucket();
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
		}
	},
	emptyBucket: function() {
		Crafty.trigger('EmptyBucket');
	},
	getTools: function() {
		var hitDatas, hitData;
		if ((hitDatas = this.hit('Bag'))) {
			Crafty.trigger('GetTools');
		}
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
			.bind('RobotUp', this.moveUp)
			.bind('RobotDown', this.moveDown)
			.bind('RobotLeft', this.moveLeft)
			.bind('RobotRight', this.moveRight)
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
		if (this.x/gv.tile_sz < 18 && this.y/gv.tile_sz < 18 && this.x/gv.tile_sz > 1 && this.y/gv.tile_sz > 1) {
			this.plant();
		}
		
		if (gv.robot.power > 0) {
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
	},
	moveUp: function() {
		this.tween({ x: this.x, y: this.y-gv.tile_sz }, gv.robot.speed)
		gv.robot.movement.push('up');
		if (gv.robot.movement.length > 5) {
			gv.robot.movement.shift();
		}
	},
	moveDown: function() {
		this.tween({ x: this.x, y: this.y+gv.tile_sz }, gv.robot.speed)
		gv.robot.movement.push('down');
		if (gv.robot.movement.length > 5) {
			gv.robot.movement.shift();
		}
	},
	moveLeft: function() {
		this.tween({ x: this.x-gv.tile_sz, y: this.y }, gv.robot.speed)
		gv.robot.movement.push('left');
		gv.robot.movement.push('left');
		if (gv.robot.movement.length > 5) {
			gv.robot.movement.shift();
		}
	}, 
	moveRight: function() {
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
		if (gv.robot.power >= 10){
			gv.robot.power -= 10
		} else {
			gv.robot.power = 0
		}
	},
	recharge: function() {
		gv.robot.power += 10
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
			.attr({ w:32, h:32, z:1 })
			.onHit('Solid', this.turnAround)
	},
	pushMovement: function(dir) {
		gv.animal.sheep.movement.push(dir);
		if (gv.animal.sheep.movement.length > 5) {
			gv.animal.sheep.movement.shift();
		}
	},
	lastMovement: function() {
		return gv.animal.sheep.movement.slice(-1);
	}
});
Crafty.c('Cow', {
	init: function() {
		this.requires('Animal, spr_cow13')
			.attr({ w:60, h:60, z:1 })
			.onHit('Solid', this.turnAround)
	},
	pushMovement: function(dir) {
		gv.animal.cow.movement.push(dir);
		if (gv.animal.cow.movement.length > 5) {
			gv.animal.cow.movement.shift();
		}
	},
	lastMovement: function() {
		return gv.animal.cow.movement.slice(-1);
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


// Information
Crafty.c('Blank', {
	init: function() {
		this.requires('2D, Canvas, Grid, Color')
			.color('white')
			// .attr({ z:-1 })
	}
});
Crafty.c('Score', {
	init: function() {
		this.requires('2D, Canvas, Grid, Text')
			.attr({ w:100, h:40 })
			.textFont({ size: '24px' })
			.bind('UpdateFrame', this.updateScore)
	},
	updateScore: function() {
		// this.replace('$   '+String(gv.score))
		this.text('$    '+gv.score)
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



// Resources
Crafty.c('Resource', {
	init: function() {
		this.requires('2D, Canvas, Grid')
	},
	collect: function() {
		this.destroy();
		// gv.score = gv.score + this.r;
		if (this.type() == 'egg') {
			gv.score += this.r;
			Crafty.trigger('UpdateLabel');
		}
	}
});
Crafty.c('ResourceLabel', {
	init: function() {
		this.requires('2D, Canvas, Text, Grid')
			.attr({ z:5 })
			.textFont({ size: '16px' })
			.bind('UpdateLabel', this.update)
			// .dynamicTextGeneration(true)
	},
	update: function() {
		gv.resources.eggs = gv.resources.eggs+1;
		this.text(gv.resources.eggs);
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

Crafty.c('Bag', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_bag')
			.attr({ w:24, h:24 })
			.bind('GetTools', this.getTools);
	},
	getTools: function() {
		// var x = gv.tile_sz*
		// var y = this.y/gv.tile_sz;
		// Crafty.e('Egg').at(x, y);
	}
});
Crafty.c('Barrel', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_barrels')
			.attr({ w:40, h:40 })
			.bind('GetSeeds', this.getSeeds);
	},
	getSeeds: function() {
		// var x = gv.tile_sz*
		// var y = this.y/gv.tile_sz;
		// Crafty.e('Egg').at(x, y);
	}
});
Crafty.c('Well', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_well')
			.attr({ w:40, h:40 })
	}
});

// Bottom panel
Crafty.c('Bucket', {
	init: function() {
		this.requires('2D, Canvas, Grid, Solid, spr_bucket_empty, Collision')
			.attr({ w:gv.tile_sz*2.5, h:gv.tile_sz*2.5 })
			.bind('FillBucket', this.fill)
			.bind('EmptyBucket', this.empty)
	},
	fill: function() {
		Crafty.log('fill');
		this.sprite('spr_bucket_full');
	},
	empty: function() {
		Crafty.log('empty');
		this.sprite('spr_bucket_empty');
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
		Crafty.log('fill');
		this.sprite('spr_seed_bag_full');
	},
	empty: function() {
		Crafty.log('empty');
		this.sprite('spr_seed_bag_empty');
	}
});
Crafty.c('Tools', {
	init: function() {
		this.requires('2D, Canvas, Grid, spr_tools')
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


// Scenery
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




