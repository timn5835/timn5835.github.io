$(document).ready(function() {
	var portfolioContent = "";

	//continue button
	$('aside button').on('click', function() {
		slideToContent();
	});

	//back button
	$('.button-group a:last-child').on('click', function() {
		$('.content').addClass('pushed-down');
		//promise is used here to queue the animation and callback because slideToIntro was being called twice
		$('html, body').animate({scrollTop: 0}, 900).queue(function(next) {
			slideToIntro();
			next();
		});
	});

	$('#portfolioBtn').on('click', function() {
		if(portfolioContent === "") {
			$.ajax("portfolio.html")
				.done(function(data) {
					portfolioContent = data;
					$('.content').prepend(portfolioContent);
					viewPortfolio();
				})
				.fail(function() {
					console.log('failed');
				});
		}
		else {
			viewPortfolio();
		}
	});

	function viewPortfolio() {
		if(!$('#portfolioBtn').hasClass('active')) {
			$('.content > section.exp .row').toggleClass('fadeOut').delay(700).queue(function(next) { 
				$(this).css('position','absolute');
				$('.portfolio').toggleClass('fadeOut').css('position','relative');
				next();
			});
		}
		else {
			$('.portfolio').toggleClass('fadeOut').delay(700).queue(function(next) { 
				$(this).css('position','absolute');
				$('.content > section.exp .row').toggleClass('fadeOut').css('position','relative');
				next();
			});
		}
		$('#portfolioBtn').toggleClass('active');
	}

	function slideToContent() {
		$('aside').addClass('invisible');
		$('.page-wrapper').removeClass('no-flow');
		$('.content').removeClass('pushed-down');	
	}

	function slideToIntro() {
		$('.page-wrapper').addClass('no-flow');
		$('aside').removeClass('invisible');
		
	}
});