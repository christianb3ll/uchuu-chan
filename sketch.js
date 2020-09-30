/*

The Game Project Final
Christian Bell

** Sound Implementation **
The first problem that I encountered in implementing the sound was that playing sounds during the draw loop resulted in the sound being repeatedly played in quick succession. I resolved this by a simple check to ensure the sound is not already playing. I also realised that calls to play certain sound effects needed to be made at the moment a state changed rather than afterward, eg, just before the flagpole is reached is set to true rather than afterwards so as not to play over and over again. I also encountered an issue with the browser whereby sound was prevented from being played on startup prior to the user interacting with the screen. On reading the error messages in the console I realised this was more or less the browser acting as it should do and as such I didn’t want to make any efforts to override the default behaviour. Therefore, I decided to create a title menu to give the player an opportunity to interact with the game menu before any sound is played. 
I learned to make simple checks before implementing code as well as how to navigate a library.


** Enemy Implementation **
Creating the design of the enemy was challenging as I wanted to restrict the code to simple shapes. I also chose to add a simple animation to the enemy. To make this easier, I decided I wanted to mirror the enemy depending on which direction it was facing rather than repeating much of the same code. Once I had done that, I decided to do the same for the player character. I chose to add an extra level of difficulty by increasing the movement speed of the enemy each time the level is completed. This was done by adding the number of times completed to the enemy’s movement speed. Certain elements of the enemy, such as the hit detection between the enemy and player, took time to finesse through trial and error. Eventually I managed to settle on values that felt satisfying when playing. I learned how to create constructor functions and how to simplify code, rather than repeating things unnecessarily. 

*/

var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;
var enemies;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var clouds;
var mountains;
var trees_x;
var canyons;
var collectables;
var flagpole;
var skyColours;

var game_score;
var gameComplete;
var lives;
var gameOver;
var timesCompleted;
var titleScreen;
var titleClouds;
var animateStep;

var collectSound;
var jumpSound;
var deathSound;
var hatchSound;
var hitSound;
var startSound;
var music;

function preload()
{
    soundFormats('mp3','wav');
    
    // Preload the sounds
    jumpSound = loadSound('assets/jump.wav');
    collectSound = loadSound('assets/pickup.wav');
    deathSound = loadSound('assets/death.wav');
    hatchSound = loadSound('assets/openHatch.wav');
    hitSound = loadSound('assets/hit.wav');
    startSound = loadSound('assets/start.wav');
    music = loadSound('assets/music.mp3');
    
    // Set sound volume
    jumpSound.setVolume(0.1);
    collectSound.setVolume(0.1);
    deathSound.setVolume(0.1);
    hatchSound.setVolume(0.1);
    hitSound.setVolume(0.1);
    startSound.setVolume(0.1);
    music.setVolume(0.1);
}


function setup()
{
	createCanvas(1024, 576);
    floorPos_y = height * 3/4;
	lives = 3;
    timesCompleted = 0;
    
    titleScreen = true;
    
    // Changes the colour of the sky each time the level is completed
    skyColours = [[100,155,255],[141,171,252],[158,102,237],[237,186,57],[222,133,44],[19,46,128],[5,31,107]];
    
    startGame();
}


