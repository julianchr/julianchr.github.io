/* Based off of: Quadrilateral Transform - (c) Ken Nilsen, CC3.0-Attr */
var rocket = {
    x : 220,
    y : 520,
    displayX : 400,
    displayY : 400,
    image : new Image(),
    speed: 0.0,
    maxSpeed: 2.0,
    speedLimit: 4.5,
    time: 0,
    refreshTimer: 0,
};
rocket.image.src = 'images/rocket.png';

var alice = {
    x : 150,
    y : 525,
    time: 0
};

var bob = {
    x : 635,
    y : 145,
    time: 0
};

var mouse = {
    x : null,
    y : null,
    down: false,   
}

var speedSlider = document.getElementById("speed");
var label = document.getElementById("speed-label");
label.innerHTML = "speed: " +  Math.floor(rocket.speedLimit * (speedSlider.value)) / 500 + "c";

// Update the current slider value (each time you drag the slider handle)
speedSlider.oninput = function() {
    rocket.maxSpeed = this.value * rocket.speedLimit / 100
    label.innerHTML = "speed: " + Math.floor(rocket.speedLimit * (this.value)) / 500 + "c";
};

// Get today's date and time
var startTime = new Date().getTime();

var img = new Image();  img.onload = go;
img.src = "images/grid_planet.png";

function resetTime() {
    rocket.time = 0;
    alice.time = 0;
    bob.time = 0;
}

