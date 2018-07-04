// Grid
Crafty.c('Grid', {
	init: function() {
		this.attr({ w:16, h:16 })
	},
	at: function(x, y) {
		this.attr({ x:x*16, y:y*16 })
		return this;
	},
	atX: function() {
		return this.x/16;
	}, 
	atY: function() {
		return this.y/16;
	}
});

// Player character
Crafty.c('Player', {
	init: function() {
		this.requires('2D, Canvas, Grid, Fourway, Collision, spr_player, SpriteAnimation')
			.attr({ w:16, h:16, z:1 })
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
		this.requires('2D, Canvas, Grid, Fourway, Collision, spr_bot')
			.attr({ w:16, h:16, z:1 })
			.bind('UpdateFrame', function(data) {
				// Check if hit
				var hitDatas, hitData;
				if (hitDatas = this.hit('Resource')) {
					hitDatas[0].obj.collect();
				} 
				this.trigger('ChangeDirection');
				// this.x = this.x+16 * (data.dt / 5000);
			})
			// .bind('NewDirection', function(data) {
			// 	if (data.x > 0) {

			// 	}
			// })
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
			.attr({ w:16, h:16})
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

