$(document).ready(function() {
	//dom elements used by all modules
	$pgWrapper = $('.page-wrapper');
	$content = $pgWrapper.find('.content');
	$aside = $pgWrapper.find('aside');

	var introModule = {
		cacheDom: function() {
			this.$ctnBtn = $aside.find('button');
		},
		bindEvents: function() {
			this.$ctnBtn.on('click', this.slideToContent.bind(this));
		},
		//slides intro panel out and content panel up
		slideToContent: function() {
			$aside.addClass('invisible');
			$pgWrapper.removeClass('no-flow');
			$content.removeClass('pushed-down');	
		},
		init: function() {
			this.cacheDom();
			this.bindEvents();
		}
	};


	var contentModule = {
		cacheDom: function() {
			this.$backBtn = $content.find('.button-group a:last-child');
			this.$portfolioBtn = $content.find('#portfolioBtn');
			this.$expRows = $('.content > section.exp .row');
		},
		bindEvents: function() {
			this.$backBtn.on('click', this.slideToIntro.bind(this));
			this.$portfolioBtn.on('click', this.initPortfolio.bind(this));
		},
		//slides content panel down and intro panel out
		slideToIntro: function() {
			$content.addClass('pushed-down');
			$('html, body').animate({
				scrollTop: 0
			}, 900).queue(function(next){
				$pgWrapper.addClass('no-flow');
				$aside.removeClass('invisible');
				next();
			});
		},
		//retrieves portfolio mark up and injects it into the DOM
		initPortfolio: function() {
			var self = this;
			$.ajax("portfolio.html")
				.done(function(data) {
					portfolioContent = data;
					$('.content').prepend(portfolioContent);
					self.togglePortfolioView();
					self.$portfolio = $('.portfolio');
				})
				.fail(function() {
					console.log('failed');
				});

			this.$portfolioBtn.off().on('click',this.togglePortfolioView.bind(this));
		},
		//toggles between portfolio and experience content
		togglePortfolioView: function() {
			var self = this;
			if(!this.$portfolioBtn.hasClass('active')) {
				this.$expRows.toggleClass('fadeOut').delay(700).queue(function(next) { 
					$(this).css('position','absolute');
					self.$portfolio.toggleClass('fadeOut').css('position','relative');
					next();
				});
			}
			else {
				this.$portfolio.toggleClass('fadeOut').delay(700).queue(function(next) { 
					$(this).css('position','absolute');
					self.$expRows.toggleClass('fadeOut').css('position','relative');
					next();
				});
			}
			this.$portfolioBtn.toggleClass('active');
		},
		init: function() {
			this.cacheDom();
			this.bindEvents();
		}
	};
	
	//initialize modules
	introModule.init();
	contentModule.init();
});