function draw()
{
    
    // Title Menu
    if (titleScreen)
    {
        callTitleScreen();
        return;   
    }
    
    background(skyColours[timesCompleted][0], skyColours[timesCompleted][1], skyColours[timesCompleted][2]);

	noStroke();
	fill(0,155,0);
	rect(0, floorPos_y, width, height/4); // draw some green ground
    
    
    push();
    translate(scrollPos, 0);

	// Draw clouds.
    drawClouds(clouds);

	// Draw mountains.
    drawMountains();

	// Draw trees.
    drawTrees();

	// Draw canyons.
    for (var i = 0; i < canyons.length; i++)
        {
            drawCanyon(canyons[i]);
            checkCanyon(canyons[i]);
        }
    
    if(isPlummeting)
        {
            gameChar_y += 10;
        }

	// Draw collectable items.
    for (var i = 0; i < collectables.length; i++)
        {
        if (collectables[i].isFound == false)
            {
                drawCollectable(collectables[i]);
                checkCollectable(collectables[i]);
            }
        }
    
    renderFlagpole();
    
    if (flagpole.isReached == false)
        {
            checkFlagpole();
        }
    
    // Draw the enemies and check for contact
    for(var i = 0; i < enemies.length; i++)
        {
            enemies[i].drawEnemy();
            var isContact = enemies[i].checkContact(gameChar_world_x,gameChar_y);
            
            if(isContact)
                {
                    if(lives > 0)
                        {
                            hitSound.play();
                            startGame();
                            lives -= 1;
                            break;
                        }
                }
        }
    
    pop();
    
    // Game Over
    if (lives < 1)
    {
        callGameOver();
        return;   
    }
    
    // Level Complete
    if (flagpole.isReached)
    {
        callLevelComplete();
        return;
    }
    
    // Score Counter
    drawScoreCounter();
    
    // life count
    for (var i = 0; i < lives; i++)
    {   
        // draw the life count icons
        drawAlienIcon(800 +i*50,50);
    }
    
    // Check if the player still has lives
    checkPlayerDie();
    
    // Sets the timing of the character animations
    if(frameCount %10 ==0)
            {
                animateStep = !animateStep;
            }
	
    // Draw game character.
	drawGameChar();

	// Logic to make the game character move or the background scroll.
	if(isLeft)
	{
		if(gameChar_x > width * 0.2)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		}
	}

	if(isRight)
	{
		if(gameChar_x < width * 0.8)
		{
			gameChar_x  += 5;
		}
		else
		{
			scrollPos -= 5; // negative for moving against the background
		}
	}

	// Logic to make the game character rise and fall.
    if(gameChar_y < floorPos_y)
        {
            isFalling = true;
            gameChar_y += 2;
        }
    else
        {
            isFalling = false;
        }

	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
}


// ---------------------
// Key control functions
// ---------------------

function keyPressed()
{    
    if(keyCode == 37)
        {
            isLeft = true;
        }
    else if(keyCode == 39)
        {
            isRight = true;
        }
    
    if(keyCode == 32 && gameChar_y == floorPos_y && !titleScreen)
        {
            gameChar_y -= 100;
            jumpSound.play();
        }
    
    // Checks for Spacebar press to restart the game
    if(keyCode == 32 && flagpole.isReached || keyCode == 32 && lives < 1 || keyCode == 32 && titleScreen)
        {
            if(!gameComplete)
                {
                    titleScreen = false;
                    startGame();
                    startSound.play();
                }
            else
                {
                    titleScreen = true;
                    music.stop();
                }
            
        }
    // Checks for esc key and returns to Title Menu
    else if(keyCode == 27)
        {
            titleScreen = true;
            music.stop();
        }
}


function keyReleased()
{
    if(keyCode == 37)
        {
            isLeft = false;
        }
    else if(keyCode == 39)
        {
            isRight = false;
        }
}

// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.

