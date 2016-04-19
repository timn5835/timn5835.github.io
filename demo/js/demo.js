$(document).ready(function() {
	//continue button
	$('aside button').on('click', function() {
		slideToContent();
	});

	//back button
	$('.button-group a:last-child').on('click', function() {
		$('.content').addClass('pushed-down');
		//promise is used here to queue the animation and callback because slideToIntro was being called twice
		$('html, body').animate({scrollTop: 0}, 900).promise().done(function () {
			slideToIntro();
		});
	});

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