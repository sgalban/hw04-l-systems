import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import * as Loader from 'webgl-obj-loader';

class Mesh extends Drawable {
    indices: Uint32Array;
    positions: Float32Array;
    transforms: Float32Array;
    normals: Float32Array;
    colors: Float32Array;
    uvs: Float32Array;
    center: vec4;
  
    objString: string;
  
    constructor(objString: string, center: vec3) {
      super(); // Call the constructor of the super class. This is required.
      this.center = vec4.fromValues(center[0], center[1], center[2], 1);
  
      this.objString = objString;
    }
  
    create() {  
      let posTemp: Array<number> = [];
      let norTemp: Array<number> = [];
      let uvsTemp: Array<number> = [];
      let idxTemp: Array<number> = [];
  
      var loadedMesh = new Loader.Mesh(this.objString);
  
      //posTemp = loadedMesh.vertices;
      for (var i = 0; i < loadedMesh.vertices.length; i++) {
        posTemp.push(loadedMesh.vertices[i]);
        if (i % 3 == 2) posTemp.push(1.0);
      }
  
      for (var i = 0; i < loadedMesh.vertexNormals.length; i++) {
        norTemp.push(loadedMesh.vertexNormals[i]);
        if (i % 3 == 2) {
          norTemp.push(0.0);
        }
      }
  
      uvsTemp = loadedMesh.textures;
      idxTemp = loadedMesh.indices;
  
      // white vert color for now
      this.colors = new Float32Array(posTemp.length);
      for (var i = 0; i < posTemp.length; ++i){
        this.colors[i] = 1.0;
      }
  
      this.indices = new Uint32Array(idxTemp);
      this.normals = new Float32Array(norTemp);
      this.positions = new Float32Array(posTemp);
      this.uvs = new Float32Array(uvsTemp);
  
      this.generateIdx();
      this.generatePos();
      this.generateNor();
      this.generateUV();
      this.generateCol();
      this.generateTransform();
  
      this.count = this.indices.length;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
  
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
      gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);
  
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
      gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);
  
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
      gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
  
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUV);
      gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);
  
      this.objString = ""; // hacky clear
    }
  
    setInstanceVBOs(transforms: Float32Array, colors: Float32Array) {
        this.colors = colors;
        this.transforms = transforms;

        let t0: Float32Array = new Float32Array(transforms.length / 4);
        let t1: Float32Array = new Float32Array(transforms.length / 4);
        let t2: Float32Array = new Float32Array(transforms.length / 4);
        let t3: Float32Array = new Float32Array(transforms.length / 4);

        for (let i = 0; i < transforms.length; i += 4) {
            t0[i / 4] = transforms[i + 0];
            t1[i / 4] = transforms[i + 1];
            t2[i / 4] = transforms[i + 2];
            t3[i / 4] = transforms[i + 3];
        }

        /*console.log(t0);
        console.log(t1);
        console.log(t2);
        console.log(t3);*/

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform0);
        gl.bufferData(gl.ARRAY_BUFFER, t0, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform1);
        gl.bufferData(gl.ARRAY_BUFFER, t1, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform2);
        gl.bufferData(gl.ARRAY_BUFFER, t2, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform3);
        gl.bufferData(gl.ARRAY_BUFFER, t3, gl.STATIC_DRAW);
    }
};

export default Mesh;
