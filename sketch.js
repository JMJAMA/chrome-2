

let video;     // webcam input
let model;     // PoseNet machine-learning model
let skeleton;  // detected skeleton
let slider,slider1,slider2,slider3;

let button,button1,button2,button3;

let font;


let firstSkeleton = true;

function preload(){

  font = loadFont("HelveticaNeueLTStd-Ex.otf");
}


function setup() {
  createCanvas(displayWidth, displayHeight);

  // type setup --------------------------------
 

 
 



  //type setup ---------------------------------

  video = createCapture(VIDEO);
  video.size(displayWidth,displayHeight);
  video.hide();

  
  
  
  slider = createSlider(0, 20, 1000);
  slider.position(10, 10);
  slider.style('width', '80px');

  slider1 = createSlider(0, 255, 40);
  slider1.position(10, 20);
  slider1.style('width', '80px');
  
  slider2 = createSlider(0, 255, 40);
  slider2.position(10, 30);
  slider2.style('width', '80px');

  slider3 = createSlider(0, 255, 100);
  slider3.position(10, 40);
  slider3.style('width', '80px');

  // load the PoseNet model
  model = ml5.poseNet(video, { maxPoseDetections: 1 } );
  
  // when it has a new pose (skeleton), this 
  // function will be run!
  // (basically we just grab the first prediction,
  // since we only want one skeleton)
  model.on('pose', function(predictions) {
    skeleton = predictions[0];
  });

  
}


