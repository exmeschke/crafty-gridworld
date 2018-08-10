window.onload = function() {
	// Initialize game
	Game = {
		map_grid: {w: 54, h: 30, tile: { w:24, h:24 }},
		w: function() {return this.map_grid.w;},
		h: function() {return this.map_grid.h;},
		width: function() {return this.map_grid.w * this.map_grid.tile.w;},
		height: function() {return this.map_grid.h * this.map_grid.tile.h;},
		start: function() {
			Crafty.init(this.width(),this.height(), document.getElementById('game'));
			// Start the Game
			Crafty.scene('Loading');
		}
	}
	// Start game
	var game = Game;
	game.start();
}
// Text
$text_css = { 'font-size': '24px', 'font-family': 'Arial', 'color': 'white', 'text-align': 'center' }
// Sounds
sounds = {
	play_low: function() {Crafty.audio.play('alert_low');},
	play_med: function() {Crafty.audio.play('alert_med');},
	play_high: function() {Crafty.audio.play('alert_high');},
	play_radar_low: function() {Crafty.audio.play('beep_low');},
	play_radar_med: function() {Crafty.audio.play('beep_med');},
	play_radar_high: function() {Crafty.audio.play('beep_high');},
	play_cow: function() {Crafty.audio.play('cow');},
	play_sheep: function() {Crafty.audio.play('sheep');},
	play_chicken: function() {Crafty.audio.play('chicken');},
	play_stone: function() {Crafty.audio.play('stone');},
	play_whack: function() {Crafty.audio.play('whack');},
	play_well_water: function() {Crafty.audio.play('well_water');},
	play_water: function() {Crafty.audio.play('water');},
	play_grain: function() {Crafty.audio.play('grain');},
	play_rustle: function() {Crafty.audio.play('rustle');},
	play_ding: function() {Crafty.audio.play('oven');},
	play_ding25: function() {Crafty.audio.play('oven25');},
	play_ticking: function() {Crafty.audio.play('ticking');},
	stop_ticking: function() {Crafty.audio.stop('ticking');},
	play_money: function() {Crafty.audio.play('cha_ching');},
	play_correct: function() {Crafty.audio.play('correct_beep');},
	play_error: function() {Crafty.audio.play('robot_error');}
};
