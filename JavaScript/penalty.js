let canvas, ctx, w, h, gameArea;
let image1, image2, image3, image4, image5, image6, image7, image8, image9;
let event1, event2, event3, event4, event5;
let mousePos;
let animation1, animation2;
let homeScreenBall, penaltyShotBall;
let blankSpace;
let homeBallCount = 0, penaltyBallCount = 0;
let oldTime = 0;
let imageLoadCount = 0;
let teamArray;
let fcbCrest, madridCrest, psgCrest, bayernCrest, dortCrest, juvCrest, interCrest, cityCrest;
let teamChooseCount = 0, teamChooseCount2 = 0;
let moving = false, gkMoving = false, penaltyBallMoving = false, continueGKSprite = true, drawTargetCircle = false, drawPowerBar = true;
let gkSpriteSheet, gkTopLeft = [], gkTopRight = [], gkBottomLeft = [], gkBottomRight = [];
let gkDiveChoice, gkDiveCount = 0, gkSpriteCounter = 0;
let goalKeeper, player;
let playerSpriteSheet, playerSpriteArray = [];
let playerMoveCount = 0;
let theTime, calledTime;
let endCount = 0;
let factor1 = 1, factor2 = 1, ballSpeedFactor = 1;
let moveAccuracyLine = true, accuracyLineSpeed;
let accuracyLineX = 0;
let powerCounter = 0, movePowerLine = false;
let accuracyRangeCounter = 0;
let randomDestination;
let save = false, miss = false, goal = false;
let shotNumber = 2;
let displayCount = 2;
let homeScore = 0, awayScore = 0;
let finalDestination = {
	x: 0,
	y: 0,
	radius: 0
};
let homeArray = [false, false, false, false, false];
let awayArray = [false, false, false, false, false];
let sound1;

class Ball {
	
	constructor(x, y, height, speedX, speedY) {
		this.x = x;
		this.y = y;
		this.height = height;
		this.speedX = speedX;
		this.speedY = speedY;
	}
	
	moveBallHome(delta) {
		this.x += calcDistanceToMove(delta, this.speedX);
		this.y += calcDistanceToMove(delta, this.speedY);
	}
	
	testForLineCollision() {
		if(this.y < blankSpace/2) {
			this.speedY *= -1;
			this.y = blankSpace/2;
		}
		else if(this.y + this.height > h - (blankSpace/2 + h/25)) {
			this.speedY *= -1;
			this.y = h - (blankSpace/2 + h/25) - this.height;
		}
		else if(this.x < w/25) {
			this.speedX *= -1;
			this.x = w/25;
		}
		else if(this.x + this.height > w - w/25) {
			this.speedX *= -1;
			this.x = w - w/25 - this.height;
		}
	}
	
	moveBallShot(delta) {
		penaltyBallCount += .25;
		this.x += calcDistanceToMove(delta, this.speedX);
		this.y += calcDistanceToMove(delta, this.speedY);
		if(this.height > .015 * w) {
			this.height -= .0025 * w;
		}
		
		if(Math.abs(randomDestination.x - this.x) < .01 * w && Math.abs(randomDestination.y - this.y) < .01 * w) {
			penaltyBallMoving = false;
			this.checkForMiss();
			this.checkForSave();
			console.log(shotNumber);
			if(!miss && !save) {
				goal = true;
				if(shotNumber %  2 === 0) {
					homeArray[shotNumber/2 - 1] = true;
					homeScore++;
				}
				else {
					awayArray[(shotNumber - 1)/2 -1] = true;
					awayScore++;
				}
			}
			else {
				if(shotNumber %  2 === 0) {
					homeArray[shotNumber/2 - 1] = false;
				}
				else {
					awayArray[(shotNumber - 1)/2 -1] = false;
				}
			}
		}
	}
	
	checkForMiss() {
		if(this.x + this.height/2 > (614/977 * w)) {
			miss = true;
		}
		else if(this.x + this.height/2 < (365/977 * w)) {
			miss = true;
		}
		else if(this.y + this.height/2 < (178/488 * h)) {
			miss = true;
		}
	}
	
	checkForSave() {
		console.log(powerCounter);
		if(powerCounter < .05 * w) {
			console.log(goalKeeper.y + ", " + this.y);
			if(this.x + this.height/2 > goalKeeper.x - goalKeeper.width && this.x + this.height/2 < goalKeeper.x + 2 * goalKeeper.width) {
				if(this.y + this.height/2 > goalKeeper.y - goalKeeper.height && this.y + this.height/2 < goalKeeper.y + 2 * goalKeeper.height) {
					save = true;
					this.clearBall();
				}
			}
		}
		else if(powerCounter < .075 * w) {
			if(this.x + this.height/2 > goalKeeper.x - goalKeeper.width/2 && this.x + this.height/2 < goalKeeper.x + 1.5 * goalKeeper.width) {
				if(this.y + this.height/2 > goalKeeper.y - goalKeeper.height/2 && this.y + this.height/2 < goalKeeper.y + 1.5 * goalKeeper.height) {
					save = true;
					this.clearBall();
				}
			}
		}
		else {
			if(this.x + this.height/2 > goalKeeper.x - goalKeeper.width/3 && this.x + this.height/2 < goalKeeper.x + 1.33 * goalKeeper.width) {
				if(this.y + this.height/2 > goalKeeper.y - goalKeeper.height/3 && this.y + this.height/2 < goalKeeper.y + 1.33 * goalKeeper.height) {
					save = true;
					this.clearBall();
				}
			}
		}
	}
	
	clearBall() {
		if(this.y < .4 * h) {
			this.y -= .1 * h;
		}
		else if(this.x >= w/2) {
			this.x += w/8;
		}
		else if(this.x < w/2) {
			this.x -= w/8;
		}
	}
}

class Goalie {
	
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	
	jump(delta) {
		factor1 = 1;
		factor2 = 1;
		if(theTime - calledTime < 500) {
			this.y -= calcDistanceToMove(delta, h/5);
		}
		else {
			this.y += calcDistanceToMove(delta, h/5);
		}
		
		if(this.y + this.height > .65 * h) {
			gkMoving = false;
		}
	}
	
	bottomLeftDive(delta) {
		let count = Math.round(gkDiveCount);
		
		//console.log(this.y + this.height + "/ " + h);
		
		if(this.y + this.height > .57 * h) {
			this.y -= (this.y + this.height) - (.57 * h);
		}
		
		if(count === 0) {
			this.x -= calcDistanceToMove(delta, h/5);
			factor1 = 1;
			factor2 = 1;
		}
		else if(count === 1) {
			this.x -= calcDistanceToMove(delta, h/5);
			//this.y -= calcDistanceToMove(delta, h/10);
			factor1 = 2;
			factor2 = 1.56;
		}
		else if(count === 2 && continueGKSprite) {
			this.x -= calcDistanceToMove(delta, h/5);
			//this.y += calcDistanceToMove(delta, h/5);
			factor1 = 2.5;
			factor2 = 1.47;
		}
		
		if(!continueGKSprite && this.y + this.height < .57 * h) {
			this.y += calcDistanceToMove(delta, h/10);
		}
	}
	
