$(document).ready(function() {
	$('aside button').on('click', function() {
		toggleStartingPos();
	});

	$('.button-group a:last-child').on('click', function() {
		toggleStartingPos();
	});

	function toggleStartingPos() {
		$('aside').toggleClass('invisible');
		$('.page-wrapper').toggleClass('no-flow');
		$('.content').toggleClass('pushed-down');	
	}
});