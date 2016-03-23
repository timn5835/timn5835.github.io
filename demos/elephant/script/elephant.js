/**
 * Define an object to hold all our images for the game so images
 * are only ever created once. This type of object is known as a
 * singleton.
 */
var timer = 0;
var shootTimer = 0;
var ellyAlive = true;
var altSrc = 0;
var groundCoord;
var jumpCount = 0;
var peanutPool;
var bulletPool;
var canSpit = true;
var lives   = 5;
var picsReady = false;
var imageRepository = new function() {
	// Define images
	this.background = new Image();
	this.e1         = new Image();
	this.e2         = new Image();
	this.e3         = new Image();
	this.elephant   = this.e1;
	this.bullet     = new Image();
	this.peanut     = new Image();
	this.hunter     = new Image();
	this.heart      = new Image();
	
	var numImages = 8;
	var numLoaded = 0;
	function imageLoaded() {
		numLoaded++;
		if (numLoaded === numImages) {
			//window.init();
			picsReady = true;
		}
	}
	this.background.onload = function() {
		imageLoaded();
	}
	this.e1.onload = function() {
		imageLoaded();
	}
	this.e2.onload = function() {
		imageLoaded();
	}
	this.e3.onload = function() {
		imageLoaded();
	}
	this.bullet.onload = function() {
		imageLoaded();
	}
	this.peanut.onload = function() {
		imageLoaded();
	}
	this.hunter.onload = function() {
		imageLoaded();
	}
	this.heart.onload = function() {
		imageLoaded();
	}
	
	// Set images src
	this.background.src = "/demos/elephant/images/forest.jpg";
	this.e1.src       = "/demos/elephant/images/e.png";
	this.e2.src       = "/demos/elephant/images/e2.png";
	this.e3.src       = "/demos/elephant/images/e3.png";
	this.bullet.src   = "/demos/elephant/images/bullet1.png";
	this.peanut.src   = "/demos/elephant/images/peanut.png";
	this.hunter.src   = "/demos/elephant/images/hunter.png";
	this.heart.src   = "/demos/elephant/images/heart.png";
}



/**
 * Creates the Drawable object which will be the base class for
 * all drawable objects in the game. Sets up default variables
 * that all child objects will inherit, as well as the default
 * functions.
 */
function Drawable() {
	this.init = function(x,y,w,h) {
		// Default variables
		this.x = x;
		this.y = y;
		this.h = h;
		this.w = w;
	}
	this.speed = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;
	// Define abstract function to be implemented in child objects
	this.draw = function() {
	};
}



/**
 * Creates the Background object which will become a child of
 * the Drawable object. The background is drawn on the "background"
 * canvas and creates the illusion of moving by panning the image.
 */

function Background() {
	this.speed = 40;// Define speed of the background for panning
	// Implement abstract function
	this.draw = function(){
		// Pan background
		this.x -= this.speed*dt;
		this.context.drawImage(imageRepository.background, this.x, this.y,this.canvasWidth,this.canvasHeight);
		// Draw another image at the top edge of the first image
		this.context.drawImage(imageRepository.background, this.x + this.canvasWidth, this.y,this.canvasWidth,this.canvasHeight);
		
		this.tempContext = game.nContext;
		this.tempContext.clearRect(this.canvasWidth-70,10,71,11);
		timer+=dt;
		if(timer<60)
		{
			this.tempContext.fillStyle="#FF0000";
			this.tempContext.fillRect(this.canvasWidth-10-(60-timer),10,(60-timer),10);
		}
		else
		{
			document.location.replace("done.html");
		}
		
		if(!canSpit)
		{			
			shootTimer+=dt;
			if(shootTimer>=5)
			{
				canSpit=true;
				shootTimer=0;
			}
		}
		
		// If the image scrolled off the screen, reset
		if (this.x <= ((this.canvasWidth)*-1))
			this.x = 0;
	};
}
// Set Background to inherit properties from Drawable
Background.prototype = new Drawable();



