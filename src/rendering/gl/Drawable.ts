import {gl} from '../../globals';

abstract class Drawable {
    count: number = 0;
  
    bufIdx: WebGLBuffer;
    bufPos: WebGLBuffer;
    bufNor: WebGLBuffer;
    bufTransform0: WebGLBuffer;
    bufTransform1: WebGLBuffer;
    bufTransform2: WebGLBuffer;
    bufTransform3: WebGLBuffer;
    bufCol: WebGLBuffer;
    bufUV: WebGLBuffer;
  
    idxGenerated: boolean = false;
    posGenerated: boolean = false;
    norGenerated: boolean = false;
    colGenerated: boolean = false;
    transformGenerated: boolean = false;
    uvGenerated: boolean = false;
  
    numInstances: number = 0; // How many instances of this Drawable the shader program should draw
  
    abstract create() : void;
  
    destory() {
        gl.deleteBuffer(this.bufIdx);
        gl.deleteBuffer(this.bufPos);
        gl.deleteBuffer(this.bufNor);
        gl.deleteBuffer(this.bufCol);
        gl.deleteBuffer(this.bufTransform0);
        gl.deleteBuffer(this.bufTransform1);
        gl.deleteBuffer(this.bufTransform2);
        gl.deleteBuffer(this.bufTransform3);
        gl.deleteBuffer(this.bufUV);
    }
  
    generateIdx() {
        this.idxGenerated = true;
        this.bufIdx = gl.createBuffer();
    }
  
    generatePos() {
        this.posGenerated = true;
        this.bufPos = gl.createBuffer();
    } 
  
    generateNor() {
        this.norGenerated = true;
        this.bufNor = gl.createBuffer();
    }
  
    generateCol() {
        this.colGenerated = true;
        this.bufCol = gl.createBuffer();
    }
  
    generateTransform() {
        this.transformGenerated = true;
        this.bufTransform0 = gl.createBuffer();
        this.bufTransform1 = gl.createBuffer();
        this.bufTransform2 = gl.createBuffer();
        this.bufTransform3 = gl.createBuffer();
    }
  
    generateUV() {
        this.uvGenerated = true;
        this.bufUV = gl.createBuffer();
    }
  
    bindIdx(): boolean {
        if (this.idxGenerated) {
           gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
        }
        return this.idxGenerated;
    }
  
    bindPos(): boolean {
        if (this.posGenerated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
        }
        return this.posGenerated;
    }
  
    bindNor(): boolean {
        if (this.norGenerated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
        }
        return this.norGenerated;
    }
  
    bindCol(): boolean {
        if (this.colGenerated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
        }
        return this.colGenerated;
    }
  
    bindTransform0(): boolean {
        if (this.transformGenerated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform0);
        }
        return this.transformGenerated;
    }

    bindTransform1(): boolean {
        if (this.transformGenerated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform1);
        }
        return this.transformGenerated;
    }

    bindTransform2(): boolean {
        if (this.transformGenerated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform2);
        }
        return this.transformGenerated;
    }

    bindTransform3(): boolean {
        if (this.transformGenerated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTransform3);
        }
        return this.transformGenerated;
    }
  
    bindUV(): boolean {
        if (this.uvGenerated) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUV);
        }
        return this.uvGenerated;
    }
  
    elemCount(): number {
        return this.count;
    }
  
    drawMode(): GLenum {
        return gl.TRIANGLES;
    }
  
    setNumInstances(num: number) {
        this.numInstances = num;
    }
};

export default Drawable;
