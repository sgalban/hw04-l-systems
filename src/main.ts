import {vec3, mat4, quat} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';

import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import Mesh from './geometry/Mesh';

import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL, readTextFile, mat4ToValues, randomRange} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

import LSystem from './LSystem/LSystem';
import Turtle from './LSystem/Turtle';
import ExpansionRule from './LSystem/ExpansionRule';
import DrawingRule from './LSystem/DrawingRule';
import DrawNode from './LSystem/DrawNode';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
    'Regenerate': function() {generateLystem()},
    'Axiom': "FB",
    'Angle': 30,
    "Iterations": 5
};

let square: Square;
let screenQuad: ScreenQuad;
let cylinder: Mesh;
let sphere: Mesh;
let time: number = 0.0;
let lsystem: LSystem;

function generateLystem() {
    // Construct the LSystem, its grammar, and its drawing rules
    lsystem = new LSystem(controls.Axiom);
    lsystem.addExpansionRule(new ExpansionRule("B", new Map<string, number>([
        ["F[+FB][/FB][*FB]", 0.6],
        ["F*[+FB][-FB]", 0.4],
    ])));
    lsystem.addExpansionRule(new ExpansionRule("F", new Map<string, number>([
        ["F", 0.75],
        ["Ff", 0.25]
    ])));
    //lsystem.addExpansionRule(ExpansionRule.newConstantRule("B", "F[+FB][/FB][*FB]"));

    //lsystem.addExpansionRule(ExpansionRule.newConstantRule("X", "FF[-FY]+FY"));
    //lsystem.addExpansionRule(ExpansionRule.newConstantRule("Y", "FF[-FX]+FX"));
    //lsystem.addExpansionRule(ExpansionRule.newConstantRule("B", "A"));

    const angle = controls.Angle;

    lsystem.addDrawingRule(new DrawingRule("F", (turt: Turtle) => {
        return turt.moveForward(1.5);
    }));
    lsystem.addDrawingRule(new DrawingRule("f", (turt: Turtle) => {
        return turt.moveForward(0.5);
    }));
    lsystem.addDrawingRule(new DrawingRule("+", (turt: Turtle) => {
        return turt.rotateZ(angle + randomRange(-angle / 2.5, angle / 2.5));
    }));
    lsystem.addDrawingRule(new DrawingRule("-", (turt: Turtle) => {
        return turt.rotateZ(-angle + randomRange(-angle / 2.5, angle / 2.5));
    }));
    lsystem.addDrawingRule(new DrawingRule("*", (turt: Turtle) => {
        turt.rotateY(120);
        return turt.rotateZ(angle + randomRange(-angle / 2.5, angle / 2.5));
    }));
    lsystem.addDrawingRule(new DrawingRule("/", (turt: Turtle) => {
        turt.rotateY(-120);
        return turt.rotateZ(angle + randomRange(-angle / 2.5, angle / 2.5)) ;
    }));
    lsystem.addDrawingRule(new DrawingRule("B", (turt: Turtle) => {
        return turt.generateLeaf();
    }));
    /*lsystem.addDrawingRule(new DrawingRule(".", (turt: Turtle) => {
        return turt.rotateX(45 + randomRange(-15, 15));
    }));
    lsystem.addDrawingRule(new DrawingRule("/", (turt: Turtle) => {
        return turt.rotateX(-45 + randomRange(-15, 15));
    }));*/

    let dNodes: DrawNode[] = lsystem.draw(controls.Iterations);

    // Determine how many nodes are in the expanded LSystem
    const expandedString: string = lsystem.expand(controls.Iterations);
    console.log(expandedString);
    const numNodes = expandedString.split('F').length - 1;

    // Set up instanced rendering data arrays here.
    // This example creates a set of positional
    // offsets and gradiated colors for a 100x100 grid
    // of squares, even though the VBO data for just
    // one square is actually passed to the GPU
    let transformArray: number[] = [];
    let colorsArray: number[] = [];
    let leafTransformArray: number[] = [];
    let leafColorsArray: number[] = [];

    let numLeaves: number = 0;
    for (let dn of dNodes) {
        if (dn.leaf) {
            numLeaves++;
            leafTransformArray = leafTransformArray.concat(mat4ToValues(dn.transformation));
            leafColorsArray.push(dn.color[0], dn.color[1], dn.color[2], 1.0);
        }
        else {
            transformArray = transformArray.concat(mat4ToValues(dn.transformation));
            //console.log(dn.transformation);
            colorsArray.push(dn.color[0], dn.color[1], dn.color[2], 1.0);
        }
    }

    let transforms: Float32Array = new Float32Array(transformArray);
    let colors: Float32Array = new Float32Array(colorsArray);
    let leafTransforms: Float32Array = new Float32Array(leafTransformArray);
    let leafColors: Float32Array = new Float32Array(leafColorsArray);

    cylinder.setInstanceVBOs(transforms, colors);
    cylinder.setNumInstances(dNodes.length - numLeaves);
    sphere.setInstanceVBOs(leafTransforms, leafColors);
    sphere.setNumInstances(numLeaves);
}

