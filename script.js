// webgl qna creating a smudge liquify effect example 3
// from https://webglfundamentals.org/webgl/webgl-qna-creating-a-smudge-liquify-effect-example-3.html


var vs = `
attribute vec4 position;

uniform mat4 u_matrix;

void main() {
  gl_Position = u_matrix * position;
}
`;

var fs = `
precision mediump float;

uniform vec4 u_color;

void main() {
  gl_FragColor = u_color;
}
`;
var vsQuad = `
attribute vec4 position;
attribute vec2 texcoord;

uniform mat4 u_matrix;

varying vec2 v_texcoord;

void main() {
  gl_Position = u_matrix * position;
  v_texcoord = texcoord;
}
`;
var fsFade = `
precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_texture;
uniform float u_mixAmount;

const float kEpsilon = 2./256.;

void main() {
  vec4 color = texture2D(u_texture, v_texcoord) * 2. - 1.;
  vec4 adjust = -color * u_mixAmount;
  adjust = mix(adjust, sign(color) * -kEpsilon, step(abs(adjust), vec4(kEpsilon)));
  color += adjust;
  gl_FragColor = color * .5 + .5;
}
`;
var fsDisplace = `
precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_texture;
uniform sampler2D u_displacementTexture;
uniform vec2 u_displacementRange;

void main() {

  // assuming the displacement texture is the same size as 
  // the main texture you can use the same texture coords

  // first look up the displacement and convert to -1 <-> 1 range
  // we're only using the R and G channels which will become U and V
  // displacements to our texture coordinates
  vec2 displacement = texture2D(u_displacementTexture, v_texcoord).rg * 2. - 1.;

  vec2 uv = v_texcoord + displacement * u_displacementRange;

  gl_FragColor = texture2D(u_texture, uv);
}
`;

var $ = document.querySelector.bind(document);

var mixAmount = 0.03;

var gl = $("canvas").getContext("webgl");
var m4 = twgl.m4;
var programInfo = twgl.createProgramInfo(gl, [vs, fs]);
var fadeProgramInfo = twgl.createProgramInfo(gl, [vsQuad, fsFade]);
var displaceProgramInfo = twgl.createProgramInfo(gl, [vsQuad, fsDisplace]);

// this will be replaced when the image has loaded;
var img = { width: 1, height: 1 };

const tex = twgl.createTexture(gl, {
  src: 'https://live.staticflickr.com/65535/53023644227_805bd4e102_k.jpg',
  crossOrigin: '',
}, function(err, texture, source) {
  img = source;                               
});

// Creates a -1 to +1 quad
var quadBufferInfo = twgl.primitives.createXYQuadBufferInfo(gl);

// Creates 2 RGBA texture + depth framebuffers
var fadeAttachments = [
  { format: gl.RGBA, 
    min: gl.NEAREST, 
    max: gl.NEAREST, 
    wrap: gl.CLAMP_TO_EDGE, 
  },
];
var fadeFbi1 = twgl.createFramebufferInfo(gl, fadeAttachments);
var fadeFbi2 = twgl.createFramebufferInfo(gl, fadeAttachments);

