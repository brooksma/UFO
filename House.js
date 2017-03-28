/**
 * Created by brooksma on 3/19/17.
 */
/**
 * Created by morganoneka on 2/26/17.
 */

class House {
    constructor (gl) {
        // creates the main part of the house
        this.mainPart = new Cube(gl, .6, 3, this.color(255, 113, 124), this.color(255, 152, 182), this.color(255, 192, 216));
        this.mainPartTransform = mat4.create();
        mat4.scale(this.mainPartTransform, this.mainPartTransform, vec3.fromValues(1, 2.5, 1));
        let moveUp = vec3.fromValues (0, 0, .38);
        mat4.translate(this.mainPartTransform, this.mainPartTransform, moveUp);

        // creates the foundation of the house
        this.foundation = new Cube(gl, .6, 3, this.color(160, 82, 45), this.color (205, 133, 63), this.color (210, 105, 30));
        this.foundationTransform = mat4.create();
        mat4.scale(this.foundationTransform, this.foundationTransform, vec3.fromValues(1, 2.5, .3));

        // creates the front door
        this.frontDoor = new Cube(gl, .3, 3, this.color(128,0,128), this.color(153, 50, 204), this.color(147,112,219));
        this.frontDoorTransform = mat4.create();
        mat4.scale(this.frontDoorTransform, this.frontDoorTransform, vec3.fromValues(.25, .75 , 1));
        mat4.translate(this.frontDoorTransform, this.frontDoorTransform, vec3.fromValues(1.20, 0, .24));

        // creates the side window
        this.window = new Cube(gl, .3, 3, this.color(224, 255, 255), this.color(0,255,255), this.color(127,255,212));
        this.windowTransform = mat4.create();
        mat4.scale(this.windowTransform, this.windowTransform, vec3.fromValues(1, .15, 1));
        mat4.translate(this.windowTransform, this.windowTransform, vec3.fromValues(0, 5.0, 0.35));

        // creates the top step
        this.topStep = new Cube(gl, .2, 3, this.color(160, 82, 45), this.color (205, 133, 63), this.color (210, 105, 30));
        this.topStepTransform = mat4.create();
        mat4.scale(this.topStepTransform, this.topStepTransform, mat4.fromValues(1, 1.5, .4));
        mat4.translate(this.topStepTransform, this.topStepTransform, vec3.fromValues(.48, 0, .2));

        // creates the middle step
        this.middleStep = new Cube(gl, .2, 3, this.color(160, 82, 45), this.color (205, 133, 63), this.color (210, 105, 30));
        this.middleStepTransform = mat4.create();
        mat4.scale(this.middleStepTransform, this.middleStepTransform, vec3.fromValues(1.25, 1.5, .4));
        mat4.translate(this.middleStepTransform, this.middleStepTransform, vec3.fromValues(.4, 0, .05));

        // creates the bottom step
        this.bottomStep = new Cube(gl, .2, 3, this.color(160, 82, 45), this.color (205, 133, 63), this.color (210, 105, 30));
        this.bottomStepTransform = mat4.create();
        mat4.scale(this.bottomStepTransform, this.bottomStepTransform, vec3.fromValues(1.5, 1.5, .4));
        mat4.translate(this.bottomStepTransform, this.bottomStepTransform, vec3.fromValues(.35, 0, -.1));

        this.tmp = mat4.create();
    }

    draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
        mat4.mul (this.tmp, coordFrame, this.mainPartTransform);
        this.mainPart.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.foundationTransform);
        this.foundation.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.frontDoorTransform);
        this.frontDoor.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.windowTransform);
        this.window.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.topStepTransform);
        this.topStep.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.middleStepTransform);
        this.middleStep.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        mat4.mul (this.tmp, coordFrame, this.bottomStepTransform);
        this.bottomStep.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    }

    color (a, b, c){
        return vec3.fromValues(a/255.0, b/255.0, c/255.0);
    }
}