$(document).ready(function() {
	//variables
	var words = [];
	var attempts = [];
	var txtBox = $('input')[0];
	var currentWord = "";
	var results = $('#results');
	var score = 0;

	//functions
	function getWords() {
		$.getJSON("words.json")
			.done(function(json) {
				console.log('got words successfully');
				words = json.words;
				getCurrentWord();
			})
			.fail(function(jqxhr, textStatus, error) {
				var err = textStatus + ", " + error;
				console.log( "Request Failed: " + err );
		});
	}
	function getCurrentWord() {
		var index = Math.floor(Math.random()*words.length);
		currentWord = words[index].toLowerCase();
		words.splice(index,1);
	}
	function getAttempts() {
		var attempt = txtBox.value.toLowerCase();
		checkSpelling(attempt);
	}
	function checkSpelling(attempt) {
		var guessArray = [currentWord, attempt];
		if(currentWord === attempt) {
			guessArray.push(true);
			respond("<span style='color#@197D19;'>CORRECT!</span>");
			takeScore(attempt,"green");
			score++;
		}
		else {
			guessArray.push(false);
			respond("<span style='color:#AF2828;'>WRONG!</span>");
			takeScore(attempt,"red");
		}
		if(words.length>0) {
			getCurrentWord();
			sayWord("The next word is " + currentWord);
		}
		else {
			respond("Good Job, you're done.");
			txtBox.disabled = true;
			currentWord = "There are no more words"
			sayWord("There are no more words.");
			$('#score').css('top','0');
			$('#score table').append("<tr><td>Score: </td><td>"+score+"</td></tr>");
		}
		txtBox.value = "";
		attempts.push(guessArray);
	}
	function respond(result) {
		results.html(result);
	}
	function takeScore(attempt, color) {
		$('#score table').append("<tr><td style='color:"+color+";'>"+currentWord+"</td><td style='color:"+color+";'>"+attempt+"</td></tr>");
	}
	function sayWord(word) {
		responsiveVoice.speak(word,"US English Female",{rate: 0.75});
	}

	$('form').submit(function(e){
	    e.preventDefault();
	    getAttempts();
	    return false; // just to be sure.
	});
	$('span#speaker').on('click',function(){
		sayWord(currentWord,"US English Female");
	});
	responsiveVoice.OnVoiceReady = function() {
	  console.log("speech loaded");
	  sayWord("To hear the word you must spell, please click on the speaker icon. Your first word is " + currentWord);
	};

	//invokations
	getWords();
	
});