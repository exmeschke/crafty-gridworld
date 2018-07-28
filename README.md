# Gridworld with Crafty.js

Single player game where player works with robot to complete a series of tasks.

Navigate using the arrow keys and 'X' triggers actions.

The player has three types of individual tasks: 
1) Collect stationary resources
2) Catch moving resources
3) Complete a series of tasks, holding information in working memory

The robot will periodically request the player for assistance, alerting them with a noise and/or a blinking light. The player may choose to respond or ignore the request.

## File content
/root/

index.html - open in browser to start game

/src/

game-setup.js - initializes Crafty game and defines sound effects

task-requests.js - defines human task list and robot request list

scene-components.js - defines game components and rules for interactions with environment

scenes.js - places objects in scene and loads sprite sheets

event-components.js - javascript functions that for events related to human tasks and robot requests

## Attributions
(animals)
https://opengameart.org/content/lpc-style-farm-animals

(farm)
https://opengameart.org/content/lpc-farming-tilesets-magic-animations-and-ui-elements

(oven)
http://lpc.opengameart.org/

(well)
https://opengameart.org/content/objects-0

