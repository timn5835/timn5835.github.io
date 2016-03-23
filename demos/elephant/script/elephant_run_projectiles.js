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
	 * Uses a "drity rectangle" to erase the bullet and moves it.
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