function loadScene() {
    square = new Square();
    square.create();
    screenQuad = new ScreenQuad();
    screenQuad.create();
    cylinder = new Mesh(readTextFile("../cylinder.obj"), vec3.fromValues(0, 0, 0));
    cylinder.create();
    sphere = new Mesh(readTextFile('../sphere.obj'), vec3.fromValues(0, 0, 0));
    sphere.create();

    generateLystem();
    
}

function main() {
    // Initial display for framerate
    const stats = Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);
  
    // Add controls to the gui
    const gui = new DAT.GUI();
    gui.add(controls, "Axiom");
    gui.add(controls, "Angle", 10, 80);
    gui.add(controls, "Iterations", 1, 15);
    gui.add(controls, "Regenerate");
  
    // get canvas and webgl context
    const canvas = <HTMLCanvasElement> document.getElementById('canvas');
    const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
    if (!gl) {
        alert('WebGL 2 not supported!');
    }
    // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
    // Later, we can import `gl` from `globals.ts` to access it
    setGL(gl);
  
    // Initial call to load scene
    loadScene();
  
    const camera = new Camera(vec3.fromValues(0, 20, 50), vec3.fromValues(0, 10, 0));

    const renderer = new OpenGLRenderer(canvas);
    renderer.setClearColor(0.2, 0.2, 0.2, 1);
    //gl.enable(gl.BLEND);
    //gl.blendFunc(gl.ONE, gl.ONE); // Additive blending
    gl.enable(gl.DEPTH_TEST);
  
    const instancedShader = new ShaderProgram([
        new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
        new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
    ]);

    const lambertShader = new ShaderProgram([
        new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
        new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
    ]);
  
    const flat = new ShaderProgram([
        new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
        new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
    ]);
  
    // This function will be called every frame
    function tick() {
        camera.update();
        stats.begin();
        instancedShader.setTime(time);
        flat.setTime(time++);
        gl.viewport(0, 0, window.innerWidth, window.innerHeight);
        renderer.clear();
        renderer.render(camera, flat, [screenQuad]);
        renderer.render(camera, instancedShader, [
            sphere,
            cylinder
        ]);
        renderer.render(camera, lambertShader, [square]);
        stats.end();
    
        // Tell the browser to call `tick` again whenever it renders a new frame
        requestAnimationFrame(tick);
    }
  
    window.addEventListener('resize', function() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.setAspectRatio(window.innerWidth / window.innerHeight);
        camera.updateProjectionMatrix();
        flat.setDimensions(window.innerWidth, window.innerHeight);
    }, false);
  
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    console.log(window.innerWidth + ", " + window.innerHeight);
    flat.setDimensions(window.innerWidth, window.innerHeight);
  
    // Start the render loop
    tick();
}

main();