function drawGameChar()
{
	// draw game character
    if(isLeft && isFalling)
	{
		// jumping-left code
        gameCharJump(1);
	}
	else if(isRight && isFalling)
	{
		// jumping-right code
        gameCharJump(-1);
	}
	else if(isLeft)
	{
		// walking left code
        gameCharWalk(-1);
	}
	else if(isRight)
	{
		// walking right code
        gameCharWalk(1);
	}
	else if(isFalling || isPlummeting)
	{
		// jumping facing forwards code
        //body
        fill(255,50,0);
        rect(gameChar_x - 10, gameChar_y - 42, 20,22, 8,8,3,3);
        fill(0,255,100);
        ellipse(gameChar_x,gameChar_y -55,28,35);
        rect(gameChar_x -5,gameChar_y - 25,10,15);
        ellipse(gameChar_x - 10,gameChar_y -36,6,14);
        ellipse(gameChar_x + 10,gameChar_y -36,6,14);
        fill(90,50,30);
        rect(gameChar_x - 6,gameChar_y - 13,6,5, 2);
        rect(gameChar_x,gameChar_y - 13,6,5, 2);
        //eyes
        fill(255,255,255);
        ellipse(gameChar_x -5,gameChar_y - 60,7,12);
        fill(0,0,0);
        ellipse(gameChar_x -5,gameChar_y - 60,5,5);
        fill(255,255,255);
        ellipse(gameChar_x +5,gameChar_y - 60,7,12);
        fill(0,0,0);
        ellipse(gameChar_x +5,gameChar_y - 60,5,5);
        //antenna
        stroke(0,225,100);
        line(gameChar_x -8,gameChar_y - 70,gameChar_x -18,gameChar_y - 75);
        line(gameChar_x +8,gameChar_y - 70,gameChar_x +18,gameChar_y - 75);
        noStroke();
        //mouth
        fill(0,0,0);
        ellipse(gameChar_x, gameChar_y - 48, 8,3);
        fill(0,255,100);
        rect(gameChar_x - 6, gameChar_y - 51, 12,3, 0,0,14,10);
        
	}
	else
	{
		// standing front facing code
        //body
        fill(255,50,0);
        rect(gameChar_x - 10, gameChar_y - 37, 20,22, 8,8,3,3);
        fill(0,255,100);
        ellipse(gameChar_x,gameChar_y -50,28,35);
        rect(gameChar_x -5,gameChar_y - 15,10,15);
        ellipse(gameChar_x - 10,gameChar_y -26,6,14);
        ellipse(gameChar_x + 10,gameChar_y -26,6,14);
        fill(90,50,30);
        rect(gameChar_x - 6,gameChar_y - 2,6,5, 2);
        rect(gameChar_x,gameChar_y - 2,6,5, 2);
        //eyes
        fill(255,255,255);
        ellipse(gameChar_x -5,gameChar_y - 50,7,12);
        fill(0,0,0);
        ellipse(gameChar_x -5,gameChar_y - 50,5,5);
        fill(255,255,255);
        ellipse(gameChar_x +5,gameChar_y - 50,7,12);
        fill(0,0,0);
        ellipse(gameChar_x +5,gameChar_y - 50,5,5);
        //antenna
        stroke(0,225,100);
        line(gameChar_x -8,gameChar_y - 60,gameChar_x -15,gameChar_y - 70);
        line(gameChar_x +8,gameChar_y - 60,gameChar_x +15,gameChar_y - 70);
        noStroke();
        //mouth
        fill(0,0,0);
        ellipse(gameChar_x, gameChar_y - 38, 8,3);
        fill(0,255,100);
        rect(gameChar_x - 6, gameChar_y - 41, 12,3, 0,0,14,10);
	}
}

// ---------------------------
// Character Draw helper functions
// ---------------------------

// Draws the character and sets it to face left or right based on direction INT 1 or -1
function gameCharWalk(direction)
{
    if(animateStep)
        {
            var charStep = 0;
            //body
            fill(255,50,0);
            rect(gameChar_x - 9 , gameChar_y - 37, 18,22, 8,8,3,3);
            fill(0,255,100);
            ellipse(gameChar_x,gameChar_y -50,26,35);
            quad(gameChar_x -4 ,gameChar_y - 15, gameChar_x +4 ,gameChar_y - 15,gameChar_x +4 ,gameChar_y,gameChar_x -4 ,gameChar_y);
            ellipse(gameChar_x,gameChar_y -24,6,14);
            fill(90,50,30);
            rect(gameChar_x - 4 ,gameChar_y - 2,10,5, 2);
        }
    else
        {
            var charStep = 3;
            //body
            fill(255,50,0);
            rect(gameChar_x - 9 , gameChar_y - 37 + charStep, 18,22, 8,8,3,3);
            fill(0,255,100);
            ellipse(gameChar_x,gameChar_y -50 + charStep,26,35);
            quad(gameChar_x -4 ,gameChar_y - 15, gameChar_x +4 ,gameChar_y - 15,gameChar_x +8 ,gameChar_y,gameChar_x ,gameChar_y);
            quad(gameChar_x -4 ,gameChar_y - 15, gameChar_x +4 ,gameChar_y - 15,gameChar_x -4 ,gameChar_y,gameChar_x -12 ,gameChar_y);
            ellipse(gameChar_x+6 *direction ,gameChar_y -30 + charStep,14,6);
            fill(90,50,30);
            rect(gameChar_x  ,gameChar_y - 2,10,5, 2);
            rect(gameChar_x -12 ,gameChar_y - 2,10,5, 2);
        }

    //eyes
    fill(255,255,255);
    ellipse(gameChar_x +7 *direction,gameChar_y - 50 + charStep,7,12);
    fill(0,0,0);
    ellipse(gameChar_x +8 *direction,gameChar_y - 50 + charStep,5,5);
    //antenna
    stroke(0,225,100);
    line(gameChar_x +2 *direction ,gameChar_y - 60 + charStep,gameChar_x +10 *direction,gameChar_y - 73 + charStep);
    noStroke();
    //mouth
    fill(0,0,0);
    ellipse(gameChar_x +4 *direction, gameChar_y - 38 + charStep, 8,3);
    fill(0,255,100);
    rect(gameChar_x-10, gameChar_y - 41 + charStep, 18 ,3, 0,0,14,10);
}