	bottomRightDive(delta) {
		let count = Math.round(gkDiveCount);
		
		if(this.y + this.height > .57 * h) {
			this.y -= (this.y + this.height) - (.57 * h);
		}
		
		if(count === 0) {
			this.x += calcDistanceToMove(delta, h/10);
			factor1 = 1;
			factor2 = 1;
		}
		else if(count === 1) {
			this.x += calcDistanceToMove(delta, h/10);
			//this.y -= calcDistanceToMove(delta, h/10);
			factor1 = 2;
			factor2 = 1.56;
		}
		else if(count === 2 && continueGKSprite) {
			this.x += calcDistanceToMove(delta, h/10);
			//this.y += calcDistanceToMove(delta, h/5);
			factor1 = 2.5;
			factor2 = 1.47;
		}
		
		if(!continueGKSprite && this.y + this.height < .57 * h) {
			this.y += calcDistanceToMove(delta, h/10);
		}
	}
	
	topLeftDive(delta) {
		let count = Math.round(gkDiveCount);
		
		if(this.y + this.height > .57 * h) {
			this.y -= (this.y + this.height) - (.57 * h);
		}
		
		if(count === 0) {
			this.x -= calcDistanceToMove(delta, h/5);
			factor1 = 1;
			factor2 = 1;
		}
		else if(count === 1) {
			this.x -= calcDistanceToMove(delta, h/10);
			this.y -= calcDistanceToMove(delta, h/5);
			factor1 = 1.2;
			factor2 = 1.8;
		}
		else if(count === 2) {
			this.x -= calcDistanceToMove(delta, h/10);
			//this.y -= calcDistanceToMove(delta, h/10);
			factor1 = 2;
			factor2 = 1.56;
		}
		else if(count === 3) {
			this.x -= calcDistanceToMove(delta, h/10);
			this.y += calcDistanceToMove(delta, h/5);
			factor1 = 2;
			factor2 = 1.56;
		}
		else if(count === 4 && continueGKSprite) {
			this.x -= calcDistanceToMove(delta, h/10);
			this.y += calcDistanceToMove(delta, h/5);
			factor1 = 2.5;
			factor2 = 1.47;
		}
		
		if(!continueGKSprite && this.y + this.height < .57 * h) {
			this.y += calcDistanceToMove(delta, h/10);
		}
	}
	
	topRightDive(delta) {
		let count = Math.round(gkDiveCount);
		
		if(this.y + this.height > .57 * h) {
			this.y -= (this.y + this.height) - (.57 * h);
		}
		
		if(count === 0) {
			this.x += calcDistanceToMove(delta, h/5);
			factor1 = 1;
			factor2 = 1;
		}
		else if(count === 1) {
			this.x += calcDistanceToMove(delta, h/10);
			this.y -= calcDistanceToMove(delta, h/5);
			factor1 = 1.2;
			factor2 = 1.8;
		}
		else if(count === 2) {
			this.x += calcDistanceToMove(delta, h/15);
			//this.y -= calcDistanceToMove(delta, h/10);
			factor1 = 2;
			factor2 = 1.56;
		}
		else if(count === 3) {
			//this.x += calcDistanceToMove(delta, h/10);
			this.y += calcDistanceToMove(delta, h/5);
			factor1 = 2;
			factor2 = 1.56;
		}
		else if(count === 4 && continueGKSprite) {
			//this.x += calcDistanceToMove(delta, h/10);
			this.y += calcDistanceToMove(delta, h/5);
			factor1 = 2.5;
			factor2 = 1.47;
		}
		
		if(!continueGKSprite && this.y + this.height < .65 * h) {
			this.y += calcDistanceToMove(delta, h/10);
		}
	}
}

class Player {
	
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	
	movePlayer(delta) {
		playerMoveCount += .2;
		
		this.x += calcDistanceToMove(delta, w/20);
		
		if(this.x + this.width >= penaltyShotBall.x) {
			moving = false;
			playerMoveCount = 2;
			calledTime = theTime;
			gkMoving = true;
			penaltyBallMoving = true;
			drawTargetCircle = false;
		}
	}
}

window.onload = function() {
	
	canvas = document.querySelector("#canvas");
	ctx = canvas.getContext('2d');
	gameArea = document.querySelector("#gameArea");
	
	resizeGame();
	
	animation2 = requestAnimationFrame(gameDataLoaded);
	loadEvents();
	loadGameData();
};

function resizeGame() {
	let widthToHeight = 5/2.5;
	let newWidth = window.innerWidth -10;
	let newHeight = window.innerHeight - 10;
	let newWidthToHeight = newWidth / newHeight;
	
	if(newWidthToHeight > widthToHeight) {
		newWidth = newHeight * widthToHeight;
		gameArea.style.height = newHeight + 'px';
		gameArea.style.width = newWidth + 'px';
	}
	else {
		newHeight = newWidth / widthToHeight;
		gameArea.style.height = newHeight + 'px';
		gameArea.style.width = newWidth + 'px';
	}
	
	gameArea.style.marginTop = (-newHeight/2) + 'px';
	gameArea.style.marginLeft = (-newWidth/2) + 'px';
	gameArea.style.fontSize = (newWidth/400) + 'em';
	
	canvas.width = newWidth;
	canvas.height = newHeight;
	
	w = canvas.width;
	h = canvas.height;
}

function gameDataLoaded() {
	let amountOfImages = 19;
	animation2 = requestAnimationFrame(gameDataLoaded);
	if(imageLoadCount === amountOfImages) {
		loadOpeningScreen();
	}
}

function loadGameData() {
	
	teamArray = ['F.C. Barcelona', 'Real Madrid C.F.', 'Paris Saint-Germain F.C.', 'F.C. Bayern Munich', 'Borussia Dortmund', 'Juventus F.C.', 'Inter Milan', 'Manchester City'];
	
	
	image1 = new Image();
	image1.src = 'media/aerialSoccerField.png';
	image1.onload = function() {
		imageLoadCount++;
	};
	
	image2 = new Image();
	image2.src = 'media/soccerFieldGreen.png';
	image2.onload = function() {
		imageLoadCount++;
	};
	
	image3 = new Image();
	image3.src = 'media/soccerBall1.png';
	image3.onload = function() {
		imageLoadCount++;
	};
	
	image4 = new Image();
	image4.src = 'media/soccerBall2.png';
	image4.onload = function() {
		imageLoadCount++;
	};
	
	image5 = new Image();
	image5.src = 'media/soccerBall3.png';
	image5.onload = function() {
		imageLoadCount++;
	};
	
	image6 = new Image();
	image6.src = 'media/soccerBall4.png';
	image6.onload = function() {
		imageLoadCount++;
	};
	
	image7 = new Image();
	image7.src = 'media/leftArrow.png';
	image7.onload = function() {
		imageLoadCount++;
	};
	
	image8 = new Image();
	image8.src = 'media/rightArrow.png';
	image8.onload = function() {
		imageLoadCount++;
	};
	
	fcbCrest = new Image();
	fcbCrest.src = 'media/fcbCrest.png';
	fcbCrest.onload = function() {
		imageLoadCount++;
	};
	
	madridCrest = new Image();
	madridCrest.src = 'media/madridCrest.png';
	madridCrest.onload = function() {
		imageLoadCount++;
	};
	
	psgCrest = new Image();
	psgCrest.src = 'media/psgCrest.png';
	psgCrest.onload = function() {
		imageLoadCount++;
	};
	
	bayernCrest = new Image();
	bayernCrest.src = 'media/bayernCrest.png';
	bayernCrest.onload = function() {
		imageLoadCount++;
	};
	
	dortCrest = new Image();
	dortCrest.src = 'media/dortCrest.png';
	dortCrest.onload = function() {
		imageLoadCount++;
	};
	
	juvCrest = new Image();
	juvCrest.src = 'media/juvCrest.png';
	juvCrest.onload = function() {
		imageLoadCount++;
	};
	
	interCrest = new Image();
	interCrest.src = 'media/interCrest.png';
	interCrest.onload = function () {
		imageLoadCount++;
	};
	
	cityCrest = new Image();
	cityCrest.src = 'media/cityCrest.png';
	cityCrest.onload = function() {
		imageLoadCount++;
	};
	
	image9 = new Image();
	image9.src = 'media/goal.png';
	image9.onload = function() {
		imageLoadCount++;
	};
	
	gkSpriteSheet = new Image();
	gkSpriteSheet.src = 'media/goalieSprite.png';
	gkSpriteSheet.onload = function() {
		imageLoadCount++;
		createDiveArrays();
	};
	
	playerSpriteSheet = new Image();
	playerSpriteSheet.src = 'media/playerSprite.png';
	playerSpriteSheet.onload = function() {
		imageLoadCount++;
		createPlayerSpriteArray();
	};
	
	sound1 = document.querySelector("#refWhistle");
	
}

