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
		}
	},
	score: 0
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
			.attr({ w:gv.tile_sz, h:gv.tile_sz, z:1 })
			.fourway(50)
			.onHit('Solid', this.stopMovement)
			.onHit('Resource', this.collectResource)
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
				   console.log('hit');
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
	}
});

// Characters
Crafty.c('Character', {
	init: function() {
		this.requires('2D, Canvas, Grid, Collision, Tween, Delay')
			.onHit('Solid', this.turnAround)
	}, 
	turnAround: function() {
		var char = this.char(); 
		if (char == 'robot') {
			if (gv.robot.power <= 0) {
				return; 
			}
		} else {
			var movement;
			if (char == 'sheep') {
				movement = gv.animal.sheep.movement.slice(-1);
			} else if (char == 'cow') {

			} else if (char == 'chicken') {

			}
		}

		if (gv.robot.movement.slice(-1) == 'up') {
			this.moveDown();
		} else if (gv.robot.movement.slice(-1) == 'down') {
			this.moveUp();
		} else if (gv.robot.movement.slice(-1) == 'right') {
			this.moveLeft();
		} else {
			this.moveRight()
		}
	}
});

// Robot character
Crafty.c('Robot', {
	init: function() {
		// this.requires('2D, Canvas, Grid, Fourway, Collision, spr_bot, Tween, Delay')
		this.requires('Character, spr_bot')
			.attr({ w: gv.tile_sz, h: gv.tile_sz, z:1 })
			.onHit('Resource', this.collectResource)
			.onHit('Solid', this.turnAround)
	},
	char: function() {
		return 'robot';
	},
	randomMove: function() {
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
	// turnAround: function() {
	// 	if (gv.robot.power > 0) {
	// 		if (gv.robot.movement.slice(-1) == 'up') {
	// 			this.moveDown();
	// 		} else if (gv.robot.movement.slice(-1) == 'down') {
	// 			this.moveUp();
	// 		} else if (gv.robot.movement.slice(-1) == 'right') {
	// 			this.moveLeft();
	// 		} else {
	// 			this.moveRight()
	// 		}
	// 	}
	// },
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
	}
});

// Animals
Crafty.c('Animal', {
	init: function() {
		this.requires('2D, Canvas, Grid, Collision, Tween, Delay, SpriteAnimation')
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
				[0,4], [1,4], [2,4], [3,4]
			])
			.reel('AnimalEatingLeft', 1000, [
				[0,5], [1,5], [2,5], [3,5]
			])
			.reel('AnimalEatingDown', 1000, [
				[0,6], [1,6], [2,6], [3,6]
			])
			.reel('AnimalEatingRight', 1000, [
				[0,7], [1,7], [2,7], [3,7]
			])
	}
});
Crafty.c('Sheep', {
	init: function() {
		this.requires('Animal, spr_sheep5')
			.crop(35, 35, 55, 50)
			.attr({ w:32, h:32, z:1 })
			.onHit('Solid', this.turnAround)
	},
	// turnAround: function() {
	// 	if (gv.animal.sheep.movement.slice(-1) == 'up') {
	// 		this.moveDown();
	// 	} else if (gv.animal.sheep.movement.slice(-1) == 'down') {
	// 		this.moveUp();
	// 	} else if (gv.animal.sheep.movement.slice(-1) == 'right') {
	// 		this.moveLeft();
	// 	} else {
	// 		this.moveRight()
	// 	}
	// },
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
		if (gv.animal.sheep.movement.slice(-1) == 'up') {
			this.animate('AnimalEatingUp', 2, -1);
		} else if (gv.animal.sheep.movement.slice(-1) == 'down') {
			this.animate('AnimalEatingDown', 2, -1);
		} else if (gv.animal.sheep.movement.slice(-1) == 'right') {
			this.animate('AnimalEatingRight', 2, -1);
		} else {
			this.animate('AnimalEatingLeft', 2, -1);
		}
	},
	moveUp: function() {
		this.tween({ x: this.x, y: this.y-gv.tile_sz }, gv.animal.speed);
		this.animate('AnimalMovingUp', 8, -1);
		gv.animal.sheep.movement.push('up');
		if (gv.animal.sheep.movement.length > 5) {
			gv.animal.sheep.movement.shift();
		}
	},
	moveDown: function() {
		this.tween({ x: this.x, y: this.y+gv.tile_sz }, gv.animal.speed);
		this.animate('AnimalMovingDown', 8, -1);
		gv.animal.sheep.movement.push('down');
		if (gv.animal.sheep.movement.length > 5) {
			gv.animal.sheep.movement.shift();
		}
	},
	moveLeft: function() {
		this.tween({ x: this.x-gv.tile_sz, y: this.y }, gv.animal.speed);
		this.animate('AnimalMovingLeft', 8, -1);
		gv.animal.sheep.movement.push('left');
		if (gv.animal.sheep.movement.length > 5) {
			gv.animal.sheep.movement.shift();
		}
	}, 
	moveRight: function() {
		this.tween({ x: this.x+gv.tile_sz, y: this.y }, gv.animal.speed);
		this.animate('AnimalMovingRight', 8, -1);
		gv.animal.sheep.movement.push('right');
		if (gv.animal.sheep.movement.length > 5) {
			gv.animal.sheep.movement.shift();
		}
	}
});


// Information
Crafty.c('Blank', {
	init: function() {
		this.requires('2D, Canvas, Grid, Color')
			.color('white')
	}
});
Crafty.c('Score', {
	init: function() {
		this.requires('HTML')
			.attr({ x:500, y:700, w:100, h:40 })
			.append('Score: 0')
			.bind('UpdateFrame', this.updateScore)
	},
	updateScore: function() {
		this.replace('Score: '+String(gv.score))
	}
});
Crafty.c('Power', {
	init: function() {
		this.requires('HTML')
			.attr({ x:600, y:700, w:200, h:40 })
			.append('Robot Power: 100')
			.bind('UpdateFrame', this.updatePower)
	},
	updatePower: function() {
		this.replace('Robot Power: '+String(gv.robot.power))
		// if (gv.robot.power < 75){
		// 	this.sprite([0,1])
		// }
	}
});



// Resources
Crafty.c('Resource', {
	init: function() {
		this.requires('2D, Canvas, Grid')
	},
	collect: function() {
		this.destroy();
		gv.score = gv.score + this.r;
	}
});
Crafty.c('Egg', {
	init: function() {
		this.requires('Resource, spr_egg')
			.attr({ w:16, h:16, r:5 })
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