// Draws the character jumping and sets it to face left or right based on direction INT 1 or -1
function gameCharJump(direction)
{
    //body
    fill(255,50,0);
    rect(gameChar_x - 9, gameChar_y - 42, 18,22, 8,8,3,3);
    fill(0,255,100);
    ellipse(gameChar_x,gameChar_y -55,26,35);
    ellipse(gameChar_x -5 *direction,gameChar_y -35,14,6);
    if(direction == 1)
        {
            rect(gameChar_x -8 ,gameChar_y - 25,8,15,5);
            fill(90,50,30);
            rect(gameChar_x - 10 ,gameChar_y - 13,10,5, 2);
        }
    else
        {
            rect(gameChar_x,gameChar_y - 25,8,15,5);
            fill(90,50,30);
            rect(gameChar_x,gameChar_y - 13,10,5, 2);
        }
    //eyes
    fill(255,255,255);
    ellipse(gameChar_x -7 *direction,gameChar_y - 56,7,12);
    fill(0,0,0);
    ellipse(gameChar_x -8 *direction,gameChar_y - 57,5,5);
    //antenna
    stroke(0,225,100);
    line(gameChar_x -2  *direction,gameChar_y - 65,gameChar_x -14 *direction,gameChar_y - 75);
    noStroke();
    //mouth
    fill(0,0,0);
    ellipse(gameChar_x -4 *direction, gameChar_y - 45, 8,3);
    fill(0,255,100);
    rect(gameChar_x - 10, gameChar_y - 48, 18,3, 0,0,14,10);
}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.
function drawClouds(cloudsArray)
{
    for (var i =0;i < cloudsArray.length;i++)
        {
            fill(200,200,200);
            ellipse(cloudsArray[i].x_pos,cloudsArray[i].y_pos +5 * cloudsArray[i].size, 140 * cloudsArray[i].size,50 * cloudsArray[i].size);    
            fill(255,255,255);    
            ellipse(cloudsArray[i].x_pos,cloudsArray[i].y_pos, 100 * cloudsArray[i].size,50 * cloudsArray[i].size);
            ellipse(cloudsArray[i].x_pos +40 * cloudsArray[i].size,cloudsArray[i].y_pos, 60 * cloudsArray[i].size,30 * cloudsArray[i].size);
            ellipse(cloudsArray[i].x_pos -40 * cloudsArray[i].size,cloudsArray[i].y_pos, 60 * cloudsArray[i].size,30 * cloudsArray[i].size);
        }
}

// Function to draw mountains objects.
function drawMountains()
{
    for (var i = 0;i < mountains.length;i++)
        {
            fill(255,255,255);
            triangle(mountains[i].x_pos - 30, 432, mountains[i].x_pos + mountains[i].width, 432, mountains[i].x_pos + mountains[i].width/3, 432 - mountains[i].height);
            triangle(mountains[i].x_pos, 432, mountains[i].x_pos + mountains[i].width, 432, mountains[i].x_pos + mountains[i].width/2, 432 - mountains[i].height);
            fill(180,180,180);
            triangle(mountains[i].x_pos, 432, mountains[i].x_pos + mountains[i].width, 432, mountains[i].x_pos + mountains[i].width/3, 432 - mountains[i].height);
            triangle(mountains[i].x_pos + 100, 432, mountains[i].x_pos + mountains[i].width, 432, mountains[i].x_pos + mountains[i].width/2, 432 - mountains[i].height);
        }
}

// Function to draw trees objects.
function drawTrees()
{
    for (var i = 0;i < trees_x.length; i++)
        {
            fill(150,75,0);
            rect(trees_x[i],floorPos_y - 100,20,100);
            fill(10,200,0);
            ellipse(trees_x[i] +10,floorPos_y - 92,130,70);
            ellipse(trees_x[i] +10,floorPos_y - 132,90,70);
            triangle(trees_x[i] - 20,floorPos_y - 152,trees_x[i] + 40,floorPos_y - 152,trees_x[i] + 10,floorPos_y - 202);
        }
}


// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.
function drawCanyon(t_canyon)
{
    fill(150,155,80);
    quad(t_canyon.x_pos,432, t_canyon.x_pos - 30, 576, t_canyon.x_pos + t_canyon.width +30, 576, t_canyon.x_pos + t_canyon.width, 432);
    fill(skyColours[timesCompleted][0], skyColours[timesCompleted][1], skyColours[timesCompleted][2]);
    quad(t_canyon.x_pos,432, t_canyon.x_pos -10, 576, t_canyon.x_pos +t_canyon.width + 10, 576, t_canyon.x_pos + t_canyon.width, 432);
}

// Function to check character is over a canyon.
function checkCanyon(t_canyon)
{
    if((gameChar_world_x > t_canyon.x_pos) && (gameChar_world_x < t_canyon.x_pos + t_canyon.width) && (gameChar_y >= floorPos_y) && !gameOver)
        {
            isPlummeting = true;
            
            // Play the falling sound
            if(deathSound.isPlaying() == false)
                {
                    deathSound.play();
                }
        }
}

// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.
function drawCollectable(t_collectable)
{
    fill(255,255,0);
    ellipse(t_collectable.x_pos,t_collectable.y_pos,t_collectable.size * 10,t_collectable.size * 30);
    ellipse(t_collectable.x_pos,t_collectable.y_pos,t_collectable.size * 20 , t_collectable.size * 24);
    fill(0,230,0);
    ellipse(t_collectable.x_pos -5 *t_collectable.size,t_collectable.y_pos -15 * t_collectable.size,t_collectable.size * 12, t_collectable.size * 6);
}

// Function to check character has collected an item.
function checkCollectable(t_collectable)
{
    if(dist(gameChar_world_x,gameChar_y,t_collectable.x_pos,t_collectable.y_pos) < 25 *t_collectable.size)
    {
        t_collectable.isFound = true;
        game_score += 1;
        collectSound.play();
    }
}

// function to draw the alien head icon
function drawAlienIcon(x,y)
{
    push();
    noStroke();
    fill(0,255,100);
    ellipse(x,y,28,35);
    //eyes
    fill(255,255,255);
    ellipse(x-5,y,7,12);
    fill(0,0,0);
    ellipse(x-5,y,5,5);
    fill(255,255,255);
    ellipse(x+5,y,7,12);
    fill(0,0,0);
    ellipse(x+5,y,5,5);
    //antenna
    stroke(0,225,100);
    line(x-8,y-10,x-15,y-20);
    line(x+8,y-10,x+15,y-20);
    noStroke();
    //mouth
    fill(0,0,0);
    ellipse(x, y+12, 8,3);
    fill(0,255,100);
    rect(x-6, y+9, 12,3, 0,0,14,10);
    pop();
}

// function to draw the score counter
function drawScoreCounter()
{
    push();
    fill(0,0,0);
    stroke(255,255,255);
    strokeWeight(5);
    textSize(20);
    text("Your Score: " + game_score, 50,50);
    pop();
}

// ---------------------------------
// Flagpole functions
// ---------------------------------

// Render the Flagpole
function renderFlagpole()
{
    push();
    //Draw Reached State
    if (flagpole.isReached)
        {
        // Ramp
        fill(100,100,100);
        triangle(flagpole.x_pos -40, floorPos_y,flagpole.x_pos +40, floorPos_y,flagpole.x_pos, floorPos_y - 90);
        stroke(150,150,150);
        for (var i = 0; i < 7; i++)
            {
                // Stairs
                line(flagpole.x_pos-30 + i*2, floorPos_y-3 - i*4,flagpole.x_pos+30 - i*2, floorPos_y-3 - i*4);
            }
        noStroke();
        }
    //Draw Normal State
    fill(150,230,255);
    // Cockpit
    ellipse(flagpole.x_pos,floorPos_y - 70, 120, 80);
    if (flagpole.isReached)
        {
            drawAlienIcon(flagpole.x_pos,floorPos_y - 85);
        }
    fill(255,255,255);
    ellipse(flagpole.x_pos + 35,floorPos_y - 90, 8, 15);
    fill(130,130,130);
    // Ship Body
    ellipse(flagpole.x_pos,floorPos_y - 50, 300, 50);
    // Legs
    strokeWeight(8);
    stroke(90,90,90);
    line(flagpole.x_pos - 50,floorPos_y - 35,flagpole.x_pos - 80,floorPos_y);
    line(flagpole.x_pos + 50,floorPos_y - 35,flagpole.x_pos + 80,floorPos_y);
    noStroke();
    // Lights
    if (flagpole.isReached)
        {
            fill(255,255,0);
        }
    else {
            fill(80,80,80);
    }
    for (var i = 0; i < 8; i++)
        {
            ellipse(flagpole.x_pos - 120 + i*35, floorPos_y - 50, 8,8);
        }
    pop();
}