function Elephant() {
	peanutPool = new Pool(1);
	peanutPool.init("peanut");
	this.speed = 45;
	this.draw = function(){
		altSrc+=dt;
		if(altSrc>=3)
		{
			imageRepository.elephant = imageRepository.e2;
			altSrc=0;
		}
		else if(altSrc>=2)
		{
			imageRepository.elephant = imageRepository.e3;
		}
		else if(altSrc>=1)
		{
			imageRepository.elephant = imageRepository.e1;
		}
		this.context.clearRect(this.x,this.y,this.w,this.h);
		this.context.drawImage(imageRepository.elephant,this.x,this.y,this.w,this.h);
		game.hunter.draw();
		for(var i=0;i<lives;i++)
		{
			this.context.clearRect(10+(10*i),groundCoord+26,11,11);
			this.context.drawImage(imageRepository.heart,10+(10*i),groundCoord+26,10,10);
		}
	};
	this.move = function() {
		// Determine if the action is move action
		if (KEY_STATUS.left || KEY_STATUS.right ||
			KEY_STATUS.down || KEY_STATUS.up || KEY_STATUS.space) {
			// The ship moved, so erase it's current image so it can
			// be redrawn in it's new location
			this.context.clearRect(this.x, this.y, this.w, this.h);
			// Update x and y according to the direction to move and
			// redraw the ship. Change the else if's to if statements
			// to have diagonal movement.
			
			if (KEY_STATUS.up) {
				jumpCount+=dt;
				if(jumpCount<=.75)
				{
					this.y -= this.speed*dt*1.5;
				}
				else if(jumpCount<=1.25)
				{
					this.speed=60;
					this.y += this.speed*dt;
				}
				else
				{
					this.speed=45;
					this.y = groundCoord;
					jumpCount=0;
					KEY_STATUS[KEY_CODES[38]]=false;
					//KEY_STATUS[KEY_CODES[39]]=false;
				}
				if(KEY_STATUS.right)
					this.x += this.speed*dt;
				if(KEY_STATUS.left)
					this.x -= this.speed*dt;

			} else if (KEY_STATUS.left) {
				this.x -= this.speed*dt;
				if (this.x <= 0) // Keep player within the screen
					this.x = 0;
				if(canSpit && KEY_STATUS.space)
				{
					canSpit=false;
					peanutPool.get(this.x+this.w,game.elly.y+game.elly.h/2-3, 85);
				}
			} else if (KEY_STATUS.right) {
				this.x += this.speed*dt;
				if(canSpit && KEY_STATUS.space)
				{
					canSpit=false;
					peanutPool.get(this.x+this.w,game.elly.y+game.elly.h/2-3, 85);
				}
			} else if (KEY_STATUS.space) {
				if(canSpit)
				{
					canSpit=false;
					peanutPool.get(this.x+this.w,game.elly.y+game.elly.h/2-3, 85);
				}
			}
			// Finish by redrawing the ship
			if (this.x >= this.canvasWidth - 40 - this.w)
			{
					this.x = this.canvasWidth - 60 - this.w;
					game.elly.context.clearRect(10+(10*(lives-1)),groundCoord+26,11,11);
					lives--;
					if(lives==0)
					{
						ellyAlive=false;
						document.getElementById("dead").click();
					}
			}
			this.draw();
		}
	};

}
Elephant.prototype = new Drawable();


function Hunter() {
	var reload = 0
	var canShoot = true;
	bulletPool = new Pool(3);
	bulletPool.init('bullet');
	this.draw = function(){
		this.context.drawImage(imageRepository.hunter,this.canvasWidth-40,groundCoord-5,40,30);
		if(!canShoot)
		{
			reload += dt;
			if(reload >= 1.75)
			{
				canShoot = true;
				reload = 0;
			}
		}
	}
	this.fire = function(){
		chance = Math.floor(Math.random()*101);
		if (chance/100 < .085 && canShoot) {
			canShoot = false;
			bulletPool.get(this.canvasWidth-60, this.canvasHeight/8*6+this.h, 85);
		}
	}
}
Hunter.prototype = new Drawable();



// The keycodes that will be mapped when a user presses a button.
// Original code by Doug McInnes
KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
}
// Creates the array to hold the KEY_CODES and sets all their values
// to false. Checking true/flase is the quickest way to check status
// of a key press and which one was pressed when determining
// when to move and which direction.
KEY_STATUS = {};
for (code in KEY_CODES) {
  KEY_STATUS[ KEY_CODES[ code ]] = false;
}
/**
 * Sets up the document to listen to onkeydown events (fired when
 * any key on the keyboard is pressed down). When a key is pressed,
 * it sets the appropriate direction to true to let us know which
 * key it was.
 */
document.onkeydown = function(e) {
  // Firefox and opera use charCode instead of keyCode to
  // return which key was pressed.
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
	if(game.elly.y==groundCoord){
		KEY_STATUS[KEY_CODES[keyCode]] = true;
	}
  }
}
/**
 * Sets up the document to listen to ownkeyup events (fired when
 * any key on the keyboard is released). When a key is released,
 * it sets teh appropriate direction to false to let us know which
 * key it was.
 */
document.onkeyup = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]&&keyCode!=38) {
    e.preventDefault();
	KEY_STATUS[KEY_CODES[keyCode]] = false;
  }
}

clickIt = function() {
	document.getElementById("start").click();
	document.getElementById("start").disabled = true;
}

