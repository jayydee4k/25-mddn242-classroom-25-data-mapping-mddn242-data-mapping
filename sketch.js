let sourceImg=null;
let maskImg=null;
let texImg=null;

// change these three lines as appropiate
let sourceFile = "input_m.jpg";
let maskFile   = "mask_m.png";
let outputFile = "Dobson_James_P3.png";
let textureFile = "texture.png"
let maskCenter = null;
let maskCenterSize = null;

function preload() {
  sourceImg = loadImage(sourceFile);
  maskImg = loadImage(maskFile);
  texImg = loadImage(textureFile, () => {
    console.log("Texture loaded successfully");
  }, () => {
    console.error("Error loading texture");
  });
}

function setup () {
  let main_canvas = createCanvas(1920, 1080);
  main_canvas.parent('canvasContainer');

  imageMode(CENTER);
  noStroke();
  background(255, 255, 255);
  sourceImg.loadPixels();
  maskImg.loadPixels();
  texImg.loadPixels();
  colorMode(HSB);

  maskCenterSearch2(20);
}

// let X_STOP = 640;
// let Y_STOP = 480;
let X_STOP = 1920;
let Y_STOP = 1080;
let OFFSET = 0;

function maskCenterSearch(min_width) {
    let max_up_down = 0;
    let max_left_right = 0;
    let max_x_index = 0;
    let max_y_index = 0;

    // first scan all rows top to bottom
    print("Scanning mask top to bottom...")
    for(let j=0; j<Y_STOP; j++) {
      // look across this row left to right and count
      let mask_count = 0;
      for(let i=0; i<X_STOP; i++) {
        let mask = maskImg.get(i, j);
        if (mask[1] > 128) {
          mask_count = mask_count + 1;
        }
      }
      // check if that row sets a new record
      if (mask_count > max_left_right) {
        max_left_right = mask_count;
        max_y_index = j;
      }
    }

    // now scan once left to right as well
    print("Scanning mask left to right...")
    for(let i=0; i<X_STOP; i++) {
      // look across this column up to down and count
      let mask_count = 0;
      for(let j=0; j<Y_STOP; j++) {
        let mask = maskImg.get(i, j);
        if (mask[1] > 128) {
          mask_count = mask_count + 1;
        }
      }
      // check if that row sets a new record
      if (mask_count > max_up_down) {
        max_up_down = mask_count;
        max_x_index = i;
      }
    }

    print("Scanning mask done!")
    if (max_left_right > min_width && max_up_down > min_width) {
      maskCenter = [max_x_index, max_y_index];
      maskCenterSize = [max_left_right, max_up_down];
    }
}

function maskCenterSearch2(min_width) {
  // we store the sum of x,y whereever the mask is on
  // at the end we divide to get the average
  let mask_x_sum = 0;
  let mask_y_sum = 0;
  let mask_count = 0;

  // first scan all rows top to bottom
  print("Scanning mask top to bottom...")
  for(let j=0; j<Y_STOP; j++) {
    // look across this row left to right and count
    for(let i=0; i<X_STOP; i++) {
      let mask = maskImg.get(i, j);
      if (mask[1] > 128) {
        mask_x_sum = mask_x_sum + i;
        mask_y_sum = mask_y_sum + j;
        mask_count = mask_count + 1;
      }
    }
  }

  print("Scanning mask done!")
  if (mask_count > min_width) {
    let avg_x_pos = int(mask_x_sum / mask_count);
    let avg_y_pos = int(mask_y_sum / mask_count);
    maskCenter = [avg_x_pos, avg_y_pos];
    print("Center set to: " + maskCenter);
  }
}

