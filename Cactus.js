/**
 * Created by brooksma on 3/19/17.
 */
/**
 * Created by morganoneka on 2/26/17.
 */

class Cactus{
    constructor (gl){

        // creates the base of the cactus
        this.base = new Cylinder(gl, .075, .1, 1, 20, 1, this.color(50,205, 50), this.color(0,100,0));
        this.baseTransform = mat4.create();
        mat4.translate(this.baseTransform, this.baseTransform, vec3.fromValues(0, 0, .5));

        // branch 1
        this.branch1 = new Cylinder(gl, .05, .07, .4, 20, 1, this.color(50,205, 50), this.color(0,100,0));
        this.branch1Transform = mat4.create();
        mat4.fromRotation(this.branch1Transform, Math.PI / 2, vec3.fromValues(0,1,0));
        mat4.translate(this.branch1Transform, this.branch1Transform, vec3.fromValues(-0.5, 0, 0.25));

        // branch 2
        this.branch2 = new Cylinder(gl, .04, .06, .25, 20, 1, this.color(50,205, 50), this.color(0,100,0));
        this.branch2Transform = mat4.create();
        mat4.translate(this.branch2Transform, this.branch2Transform, vec3.fromValues(0.43, 0, 0.6));

        // branch 3
        this.branch3 = new Cylinder(gl, .06, .05, .35, 20, 1, this.color(50,205, 50), this.color(0,100,0));
        this.branch3Transform = mat4.create();
        mat4.fromRotation(this.branch3Transform, Math.PI / 2, vec3.fromValues(0,1,0));
        mat4.translate(this.branch3Transform, this.branch3Transform, vec3.fromValues(-0.6, 0, -0.2));


        this.tmp = mat4.create();
    }

    draw (vertexAttr, colorAttr, modelUniform, coordFrame){
        mat4.mul (this.tmp, coordFrame, this.baseTransform);
        this.base.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.branch1Transform);
        this.branch1.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.branch2Transform);
        this.branch2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.branch3Transform);
        this.branch3.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

    }

    color (a, b, c){
        return vec3.fromValues(a/255.0, b/255.0, c/255.0);
    }
}