function go() {
    var me = this,
        c = document.querySelector("canvas"),
        ctx = c.getContext("2d"),
        corners = [
            {x: 0, y: 0},           // ul
            {x: 800, y: 0},           // ur
            {x: 800, y: 800},          // br
            {x: 0, y: 800}           // bl
        ],
        step = 4;                    // resolution

    update();

    // render image to quad using current settings
    function render() {
        var p1, p2, p3, p4, y1c, y2c, y1n, y2n,
            w = img.width - 1,         // -1 to give room for the "next" points
            h = img.height - 1;

        ctx.clearRect(0, 0, c.width, c.height);

        for(y = 0; y < h; y += step) {
            for(x = 0; x < w; x += step) {
                y1c = lerp(corners[0], corners[3],  y / h);
                y2c = lerp(corners[1], corners[2],  y / h);
                y1n = lerp(corners[0], corners[3], (y + step) / h);
                y2n = lerp(corners[1], corners[2], (y + step) / h);

                // corners of the new sub-divided cell p1 (ul) -> p2 (ur) -> p3 (br) -> p4 (bl)
                p1 = lerp(y1c, y2c,  x / w);
                p2 = lerp(y1c, y2c, (x + step) / w);
                p3 = lerp(y1n, y2n, (x + step) / w);
                p4 = lerp(y1n, y2n,  x / w);

                ctx.drawImage(img, x, y, step, step,  p1.x, p1.y, // get most coverage for w/h:
                    Math.ceil(Math.max(step, Math.abs(p2.x - p1.x), Math.abs(p4.x - p3.x))) + 1,
                    Math.ceil(Math.max(step, Math.abs(p1.y - p4.y), Math.abs(p2.y - p3.y))) + 1);
            }
        }
    }

    function lerp(p1, p2, t) {
        return {
            x: p1.x + (p2.x - p1.x) * t, 
            y: p1.y + (p2.y - p1.y) * t
        }
    }

    // Move rocket in natural Euclidean space
    function moveRocket(speed, x, y, mousex, mousey) {
        var xDiff = mousex - x;
        var yDiff = mousey - y;

        // angle from downwards
        var angle = Math.atan2(xDiff, yDiff);

        rocket.x += (speed * Math.sin(angle))
        rocket.y += (speed * Math.cos(angle))
    }

    function morphSpace(speed, x, y, mousex, mousey) {
        // c = 2 * maxSpeed
        var gamma = 1 / Math.sqrt(1 - ((rocket.speed * rocket.speed) / ((5.0) * (5.0))));

        var xDiff = mousex - x;
        var yDiff = mousey - y;

        // angle from downwards
        var angle = 2 * Math.atan2(xDiff, yDiff);
        
        var ULCornerX = 0;
        var ULCornerY = 0;

        var URCornerX = 0;
        var URCornerY = 0;

        if (angle >= 0 && angle <= Math.PI / 2) {
            ULCornerX = (400 - (400 / gamma)) * Math.sin(angle);
            ULCornerY = 400 - (400 / gamma);
            
            URCornerX = 0;
            URCornerY = (400 - (400 / gamma)) * Math.cos(angle);
        }   
        if (angle >= Math.PI/2 && angle <= Math.PI) {
            ULCornerX = 400 - (400 / gamma);
            ULCornerY = (400 - (400 / gamma)) * Math.sin(angle);

            URCornerX = (400 - (400 / gamma)) * Math.cos(angle);
            URCornerY = 0;
        }   
        if (angle >= Math.PI && angle <= (3 * Math.PI / 2)) {
            ULCornerX = (400 - (400 / gamma)) * Math.cos(angle);
            ULCornerY = 0;

            URCornerX = (400 - (400 / gamma));
            URCornerY = (400 - (400 / gamma)) * Math.sin(angle);
        }   
        if (angle >= (3 * Math.PI / 2) && angle <= 2 * Math.PI) {
            ULCornerX = 0;
            ULCornerY = (400 - (400 / gamma)) * Math.cos(angle);

            URCornerX = (400 - (400 / gamma)) * Math.sin(angle);
            URCornerY = (400 - (400 / gamma));
        }
        if (angle <= -(3 * Math.PI / 2) && angle >= (-2 * Math.PI)) {
            ULCornerX = (400 - (400 / gamma)) * Math.sin(angle);
            ULCornerY = (400 - (400 / gamma));

            URCornerX = 0;
            URCornerY = (400 - (400 / gamma)) * Math.cos(angle);
        }
        if (angle <= -(Math.PI) && angle >= (-3 * Math.PI / 2)) {
            ULCornerX = (400 - (400 / gamma));
            ULCornerY = (400 - (400 / gamma)) * Math.sin(angle);

            URCornerX = (400 - (400 / gamma)) * Math.cos(angle);
            URCornerY = 0;
        }
        if (angle <= (-Math.PI / 2) && angle >= (-Math.PI)) {
            ULCornerX = (400 - (400 / gamma)) * Math.cos(angle);
            ULCornerY = 0;

            URCornerX = (400 - (400 / gamma));
            URCornerY = (400 - (400 / gamma)) * Math.sin(angle);
        }
        if (angle <= 0 && angle >= (-Math.PI / 2)) {
            ULCornerX = 0;
            ULCornerY = (400 - (400 / gamma)) * Math.cos(angle);

            URCornerX = (400 - (400 / gamma)) * Math.sin(angle);
            URCornerY = (400 - (400 / gamma));
        }

        if (ULCornerX < 0) {
            ULCornerX = -ULCornerX;
        }
        if (ULCornerY < 0) {
            ULCornerY = -ULCornerY;
        }

        if (URCornerX < 0) {
            URCornerX = -URCornerX;
        }
        if (URCornerY < 0) {
            URCornerY = -URCornerY;
        }

        corners[0].x = ULCornerX;
        corners[0].y = ULCornerY;

        corners[1].x = 800 - URCornerX;
        corners[1].y = URCornerY;

        corners[2].x = 800 - ULCornerX;
        corners[2].y = 800 - ULCornerY;

        corners[3].x = URCornerX;
        corners[3].y = 800 - URCornerY;
    }

    function morphTime(speed) {
        // c = 5.0
        var gamma = 1 / Math.sqrt(1 - ((rocket.speed * rocket.speed) / ((5.0) * (5.0))));

        var currentTime = new Date().getTime();
        var timeDiff = currentTime - startTime;
        startTime = currentTime;

        alice.time += (timeDiff / 1000);
        bob.time += (timeDiff / 1000);
        rocket.time += (timeDiff / 1000) / gamma;
    }

    function drawImageLookat(img, x, y, lookx, looky){
        var yTop = lerp(corners[0], corners[3],  y / 800);
        var yBottom = lerp(corners[1], corners[2],  y / 800);
        var p = lerp(yTop, yBottom,  x / 800);

        rocket.displayX = p.x;
        rocket.displayY = p.y;

        ctx.setTransform(1, 0, 0, 1, rocket.displayX, rocket.displayY);
        ctx.rotate(Math.atan2(looky - rocket.displayY, lookx - rocket.displayX) + Math.PI / 4); // Adjust image 45 degree clockwise (PI/4) because the image is pointing in the wrong direction.
        ctx.drawImage(img, -35, -35, 70, 70);
        ctx.setTransform(1, 0, 0, 1, 0, 0); // restore default not needed if you use setTransform for other rendering operations

        ctx.font = "30px Arial";
        ctx.fillStyle = "#ecf0f1";
        ctx.textAlign = "center";
        ctx.fillText(Math.floor(rocket.time), rocket.displayX, rocket.displayY + 50);

        ctx.font = "25px Arial";
        var yTop = lerp(corners[0], corners[3],  alice.y / 800);
        var yBottom = lerp(corners[1], corners[2],  alice.y / 800);
        var dispAliceP = lerp(yTop, yBottom,  alice.x / 800);
        ctx.fillText(Math.floor(alice.time), dispAliceP.x, dispAliceP.y);

        var yTop = lerp(corners[0], corners[3],  bob.y / 800);
        var yBottom = lerp(corners[1], corners[2],  bob.y / 800);
        var dispBobP = lerp(yTop, yBottom,  bob.x / 800);
        ctx.fillText(Math.floor(bob.time), dispBobP.x, dispBobP.y);
    }

    function drawCrossHair(x,y,color){
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x + 5, y);
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x, y + 5);
        ctx.stroke();
    }

    // handle mouse
    c.onmousedown = function(e) {
        var bounds = c.getBoundingClientRect();
        mouse.x = e.pageX - bounds.left;
        mouse.y = e.pageY - bounds.top;

        if (!(mouse.x < 0 || mouse.x > 800 || mouse.y < 0 || mouse.y > 800)) {
            mouse.down = true;
            rocket.speed = 0.3;
        }
    }

    window.onmousemove = function(e) {
        var bounds = c.getBoundingClientRect();
        mouse.x = e.pageX - bounds.left;
        mouse.y = e.pageY - bounds.top;
    }

    window.onmouseup = function() {
        mouse.down = false;
    }
    
    function update() {
        if (mouse.down) {
            rocket.speed = rocket.speed + 0.3;
            if (rocket.speed > rocket.maxSpeed) {
                rocket.speed = rocket.maxSpeed;
            }
        }

        if (!mouse.down) {
            rocket.speed = rocket.speed - 0.3;
            if (rocket.speed < 0) {
                rocket.speed = 0.0;
            }
        }
        morphSpace(rocket.speed, rocket.x, rocket.y, mouse.x, mouse.y);
        morphTime(rocket.speed);

        render();

        // get mouse canvas coordinate correcting for page scroll
        var x = mouse.x
        var y = mouse.y
        drawImageLookat(rocket.image, rocket.x, rocket.y, x ,y);
        // Draw mouse at its canvas position
        drawCrossHair(x,y,"#ecf0f1");

        moveRocket(rocket.speed, rocket.x, rocket.y, mouse.x, mouse.y);
    
        // draw line from rocket center to mouse to check alignment is perfect
        ctx.strokeStyle = "#ecf0f1";
        ctx.beginPath();
        ctx.globalAlpha = 0.2;
        ctx.moveTo(rocket.displayX, rocket.displayY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalAlpha = 1;

        requestAnimationFrame(update.bind(me));
    }
}