var isDrawing;
var resultStars;

function initCanvas(id) {
    resetContext(id);
	addListeners(id);
}

function addListeners(id) {
    var canvas = document.getElementById(`card${id}-canvas`);

    canvas.addEventListener("mousedown", function(event) {drawStartEvent(event, id)});
    canvas.addEventListener("ontouchstart", function(event) {drawStartEvent(event, id)});
    canvas.addEventListener("mousemove", function(event) {drawMoveEvent(event, id)});
    canvas.addEventListener("ontouchmove", function(event) {drawMoveEvent(event, id)});
    canvas.addEventListener("mouseup", function(event) {drawEndEvent(event, id)});
    canvas.addEventListener("ontouchend", function(event) {drawEndEvent(event, id)});
}

function drawStartEvent(event, id) {
    var canvas = document.getElementById(`card${id}-canvas`);
	var context = canvas.getContext("2d");

	isDrawing = true;

	context.strokeStyle = "black";
	context.lineWidth = "4";
	context.lineJoin = context.lineCap = "round";
	context.beginPath();
}

function drawMoveEvent(event, id) {
	if (isDrawing) {
		drawStroke(event.clientX, event.clientY, id);
	}
}

function drawEndEvent(event, id) {
	isDrawing = false;
}

function drawStroke(clientX, clientY, id) {
    var canvas = document.getElementById(`card${id}-canvas`);
	var context = canvas.getContext("2d");

	const rect = canvas.getBoundingClientRect();
	const x = clientX - rect.left;
	const y = clientY - rect.top;

	context.lineTo(x, y);
	context.stroke();
	context.moveTo(x, y);
}

function clear(id) {
    resetContext(id);

	var button = document.getElementById(`card${id}-button`);
	var link = document.getElementById(`card${id}-link`);
	var result = document.getElementById(`card${id}-result`);

	resultStars[`card${id}`] = 0;
	calcResult();

	link.style.display = "none";
	button.style.display = "block";
	result.innerHTML = "";
}

function resetContext(id) {
	var canvas = document.getElementById(`card${id}-canvas`);
	var context = canvas.getContext("2d");

	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, canvas.width, canvas.height);
}

function predict(id) {
    var canvas = document.getElementById(`card${id}-canvas`);
    var spinner = document.getElementById(`card${id}-spinner`);
	var button = document.getElementById(`card${id}-button`);
	var link = document.getElementById(`card${id}-link`);

    var answer = canvas.dataset.answer;

	var dataURL = canvas.toDataURL('image/jpg');

	spinner.style.display = "block";
	button.style.display = "none";

	$.ajax({
		type: "POST",
		url: "/predict",
		data:{
			imageBase64: dataURL
		}
	}).done(function(response) {
        var result = document.getElementById(`card${id}-result`);
        var responseJson = JSON.parse(response);

		if (responseJson["answer"].toString() === answer.toString()) {
			result.innerHTML = `WOW!<br> you wrote <span>${responseJson["answer"]}</span>`;
			resultStars[`card${id}`] = 1;

			calcResult(true);
		} else {
			result.innerHTML = `OOPS!<br> you wrote <span>${responseJson["answer"]}</span>`;
			resultStars[`card${id}`] = 0;

			calcResult(false);
		}

		spinner.style.display = "none";
		link.style.display = "block";
	});
}

function calcResult(isAdd) {

	var countImg = document.getElementById(`star-img`);
	var countItem = document.getElementById(`star-count`);
	var main = document.getElementById(`main-box`);
	var mainWin = document.getElementById(`main-box-win`);
	var count = resultStars["card1"] + resultStars["card2"] + resultStars["card3"];

	if (isAdd) {
		countItem.style.display = "none";
		countImg.style.display = "block";

		setTimeout(function() {
			countImg.style.display = "none";
			countItem.style.display = "block";
		}, 500)
	}

	countItem.innerText = count;

	if (count === 3) {
		setTimeout(function() {
			mainWin.style.display = "flex";
			main.style.display = "none";
		}, 1000)
	}
}

function back() {
	var main = document.getElementById(`main-box`);
	var mainWin = document.getElementById(`main-box-win`);

	init();
	calcResult();
	clear(1);
	clear(2);
	clear(3);

	mainWin.style.display = "none";
	main.style.display = "block";
}

function init() {
	initCanvas(1);
	initCanvas(2);
	initCanvas(3);

	resultStars = {card1: 0, card2: 0, card3: 0};
	isDrawing = false;
}

onload = init;