function createPlayerSpriteArray() {
	
	playerSpriteArray.push({x: 0, y: 0, width: 70, height: 117});
	playerSpriteArray.push({x: 80, y: 0, width: 55, height: 117});
	playerSpriteArray.push({x: 140, y: 0, width: 80, height: 117});
	playerSpriteArray.push({x: 220, y: 0, width: 80, height: 117});
	playerSpriteArray.push({x: 310, y: 0, width: 60, height: 117});
}

function createDiveArrays() {
	gkBottomLeft.push({x: 420, y: 0, width: 80, height: 150});
	gkBottomLeft.push({x: 220, y: 0, width: 180, height: 150});
	gkBottomLeft.push({x: 30, y: 0, width: 190, height: 160});
	
	gkBottomRight.push({x: 420, y: 0, width: 80, height: 150});
	gkBottomRight.push({x: 600, y: 0, width: 180, height: 150});
	gkBottomRight.push({x: 780, y: 0, width: 190, height: 160});
	
	gkTopLeft.push({x: 420, y: 0, width: 80, height: 150});
	gkTopLeft.push({x: 680, y: 190, width: 120, height: 150});
	gkTopLeft.push({x: 500, y: 160, width: 180, height: 150});
	gkTopLeft.push({x: 220, y: 0, width: 180, height: 150});
	gkTopLeft.push({x: 30, y: 0, width: 190, height: 160});
	
	gkTopRight.push({x: 420, y: 0, width: 80, height: 150});
	gkTopRight.push({x: 200, y: 190, width: 120, height: 150});
	gkTopRight.push({x: 320, y: 160, width: 180, height: 150});
	gkTopRight.push({x: 600, y: 0, width: 180, height: 150});
	gkTopRight.push({x: 780, y: 0, width: 190, height: 160});
}
	

function getMousePos(e) {
	let rect = canvas.getBoundingClientRect();
	
	return {
		x: e.clientX - rect.left,
		y: e.clientY - rect.top
	};
}

function calcDistanceToMove(delta, speed) {
	return speed * delta / 1000;
}

function loadEvents() {
	
	event1 = function(e) {
		mousePos = getMousePos(e);
		console.log(mousePos.x + ", " + mousePos.y);
	};
	
	event2 = function(e) {
		if(e.keyCode === 13) {
			loadTeamSelect();
		}
	};
	
	event3 = function(e) {
		//console.log("hi");
		if(mousePos.x > .05 * w && mousePos.x < .1 * w && mousePos.y < (3 * h/4) + (.05 * w) && mousePos.y > 3 * h/4){
			teamChooseCount--;
			//console.log("click");
		}
		else if(mousePos.x > .4 * w && mousePos.x < .45 * w && mousePos.y < (3 * h/4) + (.05 * w) && mousePos.y > 3 * h/4) {
			teamChooseCount++;
		}
		else if(mousePos.x > .55 * w && mousePos.x < .6 * w && mousePos.y < (3 * h/4) + (.05 * w) && mousePos.y > 3 * h/4) {
			teamChooseCount2--;
		}
		else if(mousePos.x > .9 * w && mousePos.x < .95 * w && mousePos.y < (3 * h/4) + (.05 * w) && mousePos.y > 3 * h/4) {
			teamChooseCount2++;
		}
		
		if(teamChooseCount < 0) {
			teamChooseCount = 7;
		}
		else if(teamChooseCount > 7) {
			teamChooseCount = 0;
		}
		else if(teamChooseCount2 < 0) {
			teamChooseCount2 = 7;
		}
		else if(teamChooseCount2 > 7) {
			teamChooseCount2 = 0;
		}
		
		if(mousePos.x > 2.5 * w/6 && mousePos.x < 3.5 * w/6 && mousePos.y < 5.95 * h/6 && mousePos.y > 5.5 * h/6) {
			loadDirectionsSheet();
		}
	};
	
	event4 = function(e) {
		if(mousePos.x > 2.5 * w/6 && mousePos.x < 3.5 * w/6 && mousePos.y < 5.95 * h/6 && mousePos.y > 5.5 * h/6) {
			beginShootout();
		}
	};
	
	event5 = function(e) {
		console.log("click");
		
		finalDestination.x = mousePos.x;
		finalDestination.y = mousePos.y;
		finalDestination.radius = w/50;
		
		drawTargetCircle = true;
		
		removeEventListener('mousedown', event5);
		addEventListener('keydown', event6);
	};
		
	event6 = function(e) {
		if(e.keyCode === 32) {
			//console.log("hello");
			movePowerLine = true;
			moveAccuracyLine = false;
			removeEventListener('keydown', event6);
			addEventListener('keyup', event7);
		}
	};
	
	event7 = function(e) {
		movePowerLine = false;
		moving = true;
		drawPowerBar = false;
		
		randomDestination = calcRandomDestination();
		
		calcBallXAndYSpeed();
		
		removeEventListener('keyup', event7);
	};
}

function loadOpeningScreen() {
	
	cancelAnimationFrame(animation2);
	addEventListener('mousemove', event1);
	addEventListener('keydown', event2);
	
	homeScreenBall = new Ball(w/2, h/2, h/15, 200, 200);
	
	animation1 = requestAnimationFrame(openingLoop);
}

function openingLoop(currentTime) {
	ctx.save();
	
	let delta = currentTime - oldTime;
	
	ctx.clearRect(0, 0, w, h);
	
	drawOpeningScreenBackground();
	drawTitleScreen();
	drawEnterPrompt();
	moveHomeScreenBall(delta);
	
	ctx.restore();
	oldTime = currentTime;
	animation1 = requestAnimationFrame(openingLoop);
}

