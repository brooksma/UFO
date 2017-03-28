/**
 * Created by brooksma on 3/19/17.
 */
/**
 * Created by Hans Dulimarta on 2/1/17.
 */
// Create a cylinder whose Z-axis as its axis of symmetry, base at Z=-h/2, top at Z=+h/2
class Cylinder extends GeometricObject{

    constructor (gl, radiusBottom, radiusTop, height, div, vsubDiv = 1, col1, col2) {
        super(gl);
        /* if colors are undefined, generate random colors */
        if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        let randColor = vec3.create();
        this.vertices = [];
        this.vbuff = gl.createBuffer();

        let normalVector = vec3.fromValues(0,0,1);
        for(let i = 0; i <= vsubDiv; i ++) {
            let stackHeight = height * (i/vsubDiv);
            let stackRadius = radiusBottom - (i * ((radiusBottom - radiusTop) / vsubDiv));
            if(i === 0) {
                this.vertices.push(0, 0, stackHeight);
                this.vertices.push(normalVector[0], normalVector[1], normalVector[2]);
            }

            if(i === vsubDiv) {
                normalVector = vec3.fromValues(0,0, 1);
                this.vertices.push(0, 0, stackHeight);
                this.vertices.push(normalVector[0], normalVector[1], normalVector[2]);
            }

            for (let k = 0; k < div; k++) {
                let angle = k * 2 * Math.PI / div;
                let x = stackRadius * Math.cos (angle);
                let y = stackRadius * Math.sin (angle);
                let z = stackHeight;

                let n1 = vec3.fromValues(-Math.sin(angle), Math.cos(angle), 0);
                let n2 = vec3.fromValues(radiusBottom - radiusTop, 0, z);

                vec3.cross(normalVector, n1, n2);
                vec3.normalize(normalVector, normalVector);

                this.vertices.push (x, y, z);
                this.vertices.push(normalVector[0], normalVector[1], normalVector[2]);
            }
        }

        /* copy the (x,y,z,r,g,b) sixtuplet into GPU buffer */
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(this.vertices), gl.STATIC_DRAW);

        this.indices = [];

        let bottomIndex = [];
        bottomIndex.push(0);

        // Generate bottom of stack
        for(let j = div; j >= 1; j--) {
            bottomIndex.push(j);
        }
        bottomIndex.push(div);

        this.bottomIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bottomIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(bottomIndex), gl.STATIC_DRAW);

        this.indices.push({"primitive": gl.TRIANGLE_FAN, "buffer": this.bottomIdxBuff, "numPoints": bottomIndex.length});

        // Generate side of vsubDiv
        for(let i = 0; i < vsubDiv; i ++) {
            let sideIndex = [];
            for(let j = 1; j <= div; j++) {
                let nextLevel = ((i  + 1) * div) + j;
                let currentLevel = (i * div) + j;

                if(i === vsubDiv - 1) {
                    nextLevel++;
                }
                sideIndex.push(nextLevel, currentLevel);
            }

            let nextLevelLast = ((i  + 1) * div) + 1;
            let currentLevelLast = (i * div) + 1;

            if(i === vsubDiv - 1) {
                nextLevelLast++;
            }

            sideIndex.push(nextLevelLast, currentLevelLast);

            this.sideIdxBuff = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.sideIdxBuff);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(sideIndex), gl.STATIC_DRAW);
            this.indices.push({"primitive": gl.TRIANGLE_STRIP, "buffer": this.sideIdxBuff, "numPoints": sideIndex.length});
        }


        // Generate top of stack
        let topIndex = [];
        topIndex.push((vsubDiv * div) + 1);
        for(let j = 2; j < div + 2; j++) {
            topIndex.push(j + (vsubDiv * div));
        }
        topIndex.push((vsubDiv * div) + 2);

        this.topIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.topIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(topIndex), gl.STATIC_DRAW);

        this.indices.push({"primitive": gl.TRIANGLE_FAN, "buffer": this.topIdxBuff, "numPoints": topIndex.length});
    }

}