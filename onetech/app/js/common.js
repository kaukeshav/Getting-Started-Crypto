var countDownDate = new Date("Jul 15, 2018 15:37:25").getTime();
var x = setInterval(function() {
    var now = new Date().getTime();
    var distance = countDownDate - now;   
  	var hours = Math.floor(distance / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    
    document.getElementById("my-timer").innerHTML = 
		"<div class='my-timer-class'>" + 
			"<div>" + hours + "</div>"+
			"<div>" + minutes + "</div>"+ 
            "<div class='my-timer-class__seconds'>" + seconds + "</div>"+
		"</div>";
    if (distance < 0) {
        clearInterval(x);
        document.getElementById("demo").innerHTML = "EXPIRED";
    }
}, 1000);