function drawOpeningScreenBackground() {
	ctx.save();
	
	let fieldWidthToHeight = 692/326;
	let canvasWidthToHeight = w/h;
	let canvasWidth = w;
	let canvasHeight = h;
	let backImg = {
		width: 0, 
		height: 0
	};
	
	canvasHeight = canvasWidth / fieldWidthToHeight;
	backImg.width = canvasWidth;
	backImg.height = canvasHeight;

	blankSpace = h - backImg.height;
	
	ctx.drawImage(image1, 0, 0, 692, 326, 0, blankSpace/2, backImg.width, backImg.height);
	
	ctx.drawImage(image2, 0, 0, 88, 93, 0, 0, w, blankSpace/2);
	ctx.drawImage(image2, 0, 0, 88, 93, 0, blankSpace/2 + backImg.height, w, blankSpace/2);
	
	ctx.restore();
}

function drawTitleScreen() {
	ctx.save();
	
	ctx.lineWidth = h/400;
	ctx.strokeStyle = 'yellow';
	ctx.fillStyle = 'red';
	ctx.font = h/4 + 'px Berlin-Sans-FB-Demi';
	ctx.textAlign = 'center';
	
	ctx.fillText('Penalty Shootout!', w/2, h/3);
	ctx.strokeText('Penalty Shootout!', w/2, h/3);
	
	ctx.restore();
}

function drawEnterPrompt() {
	ctx.save();
	
	ctx.strokeStyle = '#20931C';
	ctx.lineWidth = h/100;
	ctx.strokeRect(2 * w/7, 2.75 * h/7, 3 * w/7, 1 * h/7);
	
	ctx.fillStyle = '#240C87';
	ctx.font = (h/7)+ 'px Arial';
	ctx.textAlign = 'center';
	
	ctx.fillText('Press Enter', w/2, 3.75 * h/7);
	
	ctx.restore();
}

function moveHomeScreenBall(delta) {
	ctx.save();
	
	homeScreenBall.moveBallHome(delta);
	homeScreenBall.testForLineCollision();
	
	let chosenImage;
	
	if(homeBallCount <= 1) {
		chosenImage = image3;
	}
	else if(homeBallCount <= 2) {
		chosenImage = image4;
	}
	else if(homeBallCount <= 3) {
		chosenImage = image5;
	}
	else if(homeBallCount <= 4) {
		chosenImage = image6;
	}
	
	ctx.drawImage(chosenImage, 0, 0, 155, 154, homeScreenBall.x, homeScreenBall.y, homeScreenBall.height, homeScreenBall.height);
	
	homeBallCount += .25;
	if(homeBallCount > 4) {
		homeBallCount = 0;
	}
	
	ctx.restore();
}
	
function loadTeamSelect() {
	cancelAnimationFrame(animation1);
	removeEventListener('keydown', event2);
	
	addEventListener('mousedown', event3);
	ctx.fillStyle = 'blue';
	ctx.fillRect(0, 0, w, h);
	
	animation1 = requestAnimationFrame(teamSelect);
}

function teamSelect() {
	ctx.save();
	ctx.clearRect(0, 0, w, h);
	ctx.fillStyle = 'blue';
	ctx.fillRect(0, 0, w, h);
	ctx.restore();
	
	drawTeamSelectTitle();
	drawTeamSelectArrows();
	drawTeamChoice();
	drawContinueIcon();
	
	animation1 = requestAnimationFrame(teamSelect);
}

function drawTeamSelectTitle() {
	ctx.save();
	
	ctx.textAlign = 'center';
	ctx.font = h/5 + 'px Berlin-Sans-FB-Demi';
	ctx.fillStyle = 'black';
	ctx.fillText('Team Select', w/2, h/5);
	
	ctx.font = h/10 + 'px Berlin-Sans-FB-Demi';
	ctx.fillStyle = 'white';
	ctx.fillText('Home Team', w/4, h/3);
	ctx.fillText('Away Team', 3 * w/4, h/3);
	
	ctx.restore();
}
	
function drawTeamSelectArrows() {
	
	ctx.save();
	
	ctx.drawImage(image7, 0, 0, 278, 278, .05 * w, 3 * h/4, .05 * w, .05 * w);
	ctx.drawImage(image8, 0, 0, 278, 278, .4 * w, 3 * h/4, .05 * w, .05 * w);
	ctx.drawImage(image7, 0, 0, 278, 278, .55 * w, 3 * h/4, .05 * w, .05 * w);
	ctx.drawImage(image8, 0, 0, 278, 278, .9 * w, 3 * h/4, .05 * w, .05 * w);
	
	ctx.restore();
}
	
function drawTeamChoice() {
	ctx.save();
	
	ctx.clearRect(0, h/3 + h/20, w/2, h * ((3/4) - (1/3 + 1/20)));
	ctx.clearRect(.1 * w, 3 * h/4, .3 * w, .05 * w);
	ctx.clearRect(w/2, h/3 + h/20, w/2, h * ((3/4) - (1/3 + 1/20)));
	ctx.clearRect((.1 * w) + w/2, 3 * h/4, .3 * w, .05 * w);
	
	ctx.fillStyle = 'blue';
	ctx.fillRect(0, h/3 + h/20, w/2, h * ((3/4) - (1/3 + 1/20)));
	ctx.fillRect(.1 * w, 3 * h/4, .3 * w, .05 * w);
	ctx.fillRect(w/2, h/3 + h/20, w/2, h * ((3/4) - (1/3 + 1/20)));
	ctx.fillRect((.1 * w) + w/2, 3 * h/4, .3 * w, .05 * w);
	
	let chosenTeam = teamChosen(teamChooseCount);
	let chosenTeam2 = teamChosen(teamChooseCount2);
	
	let chosenTeamCrest = teamCrestChosen(teamChooseCount);
	let chosenTeamCrest2 = teamCrestChosen(teamChooseCount2);
	
	drawHomeTeam(chosenTeam, chosenTeamCrest);
	drawOpponentTeam(chosenTeam2, chosenTeamCrest2);
	
	ctx.restore();
}

function drawOpponentTeam(team, crest) {
	ctx.save();
	
	ctx.fillStyle = 'gray';
	ctx.textAlign = 'center';
	
	let crestWidth = h/3;
	
	if(crest === madridCrest) {
		crestWidth = (h/3) / (720/433);
	}
	else if(crest === juvCrest) {
		crestWidth = (h/3) / (2378/1200);
	}
	
	switch(crest) {
		
		case fcbCrest:
		ctx.drawImage(fcbCrest, 0, 0, 50, 50, (1.65 * w/8) + w/2, h/3 + h/12, crestWidth/2, h/6);
		ctx.font = .045 * w + 'px Arial';
		break;
		
		case madridCrest:
		ctx.drawImage(madridCrest, 0, 0, 433, 720, (1.7 * w/8) + w/2, h/3 + h/12, .7 * crestWidth, h/5);
		ctx.font = .04 * w + 'px Arial';
		break;
		
		case psgCrest:
		ctx.drawImage(psgCrest, 0, 0, 1200, 1200, (1.6 * w/8) + w/2, h/3 + h/12, crestWidth, h/3);
		ctx.font = .025 * w + 'px Arial';
		break;
		
		case bayernCrest:
		ctx.drawImage(bayernCrest, 0, 0, 1200, 1200, (1.5 * w/8) + w/2, h/3 + h/12, crestWidth, h/3);
		ctx.font = .03 * w + 'px Arial';
		break;
		
		case dortCrest:
		ctx.drawImage(dortCrest, 0, 0, 1200, 1200, (1.5 * w/8) + w/2, h/3 + h/12, crestWidth, h/3);
		ctx.font = .03 * w + 'px Arial';
		break;
		
		case juvCrest:
		ctx.drawImage(juvCrest, 0, 0, 1200, 2378, (1.8 * w/8) + w/2, h/3 + h/12, crestWidth + w/20, h/2);
		ctx.font = .04 * w + 'px Arial';
		break;
		
		case interCrest:
		ctx.drawImage(interCrest, 0, 0, 1200, 1200, (1.6 * w/8) + w/2, h/3 + h/12, crestWidth, h/3);
		ctx.font = .04 * w + 'px Arial';
		break;
		
		case cityCrest:
		ctx.drawImage(cityCrest, 0, 0, 1200, 1200, (1.6 * w/8) + w/2, h/3 + h/12, crestWidth, h/3);
		ctx.font = .04 * w + 'px Arial';
		break;
	}
	
	ctx.fillText(team, 3 * w/4, (3 * h/4) + (.05 * w));
	
	ctx.restore();
}
	

