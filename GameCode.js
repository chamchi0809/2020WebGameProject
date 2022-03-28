window.onload=startGame;  
        //movement
        var pYSpeed=0;      
        var pXSpeed=300;  
        var maxPXSpeed=700;
        var speedMultiplier = 1;
        //key input        
        var jumpKey = 38;
        var slideKey = 40;
        var pressedSlide = false;
        var pressedJump = false;
        var jumpCount=0;
        //system
        var deltaTime = 1/100;        
        var gameFrames=0;
        //obstacles
        var obstacles=new Array();
        var dashObstacles=new Array;
        var frameNum=0;
        var spawnDelay = 2.5;
        var spawnTimer = 0;
        var minSpawnDelay = 1.75;
        //death
        var deathMenu;
        //reverse
        var reversed = false;
        var reverseTimer = 60;        
        var flipping = false;
        //sliding
        var sliding = false;
        //dashing
        var dashTimer = 0;
        var dashCoolDownTimer = 0;    
        var dashTrails = new Array();  
        //score
        var score = 0;  
        var scoreText;
        //images
        var spam, hangwa, samgyupsal, riceCake, bg, woodenTable;
        //SFXs
        var dashSFX, jumpSFX, slideSFX;

        function startGame(){       
            //get images
            spam = document.getElementById("player");     
            hangwa = document.getElementById("hangwa");
            samgyupsal = document.getElementById("samgyupsal");
            riceCake = document.getElementById("riceCake");
            bg = document.getElementById("bg");
            woodenTable = document.getElementById("woodenTable");

            //get SFXs
            dashSFX = document.getElementById("dashSFX");
            jumpSFX = document.getElementById("jumpSFX");
            slideSFX = document.getElementById("slideSFX");

            //get highscore
            if(localStorage.getItem("highscore")==null)
                localStorage.setItem("highscore", 0);      
                
            //hide death menu
            deathMenu = document.getElementById("deathMenu");
            deathMenu.style.display="none";

            //get score text
            scoreText = document.getElementById("score");
            
            //generate components
            player=new component(60,60,spam, 100,250);
            ground=new component(1280,50,woodenTable, 0,548-50 );
            ceiling=new component(1280,50,woodenTable, 0,0);
            background = new component(1280, 548-ground.height*2, bg, 0,ground.height);
            gameArea.start();            
        }
        var gameArea={
            canvas:document.getElementById("canvas"),
            start: function(){
                this.ctx=canvas.getContext("2d");    
                this.interval = setInterval(updateGameArea,10);       
                document.addEventListener("keydown",keyDownHandler, false);	
		        document.addEventListener("keyup",keyUpHandler, false);	                                   
            },
            clear:function(){
                this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
            }
        }
        function component(width, height, img, x, y) {
            this.width = width;
            this.height = height;
            this.x = x;
            this.y = y;
            this.update = function(){
                var ctx = gameArea.ctx;                 
                if(flipping){
                    gameArea.ctx.save();
                    gameArea.ctx.translate(this.x, this.y);            
                    gameArea.ctx.scale(1,-1);  
                    ctx.drawImage(img, 0,0-this.height, this.width, this.height);
                    gameArea.ctx.restore();
                }
                else
                    ctx.drawImage(img, this.x, this.y, this.width, this.height);
            }   
            this.crashWith = function(otherobj) {
                var myleft = this.x;
                var myright = this.x + (this.width);
                var mytop = this.y;
                var mybottom = this.y + (this.height);
                var otherleft = otherobj.x;
                var otherright = otherobj.x + (otherobj.width);
                var othertop = otherobj.y;
                var otherbottom = otherobj.y + (otherobj.height);
                var crash = true;
                if ((mybottom < othertop) ||
                (mytop > otherbottom) ||
                (myright < otherleft) ||
                (myleft > otherright)) {
                    crash = false;
                }
                return crash;
            }         
        }   
        function componentTrail(width, height, img, x, y, startOpacity, lifeTime) {
            this.width = width;
            this.height = height;
            this.x = x;
            this.y = y;
            this.startOpacity = startOpacity;
            this.lifeTimer = lifeTime;
            this.lifeTime=lifeTime;
            this.update = function(){
                if(this.lifeTimer > 0.01)
                    this.lifeTimer -= deltaTime;
                else{
                    this.lifeTimer=0;
                    dashTrails.shift();
                }
                var ctx = gameArea.ctx;     
                ctx.globalAlpha = (this.lifeTimer/this.lifeTime) * this.startOpacity;  
                this.width = width * ((this.lifeTimer/this.lifeTime)*0.5+0.5);
                this.height = height * ((this.lifeTimer/this.lifeTime)*0.5+0.5);                    
                if(flipping){
                    gameArea.ctx.save();
                    gameArea.ctx.translate(this.x, this.y);            
                    gameArea.ctx.scale(1,-1);  
                    ctx.drawImage(img, 0,0-this.height-(height-this.height)/2, this.width, this.height);
                    gameArea.ctx.restore();
                }
                else
                    ctx.drawImage(img, this.x, this.y + (height-this.height)/2, this.width, this.height);
                ctx.globalAlpha=1;
            }          
        }    
        function componentRect(width, height, color="FFFFFF", x, y) {
            this.width = width;
            this.height = height;
            this.x = x;
            this.y = y;
            this.color=color;
            this.update = function(){
                var ctx = gameArea.ctx;    
                ctx.fillStyle=this.color;        
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }   
            this.crashWith = function(otherobj) {
                var myleft = this.x;
                var myright = this.x + (this.width);
                var mytop = this.y;
                var mybottom = this.y + (this.height);
                var otherleft = otherobj.x;
                var otherright = otherobj.x + (otherobj.width);
                var othertop = otherobj.y;
                var otherbottom = otherobj.y + (otherobj.height);
                var crash = true;
                if ((mybottom < othertop) ||
                (mytop > otherbottom) ||
                (myright < otherleft) ||
                (myleft > otherright)) {
                    crash = false;
                }
                return crash;
            }         
        }    
        function endGame(){
            clearInterval(gameArea.interval); 
            if(localStorage.getItem("highscore")<score)
                localStorage.setItem("highscore", score.toFixed(0));
            scoreText.innerHTML = "점수: "+score.toFixed(0)+"<br>"+"최고점수: "+localStorage.getItem("highscore");
            deathMenu.style.display="flex";
        }
        function updateGameArea(){

            gameArea.clear(); //clear canvas
            updatePhysics(); //update physics
            //obstacle collision
            for(var i = 0; i < obstacles.length; i++){
                if(player.crashWith(obstacles[i]))
                    endGame();                   
            }
            for(var i = 0; i < dashObstacles.length; i++){
                if(player.crashWith(dashObstacles[i]))
                {
                    if(dashTimer > 0){
                        dashCoolDownTimer = 0;
                        jumpCount = 1;
                    }
                    else
                        endGame();                   
                } 
                    
            }
            //increase speed
            if(pXSpeed < maxPXSpeed)
                pXSpeed += 300 * (1.5/100) * deltaTime;
            //decrease spawn delay
            if(spawnDelay > minSpawnDelay)
                spawnDelay -= 1.75 * (1.5/100) * deltaTime;
            //spawn obstacles
            spawnTimer -= speedMultiplier * deltaTime;
            if(spawnTimer <= 0 && reverseTimer >= 3){ 
                console.log("spawned!");
                spawnTimer = spawnDelay;
                if(Math.random()<=1/3.0){
                    obstacles.push(new component(60, 100, hangwa, 1280, 548-100-ground.height));                    
                    obstacles.push(new component(60, 100, hangwa, 1280, ground.height));                    
                }                
                else if(Math.random()<=2/3.0)
                    obstacles.push(new component(80, 385, samgyupsal, 1280, 548/2-385/2));
                else
                    dashObstacles.push(new component(80, 500, riceCake, 1280, 548/2-250));
            }
            //delete obstacles
            if(obstacles.length > 6)
                obstacles.shift();
            if(dashObstacles.length > 3)
                dashObstacles.shift();
            //reverse
            if(!reversed){
                jumpKey = 38;
                slideKey = 40;
            }
            else{
                jumpKey = 40;
                slideKey = 38;
            }
            reverseTimer -= deltaTime;
            if(reverseTimer < 0){
                reversed = !reversed;
                pressedSlide=false;
                pressedJump=false;
                if(sliding){
                    player.y -= 30;
                    pressedJump = true;
                }
                reverseTimer = 60;
            }
            //dashing
            dashTimer -= deltaTime;
            dashCoolDownTimer -= deltaTime;
            if(dashTimer > 0){
                speedMultiplier = 4;
            }
            else
                speedMultiplier = 1;
            //score
            score += 10 * deltaTime;
            //#region render objects
            background.update();
            ground.update();            
            ceiling.update();
            
            for(var i = 0; i < obstacles.length; i++){
                obstacles[i].x -= pXSpeed*speedMultiplier*deltaTime;    
                if(obstacles[i].y == 548-100-ground.height)
                flipping = true;     
                obstacles[i].update(); 
                flipping = false;
            }
            for(var i = 0; i < dashObstacles.length; i++){
                dashObstacles[i].x -= pXSpeed*speedMultiplier*deltaTime;      
                dashObstacles[i].update();               
            }
            //#region render player                  
            if(pressedSlide){
                if(player.crashWith(ground) || player.crashWith(ceiling)){
                    player.height = 30;
                    if(!sliding){
                        slideSFX.load();
                        slideSFX.volume=.1;
                        slideSFX.play();
                        if(!reversed)
                            player.y += 30;
                        sliding = true;
                    }
                }
            }
            else{
                player.height = 60;
                if(sliding){
                    if(!reversed)
                        player.y -= 30;
                    sliding = false;
                }
            }
            if(reversed)                                             
            flipping = true;   
            if(dashTimer > 0){
                gameArea.ctx.globalAlpha = 0.5;

            }
            player.update();    
            gameArea.ctx.globalAlpha = 1;
            flipping = false;    

            //generate dash trail
            if(dashTimer > 0){
                dashTrails.push(new componentTrail(player.width,player.height,spam,player.x,player.y,.5,.1));
                for(var i; i< dashTrails.length; i++){
                    dashTrails[i].x -= pXSpeed*speedMultiplier*deltaTime;
                    if(reversed)
                        flipping = true;
                    dashTrails[i].update();
                    flipping = false;
                }
            }

            //print dash cooldown
            gameArea.ctx.fillStyle="black";          
            gameArea.ctx.font = "20px Gugi Regular";
            gameArea.ctx.textBaseline="middle";
            gameArea.ctx.textAlign="center";
            if(dashCoolDownTimer > 0)
                gameArea.ctx.fillText("대쉬 쿨타임: "+dashCoolDownTimer.toFixed(1),640, 548-ground.height/2);                                            
            else
                gameArea.ctx.fillText("대쉬 쿨타임: 0.0",640, 548-ground.height/2);        
            //print score
            gameArea.ctx.fillText("점수: "+ score.toFixed(0),640, ground.height/2);                                                    
            //#endregion
            
            //#endregion

            //add frame
            gameFrames+=1;
        } 
        
        function updatePhysics(){
            player.y+=pYSpeed*deltaTime;    
            if(!reversed){
                if(!player.crashWith(ground)){
                    if(dashTimer <= 0)
                        pYSpeed+=9.81*125*deltaTime;
                }
                else{
                    jumpCount=0;
                    pYSpeed=0;
                    player.y=ground.y-player.height;
                }
            }
            else{
                if(!player.crashWith(ceiling)){
                    if(dashTimer <= 0)
                        pYSpeed-=9.81*125*deltaTime;
                }
                else{
                    jumpCount=0;
                    pYSpeed=0;
                    player.y=ceiling.y+ceiling.height;
                }
            }
        }
        function keyDownHandler(event){            
            if(event.keyCode == jumpKey && !pressedJump && jumpCount < 2){
                if(!player.crashWith(ground) && !player.crashWith(ceiling)){
                    if(dashCoolDownTimer < 0){
                        dashTimer=.25;
                        dashCoolDownTimer=5;
                        dashSFX.load();
                        dashSFX.volume = .1;
                        dashSFX.setAttribute("src", "./Whoosh 6_" + Math.floor(Math.random()*5+1) + ".wav");
                        dashSFX.play();
                        pYSpeed = 0;
                    }
                }
                else{
                    jumpSFX.load();
                    jumpSFX.volume = .1;
                    jumpSFX.play();
                    if(!reversed)
                        pYSpeed=-650;
                    else
                        pYSpeed=650;
                }
                pressedJump = true;
                jumpCount++;
                console.log(jumpCount);
            }            
            if(event.keyCode == slideKey){
                pressedSlide = true;
            }
        }
        function keyUpHandler(event){       
            if(event.keyCode == jumpKey){                
                pressedJump = false;
            }     
            if(event.keyCode == slideKey){                
                pressedSlide = false;
            }
        }