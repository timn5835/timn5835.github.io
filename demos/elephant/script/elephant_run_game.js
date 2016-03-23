/**
 * Creates the Game object which will hold all objects and data for
 * the game.
 */
function Game() {
	/*
	 * Gets canvas information and context and sets up all game
	 * objects.
	 * Returns true if the canvas is supported and false if it
	 * is not. This is to stop the animation script from constantly
	 * running on older browsers.
	 */
	this.init = function() {
		// Get the canvas elements
		this.bgCanvas = document.getElementById('background');
		this.elCanvas = document.getElementById("elephant");
		this.hCanvas = document.getElementById("hunter");
		this.nCanvas = document.getElementById("nuts");
		// Test to see if canvas is supported
		if (this.bgCanvas.getContext) {
			this.bgContext = this.bgCanvas.getContext('2d');
			this.elContext = this.elCanvas.getContext('2d');
			this.hContext = this.hCanvas.getContext('2d');
			this.nContext = this.nCanvas.getContext('2d');
			// Initialize objects to contain their context and canvas
			// information
			Background.prototype.context = this.bgContext;
			Background.prototype.canvasWidth = this.bgCanvas.width;
			Background.prototype.canvasHeight = this.bgCanvas.height;
			
			Elephant.prototype.context = this.elContext;
			Elephant.prototype.canvasWidth = this.elCanvas.width;
			Elephant.prototype.canvasHeight = this.elCanvas.height;
			
			Hunter.prototype.context = this.hContext;
			Hunter.prototype.canvasWidth = this.hCanvas.width;
			Hunter.prototype.canvasHeight = this.hCanvas.height;
			
			Projectile.prototype.context = this.hContext;
			Projectile.prototype.canvasWidth = this.hCanvas.width;
			Projectile.prototype.canvasHeight = this.hCanvas.height;
			
			// Initialize the background object
			this.background = new Background();
			this.elly       = new Elephant();
			this.hunter     = new Hunter();
			
			this.background.init(0,0); // Set draw point to 0,0
			groundCoord = this.elCanvas.height*.75;
			this.elly.init(10,groundCoord,this.elCanvas.width*.12,this.elCanvas.height*.17);
			this.hunter.init(this.hCanvas.width-50,groundCoord-10,10,10);
			return true;
		} else {
			return false;
		}
	};
	// Start the animation loop
	this.start = function() {
		animate();
	};
}




/**
 * The animation loop. Calls the requestAnimationFrame shim to
 * optimize the game loop and draws all game objects. This
 * function must be a global function and cannot be within an
 * object.
 */
var lastTime = Date.now();
var dt;
var now;
function animate() {
	if(ellyAlive && picsReady)
	{
		requestAnimFrame( animate );
		now = Date.now();
		dt = (now-lastTime)/1000.0;//VERY FIRST TIME: THIS RETURNS NaN and lastTime IS undefined
		lastTime = now;
		game.background.draw();
		game.elly.draw();
		game.elly.move();
		peanutPool.animate();
		game.hunter.fire();
		bulletPool.animate();
	}
}

/**
 * requestAnimf shim layer by Paul Irish
 * Finds the first API that works to optimize the animation loop,
 * otherwise defaults to setTimeout().
 */
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame   ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();



/**
 * Initialize the Game and starts it.
 */
var game = new Game();
function init() {
	if(game.init())
		game.start();
}

function restart() {
	game.elly.context.clearRect(game.elly.x,game.elly.y,game.elCanvas.width*.12+1,game.elCanvas.height*.17+1);
	timer = 0;
	shootTimer = 0;
	ellyAlive = true;
	canSpit = true;
	lives   = 5;
	game.elly.x=10;
	for(var i=0;i<bulletPool.size;i++)
	{
		bulletPool.access(i).clear();
	}
	requestAnimFrame( animate );
}