let renderCounter=0;
function draw () {
  angleMode(DEGREES);
  
  let num_lines_to_draw = 40;
  let minPixelSize = 5;  
  let maxPixelSize = 26; 
  let bgPixelSize = 6;  

  // get one scanline
  for(let j=renderCounter; j<renderCounter+num_lines_to_draw && j<Y_STOP; j++) {
    for(let i=0; i<X_STOP; i++) {
      colorMode(RGB);
      let mask = maskImg.get(i, j);
      let tex = texImg.get(int(i-maskCenter[0]/2), int(j-maskCenter[1]/2));
      let pix = sourceImg.get(i, j);
      
      if (mask[1] > 100) {
        // Only apply pixelation to masked areas
        // Generate random pixel size for this block
        let pixelSize = floor(random(minPixelSize, maxPixelSize));
        
        // Process every pixel in the masked area
        // Convert to grayscale
        let gray = (pix[0] + pix[1] + pix[2]) / 3;
        
        // Add random variation to the grayscale value
        let randomVariation = random(-30, 30);
        gray = constrain(gray + randomVariation, 0, 255);
        
        // Quantize the color to create pixel art effect
        gray = floor(gray / 32) * 32;
        
        if (pix[2] > pix[0] && pix[2] > pix[1]) {
          // Replace blue with dark red
          pix[0] = 139; // Dark red
          pix[1] = 0;   // No green
          pix[2] = 0;   // No blue
        } else {

          let red = random(150, 255);
          let green = random(0, 100);
          let blue = random(0, 50);
          
          // Add some random variation
          let colorVariation = 20;
          red = constrain(red + random(-colorVariation, colorVariation), 150, 255);
          green = constrain(green + random(-colorVariation, colorVariation), 0, 100);
          
          // Directly set the colors without lerp
          pix[0] = red;
          pix[1] = green;
          pix[2] = blue;
        }

        // Only create pixel blocks at the start of each block
        if (i % pixelSize === 0 && j % pixelSize === 0) {
          // Fill the pixel block with the random size
          for(let x = 0; x < pixelSize; x++) {
            for(let y = 0; y < pixelSize; y++) {
              if(i + x < X_STOP && j + y < Y_STOP) {
                set(i + x, j + y, pix);
              }
            }
          }
        }
      } else {
        // Apply black and white with red tint to background
        if (i % bgPixelSize === 0 && j % bgPixelSize === 0) {
          // Convert to grayscale
          let gray = (pix[0] + pix[1] + pix[2]) / 3;
          
          // Add subtle red tint
          let redTint = 20; // Amount of red tint
          pix[0] = constrain(gray + redTint, 0, 255); // Add red
          pix[1] = gray; // Keep green as grayscale
          pix[2] = gray; // Keep blue as grayscale
          
          // Fill the small pixel block
          for(let x = 0; x < bgPixelSize; x++) {
            for(let y = 0; y < bgPixelSize; y++) {
              if(i + x < X_STOP && j + y < Y_STOP) {
                set(i + x, j + y, pix);
              }
            }
          }
        }
      }
    }
  }
  renderCounter = renderCounter + num_lines_to_draw;
  updatePixels();

  // Draw pixelated texture overlay on top of everything
  push();
  blendMode(OVERLAY);
  tint(255, 150); // Adjust texture opacity
  
  // Create a temporary graphics buffer for the pixelated texture
  let pixelatedTex = createGraphics(width, height);
  pixelatedTex.loadPixels();
  
  // Apply pixelation to texture
  for(let j = 0; j < height; j += bgPixelSize) {
    for(let i = 0; i < width; i += bgPixelSize) {
      let texPix = texImg.get(i, j);
      // Quantize the texture colors
      texPix[0] = floor(texPix[0] / 16) * 16;
      texPix[1] = floor(texPix[1] / 16) * 16;
      texPix[2] = floor(texPix[2] / 16) * 16;
      
      // Fill the pixel block
      for(let x = 0; x < bgPixelSize; x++) {
        for(let y = 0; y < bgPixelSize; y++) {
          if(i + x < width && j + y < height) {
            pixelatedTex.set(i + x, j + y, texPix);
          }
        }
      }
    }
  }
  pixelatedTex.updatePixels();
  
  // Draw the pixelated texture
  image(pixelatedTex, width/2, height/2, width, height);
  pop();

  if(renderCounter > Y_STOP) {
    console.log("Done!")
    noLoop();
    // uncomment this to save the result
   saveArtworkImage(outputFile);
  }
}

function keyTyped() {
  if (key == '!') {
    saveBlocksImages();
  }
}

function mousePressed() {
  renderCounter = 0;
  loop();
}