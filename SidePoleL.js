/**
 * Created by Madison on 2/27/2017.
 */

/* The left side connecting poles */

class SidePoleL {
    constructor (gl) {
        this.sidePole1 = new Cylinder(gl, 0.05, 0.05, 0.5, 10, 1, this.color(0,0,0), this.color(50,0,0));
        this.sidePole2 = new Cylinder(gl, 0.05, 0.05, 0.5, 10, 1, this.color(0,0,0), this.color(50,0,0));

        /* Transforming the top left side pole*/
        this.sidePole1Transform = mat4.create();
        let angle = (Math.PI/2);
        let axisRot = vec3.fromValues(1, 0, 0);
        mat4.fromRotation(this.sidePole1Transform, angle, axisRot);
        let moveOver =  vec3.fromValues (1.1, 0, 0);
        mat4.translate(this.sidePole1Transform, this.sidePole1Transform, moveOver);
        let moveDown = vec3.fromValues(0,0.3,0);
        mat4.translate(this.sidePole1Transform, this.sidePole1Transform, moveDown);
        let moveBack = vec3.fromValues(0,0,0.5);
        mat4.translate(this.sidePole1Transform, this.sidePole1Transform, moveBack);

        /* Transforming the bottom left side pole*/
        this.sidePole2Transform = mat4.create();
        let angle2 = (Math.PI/2);
        let axisRot2 = vec3.fromValues(1, 0, 0);
        mat4.fromRotation(this.sidePole2Transform, angle2, axisRot2);
        let moveOver2 =  vec3.fromValues (1.1, 0, 0);
        mat4.translate(this.sidePole2Transform, this.sidePole2Transform, moveOver2);
        let moveDown2 = vec3.fromValues(0,0.05,0);
        mat4.translate(this.sidePole2Transform, this.sidePole2Transform, moveDown2);
        let moveBack2 = vec3.fromValues(0,0,0.5);
        mat4.translate(this.sidePole2Transform, this.sidePole2Transform, moveBack2);

        /* Last line */
        this.tmp = mat4.create();
    }
    draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
        mat4.mul (this.tmp, coordFrame, this.sidePole1Transform);
        gl.uniform3fv(objTintUnif, vec3.fromValues(1.0,0.3,1.0));
        this.sidePole1.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.sidePole2Transform);
        gl.uniform3fv(objTintUnif, vec3.fromValues(1.0,0.3,1.0));
        this.sidePole2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    }

    /* Allows the objects to have a defined color by calling this method with RGB values*/
    color (a, b, c){
        return vec3.fromValues(a/255.0, b/255.0, c/255.0);
    }
}