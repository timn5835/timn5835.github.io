(function() {	
	var imageRepository = new function() {
		// Define images
		this.imgs = {
			e1         : "/images/e.png",
			e2   	   : "/images/e2.png",
			e3         : "/images/e3.png",
			bullet     : "/images/bullet1.png",
			peanut     : "/images/peanut.png",
			hunter     : "/images/hunter.png"
		};

		this.ready = false;
		var self = this;
		var numImages = 0;
		for(var i in this.imgs) {
			numImages++;
		}
		var numLoaded = 0;

		function imageLoaded() {
			numLoaded++;
			if (numLoaded === numImages) {
				self.ready = true;
			}
		}

		for(var i in this.imgs) {
			var image = new Image();
			image.src = this.imgs[''+i];
			this.imgs[''+i] = image;
			image.onload = function() {
				imageLoaded();
			};
		}

	};

	/**
	 * Drawable Class that everything is based on
	 */
	function Drawable() {

		this.clear = function(canvas) {
			canvas.context.clearRect(0, 0, canvas.w, canvas.h);
		};

		this.draw = function(canvas) {
			canvas.drawImage(this.image, this.x, this.y, this.w, this.h);
		};
	}


	function Elephant(speed,x,y,w,h,peanuts) {
		//sets defaults
		speed = speed || 40;
		x = x || 0;
		y = y || 0;
		w = w || 100;
		h = h || 100;
		peanuts = peanuts || [];
		this.isAlive = true;
		this.life = 100;

		//sets property values
		this.speed = speed;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.peanuts = peanuts;
		

		this.image = imageRepository.imgs.e1;

		var KEY_CODES = {
		  32: 'space',
		  37: 'left',
		  38: 'up',
		  39: 'right',
		};

		var KEY_STATUS = {
			'space': false,
			'left': false,
			'right': false,
			'up': false,
		};

		document.onkeydown = function(e) {
		  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
		  if (KEY_CODES[keyCode]) {
		    e.preventDefault();
			KEY_STATUS[KEY_CODES[keyCode]] = true;
		  }
		};

		document.onkeyup = function(e) {
		  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
		  if (KEY_CODES[keyCode]&& KEY_CODES[keyCode] !== 'up') {
		    e.preventDefault();
			KEY_STATUS[KEY_CODES[keyCode]] = false;
		  }
		};

		this.count = 0;
		this.move = function() {
			if(KEY_STATUS.up) {
				this.count += dt;
				if(this.count <= 0.75) {
					this.y -= (this.speed*4)*dt;
				}
				else {
					this.y += (this.speed)*dt*6;
					if(this.count >= 1.25) {
						KEY_STATUS.up = false;
						this.count = 0;
						this.y = game.pcAttr.topOfPlayers;
					}
				}
			}

			if(KEY_STATUS.left && this.x-this.speed*dt>=0) {
				if(!KEY_STATUS.up) {
					this.x -= this.speed*dt;	
				}
				else {
					this.x -= this.speed*dt*2;
				}
				
			}
			else if(KEY_STATUS.right) {//check to see if >= hunter.x
				if(this.x+this.speed*dt+this.w < game.objs.comp.h.x) {
					if(!KEY_STATUS.up) {
						this.x += this.speed*dt;
					}
					else {
						this.x += this.speed*dt*2;	
					}
				}
				else {
					this.x -= this.speed*dt*2;
					this.life -= game.objs.comp.bullets[0].damage;
				}
			}

			if(KEY_STATUS.space) {
				KEY_STATUS.space = false;
				this.shoot();
			}
			
		};


		this.shoot = function() {
			if(this.isAlive) {
				var peanut = this.peanuts[this.peanuts.length-1];
				if (!peanut.shot) {
					peanut.x = this.x + this.w;
					peanut.y = this.y + (this.h/2);
					peanut.isAlive = true;
					peanut.shot = true;
					var temp = this.peanuts.pop();
					this.peanuts.unshift(temp);
				}
			}
		};


		this.reload = function() {
			var self = this;
			console.log('reloading');
			var reloadTimer = setTimeout(function() {
				for(var i=0; i<self.peanuts.length; i++) {
					self.peanuts[i].shot = false;
				}
				clearTimeout(reloadTimer);
			}, 3000);
		};
	}

	Elephant.prototype = new Drawable();



	function Hunter(x,y,w,h,bullets) {
		//sets defaults
		x = x || 0;
		y = y || 0;
		w = w || 100;
		h = h || 100;
		bullets = bullets || [];
		this.isAlive = true;
		this.life = 100;

		//sets property values
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.bullets = bullets;
		

		this.image = imageRepository.imgs.hunter;

		this.shoot = function() {
			if(this.isAlive) {
				var sum = Math.floor(Math.random() * 100 + 1);
				var bullet = this.bullets[this.bullets.length-1];
				if (!bullet.shot && sum<=40  ) {
					bullet.x = this.x - bullet.w;
					bullet.y = this.y + (this.h/2);
					bullet.isAlive = true;
					bullet.shot = true;
					var temp = this.bullets.pop();
					this.bullets.unshift(temp);
				}
			}
		};

		this.reload = function() {
			var self = this;
			console.log('reloading');
			var reloadTimer = setTimeout(function() {
				for(var i=0; i<self.bullets.length; i++) {
					self.bullets[i].shot = false;
				}
				clearTimeout(reloadTimer);
			}, 5000);
		};
	}

	Hunter.prototype = new Drawable();



	function Projectile(image,speed,w,h,damage,direction) {
		//sets defaults
		image = image || new Image();
		speed = speed || 60;
		w = w || 100;
		h = h || 100;
		damage = damage || 0;
		direction = direction || 1;
		this.isAlive = false;
		this.shot = false;

		//sets property values
		this.speed = speed;
		this.w = w;
		this.h = h;
		this.damage = damage;
		this.direction = direction;
		this.image = image;
		this.image.setAttribute('width', this.w);
		this.image.setAttribute('height', this.h);


		this.shooting = function() {
			var hunter = game.objs.comp.h;
			var elephant = game.objs.user.e;
			if(this.direction === 1 && this.x + this.w > hunter.x && this.y+this.h >= game.pcAttr.topOfPlayers || this.y+this.h < game.pcAttr.topOfPlayers && this.x+this.w>game.pcAttr.w) {
				this.isAlive = false;

				if(this.x + this.w > hunter.x && this.y+this.h >= game.pcAttr.topOfPlayers) {
					hunter.life -= this.damage;
				}

				if(game.objs.user.peanuts[game.objs.user.peanuts.length-1].shot && !game.objs.user.peanuts[0].isAlive) {
					elephant.reload();
				}
			}
			else if (this.direction === -1 && this.x < elephant.x + elephant.w && this.x + this.w > elephant.x && this.y+this.h >= elephant.y && this.y <= elephant.y+elephant.h || this.x+this.w<=0) {
				this.isAlive = false;

				if(this.x < elephant.x + elephant.w && this.x + this.w > elephant.x && this.y+this.h >= elephant.y && this.y <= elephant.y+elephant.h) {
					elephant.life -= this.damage;
				}

				if(game.objs.comp.bullets[game.objs.comp.bullets.length-1].shot && !game.objs.comp.bullets[0].isAlive) {
					hunter.reload();
				}
			}
			else {
				this.x += (this.speed * this.direction * dt);
			}
		};
	}

	Projectile.prototype = new Drawable();

	function Game() {
		this.objs = {user: {}, comp: {}};
		
		this.init = function() {
			this.pCanvas = document.getElementById('players');
			this.prCanvas = document.getElementById('projectiles');
			if(this.pCanvas.getContext) {
				this.pcAttr = {
					w: this.pCanvas.getAttribute('width'),
					h: this.pCanvas.getAttribute('height'),
					topOfPlayers: this.pCanvas.getAttribute('height')*0.78,
					context: this.pCanvas.getContext('2d')
				};
				this.prAttr = {
					w: this.prCanvas.getAttribute('width'),
					h: this.prCanvas.getAttribute('height'),
					context: this.prCanvas.getContext('2d')
				};
				this.pcAttr.context.fillStyle = "#FF0000";
				this.objs.user.peanuts = [];
				this.objs.comp.bullets = [];
				for(var i=0; i<5; i++) {
					//image,speed,w,h,damage,direction
					this.objs.user.peanuts[i] = new Projectile(imageRepository.imgs.peanut,75,15,20,10,1);
				}

				for(var i=0; i<7; i++) {
					//image,speed,w,h,damage,direction
					this.objs.comp.bullets[i] = new Projectile(imageRepository.imgs.bullet,75,15,20,20,-1);
				}

				//speed,x,y,w,h,peanuts
				this.objs.user.e = new Elephant(75,0,this.pcAttr.topOfPlayers,this.pcAttr.w*0.1,this.pcAttr.h*0.15, this.objs.user.peanuts);	
				
				//x,y,w,h,bullets
				this.objs.comp.h = new Hunter(this.pcAttr.w*0.85,this.pcAttr.topOfPlayers,this.pcAttr.w*0.15,this.pcAttr.h*0.15,this.objs.comp.bullets);

				var self = this;
				var eImg = 1;
				setInterval(function() {
					self.objs.user.e.image = imageRepository.imgs['e'+(eImg%3+1)]; 
					self.objs.comp.h.shoot();
					eImg++;
				}, 1000);

				return true;
			}
			else {
				return false;
			}
			
		};

		this.projectCollide = function() {
			var bp = this.objs.comp.bullets;
			var pp = this.objs.user.peanuts;

			for(var i=0; i<pp.length; i++) {
				for(var j=0; j<bp.length; j++) {
					if(pp[i].isAlive && bp[j].isAlive && pp[i].x <= bp[j].x + bp[j].w && pp[i].y + pp[i].h>= bp[j].y) {
						if(pp[i].x + pp[i].w >= bp[j].x  && pp[i].y <= bp[j].y + bp[j].h) {
							pp[i].isAlive = false;
							bp[j].isAlive = false;

							if(pp[pp.length-1].shot && pp[0].shot && !pp[0].isAlive) {
								this.objs.user.e.reload();
							}

							if(bp[bp.length-1].shot && bp[0].shot && !bp[0].isAlive) {
								this.objs.comp.h.reload();
							}
						}
					}
				}
			}
		};

		this.play = function() {
			var elly = this.objs.user.e;
			var peanuts = this.objs.user.peanuts;
			var hunter = this.objs.comp.h;
			var bullets = this.objs.comp.bullets;
			
			elly.move();

			elly.clear(this.pcAttr);
			elly.clear(this.prAttr);

			if(elly.life>0) {
				elly.draw(this.pcAttr.context);
				this.pcAttr.context.fillRect(10,this.pcAttr.h*.95,elly.life*1.5,20);
			}
			else {
				elly.isAlive = false;
				document.getElementById("dead").click();
			}

			if(hunter.life>0) {
				hunter.draw(this.pcAttr.context);
				this.pcAttr.context.fillRect(this.pcAttr.w-160,this.pcAttr.h*.95,hunter.life*1.5,20);
			}
			else {
				hunter.isAlive = false;
				window.alert("WINNER WINNER CHICKEN DINNER!!\nTo play again, please refresh the page.")
			}

			this.projectCollide();
			
			for(var i=0; i<peanuts.length; i++) {
				if(peanuts[i].isAlive) {
					peanuts[i].shooting();
					peanuts[i].draw(this.prAttr.context);
				}
			}

			for(var i=0; i<bullets.length; i++) {
				if(bullets[i].isAlive) {
					bullets[i].shooting();
					bullets[i].draw(this.prAttr.context);
				}
			}
		};

		this.start = function() {
			animate();
		};
	}

	

	window.game = new Game();
	window.restart = function() {
		var e = game.objs.user.e;
		var h = game.objs.comp.h;
		var bullets = game.objs.comp.bullets;
		var peanuts = game.objs.user.peanuts;

		e.life = 100;
		h.life = 100;

		e.isAlive = true;
		h.isAlive = true;

		e.x = 0;
		e.y = game.pcAttr.topOfPlayers;

		for(var i=0; i<bullets.length; i++) {
			bullets[i].shot = false;
			bullets[i].isAlive = false;
		}

		for(var i=0; i<peanuts.length; i++) {
			peanuts[i].shot = false;
			peanuts[i].isAlive = false;
		}
		lastTime = Date.now();
		requestAnimFrame( animate );
	};

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
		if(window.game.objs.user.e.isAlive && window.game.objs.comp.h.isAlive && imageRepository.ready) {
			requestAnimFrame( animate );
			now = Date.now();
			dt = (now-lastTime)/1000.0;
			lastTime = now;
			window.game.play();
		}
		else {
			game.objs.user.e.clear(this.prAttr);
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

	window.clickIt = function() {
		document.getElementById("start").click();
		document.getElementById("start").disabled = true;
	};

	window.begin = function() {
		if(game.init())
			game.start();
	};

})();