function drawThing(gl, x, y, rotation, scale, color) {
  var matrix = m4.ortho(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
  matrix = m4.translate(matrix, [x, y, 0]);
  matrix = m4.rotateZ(matrix, rotation);
  matrix = m4.scale(matrix, [scale, scale, 1]);

  gl.useProgram(programInfo.program);
  twgl.setBuffersAndAttributes(gl, programInfo, quadBufferInfo);
  twgl.setUniforms(programInfo, {
    u_matrix: matrix,
    u_color: color,
  });
  twgl.drawBufferInfo(gl, quadBufferInfo);
}

function rand(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return min + Math.random() * (max - min);
}

var drawRect = false;
var rectX;
var rectY;
var currentMatrix;

function render(time) {
  if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
    // set the clear color to 0.5 which is 0 displacement
    // for our shader
    gl.clearColor(0.5, 0.5, 0.5, 0.5);
    // resize the framebuffer's attachments so their the
    // same size as the canvas
    twgl.resizeFramebufferInfo(gl, fadeFbi1, fadeAttachments);
    // clear the color buffer to 0.5
    twgl.bindFramebufferInfo(gl, fadeFbi1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // resize the 2nd framebuffer's attachments so their the
    // same size as the canvas
    twgl.resizeFramebufferInfo(gl, fadeFbi2, fadeAttachments);
    // clear the color buffer to 0.5
    twgl.bindFramebufferInfo(gl, fadeFbi2);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
  
  // fade by copying from fadeFbi1 into fabeFbi2 using mixAmount.
  // fadeFbi2 will contain mix(fadeFb1, u_fadeColor, u_mixAmount)
  twgl.bindFramebufferInfo(gl, fadeFbi2);

  gl.useProgram(fadeProgramInfo.program);
  twgl.setBuffersAndAttributes(gl, fadeProgramInfo, quadBufferInfo);
  twgl.setUniforms(fadeProgramInfo, {
    u_matrix: m4.identity(),
    u_texture: fadeFbi1.attachments[0],
    u_mixAmount: mixAmount,
  });
  twgl.drawBufferInfo(gl, quadBufferInfo);

  if (drawRect) {
    drawRect = false;
    // now draw new stuff to fadeFb2. Notice we don't clear!
    twgl.bindFramebufferInfo(gl, fadeFbi2);

    var rotation = rand(Math.PI);
    var scale = rand(10, 20);
    var color = [rand(1), rand(1), rand(1), 1];
    drawThing(gl, rectX, rectY, rotation, scale, color);
  }

  // now use fadeFbi2 as a displacement while drawing tex to the canvas
  twgl.bindFramebufferInfo(gl, null);
  
  var mat = m4.ortho(0, gl.canvas.clientWidth, gl.canvas.clientHeight, 0, -1, 1);
  mat = m4.translate(mat, [gl.canvas.clientWidth / 2, gl.canvas.clientHeight / 2, 0]);
  mat = m4.scale(mat, [img.width * 0.5, img.height * 0.5, 1]);
  
  currentMatrix = mat;

  gl.useProgram(displaceProgramInfo.program);
  twgl.setBuffersAndAttributes(gl, displaceProgramInfo, quadBufferInfo);
  twgl.setUniforms(displaceProgramInfo, {
    u_matrix: mat,
    u_texture: tex,
    u_displacementTexture: fadeFbi2.attachments[0],
    u_displacementRange: [0.05, 0.05],
  });
  twgl.drawBufferInfo(gl, quadBufferInfo);

  // swap the variables so we render to the opposite textures next time
  var temp = fadeFbi1;
  fadeFbi1 = fadeFbi2;
  fadeFbi2 = temp;

  requestAnimationFrame(render);
}
requestAnimationFrame(render);

gl.canvas.addEventListener('mousemove', function(event, target) {
  target = target || event.target;
  const rect = target.getBoundingClientRect();

  const rx = event.clientX - rect.left;
  const ry = event.clientY - rect.top;
  
  const x = rx * target.width  / target.clientWidth;
  const y = ry * target.height / target.clientHeight;
  
  // reverse project the mouse onto the image
  var rmat = m4.inverse(currentMatrix);
  var clipspacePoint = [x / target.width * 2 - 1, -(y / target.height * 2 - 1), 0];
  var s = m4.transformPoint(rmat, clipspacePoint);

  // s is now a point in the space of the image's quad. The quad goes -1 to 1
  // and we're going to draw into it using pixels because drawThing takes
  // a pixel value and our displacement map is the same size as the canvas
  drawRect = true;
  rectX = ( s[0] * .5 + .5) * gl.canvas.width;
  rectY = (-s[1] * .5 + .5) * gl.canvas.height;
});