function drawHomeTeam(team, crest) {
	ctx.save();
	
	ctx.fillStyle = 'gray';
	ctx.textAlign = 'center';
	
	let crestWidth = h/3;
	
	if(crest === madridCrest) {
		crestWidth = (h/3) / (720/433);
	}
	else if(crest === juvCrest) {
		crestWidth = (h/3) / (2378/1200);
	}
	
	switch(crest) {
		
		case fcbCrest:
		ctx.drawImage(fcbCrest, 0, 0, 50, 50, 1.65 * w/8, h/3 + h/12, crestWidth/2, h/6);
		ctx.font = .045 * w + 'px Arial';
		break;
		
		case madridCrest:
		ctx.drawImage(madridCrest, 0, 0, 433, 720, 1.7 * w/8, h/3 + h/12, .7 * crestWidth, h/5);
		ctx.font = .04 * w + 'px Arial';
		break;
		
		case psgCrest:
		ctx.drawImage(psgCrest, 0, 0, 1200, 1200, 1.6 * w/8, h/3 + h/12, crestWidth, h/3);
		ctx.font = .025 * w + 'px Arial';
		break;
		
		case bayernCrest:
		ctx.drawImage(bayernCrest, 0, 0, 1200, 1200, 1.5 * w/8, h/3 + h/12, crestWidth, h/3);
		ctx.font = .03 * w + 'px Arial';
		break;
		
		case dortCrest:
		ctx.drawImage(dortCrest, 0, 0, 1200, 1200, 1.5 * w/8, h/3 + h/12, crestWidth, h/3);
		ctx.font = .03 * w + 'px Arial';
		break;
		
		case juvCrest:
		ctx.drawImage(juvCrest, 0, 0, 1200, 2378, 1.8 * w/8, h/3 + h/12, crestWidth + w/20, h/2);
		ctx.font = .04 * w + 'px Arial';
		break;
		
		case interCrest:
		ctx.drawImage(interCrest, 0, 0, 1200, 1200, 1.6 * w/8, h/3 + h/12, crestWidth, h/3);
		ctx.font = .04 * w + 'px Arial';
		break;
		
		case cityCrest:
		ctx.drawImage(cityCrest, 0, 0, 1200, 1200, 1.6 * w/8, h/3 + h/12, crestWidth, h/3);
		ctx.font = .04 * w + 'px Arial';
		break;
	}
	
	ctx.fillText(team, w/4, (3 * h/4) + (.05 * w));
	
	ctx.restore();
}

function teamChosen(count) {
	return teamArray[count];
}

function teamCrestChosen(count) {
	let returnImage;
	switch(count) {
		case 0:
		returnImage = fcbCrest;
		break;
		
		case 1:
		returnImage = madridCrest;
		break;
		
		case 2:
		returnImage = psgCrest;
		break;
		
		case 3:
		returnImage = bayernCrest;
		break;
		
		case 4:
		returnImage = dortCrest;
		break;
		
		case 5:
		returnImage = juvCrest;
		break;
		
		case 6:
		returnImage = interCrest;
		break;
		
		case 7:
		returnImage = cityCrest;
	}
	
	return returnImage;
}
	
function drawContinueIcon() {
	ctx.save();
	
	ctx.beginPath();
	ctx.strokeStyle = 'red';
	ctx.lineJoin = 'round';
	ctx.lineWidth = w/200;
	ctx.strokeRect(2.5 * w/6, 5.5 * h/6, w/6, .45 * h/6);
	ctx.closePath();
	
	ctx.fillStyle = 'black';
	ctx.font = h/15 + 'px Arial';
	ctx.textAlign = 'center';
	ctx.fillText('Continue', w/2, 5.90 * h/6);
	
	ctx.restore();
}
	
function loadDirectionsSheet() {
	removeEventListener('mousedown', event3);
	cancelAnimationFrame(animation1);
	addEventListener('mousedown', event4);
	ctx.save();
	ctx.clearRect(0, 0, w, h);
	drawOpeningScreenBackground();
	
	drawDirectionsTitle();
	drawDirections();
	drawContinueIcon();
}

function drawDirectionsTitle() {
	ctx.save();
	
	ctx.font = h/5 + 'px Berlin-Sans-FB-Demi';
	ctx.textAlign = 'center';
	ctx.fillStyle = '#23239E';
	ctx.fillText('Directions', w/2, h/4);
	
	ctx.restore();
}

function drawDirections() {
	ctx.save();
	
	ctx.font = h/10 + 'px Arial';
	ctx.fillStyle = '#931C30';
	ctx.fillText('1. Click on the goal to aim your shot', .1 * w, h/2 - h/10);
	ctx.fillText('2. Press and hold space to determine', .1 * w, h/2 + h/10);
	ctx.fillText('pace and accuracy of shot', .1 * w, h/2 + h/5);
	
	ctx.restore();
}
	
function beginShootout() {
	removeEventListener('mousedown', event4);
	oldTime = 0;
	
	addEventListener('mousedown', event5);
	
	player = new Player( .25 * w, h - (.2 * h), .08 * w, .2 * h);
	goalKeeper = new Goalie(.475 * w, .5 * h, .05 * w, .15 * h);
	penaltyShotBall = new Ball(.49 * w, 555/625 * h, .03 * w, 200, 200);
	gkDiveChoice = Math.round(Math.random() * 4.49);
	gkSpriteCounter = .05;
	//console.log(gkDiveChoice);
	accuracyLineSpeed = w/200;
	displayCount = 0;
	
	//sound1.play();
	
	animation1 = requestAnimationFrame(penaltyLoop);
}

