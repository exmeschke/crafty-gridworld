window.onload = function() {
	// Define game
	Game = {
		map_grid: {
			w: 48,
			h: 32,
			tile: {
				w: 16,
				h: 16
			}
		},
		w: function() {
			return this.map_grid.w;
		},
		h: function() {
			return this.map_grid.h;
		},
		width: function() {
			return this.map_grid.w * this.map_grid.tile.w;
		},
		height: function() {
			return this.map_grid.h * this.map_grid.tile.h;
		},
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

$text_css = { 'font-size': '24px', 'font-family': 'Arial', 'color': 'white', 'text-align': 'center' }