begin = function() {
	window.init();
}



function Pool(maxSize)
{
	var size = maxSize;
	var pool = [];
	var type;
	
	this.access = function(index){
		if(index<size&&index>=0)
			return pool[index];
	};
	
	this.init = function(object) {
		if (object == "peanut") {
			for (var i = 0; i < size; i++) {
				// Initalize the object
				var bullet = new Projectile("peanut");
				bullet.init(0,0, 10,10);
				pool[i] = bullet;
			}
		}
		else if (object == "bullet") {
			for (var i = 0; i < size; i++) {
				var bullet = new Projectile("bullet");
				bullet.init(0,0, 10,10);
				pool[i] = bullet;
			}
		}
	};
	
	
	
	this.get = function(x, y, speed) {
		if(!pool[size - 1].alive) {
			pool[size - 1].spawn(x, y, speed);
			pool.unshift(pool.pop());
		}
	};
	
	this.animate = function() {
		for (var i = 0; i < size; i++) {
			// Only draw until we find a bullet that is not alive
			if (pool[i].alive) {
				if (pool[i].draw() || pool[i].collision()) {
					//alert("hit");
					pool[i].clear();
					pool.push((pool.splice(i,1))[0]);
				}
			}
			else
				break;
		}
	};
}





function Projectile(object) {
	this.alive = false; // Is true if the bullet is currently in use
	var self = object;
	/*
	 * Sets the bullet values
	 */
	this.spawn = function(x, y, speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.alive = true;
	};
	/*
	 * Uses a "dirty rectangle" to erase the bullet and moves it.
	 * Returns true if the bullet moved off the screen, indicating that
	 * the bullet is ready to be cleared by the pool, otherwise draws
	 * the bullet.
	 */
	this.draw = function() {
		this.context.clearRect(this.x-1, this.y-1, /*this.width+1, this.height+1*/21,21);
		if (self === "peanut" && this.x >= this.canvasWidth-70) {
			return true;
		}
		else if (self === "bullet" && this.x <= -10) {
			return true;
		}
		else {
			if (self === "peanut") {
				this.x += this.speed*dt;
				this.context.drawImage(imageRepository.peanut, this.x, this.y,10,10);
			}
			else if (self === "bullet") {
				this.x -= this.speed*dt;
				this.context.drawImage(imageRepository.bullet, this.x, this.y,10,10);
			}
			return false;
		}
	};
	
	
	this.collision = function(){
		if(self==="bullet")
		{
			this.tempElly = game.elly;
			this.p        = peanutPool.access(0);
			if(this.tempElly.x+2<=this.x+this.w-2 && this.tempElly.x+this.tempElly.w-2>=this.x+2 && this.tempElly.y+2<=this.y+this.h-2 && this.tempElly.y+this.tempElly.h-2>=this.y+2)
			{
				this.context.clearRect(this.x, this.y, this.w, this.h);
				//this.clear();
				for (code in KEY_CODES)
				{
					KEY_STATUS[ KEY_CODES[ code ]] = false;
				}
				if(this.tempElly.y!=groundCoord)
				{
					this.tempElly.y=groundCoord;
					this.tempElly.context.clearRect(this.tempElly.x,this.tempElly.y-this.tempElly.h,this.tempElly.w,this.tempElly.h*2);
				}
				game.elly.context.clearRect(10+(10*(lives-1)),groundCoord+26,11,11);
				lives--;
				if(lives==0)
				{
					ellyAlive=false;
					document.getElementById("dead").click();
				}
				return true;
			}
			else if(this.p.x+2<=this.x+8 && this.p.x+8>=this.x+2 && this.p.y+2<=this.y+8 && this.p.y+8>=this.y+2)
			{
				this.context.clearRect(this.x-1, this.y-1, this.w+1, this.h+1);
				this.context.clearRect(this.p.x-1,this.p.y-1,this.p.w+1,this.p.h+1);
				this.p.clear();
				return true;
			}
		}
		else
		{
			for(var i=0;i<3;i++)
			{
				this.b=bulletPool.access(i);
				if(this.b.x+2<=this.x+8 && this.b.x+8>=this.x+2 && this.b.y+2<=this.y+8 && this.b.y+8>=this.y+2)
				{
					this.context.clearRect(this.x-1, this.y-1, this.w+1, this.h+1);
					this.context.clearRect(this.b.x-1,this.b.y-1,this.b.w+1,this.b.h+1);
					this.b.clear();
					return true;
				}
			}
		}
		
	};
	
	/*
	 * Resets the bullet values
	 */
	this.clear = function() {
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
	};
}
Projectile.prototype = new Drawable();



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