function checkFlagpole()
{
    var dist = abs(gameChar_world_x - flagpole.x_pos);
    
    if (dist < 10)
        {
            // Play the sound of the ship hatch opening
            if(hatchSound.isPlaying() == false)
            {
                hatchSound.play();
            }
            timesCompleted +=1;
            flagpole.isReached = true;
        }
}

// ---------------------------------
// Enemy functions
// ---------------------------------

function Enemy(x, y, range)
{
    this.x = x;
    this.y = y;
    this.range = range;
    
    this.currentX = x;
    this.inc = 1 +timesCompleted;
    this.direction = -1;
    
    this.update = function()
    {
        this.currentX += this.inc;
        
        // Speed of the enemy increases each time the level is completed
        if(this.currentX >= this.x + this.range)
            {
                this.inc = -1 -timesCompleted;
                this.direction = 1;
            }
        else if(this.currentX < this.x)
            {
                this.inc = 1 +timesCompleted;
                this.direction = -1;
            }
    }
    
    this.drawEnemy = function()
    {
        this.update();
        
        //Draw the bee
        noStroke();
        fill(0);
        triangle(this.currentX +5*this.direction,this.y +15,this.currentX +7*this.direction,this.y+ 22,this.currentX +9*this.direction,this.y+ 15);
        ellipse(this.currentX +8*this.direction,this.y +11, 3,13);
        fill(255,255,0);
        ellipse(this.currentX +6*this.direction,this.y+9, 5,15);

        fill(0);
        ellipse(this.currentX+4*this.direction,this.y+6, 5,15);
        fill(255,255,0);
        ellipse(this.currentX+2*this.direction,this.y+3, 5,15);
        fill(0);
        ellipse(this.currentX,this.y, 5,15);
        ellipse(this.currentX-8*this.direction,this.y-2,20,12);
        
        // Animates the bee's wings
        if(animateStep)
            {
                fill(180,180,180);
                ellipse(this.currentX+10*this.direction,this.y-3,17,8);

                fill(210,210,210);
                ellipse(this.currentX +4*this.direction,this.y-10,8,20);
            }
        else
            {
                fill(210,210,210);
                ellipse(this.currentX +4*this.direction,this.y+10,8,20);
            }
        
        fill(255,0,0);
        ellipse(this.currentX -10*this.direction,this.y -4,3,3);

        stroke(1);
        line(this.currentX-7*this.direction,this.y-5,this.currentX -11*this.direction,this.y-15)
        
    }
    this.checkContact = function(gc_x, gc_y)
    {
        // game character centre adjusted for more accurate hit detection
        var d = dist(gc_x, gc_y-30, this.currentX, this.y);
        
        if(d < 30)
        {
            return true;
        }
    return false;
    }
    
}

// ---------------------------------
// Game Control functions
// ---------------------------------

function callTitleScreen()
{
    push();
    background(100, 155, 255);
    
    drawAlienIcon(990,200);
    
    fill(255,0,0);
    textSize(180);
    stroke(0,255,0);
    strokeWeight(10);
    textFont('arial black');
    textAlign(CENTER, CENTER);
    text("宇宙ちゃん", width/2,150);

    fill(0,0,0);
    stroke(255,255,255);
    strokeWeight(5);
    textSize(30);
    textAlign(CENTER, CENTER);
    text("UChuu-Chan.\n Press space to play", width/2,height/2);
    
    titleClouds = [{x_pos: 150, y_pos: 370, size: 1.5},{x_pos: 450, y_pos: 390, size: 1.6},{x_pos: 850, y_pos: 380, size: 1.3}];
    
    drawClouds(titleClouds);
    
    game_score = 0;
    gameComplete = false;
    timesCompleted = 0;
    
    // Game Credits
    textSize(10);
    noStroke();
    textAlign(LEFT, CENTER);
    text("SFX from Freesound.org: \n Retro Reward 1_1 by Joao_Janz \n Hit_01.wav by LittleRobotSoundFactory \n door_open_close by primeval_polypod \n Cartoon jump.wav by Bastianhallo \n Cartoon jump.wav by Bastianhallo \n Lose_Funny_Retro_Video Game by cabled_mess \n Collect special coin.wav by Cabeeno Rossley", 50,height-90);
    
    textAlign(RIGHT, CENTER);
    text("Teddy Bear Waltz Kevin MacLeod \(incompetech.com\) \n Licensed under Creative Commons: By Attribution 3.0 License \n http://creativecommons.org/licenses/by/3.0/", width - 50,height-90);

    pop();
}

