// //Open and connect socket
let socket = io();

//Listen for confirmation of connection
socket.on('connect', function() {
    console.log("Connected");
  });

// Code for an instanse of live web cam
// We got a new stream!
function gotStream(stream, id) {
  // This is just like a video/stream from createCapture(VIDEO)
  
}

let video;
let poseNet;
let currPose;
let noseX = 0;
let noseY = 0;
let canvas2;
let d;
let colors;
let currColor;

function setup() {
  createCanvas(640, 480);

  canvas2 = createGraphics(640, 480);
  canvas2.clear();

  video = createCapture(VIDEO);
  video.hide();

  poseNet = ml5.poseNet(video, modelReady);
  poseNet.flipHorizontal = 1;
  poseNet.on("pose", gotPoses);

  colors = ["#B29DD9", "#FDFD98", "#FE6B64", "#77DD77", "#000000"];

  currColor = "#000000";

  //Socket management
  socket.on('data', function(obj){
      console.log(obj);
      drawPos(obj);
  });
  
  socket.on('clear', clearCanvas);
  
}


function modelReady() {
  console.log("model ready");
}

function gotPoses(poses) {
  if (poses.length > 0) {
    currPose = poses[0].pose;
  }
}

function draw() {
  push();
  translate(width, 0);
  scale(-1, 1);
  //image(video, 0, 0); // why c does not work? puts video on prev picture need to put white screen?
  pop();

  if (currPose) {
    let nosePos = {x: noseX, y: noseY, dist: d};
    noseX = lerp(noseX, currPose.nose.x, 0.7);
    noseY = lerp(noseY, currPose.nose.y, 0.7);

    d = dist(
      currPose.leftEye.x,
      currPose.leftEye.y,
      currPose.rightEye.x,
      currPose.rightEye.y
    );
  
    noStroke();
    colorBox();
    
    image(canvas2, 0, 0);
    canvas2.noStroke();
  
    if (keyIsDown(32)) { 
      socket.emit('data', nosePos);
    } 
    //socket.on('clear', clearCanvas;
  }

  // noStroke();
  // colorBox();

  // image(canvas2, 0, 0);
  // canvas2.noStroke();
  if (keyIsDown(32)) {
    // canvas2.ellipse(noseX, noseY, d * 0.2);
    // noStroke();
  }
}

function clearCanvas() {
   canvas2.clear();
   clear(); //actually needs to clear the 2 canvas
}

function keyPressed() {
  if (key == "c") {
    socket.emit('clear');
    clearCanvas();
    // canvas2.clear();
    // clear(); //actually needs to clear the 2 canvas
  }
  for (i = 0; i < 5; i++) {
    if (key == i + 1) {
      currColor = i;
      canvas2.fill(colors[i]);
    }
  }
}


//color Box where you can choose from 5 different colors and reset the drawing
function colorBox() {
  textAlign(LEFT);
  fill(216, 191, 216);
  rect(0, 0, width, 30);

  stroke(0, 0, 0);
  strokeWeight(1);
  textSize(20);
  fill(0, 0, 0);
  text("c = reset", 490, 20);

  noFill();
  strokeWeight(3);
  rect(70 * currColor, 2, 60, 27);

  for (i = 0; i < 5; i++) {
    fill(0, 0, 0);
    strokeWeight(1);
    text(i + 1 + " = ", 70 * i, 20);
    fill(colors[i]);
    ellipse(70 * i + 45, 15, 20);
  }
}

// Code for an instanse of live web cam
let sketch = function (p) {
  p.myVideo;
  p.otherVideo;

  p.setup = function () {
    let cnv = p.createCanvas(400, 400);
    cnv.position(800, 50);

    p.myVideo = createCapture(VIDEO, function (stream) {
      let p5l = new p5LiveMedia(
        this,
        "CAPTURE",
        stream,
        "CL_room1",
        "https://trusting-aged-opinion.glitch.me/"
      );
      p5l.on("stream", (stream,id) => {
        p.otherVideo = stream;
  //otherVideo.id and id are the same and unique identifiers
        p.otherVideo.hide();
      });
    });
    p.myVideo.muted = true;
    p.myVideo.hide();
  };

  p.draw = function () {
    p.background(220);
    p.stroke(255);

    if (p.myVideo != null) {
      p.image(p.myVideo, 0, 0, p.width/2, p.height); //not proportional for some reason
      p.text("My Video", 10, 10);
    }

    if (p.otherVideo != null) {
      console.log(p.otherVideo);
      
      p.image(p.otherVideo, p.width / 2, 0, p.width / 2, p.height);
      p.text("Their Video", p.width / 2 + 10, 10);
    }
  };
};

let myp5 = new p5(sketch);

function drawPos (nosePos){
  image(canvas2, 0, 0);
  //canvas2.noStroke();
    // if (keyIsDown(32)) {
  console.log("in drawpos",nosePos.x, nosePos.y, nosePos.dist * 0.2)
  canvas2.ellipse(nosePos.x, nosePos.y, nosePos.dist * 0.2);
  noStroke();
  
}
