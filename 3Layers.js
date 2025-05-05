let sourceImg=null;
let maskImg=null;
let renderCounter=0;
let curLayer = 0;

// change these three lines as appropiate
let sourceFile = "input_1.jpg";
let maskFile   = "mask_1.png";
let outputFile = "output_1.png";

function preload() {
  sourceImg = loadImage(sourceFile);
  maskImg = loadImage(maskFile);
}

function setup () {
  let main_canvas = createCanvas(1920, 1080);
  main_canvas.parent('canvasContainer');

  imageMode(CENTER);
  noStroke();
  background(0, 0, 128);
  sourceImg.loadPixels();
  maskImg.loadPixels();
  colorMode(HSB);
}

function draw () {
  if (curLayer == 0) {
    let num_lines_to_draw = 40;
    // get one scanline
    for(let j=renderCounter; j<renderCounter+num_lines_to_draw && j<1080; j++) {
      for(let i=0; i<1920; i++) {
        colorMode(RGB);
        let pixData = sourceImg.get(i, j);
        // create a color from the values (always RGB)
        let col = color(pixData);
        //let maskData = maskImg.get(i, j);

        colorMode(HSB, 360, 100, 100);
        // draw a "dimmed" version in gray
        let h = hue(col);
        let s = saturation(col);
        let b = brightness(col);

        let new_brt = map(b, 0, 100, 30, 50);
        let new_col = color(h, 0, new_brt);
        set(i, j, new_col);
      }
    }
    renderCounter = renderCounter + num_lines_to_draw;
    updatePixels();
  }
  else if (curLayer == 1) {
    for(let i=0; i<500; i++) {
      let x1 = random(0, width);
      let y1 = random(0, height);
      let maskData = maskImg.get(x1, y1);
      if(maskData[1] > 128) {
        let x2 = x1 + random(-20, 20);
        let y2 = y1 + random(-20, 20);
        colorMode(RGB);
        stroke(255, 255, 0);
        line(x1, y1, x2, y2);
      }
    }
    renderCounter = renderCounter + 1;
  }
  else {
    rectMode(CORNERS);
    for(let i=0; i<100; i++) {
      let x1 = random(0, width);
      let y1 = random(0, height);
      let x2 = x1 + random(-10, 10);
      let y2 = y1 + random(-10, 10);
      colorMode(RGB);
      let pixData = sourceImg.get(x1, y1);
      let maskData = maskImg.get(x1, y1);
      let col = color(pixData);
      stroke(col);
      fill(col);
      if(maskData[1] < 128) {
        line(x1, y1, x2, y2);
      }
      else {
        rect(x1, y1, x2, y2);
      }
    }
    renderCounter = renderCounter + 1;
    // set(i, j, new_col);
  }
  // print(renderCounter);
  if(curLayer == 0 && renderCounter > 1080) {
    curLayer = 1;
    renderCounter = 0;
    print("Switching to curLayer 1");
  }
  if(curLayer == 1 && renderCounter > 500) {
    curLayer = 2;
    renderCounter = 0;
    print("Switching to curLayer 2");
  }
  else if(curLayer == 2 && renderCounter > 1500) {
    console.log("Done!")
    noLoop();
    // uncomment this to save the result
    // saveArtworkImage(outputFile);
  }
}

function keyTyped() {
  if (key == '!') {
    saveBlocksImages();
  }
}