function penaltyLoop(currentTime) {
	ctx.clearRect(0, 0, w, h);
	
	let delta = currentTime - oldTime;
	theTime = currentTime;
	
	drawPenaltyGoal();
	drawBall();
	drawKeeper();
	drawPlayer();
	displayCrests();
	displayScore();
	drawScoreBoxes();
	
	if(moving) {
		player.movePlayer(delta);
	}
	if(penaltyBallMoving) {
		penaltyShotBall.moveBallShot(delta);
	}
	if(gkMoving) {
		if(continueGKSprite) {
			gkDiveCount += gkSpriteCounter;
		}
		moveKeeper(delta);
	}
	if(drawTargetCircle) {
		drawFinalDestination();
	}
	if(drawPowerBar) {
		createAccuracyBar(.455 * w, .84 * h, .1 * w, .04 * h);
		createPowerBar();
	}
	
	
	oldTime = currentTime;
	animation1 = requestAnimationFrame(penaltyLoop);
	
	if(save) {
		console.log("saved");
		if(displayCount < 100) {
			displayOutcome('SAVE');
			displayCount++;
		}
		else {
			resetLoop();
		}
	}
	else if(miss) {
		console.log("missed");
		if(displayCount < 100) {
			displayOutcome('MISS');
			displayCount++;
		}
		else {
			resetLoop();
		}
	}
	else if(goal) {
		console.log("goal");
		if(displayCount < 100) {
			displayOutcome('GOAL');
			displayCount++;
		}
		else {
			resetLoop();
		}
	}
	if(penaltyBallCount > 4) penaltyBallCount = 0;
}

function drawScoreBoxes() {
	ctx.save();
	
	if(shotNumber >= 3) {
		if(homeArray[0] === true) {
			ctx.fillStyle = 'green';
			ctx.fillRect(.03 * w, .75 * h, .03 * w, .02 * h);
		}
		else if(homeArray[0] === false) {
			ctx.fillStyle = 'red';
			ctx.fillRect(.03 * w, .75 * h, .03 * w, .02 * h);
		}
	}
	if(shotNumber >= 4) {
		if(awayArray[0] === true) {
			ctx.fillStyle = 'green';
			ctx.fillRect(.815 * w, .75 * h, .03 * w, .02 * h);
		}
		else if(awayArray[0] === false) {
			ctx.fillStyle = 'red';
			ctx.fillRect(.815 * w, .75 * h, .03 * w, .02 * h);
		}
	}
	if(shotNumber >= 5) {
			if(homeArray[1] === true) {
			ctx.fillStyle = 'green';
			ctx.fillRect(.06 * w, .75 * h, .03 * w, .02 * h);
		}
		else if(homeArray[1] === false) {
			ctx.fillStyle = 'red';
			ctx.fillRect(.06 * w, .75 * h, .03 * w, .02 * h);
		}
	}
	if(shotNumber >= 6) {
		if(awayArray[1] === true) {
			ctx.fillStyle = 'green';
			ctx.fillRect(.845 * w, .75 * h, .03 * w, .02 * h);
		}
		else if(awayArray[1] === false) {
			ctx.fillStyle = 'red';
			ctx.fillRect(.845 * w, .75 * h, .03 * w, .02 * h);
		}
	}
	if(shotNumber >= 7) {
			if(homeArray[2] === true) {
			ctx.fillStyle = 'green';
			ctx.fillRect(.09 * w, .75 * h, .03 * w, .02 * h);
		}
		else if(homeArray[2] === false) {
			ctx.fillStyle = 'red';
			ctx.fillRect(.09 * w, .75 * h, .03 * w, .02 * h);
		}
	}
	if(shotNumber >= 8) {
		if(awayArray[2] === true) {
			ctx.fillStyle = 'green';
			ctx.fillRect(.875 * w, .75 * h, .03 * w, .02 * h);
		}
		else if(awayArray[2] === false) {
			ctx.fillStyle = 'red';
			ctx.fillRect(.875 * w, .75 * h, .03 * w, .02 * h);
		}
	}
	if(shotNumber >= 9) {
			if(homeArray[3] === true) {
			ctx.fillStyle = 'green';
			ctx.fillRect(.12 * w, .75 * h, .03 * w, .02 * h);
		}
		else if(homeArray[3] === false) {
			ctx.fillStyle = 'red';
			ctx.fillRect(.12 * w, .75 * h, .03 * w, .02 * h);
		}
	}
	if(shotNumber >= 10) {
		if(awayArray[3] === true) {
			ctx.fillStyle = 'green';
			ctx.fillRect(.905 * w, .75 * h, .03 * w, .02 * h);
		}
		else if(awayArray[3] === false) {
			ctx.fillStyle = 'red';
			ctx.fillRect(.905 * w, .75 * h, .03 * w, .02 * h);
		}
	}
	if(shotNumber >= 11) {
			if(homeArray[4] === true) {
			ctx.fillStyle = 'green';
			ctx.fillRect(.15 * w, .75 * h, .03 * w, .02 * h);
		}
		else if(homeArray[4] === false) {
			ctx.fillStyle = 'red';
			ctx.fillRect(.15 * w, .75 * h, .03 * w, .02 * h);
		}
	}
	if(shotNumber >= 12) {
		if(awayArray[4] === true) {
			ctx.fillStyle = 'green';
			ctx.fillRect(.935 * w, .75 * h, .03 * w, .02 * h);
		}
		else if(awayArray[4] === false) {
			ctx.fillStyle = 'red';
			ctx.fillRect(.935 * w, .75 * h, .03 * w, .02 * h);
		}
	}
	
	
	ctx.strokeStyle = 'black';
	ctx.lineWidth = w/500;
	
	ctx.strokeRect(.03 * w, .75 * h, .03 * w, .02 * h);
	ctx.strokeRect(.06 * w, .75 * h, .03 * w, .02 * h);
	ctx.strokeRect(.09 * w, .75 * h, .03 * w, .02 * h);
	ctx.strokeRect(.12 * w, .75 * h, .03 * w, .02 * h);
	ctx.strokeRect(.15 * w, .75 * h, .03 * w, .02 * h);
	
	ctx.strokeRect(.815 * w, .75 * h, .03 * w, .02 * h);
	ctx.strokeRect(.845 * w, .75 * h, .03 * w, .02 * h);
	ctx.strokeRect(.875 * w, .75 * h, .03 * w, .02 * h);
	ctx.strokeRect(.905 * w, .75 * h, .03 * w, .02 * h);
	ctx.strokeRect(.935 * w, .75 * h, .03 * w, .02 * h);
	
	ctx.restore();
}

function displayScore() {
	ctx.save();
	
	ctx.fillStyle = 'black';
	ctx.font = h/5 + 'px Arial';
	ctx.textAlign = 'center';
	
	ctx.fillText(homeScore, blankSpace/4, .6 * h);
	ctx.fillText(awayScore, w - blankSpace/4, .6 * h);
	
	ctx.restore();
}


