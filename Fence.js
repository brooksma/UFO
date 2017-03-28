/**
 * Created by brooksma on 3/19/17.
 */
/**
 * Created by Madison on 2/26/2017.
 * Created by Hans Dulimarta on 2/16/17.
 */
class Fence {
    constructor (gl) {

        this.topCone = new Cone(gl, 0.08, 0.12, 30, 10, this.color(0,0,0), this.color(50,0,0));
        this.pole = new Cylinder(gl, 0.08, 0.08, 0.5, 10, 1, this.color(0,0,0), this.color(50,0,0));
        this.sidePole1 = new Cylinder(gl, 0.05, 0.05, 0.175, 10, 1, this.color(0,0,0), this.color(50,0,0));

        /* Transforming the cone tops for the fence */
        let moveSide = vec3.fromValues (1.10, 0, 0);
        let moveUp = vec3.fromValues (0, 0, 0.5);
        this.topConeTransform = mat4.create();
        mat4.translate (this.topConeTransform, this.topConeTransform, moveSide);
        let moveItUp = mat4.fromTranslation(mat4.create(), moveUp);
        mat4.multiply (this.topConeTransform, moveItUp, this.topConeTransform);

        /* Transforming the poles*/
        this.poleTransform = mat4.create();
        mat4.translate (this.poleTransform, this.poleTransform, moveSide);

        /* Transforming the side poles*/
        // this.sidePole1Transform = mat4.create();
        // let angle = (Math.PI/2);
        // let axisRot = vec3.fromValues(0, 1, 0);
        // mat4.fromRotation(this.sidePole1Transform, angle, axisRot);


        /* Last line */
        this.tmp = mat4.create();
    }

    draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
        mat4.mul (this.tmp, coordFrame, this.topConeTransform);
        this.topCone.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.poleTransform);
        this.pole.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        // mat4.mul (this.tmp, coordFrame, this.sidePole1Transform);
        // this.sidePole1.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    }

    /* Allows the objects to have a defined color by calling this method with RGB values*/
    color (a, b, c){
        return vec3.fromValues(a/255.0, b/255.0, c/255.0);
    }

}