function draw() {
  if (video.loadedmetadata) {
    image(video, 0,0, displayWidth,displayHeight);
  }
  if (skeleton !== undefined) {

    // if this is the first face we've
    // found, print the info
    if (firstSkeleton) {
      console.log(skeleton);
      firstSkeleton = false;
    }

    // the skeleton includes a list of 17 keypoints,
    // or named locations on the body – let's see them!
    fill(255);
    noStroke();
    for (let pt of skeleton.pose.keypoints) {
      
      // the points in PoseNet are in a different
      // format than in our face examples – they
      // include a 'part' (rightShoulder, etc), a
      // 'score' (confidence that this is correct)
      // and a position

      pt = scalePoint(pt.position);
      //circle(pt.x, pt.y, 20);
    }

    // we can also get specific points!
    let leftEye =  skeleton.pose.leftEye;
    let rightEye = skeleton.pose.rightEye;
    let leftHand = skeleton.pose.leftWrist;

    // only display if the confidence level is high enough
    // if (rightWrist.confidence > 0.3 && leftWrist.confidence > 0.3) {
      
      // grab the position from the wrists and convert into
      // a vector (which will let us do fancier math below)
      let l = createVector(leftEye.x, leftEye.y);
      //l = scalePoint(l);
      
      let r = createVector(rightEye.x, rightEye.y);
      //r = scalePoint(r);

      let lh = createVector(leftHand.x, leftHand.y);
      
      stroke(255);
      //strokeWeight(6);

      var d = dist(leftEye.x,leftEye.y,rightEye.x,rightEye.y);
      rectMode(CENTER);
      noFill();
      rect(leftEye.x-d/2, leftEye.y-10, displayWidth/6, displayHeight/6);
      
      
      push();

      let val = slider.value();

      let windowW = displayWidth/val;
      let windowH = displayHeight/val;
      
      
      //..............
        
      copy(leftEye.x-d/2-windowW/2, leftEye.y-windowH/2+10, windowW, windowH,0,0,displayWidth,displayHeight);


      //..............


       //EXCLUSION lendMode control slider
       push();
       //image(video,0,0,width/2,height/2);
        fill(val,51, 51, 255);
        blendMode(HARD_LIGHT);
        noStroke();
        //rect(0,0,displayWidth,displayHeight);
       pop();


        let val1 = slider1.value();

       //EXCLUSION lendMode control slider
       push();
       //image(video,width/2,0,width/2,height/2);
        fill(val1,51, 51, 255);
        fill(val1,255, 51, 0);
        blendMode(EXCLUSION);
       pop();

        let val2 = slider2.value();

       //EXCLUSION lendMode control slider
        fill(val2, 102, 255, 51);
        blendMode(DIFFERENCE);


        let val3 = slider3.value();

       //EXCLUSION lendMode control slider
        fill(val3, 255, 0, 255);
        blendMode(DIFFERENCE);


        rect(width/2,height/2,displayWidth,displayHeight);
      


    pop();

    //image(video, 0,0, displayWidth/5,displayHeight/5);
    
    push();
    scale(1/5);
    strokeWeight(10);
    stroke(255);
    //rect(leftEye.x-d/2, leftEye.y-10, displayWidth/6, displayHeight/6);
    

    
    pop();



    
    

      // bonus!
      // we can use the dist() and angleBetween() functions
      // to calculate useful measurements between points!
      // let a = l.angleBetween(r);  // angle (in radians)
      //let d = l.dist(r);          // distance too!

      
      fill(255);
      noStroke();
      rectMode(CENTER);
      fill(204, 255, 51);
      textFont(font);
      textSize(12);
      //text(leftEye.x,width/2+50,50);
      //text(leftEye.y,width/2+50,60);

      textSize(20);
      textAlign(LEFT,TOP);

      
      
     
      
      //text('Angle: ' + nf(degrees(a), 0,2) + 'º\nDist: ' + nf(d, 0,2) + 'px', l.x,l.y);
    // }
    
  }

  var str = ["Do you get aggressive very easily?","Do you always force others to do things your way?","Do you dominate your partner in everything?","Are you sexually aggressive?","Do you believe women to be weaker than men?","Do you hate or feel disgusted by people \nwho are not straight?","Do you indulge in unnecessary fights?","Do you disrespect others who are physically \nweaker than you?","Do people call you a bully?","Do you say whatever you have to say without \ncaring how the other person would feel?","Do you always judge others' masculinity?","Do you shout even when it's not required?","Do you worry about things?","Do you make friends easily?","Do you trust others?","Do you complete tasks successfuly?","Do you get angry easily?","Do you love large parties?","Do you beleive in the importance of art?","Do you use others for your own ends?","Do you like to tidy up?","Do you often feel blue?","Do you take charge?","Do you experience emotions intensley?","Do you love to help others?","Do you keep your promises?","Do you find it difficult to aproach others?","Are you always busy?","Do you prefer variety to routine?"];
  var id = ["T","O","X","I","C"];
  var m = ["M","A","S","C","U","L","I","N","I","T","Y"];


  for(let a = 0; a < str.length; a++){

    let wave = map(cos(radians(frameCount*7 + a*5)),-1,1,-50,50);
    let wave1 = map(cos(radians(frameCount*25 + a*-500)),-1,1,-10,10);
   
  
    if( keyIsPressed && key == '1'){
    textLeading(20)
    text(str[0], width/2-230,height/2);
    }

    else if( keyIsPressed && key == '2'){
      textLeading(20)
      text(str[1], width/2-230,height/2);
      }

      if( keyIsPressed && key == '3'){
        textLeading(20)
        text(str[2], width/2-230,height/2);
        }

        if( keyIsPressed && key == '4'){
          textLeading(20)
          text(str[3], width/2-230,height/2);
          }

          if( keyIsPressed && key == '5'){
            textLeading(20)
            text(str[4], width/2-230,height/2);
            }


            if( keyIsPressed && key == '6'){
              textLeading(20)
              text(str[5], width/2-230,height/2);
              }

              if( keyIsPressed && key == '7'){
                textLeading(20)
                text(str[6], width/2-230,height/2);
                }

                if( keyIsPressed && key == '8'){
                  textLeading(20)
                  text(str[7], width/2-230,height/2);
                  }

                  if( keyIsPressed && key == '9'){
                    textLeading(20)
                    text(str[8], width/2-230,height/2);
                    }

                    if( keyIsPressed && key == '0'){
                      textLeading(20)
                      text(str[9], width/2-230,height/2);
                      }

                      if( keyIsPressed && key == 'q'){
                        textLeading(20)
                        text(str[10], width/2-230,height/2);
                        }
                    
                    

    push();
    textSize(30);
    text(id[a],width/2-340,50+a*700/id.length+wave1);
    text(m[a],width/2+340,50+a*300/id.length+wave1);
    pop();
  }

 
  
}


// note: this is a little different than the previous
// versions of this function, since the position from
// PostNet has separate x/y variables
function scalePoint(pt) {
  let x = map(pt.x, 0,video.width, 0,width);
  let y = map(pt.y, 0,video.height, 0,height);
  return createVector(x, y);
}