function displayCrests() {
	ctx.save();
	
	let chosenTeamCrest = teamCrestChosen(teamChooseCount);
	let chosenTeamCrest2 = teamCrestChosen(teamChooseCount2);
	
	
	let crestWidth = h/3;
	
	if(chosenTeamCrest === madridCrest) {
		crestWidth = (h/3) / (720/433);
	}
	else if(chosenTeamCrest === juvCrest) {
		crestWidth = (h/3) / (2378/1200);
	}
	
	switch(chosenTeamCrest) {
		
		case fcbCrest:
		ctx.drawImage(fcbCrest, 0, 0, 50, 50, .06 * w, .15 * h, crestWidth/2, h/6);
		ctx.font = .045 * w + 'px Arial';
		break;
		
		case madridCrest:
		ctx.drawImage(madridCrest, 0, 0, 433, 720, .06 * w, .15 * h, .7 * crestWidth, h/5);
		ctx.font = .04 * w + 'px Arial';
		break;
		
		case psgCrest:
		ctx.drawImage(psgCrest, 0, 0, 1200, 1200, .055 * w, .15 * h, crestWidth, h/3);
		ctx.font = .025 * w + 'px Arial';
		break;
		
		case bayernCrest:
		ctx.drawImage(bayernCrest, 0, 0, 1200, 1200, .055 * w, .15 * h, crestWidth, h/3);
		ctx.font = .03 * w + 'px Arial';
		break;
		
		case dortCrest:
		ctx.drawImage(dortCrest, 0, 0, 1200, 1200, .055 * w, .15 * h, crestWidth, h/3);
		ctx.font = .03 * w + 'px Arial';
		break;
		
		case juvCrest:
		ctx.drawImage(juvCrest, 0, 0, 1200, 2378, .08 * w, .15 * h, crestWidth + w/20, h/2);
		ctx.font = .04 * w + 'px Arial';
		break;
		
		case interCrest:
		ctx.drawImage(interCrest, 0, 0, 1200, 1200, .055 * w, .15 * h, crestWidth, h/3);
		ctx.font = .04 * w + 'px Arial';
		break;
		
		case cityCrest:
		ctx.drawImage(cityCrest, 0, 0, 1200, 1200, .055 * w, .15 * h, crestWidth, h/3);
		ctx.font = .04 * w + 'px Arial';
		break;
	}
	
	crestWidth = h/3;
	
	if(chosenTeamCrest2 === madridCrest) {
		crestWidth = (h/3) / (720/433);
	}
	else if(chosenTeamCrest2 === juvCrest) {
		crestWidth = (h/3) / (2378/1200);
	}
	
	switch(chosenTeamCrest2) {
		
		case fcbCrest:
		ctx.drawImage(fcbCrest, 0, 0, 50, 50, .85 * w, .15 * h, crestWidth/2, h/6);
		ctx.font = .045 * w + 'px Arial';
		break;
		
		case madridCrest:
		ctx.drawImage(madridCrest, 0, 0, 433, 720, .855 * w, .15 * h, .7 * crestWidth, h/5);
		ctx.font = .04 * w + 'px Arial';
		break;
		
		case psgCrest:
		ctx.drawImage(psgCrest, 0, 0, 1200, 1200, .84 * w, .15 * h, crestWidth, h/3);
		ctx.font = .025 * w + 'px Arial';
		break;
		
		case bayernCrest:
		ctx.drawImage(bayernCrest, 0, 0, 1200, 1200, .84 * w, .15 * h, crestWidth, h/3);
		ctx.font = .03 * w + 'px Arial';
		break;
		
		case dortCrest:
		ctx.drawImage(dortCrest, 0, 0, 1200, 1200, .84 * w, .15 * h, crestWidth, h/3);
		ctx.font = .03 * w + 'px Arial';
		break;
		
		case juvCrest:
		ctx.drawImage(juvCrest, 0, 0, 1200, 2378, .87 * w, .15 * h, crestWidth + w/20, h/2);
		ctx.font = .04 * w + 'px Arial';
		break;
		
		case interCrest:
		ctx.drawImage(interCrest, 0, 0, 1200, 1200, .84 * w, .15 * h, crestWidth, h/3);
		ctx.font = .04 * w + 'px Arial';
		break;
		
		case cityCrest:
		ctx.drawImage(cityCrest, 0, 0, 1200, 1200, .84 * w, .15 * h, crestWidth, h/3);
		ctx.font = .04 * w + 'px Arial';
		break;
	}
	
	ctx.restore();
}

function displayOutcome(message) {
	ctx.save();
	
	ctx.fillStyle = 'red';
	ctx.font = h/4 + 'px Arial';
	ctx.textAlign = 'center';
	ctx.fillText(message, w/2, h/4);
	
	ctx.restore();
}

function createPowerBar() {
	ctx.save();
	
	if(!moveAccuracyLine) {
		ctx.fillStyle = 'yellow';
		ctx.fillRect(.455 * w, .81 * h, powerCounter, .03 * h);
	}
	if(movePowerLine) {
		powerCounter += w/400;
		if(powerCounter >= .1 * w) {
			movePowerLine = false;
			powerCounter -= w/400;
		}
		if(powerCounter >= .05 * w) {
			finalDestination.radius += powerCounter * .05;
		}
	}
	
	ctx.strokeStyle = 'black';
	ctx.lineWidth = w/500;
	ctx.strokeRect(.455 * w, .81 * h, .1 * w, .03 * h);
	
	ctx.restore();
}

function createAccuracyBar(x, y, width, height) {
	ctx.save();
	
	ctx.translate(x, y);
	
	let pattern1 = ctx.createLinearGradient(0, 0, width, height);
	createGradient1(pattern1);
	
	ctx.fillStyle = pattern1;
	ctx.fillRect(0, 0, width, height);
	
	ctx.strokeStyle = 'black';
	ctx.lineWidth = w/200 + 'px';
	ctx.strokeRect(0, 0, width, height);
	
	ctx.fillStyle = 'black'
	ctx.fillRect(accuracyLineX, 0, w/500, height);
	
	if(moveAccuracyLine) {
		accuracyLineX += accuracyLineSpeed;
		//console.log(accuracyLineX);
	}
	if(accuracyLineX >= width) {
		accuracyLineX = width;
		accuracyLineSpeed *= -1;
		console.log(accuracyLineX);
	}
	else if(accuracyLineX <= 0) {
		accuracyLineX = 0;
		accuracyLineSpeed *= -1;
		console.log(accuracyLineX);
	}
	
	ctx.restore();
}

function createGradient1(pattern) {
	pattern.addColorStop(0, '#F20D0D');
	pattern.addColorStop(.35, '#EAEA0C');
	pattern.addColorStop(.5, '#1CAF11');
	pattern.addColorStop(.65, '#EAEA0C');
	pattern.addColorStop(1, '#F20D0D');
}

