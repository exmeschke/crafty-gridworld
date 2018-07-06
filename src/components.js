var tile_sz = 24
var robot_speed = 1500
var robot_movement = []

// Grid
Crafty.c('Grid', {
	init: function() {
		this.attr({ w:tile_sz, h:tile_sz })
	},
	at: function(x, y) {
		this.attr({ x:x*tile_sz, y:y*tile_sz })
		return this;
	},
	atX: function() {
		return this.x/tile_sz;
	}, 
	atY: function() {
		return this.y/tile_sz;
	}
});

// Player character
Crafty.c('Player', {
	init: function() {
		this.requires('2D, Canvas, Grid, Fourway, Collision, spr_player, SpriteAnimation')
			.attr({ w:tile_sz, h:tile_sz, z:1 })
			.fourway(50)
			.bind('Move', function(from) {
				if (this.hit('Solid')) {
					this.attr({ x:from._x, y:from._y });
				}
			})
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
				} else if (data.x < 0) {
					this.animate('PlayerMovingLeft', animation_speed, -1);
				} else if (data.y > 0) {
					this.animate('PlayerMovingDown', animation_speed, -1);
				} else if (data.y < 0) {
					this.animate('PlayerMovingUp', animation_speed, -1);
				} else {
					this.pauseAnimation();
				}
			})
	},
	collectResource: function() {
		var hitDatas, hitData;
		if ((hitDatas = this.hit('Resource'))) {
			hitData = hitDatas[0];
			hitData.obj.collect();
		}
	}
});

// Robot character
Crafty.c('Robot', {
	init: function() {
		this.requires('2D, Canvas, Grid, Fourway, Collision, spr_bot, Tween, Delay')
			.attr({ w:tile_sz, h:tile_sz, z:1 })
			.onHit('Resource', this.collectResource)
			.onHit('Solid', this.turnAround)
	},
	randomMove: function() {
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
	},
	turnAround: function() {
		console.log(robot_movement.slice(-1))
		if (robot_movement.slice(-1) == 'up') {
			this.moveDown();
		} else if (robot_movement.slice(-1) == 'down') {
			this.moveUp();
		} else if (robot_movement.slice(-1) == 'right') {
			this.moveLeft();
		} else {
			this.moveRight()
		}
	},
	moveUp: function() {
		this.tween({ x:this.x, y:this.y-tile_sz }, robot_speed)
		robot_movement.push('up');
		if (robot_movement.length > 5) {
			robot_movement.shift();
		}
	},
	moveDown: function() {
		this.tween({ x:this.x, y:this.y+tile_sz }, robot_speed)
		robot_movement.push('down');
		if (robot_movement.length > 5) {
			robot_movement.shift();
		}
	},
	moveLeft: function() {
		this.tween({ x:this.x-tile_sz, y:this.y }, robot_speed)
		robot_movement.push('left');
		if (robot_movement.length > 5) {
			robot_movement.shift();
		}
	}, 
	moveRight: function() {
		this.tween({ x:this.x+tile_sz, y:this.y }, robot_speed)
		robot_movement.push('right');
		if (robot_movement.length > 5) {
			robot_movement.shift();
		}
	},
	collectResource: function() {
		var hitDatas, hitData;
		if ((hitDatas = this.hit('Resource'))) {
			hitData = hitDatas[0];
			hitData.obj.collect();
		}
	}
})

// Resource
Crafty.c('Resource', {
	init: function() {
		this.requires('2D, Canvas, Grid')
	},
	collect: function() {
		this.destroy();
		Crafty.trigger('ResourceCollected', this);
	}
});
Crafty.c('SmallResource', {
	init: function() {
		this.requires('Resource, Color')
			.attr({ w:4, h:4, r:1 })
			.color('red')
	}
});
Crafty.c('MedResource', {
	init: function() {
		this.requires('Resource, Color')
			.attr({ w:6, h:6, r:5 })
			.color('blue')
	}
});
Crafty.c('BigResource', {
	init: function() {
		this.requires('Resource, Color')
			.attr({ w:8, h:8, r:10 })
			.color('purple')
	}
});

// Obstacles
Crafty.c('Obstacle', {
	init: function() {
		this.requires('2D, Canvas, Grid, Collision')
			.attr({ w:tile_sz, h:tile_sz})
	}
});
Crafty.c('Tree', {
	init: function() {
		this.requires('Obstacle, Solid, spr_tree')
	}
});
Crafty.c('Bush', {
	init: function() {
		this.requires('Obstacle, Solid, spr_bush')
	}
});

