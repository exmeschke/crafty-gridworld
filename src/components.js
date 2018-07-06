// Game variables
gv = {
	tile_sz: 24,
	player: {
		movement: []
	}, 
	robot: {
		movement: [],
		power: 100,
		speed: 1500
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

// Robot character
Crafty.c('Robot', {
	init: function() {
		this.requires('2D, Canvas, Grid, Fourway, Collision, spr_bot, Tween, Delay')
			.attr({ w: gv.tile_sz, h: gv.tile_sz, z:1 })
			.onHit('Resource', this.collectResource)
			.onHit('Solid', this.turnAround)
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
	turnAround: function() {
		if (gv.robot.power > 0) {
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
		if (gv.robot.movement.length > 5) {
			gv.robot.movement.shift();
		}
	}, 
	moveRight: function() {
		this.tween({ x: this.x+gv.tile_sz, y: this.y }, gv.robot.speed)
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
		gv.robot.power -= 10
	},
	recharge: function() {
		gv.robot.power += 10
	}
});

// Information
Crafty.c('Score', {
	init: function() {
		this.requires('HTML')
			.attr({ x:20, y: 380, w:100, h:10 })
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
			.attr({ x:20, y: 400, w:100, h:10 })
			.append('Robot Power: 100')
			.bind('UpdateFrame', this.updatePower)
	},
	updatePower: function() {
		this.replace('Robot Power: '+String(gv.robot.power))
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
			.attr({ w:gv.tile_sz, h:gv.tile_sz})
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

