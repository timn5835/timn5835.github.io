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
	this.background.src = "../images/forest.jpg";
	this.e1.src       = "../images/e.png";
	this.e2.src       = "../images/e2.png";
	this.e3.src       = "../images/e3.png";
	this.bullet.src   = "../images/bullet1.png";
	this.peanut.src   = "../images/peanut.png";
	this.hunter.src   = "../images/hunter.png";
	this.heart.src   = "../images/heart.png";
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