function callGameOver()
{
    push();
    fill(0,0,0);
    stroke(255,255,255);
    strokeWeight(5);
    textSize(30);
    textAlign(CENTER, CENTER);
    gameOver = true;
    game_score = 0;
    timesCompleted = 0;
    text("Game Over. Press space to continue", width/2,height/2);
    pop();
}

function callLevelComplete()
{
    push();
    fill(0,0,0);
    stroke(255,255,255);
    strokeWeight(5);
    textSize(30);
    textAlign(CENTER, CENTER);
    if(timesCompleted > 5)
        {
            text("CONGRATULATIONS \n You Completed the game!", width/2,height/2);
            textSize(50);
            text("Your Score: " + game_score, width/2,height/2 +100);
            gameComplete = true;
        }
    else
        {
            text("Level complete. Press space to continue.", width/2,height/2);
        }
    pop();
}

function checkPlayerDie()
{
    if (gameChar_y > height)
    {
        lives -=1;
        if (lives > 0)
        {
            startGame();
        }
    }
}

function startGame()
{
    gameChar_x = width/2;
	gameChar_y = floorPos_y;
    
    enemies = [];
    enemies.push(new Enemy(300,floorPos_y -100, 100),new Enemy(1600,floorPos_y -100, 300),new Enemy(2600,floorPos_y -40, 200),new Enemy(2800,floorPos_y -40, 200));
    
    // Check if the BGM is already playing
    if(music.isPlaying() == false)
        {
            music.loop();
        }
    
    // Checks to see if GameOver. If so, refills lives and restarts the game
    if (gameOver)
        {
            lives = 3;
            gameOver = false;
        }

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;

	// Initialise arrays of scenery objects.
    
    trees_x = [300,500,700,1000,1500,1700,2300,2400];
    
    clouds = [{x_pos: 150, y_pos: 120, size: 1.5},{x_pos: 450, y_pos: 100, size: 1.6},{x_pos: 750, y_pos: 130, size: 1.3},{x_pos: 1020, y_pos: 110, size: 0.9},{x_pos: 1350, y_pos: 100, size: 1.6},{x_pos: 1750, y_pos: 120, size: 1.5},{x_pos: 2150, y_pos: 100, size: 1.6},{x_pos: 2450, y_pos: 130, size: 1.3},{x_pos: 3020, y_pos: 110, size: 0.9},{x_pos: 3550, y_pos: 100, size: 1.6}];
    
    mountains = [{x_pos: 160, width: 250, height: 180},{x_pos: 1020, width: 250, height: 180},{x_pos: 1620, width: 250, height: 180},{x_pos: 2620, width: 250, height: 180},{x_pos: 2920, width: 250, height: 180}];
    
    canyons = [{x_pos: -500,width: 520},{x_pos: 850,width: 80},{x_pos: 2050,width: 120},{x_pos: 2450,width: 20},{x_pos: 3450,width: 120}];
    
    collectables = [{x_pos: 300, y_pos: 415, size: 1, isFound: false},{x_pos: 800, y_pos: 415, size: 1, isFound: false},{x_pos: 1500, y_pos: 415, size: 1, isFound: false},{x_pos: 1700, y_pos: 315, size: 1.5, isFound: false},{x_pos: 2500, y_pos: 415, size: 1, isFound: false},{x_pos: 2750, y_pos: 415, size: 1, isFound: false},{x_pos: 3500, y_pos: 315, size: 2, isFound: false}];
    
    flagpole = {x_pos: 4000, isReached: false}
}