function drawFinalDestination() {
	ctx.save();
	
	ctx.strokeStyle = 'blue';
	ctx.lineWidth = w/200;
	ctx.beginPath();
	ctx.arc(finalDestination.x, finalDestination.y, finalDestination.radius, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.closePath();
	
	if(!moveAccuracyLine && accuracyRangeCounter < 1) {
		let difference = Math.abs(accuracyLineX - (.05 * w));
		//console.log(.05 * w);
		if(difference < .015 * w) {
			difference = 0;
		}
		else if(difference < .03 * w) {
			difference = (1/100) * w;
		}
		else if(difference < .045 * w) {
			difference = (3/100) * w;
		}
		else {
			difference = (1/25) * w;
		}
		finalDestination.radius += difference;
		accuracyRangeCounter++;
	}
	
	ctx.restore();
}

function drawPlayer() {
	ctx.save();
	
	let count = Math.round(playerMoveCount);
	if(!playerSpriteArray[count]) {
		count = 0;
		playerMoveCount = 0;
	}
	
	ctx.drawImage(playerSpriteSheet, playerSpriteArray[count].x, playerSpriteArray[count].y, playerSpriteArray[count].width, playerSpriteArray[count].height, player.x, player.y, player.width, player.height);
	
	ctx.restore();
}

function drawPenaltyGoal() {
	ctx.save();
	
	let goalWidthToHeight = 500/442;
	let canvasWidthToHeight = w/h;
	let canvasWidth = w;
	let canvasHeight = h;
	let backImg = {
		width: 0, 
		height: 0
	};
	
	canvasWidth = canvasHeight * goalWidthToHeight;
	backImg.width = canvasWidth;
	backImg.height = canvasHeight;

	blankSpace = w - backImg.width;
	
	ctx.drawImage(image9, 0, 0, 500, 442, blankSpace/2, 0, backImg.width, backImg.height);
	
	ctx.fillStyle = '#0D1261';
	ctx.fillRect(0, 0, blankSpace/2, h);
	ctx.fillRect(w - blankSpace/2, 0, blankSpace/2, h);
	
	ctx.restore();
}
	
function drawBall() {
	ctx.save();
	
	let selectedImage;
	if(penaltyBallCount <= 1) {
		selectedImage = image3;
	}
	else if(penaltyBallCount <= 2) {
		selectedImage = image4;
	}
	else if(penaltyBallCount <= 3) {
		selectedImage = image5;
	}
	else if(penaltyBallCount <= 4) {
		selectedImage = image6;
	}
	
	ctx.drawImage(selectedImage, 0, 0, 155, 154, penaltyShotBall.x, penaltyShotBall.y, penaltyShotBall.height, penaltyShotBall.height);
	
	ctx.restore();
}

function drawKeeper() {
	ctx.save();
	let chosenArray = [];
	let count = Math.round(gkDiveCount);
	
	if(gkDiveChoice === 0) {
		chosenArray = [{x: 420, y: 0, width: 80, height: 150}];
		endCount = 0;
	}
	else if(gkDiveChoice === 1) {
		chosenArray = gkBottomLeft;
		endCount = 2;
	}
	else if(gkDiveChoice === 2 ) {
		chosenArray = gkBottomRight;
		endCount = 2;
	}
	else if(gkDiveChoice === 3) {
		chosenArray = gkTopLeft;
		endCount = 4;
	}
	else if(gkDiveChoice === 4) {
		chosenArray = gkTopRight;
		endCount = 4;
	}
	
	if(!chosenArray[count]) {
		gkDiveCount = endCount;
		count = endCount;
		continueGKSprite = false;
	}
	
	if(gkDiveChoice >= 3 && gkDiveCount >= 1.5 && gkDiveCount <= 2.5) {
		gkDiveCount -= .025;
	}
	
	//console.log(gkDiveChoice);
	//console.log(chosenArray);
	
	ctx.drawImage(gkSpriteSheet, chosenArray[count].x, chosenArray[count].y, chosenArray[count].width, chosenArray[count].height, goalKeeper.x, goalKeeper.y, goalKeeper.width * factor1, goalKeeper.height * factor2);
	
	ctx.restore();
}

function moveKeeper(delta) {
	
	if(gkDiveChoice === 0) {
		goalKeeper.jump(delta);
	}
	else if(gkDiveChoice === 1) {
		goalKeeper.bottomLeftDive(delta);
	}
	else if(gkDiveChoice === 2) {
		goalKeeper.bottomRightDive(delta);
	}
	else if(gkDiveChoice === 3) {
		goalKeeper.topLeftDive(delta);
	}
	else if(gkDiveChoice === 4) {
		goalKeeper.topRightDive(delta);
	}
}	
	
function calcBallXAndYSpeed() {
	
	let Xdiff = randomDestination.x - penaltyShotBall.x;
	let Ydiff = randomDestination.y - penaltyShotBall.y;
	
	if(powerCounter > .5) {
		ballSpeedFactor = .025 * powerCounter;
	}
	else {
		ballSpeedFactor = .0005 * w;
	}
	
	penaltyShotBall.speedX = Xdiff * ballSpeedFactor;
	penaltyShotBall.speedY = Ydiff * ballSpeedFactor;
}

function calcRandomDestination() {
	
	if(finalDestination.y - finalDestination.radius - penaltyShotBall.height/2 > .65 * h - penaltyShotBall.height/2) {
		moving = false;
		drawPowerBar = true;
		movePowerBar = true;
		moveAccuracyLine = true;
		movePowerLine = false;
		powerCounter = 0;
		finalDestination.radius = w/50;
		finalDestination.x = 2 * w;
		finalDestination.y = 2 * h;
		addEventListener('mousedown', event5);
		
		return {x: 0, y: 0};
	}
	
	let xCord = Math.random() * (2 * finalDestination.radius) + (finalDestination.x - finalDestination.radius - penaltyShotBall.height/2);
	let yCord = Math.random() * (2 * finalDestination.radius) + (finalDestination.y - finalDestination.radius -  penaltyShotBall.height/2);
	
	while(yCord + penaltyShotBall.height/2 > .65 * h) {
		yCord = Math.random() * (2 * finalDestination.radius) + (finalDestination.y - penaltyShotBall.height - finalDestination.radius);
	}
	
	return {
		x: xCord, 
		y: yCord
	};
}
	
function resetLoop() {
	
	if(shotNumber === 11) {
		if(homeScore - awayScore != 0) {
			displayEndScreen();
		}
	}
	else if(shotNumber > 11 && shotNumber % 2 != 0) {
		if(homeScore - awayScore != 0) {
			displayEndScreen();
		}
	}
	
	shotNumber++;
	
	homeBallCount = 0; 
	penaltyBallCount = 0;
	moving = false;
	gkMoving = false;
	penaltyBallMoving = false;
	continueGKSprite = true;
	drawTargetCircle = false;
	drawPowerBar = true;
	
	addEventListener('mousedown', event5);
	
	gkDiveChoice = Math.round(Math.random() * 4.49);
	displayCount = 0;
	
	player.x = .25 * w;
	player.y = h - (.2 * h);
	player.width = .08 * w;
	player.height = .2 * h;
	
	goalKeeper.x = .475 * w;
	goalKeeper.y = .5 * h;
	goalKeeper.width = .05 * w;
	goalKeeper.height = .15 * h;
	
	penaltyShotBall.x = .49 * w;
	penaltyShotBall.y = 555/625 * h;
	penaltyShotBall.height = .03 * w;
	penaltyShotBall.speedX = 200;
	penaltyShotBall.speedY = 200;
	
	gkDiveCount = 0;
	gkSpriteCounter = .05;
	playerMoveCount = 0;
	endCount = 0;
	factor1 = 1;
	factor2 = 1;
	ballSpeedFactor = 1;
	moveAccuracyLine = true
	accuracyLineX = 0;
	powerCounter = 0;
	movePowerLine = false;
	accuracyRangeCounter = 0;
	save = false;
	miss = false;
	goal = false;
	displayCount = 0;
	
	//sound1.play();
}

function displayEndScreen() {
	ctx.save();
	
	cancelAnimationFrame(animation1);
	removeEventListener('mousedown', event5);
	
	ctx.clearRect(0, 0, w, h);
	drawOpeningScreenBackground();
	
	ctx.font = h/4 + 'px Berlin-Sans-FB-Demi';
	ctx.fillStyle = 'red';
	ctx.textAlign = 'center';
	
	ctx.fillText('VICTORY', w/2, h/3);
	
	if(homeScore > awayScore) {
		ctx.fillText('HOME TEAM', w/2, 2 * h/3);
	}
	else {
		ctx.fillText('AWAY TEAM', w/2, 2 * h/3);
	}

	ctx.restore();
}
	
	
	
	
	
	
	
	
	
	
	
