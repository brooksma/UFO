/**
 * Created by morganoneka on 2/27/17.
 */

class UFO{
    constructor (gl){
        this.flatPart = new Torus(gl, .5, .45, 20, 20);
        this.flatPartTransform = mat4.create();
        mat4.scale(this.flatPartTransform, this.flatPartTransform, vec3.fromValues(1,1, .25));
        mat4.translate(this.flatPartTransform, this.flatPartTransform, vec3.fromValues(0,0, 8));

        this.sphere = new Torus(gl, 0, .5, 15,15);
        this.sphereTransform = mat4.create();
        mat4.translate(this.sphereTransform, this.sphereTransform, vec3.fromValues(0,0,2));

        this.beam = new Cylinder(gl, .6, .05, 1.5, 10, 10, this.color(144,238,144), this.color(173,255,47));
        this.beamTransform = mat4.create();
        mat4.translate(this.beamTransform, this.beamTransform, vec3.fromValues(0,0,.38));

        this.tmp = mat4.create();
    }

    draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
        mat4.mul (this.tmp, coordFrame, this.flatPartTransform);
        gl.uniform3fv(objTintUnif, vec3.fromValues(1.0,0.2,0.0));
        this.flatPart.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.sphereTransform);
        gl.uniform3fv(objTintUnif, vec3.fromValues(1.0,0.2,0.0));
        this.sphere.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.beamTransform);
        gl.uniform3fv(objTintUnif, vec3.fromValues(0.0,1.0,0.5));
        this.beam.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    }

    drawNormal (vertexAttr, colorAttr, modelUniform, coordFrame) {
        this.flatPart.drawNormal(vertexAttr, colorAttr, modelUniform, coordFrame);
        this.sphere.drawNormal(vertexAttr, colorAttr, modelUniform, coordFrame);
        this.beam.drawNormal(vertexAttr, colorAttr, modelUniform, coordFrame);
    }

    color (a, b, c){
        return vec3.fromValues(a/255.0, b/255.0, c/255.0);
    }
}