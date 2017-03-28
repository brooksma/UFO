/**
 * Created by Hans Dulimarta on 1/31/17.
 */

var gl;
var glCanvas, textOut;
var persProjMat, viewMat, viewMatInverse, normalMat;
var lightCF, Light2CF;
var tmpMat;
var axes;
var eyePos;
var fenceCF;
var houseCF;
var ufoCF;
var sideP1LCF;
var sideP2CF;
var groundCF
/* Vertex shader attribute variables */
var posAttr, colAttr;

/* Shader uniform variables */
var projUnif, viewUnif, modelUnif, lightPosUnif, LightPosUnif2 ;
var objAmbientUnif, objTintUnif, normalUnif, isEnabledUnif;
var ambCoeffUnif, diffCoeffUnif, specCoeffUnif, shininessUnif;
var lightPos, LightPos2, useLightingUnif;
const IDENTITY = mat4.create();
var obj, lineBuff, normBuff, objTint, pointLight, pointLight2;
var ufoSpeed = 30;  /* 30 RPM (revolutions/min) */
var shaderProg;
var timeStamp;
let objects = [];
let objectCFs = [];
var baseCF;
var isCFVisible = false;
var ufoMovingUp;
var lightingComponentEnabled = [true, true, true];

function main() {
    glCanvas = document.getElementById("gl-canvas");

    let UFOspeedslider = document.getElementById("ufo-speed");
    UFOspeedslider.addEventListener('input', ev => {
        // gl.uniform1f(ambCoeffUnif, ev.target.value);
        ufoSpeed = ev.target.value;
        redrawNeeded = true;
    }, false);
    let normalCheckBox = document.getElementById("shownormal");
    normalCheckBox.addEventListener('change', ev => {
        showNormal = ev.target.checked;
        redrawNeeded = true;
    }, false);
    let lightCheckBox = document.getElementById("showlightvector");
    lightCheckBox.addEventListener('change', ev => {
        showLightVectors = ev.target.checked;
        redrawNeeded = true;
    }, false);
    let ambientCheckBox = document.getElementById("enableAmbient");
    ambientCheckBox.addEventListener('change', ev => {
        lightingComponentEnabled[0] = ev.target.checked;
        gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);
        redrawNeeded = true;
    }, false);
    let diffuseCheckBox = document.getElementById("enableDiffuse");
    diffuseCheckBox.addEventListener('change', ev => {
        lightingComponentEnabled[1] = ev.target.checked;
        gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);
        redrawNeeded = true;
    }, false);
    let specularCheckBox = document.getElementById("enableSpecular");
    specularCheckBox.addEventListener('change', ev => {
        lightingComponentEnabled[2] = ev.target.checked;
        gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);
        redrawNeeded = true;
    }, false);
    let ambCoeffSlider = document.getElementById("amb-coeff");
    ambCoeffSlider.addEventListener('input', ev => {
        gl.uniform1f(ambCoeffUnif, ev.target.value);
        redrawNeeded = true;
    }, false);
    ambCoeffSlider.value = Math.random() * 0.2;
    let diffCoeffSlider = document.getElementById("diff-coeff");
    diffCoeffSlider.addEventListener('input', ev => {
        gl.uniform1f(diffCoeffUnif, ev.target.value);
        redrawNeeded = true;
    }, false);
    diffCoeffSlider.value = 0.5 + 0.5 * Math.random();  // random in [0.5, 1.0]
    let specCoeffSlider = document.getElementById("spec-coeff");
    specCoeffSlider.addEventListener('input', ev => {
        gl.uniform1f(specCoeffUnif, ev.target.value);
        redrawNeeded = true;
    }, false);
    specCoeffSlider.value = Math.random();
    let shinySlider = document.getElementById("spec-shiny");
    shinySlider.addEventListener('input', ev => {
        gl.uniform1f(shininessUnif, ev.target.value);
        redrawNeeded = true;
    }, false);
    shinySlider.value = Math.floor(1 + Math.random() * shinySlider.max);
    let redSlider = document.getElementById("redslider");
    let greenSlider = document.getElementById("greenslider");
    let blueSlider = document.getElementById("blueslider");
    redSlider.addEventListener('input', colorChanged, false);
    greenSlider.addEventListener('input', colorChanged, false);
    blueSlider.addEventListener('input', colorChanged, false);

    let lightxslider = document.getElementById("lightx");
    let lightyslider = document.getElementById("lighty");
    let lightzslider = document.getElementById("lightz");
    lightxslider.addEventListener('input', lightPosChanged, false);
    lightyslider.addEventListener('input', lightPosChanged, false);
    lightzslider.addEventListener('input', lightPosChanged, false);

    gl = WebGLUtils.setupWebGL(glCanvas, null);
    axisBuff = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, axisBuff);
    window.addEventListener("resize", resizeHandler, false);
    window.addEventListener("keypress", keyboardHandler, false);
    ShaderUtils.loadFromFile(gl, "vshader.glsl", "fshader.glsl")
        .then (prog => {
            shaderProg = prog;
            gl.useProgram(prog);
            gl.clearColor(0, 0, 0.75, 1);
            gl.enable(gl.DEPTH_TEST);    /* enable hidden surface removal */
            gl.enable(gl.CULL_FACE);     /* cull back facing polygons */
            gl.cullFace(gl.BACK);
            posAttr = gl.getAttribLocation(prog, "vertexPos");
            colAttr = gl.getAttribLocation(prog, "vertexCol");
            normalAttr = gl.getAttribLocation(prog, "vertexNormal");
            lightPosUnif = gl.getUniformLocation(prog, "lightPosWorld");
            lightPosUnif2 = gl.getUniformLocation(prog, "lightPosSecond");
            projUnif = gl.getUniformLocation(prog, "projection");
            viewUnif = gl.getUniformLocation(prog, "view");
            modelUnif = gl.getUniformLocation(prog, "modelCF");
            normalUnif = gl.getUniformLocation(prog, "normalMat");
            useLightingUnif = gl.getUniformLocation (prog, "useLighting");
            objTintUnif = gl.getUniformLocation(prog, "objectTint");
            ambCoeffUnif = gl.getUniformLocation(prog, "ambientCoeff");
            diffCoeffUnif = gl.getUniformLocation(prog, "diffuseCoeff");
            specCoeffUnif = gl.getUniformLocation(prog, "specularCoeff");
            shininessUnif = gl.getUniformLocation(prog, "shininess");
            isEnabledUnif = gl.getUniformLocation(prog, "isEnabled");
            gl.enableVertexAttribArray(posAttr);
            gl.enableVertexAttribArray(colAttr);
            persProjMat = mat4.create();
            viewMat = mat4.create();
            viewMatInverse = mat4.create();
            normalMat = mat3.create();
            lightCF = mat4.create();
            tmpMat = mat4.create();
            eyePos = vec3.fromValues(3, 2, 3);
            mat4.lookAt(viewMat,
                eyePos, /* eye */
                vec3.fromValues(0, 0, 1), /* focal point */
                vec3.fromValues(0, 0, 1)); /* up */

            mat4.invert(viewMatInverse, viewMat);
            gl.uniformMatrix4fv(modelUnif, false, IDENTITY);
            lightPos = vec3.fromValues (0,2,2);
            LightPos2 = vec3.fromValues(0,1,1);
            mat4.fromTranslation(lightCF, lightPos);
            mat4.fromTranslation(LightPos2, LightPos2);
            lightx.value = lightPos[0];
            lighty.value = lightPos[1];
            lightz.value = lightPos[2];

            lightx.value = LightPos2[0];
            lighty.value = LightPos2[1];
            lightz.value = LightPos2[2];
            gl.uniform3fv (lightPosUnif, lightPos);
            gl.uniform3fv (lightPosUnif2, LightPos2);
            let vertices = [0, 0, 0, 1, 1, 1,
                lightPos[0], 0, 0, 1, 1, 1,
                lightPos[0], lightPos[1], 0, 1, 1, 1,
                lightPos[0], lightPos[1], lightPos[2], 1, 1, 1];
            let vertices2 = [0, 0, 0, 1, 1, 1,
                LightPos2[0], 0, 0, 1, 1, 1,
                LightPos2[0], LightPos2[1], 0, 1, 1, 1,
                LightPos2[0], LightPos2[1], LightPos2[2], 1, 1, 1];
            gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
            gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);
            gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices2), gl.STATIC_DRAW);

            redSlider.value = Math.random();
            greenSlider.value = Math.random();
            blueSlider.value = Math.random();
            objTint = vec3.fromValues(redSlider.value, greenSlider.value, blueSlider.value);
            gl.uniform3fv(objTintUnif, objTint);
            gl.uniform1f(ambCoeffUnif, ambCoeffSlider.value);
            gl.uniform1f(diffCoeffUnif, diffCoeffSlider.value);
            gl.uniform1f(specCoeffUnif, specCoeffSlider.value);
            gl.uniform1f(shininessUnif, shinySlider.value);

            gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);
            let yellow = vec3.fromValues (0xe7/255, 0xf2/255, 0x4d/255);
            pointLight = new UniSphere(gl, 0.03, 3, yellow, yellow);
            //pointLight2 = new UniSphere(gl, 0.03, 3, yellow, yellow);
            globalAxes = new Axes(gl);


            axes = new Axes(gl);
            baseCF = mat4.create();


            fenceCF = mat4.create();
            houseCF = mat4.create();
            //cactusCF = mat4.create();
            ufoCF = mat4.create();
            sideP1LCF = mat4.create();
            sideP2CF = mat4.create();
            groundCF = mat4.create();

            fence = new Fence(gl);
            sideP1L = new SidePoleL(gl);
            sideP2 = new SidePoleR(gl);
            house = new House(gl);
            //cactus = new Cactus(gl);
            ufo = new UFO(gl, 1.5);
            ground = new Cube(gl, 8, 2, color(170, 69, 0),color(170, 69, 0),color(170, 69, 0) );

            /* ufo
            objects.push(new UFO(gl, 1.5));
            mat4.fromTranslation(tmpMat, vec3.fromValues(-.5,-.5,.5));
            objectCFs.push(mat4.clone(tmpMat));
            */
            /* house
            objects.push(new House(gl));
            mat4.fromTranslation(tmpMat, vec3.fromValues(-1, .25, 0));
            objectCFs.push(mat4.clone(tmpMat));
            */
            /* cactus
            objects.push(new Cactus(gl));
            mat4.fromTranslation(tmpMat, vec3.fromValues(-1, -2, -0.25));
            objectCFs.push(mat4.clone(tmpMat));

            objects.push(new Cactus(gl));
            mat4.fromTranslation(tmpMat, vec3.fromValues(.5, .4, -0.25));
            let tmp2 = mat4.create();
            mat4.fromRotation(tmp2, Math.PI / 2, vec3.fromValues(0,0,1));
            mat4.multiply(tmpMat, tmpMat, tmp2);
            objectCFs.push(mat4.clone(tmpMat));
            */
            /* ground
            // objects.push (new Cube(gl, 8, 2, color(170, 69, 0),color(170, 69, 0),color(170, 69, 0) ));
            // mat4.fromTranslation(tmpMat, vec3.fromValues(0,0,-5));
            // objectCFs.push( mat4.clone(tmpMat) );
            */
            /* fence
            var yPos = -2.0;
            for (let k = 0; k <= 8; k++) {
                objects.push(new Fence(gl));
                objects.push(new SidePoleL(gl));
                mat4.fromTranslation(tmpMat, vec3.fromValues(0, yPos, 0.25));
                objectCFs.push(mat4.clone(tmpMat));
                objectCFs.push(mat4.clone(tmpMat));


                objects.push(new Fence(gl));
                objects.push(new SidePoleL(gl));
                mat4.fromTranslation(tmpMat, vec3.fromValues(-4, yPos, 0.25));
                objectCFs.push(mat4.clone(tmpMat));
                objectCFs.push(mat4.clone(tmpMat));
                yPos += 0.5;
            }

            var xPos = -4;
            for (let k = 0; k <= 8; k++) {
                objects.push(new Fence(gl));
                objects.push(new SidePoleR(gl));
                mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, 1.95, 0.25));
                objectCFs.push(mat4.clone(tmpMat));
                objectCFs.push(mat4.clone(tmpMat));

                objects.push(new Fence(gl));
                objects.push(new SidePoleR(gl));
                mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, -2.5, 0.25));
                objectCFs.push(mat4.clone(tmpMat));
                objectCFs.push(mat4.clone(tmpMat));

                xPos += 0.5;
            }
            */

            timeStamp = Date.now();
            resizeHandler();
            render();
        });
}

function drawScene() {
    gl.uniform1i(useLightingUnif, false);
    gl.disableVertexAttribArray(normalAttr);
    gl.enableVertexAttribArray(colAttr);


    /* Use LINE_STRIP to mark light position */
    gl.uniformMatrix4fv(modelUnif, false, IDENTITY);
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
    gl.vertexAttribPointer(posAttr, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(colAttr, 3, gl.FLOAT, false, 24, 12);
    gl.drawArrays(gl.LINE_STRIP, 0, 4);
    /* Draw the light source (a sphere) using its own coordinate frame */

    pointLight.draw(posAttr, colAttr, modelUnif, lightCF);
    //pointLight2.draw(posAttr, colAttr, modelUnif, Light2CF);
    /* Draw the global axes */
    //axes.draw(posAttr, colAttr, modelUnif, IDENTITY);

    /*OLDDDDD initialize with the baseCF
    tmpMat.set(baseCF);
    gl.uniform1i(useLightingUnif, true);
    gl.disableVertexAttribArray(colAttr);
    gl.enableVertexAttribArray(normalAttr);

    for (let k = 0; k < objects.length; k++) {
        //mat4.mul(tmpMat, tmpMat, objectCFs[k]);
        tmpMat = mat4.clone(objectCFs[k]);
        objects[k].draw(posAttr, normalAttr, modelUnif, tmpMat);
        if (isCFVisible)
            axes.draw(posAttr, normalAttr, modelUnif, tmpMat);
    } */

    if(typeof house !== 'undefined'){
        /* calculate normal matrix from ringCF */
        gl.uniform1i (useLightingUnif, true);
        gl.disableVertexAttribArray(colAttr);
        gl.enableVertexAttribArray(normalAttr);
        mat4.fromTranslation(tmpMat, vec3.fromValues(-1, .25, 0));
        mat4.multiply(tmpMat, houseCF, tmpMat);   // tmp = houseCF * tmpMat
        house.draw(posAttr, normalAttr, modelUnif, tmpMat);
    }
    if(typeof ufo !== 'undefined'){
        /* calculate normal matrix from ringCF */
        gl.uniform1i (useLightingUnif, true);
        gl.disableVertexAttribArray(colAttr);
        gl.enableVertexAttribArray(normalAttr);
        let tmpMat2 = mat4.create();
        mat4.fromTranslation(tmpMat2, vec3.fromValues(-.5,-.5,.5));
        mat4.multiply(tmpMat, tmpMat2, tmpMat);
        mat4.multiply(tmpMat, ufoCF, tmpMat);
        ufo.draw(posAttr, normalAttr, modelUnif, tmpMat);
    }
    if(typeof fence !== 'undefined'){
        /* calculate normal matrix from ringCF */
        gl.uniform1i (useLightingUnif, true);
        gl.disableVertexAttribArray(colAttr);
        gl.enableVertexAttribArray(normalAttr);
        var yPos = -2.0;
        for (let k = 0; k < 8; k++) {
            mat4.fromTranslation(tmpMat, vec3.fromValues(0, yPos, 0.25));
            mat4.multiply(tmpMat, fenceCF, tmpMat);   // tmp = fenceCF * tmpMat
            fence.draw(posAttr, normalAttr, modelUnif, tmpMat);

            mat4.fromTranslation(tmpMat, vec3.fromValues(-4, yPos, 0.25));
            mat4.multiply(tmpMat, fenceCF, tmpMat);   // tmp = fenceCF * tmpMat
            fence.draw(posAttr, normalAttr, modelUnif, tmpMat);

            yPos += 0.5;
        }
        var xPos = -4;
        for (let k = 0; k <= 8; k++) {
            mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, 1.5, 0.25));
            mat4.multiply(tmpMat, fenceCF, tmpMat);   // tmp = fenceCF * tmpMat
            //fence.draw(posAttr, colAttr, modelUnif, tmpMat);
            fence.draw(posAttr, normalAttr, modelUnif, tmpMat);

            mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, -2.5, 0.25));
            mat4.multiply(tmpMat, fenceCF, tmpMat);   // tmp = fenceCF * tmpMat
            //fence.draw(posAttr, colAttr, modelUnif, tmpMat);
            fence.draw(posAttr, normalAttr, modelUnif, tmpMat);

            xPos += 0.5;
        }
    }
    if(typeof ground !== 'undefined'){
        /* calculate normal matrix from ringCF */
        gl.uniform1i (useLightingUnif, true);
        gl.disableVertexAttribArray(colAttr);
        gl.enableVertexAttribArray(normalAttr);
        ground.draw(posAttr, normalAttr, modelUnif, groundCF);
    }

    if(typeof sideP1L !== 'undefined'){
        /* calculate normal matrix from ringCF */
        gl.uniform1i (useLightingUnif, true);
        gl.disableVertexAttribArray(colAttr);
        gl.enableVertexAttribArray(normalAttr);
        var yPos = -1.5;
        for (let k = 0; k < 8; k++) {
            mat4.fromTranslation(tmpMat, vec3.fromValues(0, yPos, 0.25));
            mat4.multiply(tmpMat, sideP1LCF, tmpMat);
            sideP1L.draw(posAttr, normalAttr, modelUnif, tmpMat);

            mat4.fromTranslation(tmpMat, vec3.fromValues(-4, yPos, 0.25));
            mat4.multiply(tmpMat, sideP1LCF, tmpMat);
            sideP1L.draw(posAttr, normalAttr, modelUnif, tmpMat);
            yPos += 0.5;
        }
    }
    if(typeof sideP2 !== 'undefined'){
        /* calculate normal matrix from ringCF */
        gl.uniform1i (useLightingUnif, true);
        gl.disableVertexAttribArray(colAttr);
        gl.enableVertexAttribArray(normalAttr);
        var xPos = -3.5;
        for (let k = 0; k < 8; k++) {
            mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, 1.5, 0.25));
            mat4.multiply(tmpMat, sideP2CF, tmpMat);
            sideP2.draw(posAttr, normalAttr, modelUnif, tmpMat);

            mat4.fromTranslation(tmpMat, vec3.fromValues(xPos, -2.5, 0.25));
            mat4.multiply(tmpMat, sideP2CF, tmpMat);
            sideP2.draw(posAttr, normalAttr, modelUnif, tmpMat);
            xPos += 0.5;
        }

    }
    /*
    if(typeof cactus !== 'undefined'){
        /* calculate normal matrix from ringCF
        gl.uniform1i (useLightingUnif, true);
        gl.disableVertexAttribArray(colAttr);
        gl.enableVertexAttribArray(normalAttr);
        mat4.fromTranslation(tmpMat, vec3.fromValues(-1, -2, -0.25));
        mat4.multiply(tmpMat, cactusCF, tmpMat);
        cactus.draw(posAttr, normalAttr, modelUnif, tmpMat);

        let tmp2 = mat4.create();
        mat4.fromTranslation(tmpMat, vec3.fromValues(.5, .4, -0.25));
        mat4.fromRotation(tmp2, Math.PI / 2, vec3.fromValues(0,0,1));
        mat4.multiply(tmpMat, tmpMat, tmp2);
        mat4.multiply(tmpMat, cactusCF, tmpMat);
        cactus.draw(posAttr, normalAttr, modelUnif, tmpMat);
    } */
}

function ambColorChanged(ev) {
    switch (ev.target.id) {
        case 'r-amb-slider':
            objAmbient[0] = ev.target.value;
            break;
        case 'g-amb-slider':
            objAmbient[1] = ev.target.value;
            break;
        case 'b-amb-slider':
            objAmbient[2] = ev.target.value;
            break;
    }
    gl.uniform3fv(objAmbientUnif, objAmbient);
    redrawNeeded = true;
}

function colorChanged(ev) {
    switch (ev.target.id) {
        case 'redslider':
            objTint[0] = ev.target.value;
            break;
        case 'greenslider':
            objTint[1] = ev.target.value;
            break;
        case 'blueslider':
            objTint[2] = ev.target.value;
            break;
    }
    gl.uniform3fv(objTintUnif, objTint);
    redrawNeeded = true;
}

function lightPosChanged(ev) {
    switch (ev.target.id) {
        case 'lightx':
            lightPos[0] = ev.target.value;
            break;
        case 'lighty':
            lightPos[1] = ev.target.value;
            break;
        case 'lightz':
            lightPos[2] = ev.target.value;
            break;
    }
    mat4.fromTranslation(lightCF, lightPos);
    gl.uniform3fv (lightPosUnif, lightPos);
    let vertices = [
        0, 0, 0, 1, 1, 1,
        lightPos[0], 0, 0, 1, 1, 1,
        lightPos[0], lightPos[1], 0, 1, 1, 1,
        lightPos[0], lightPos[1], lightPos[2], 1, 1, 1];
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);
    redrawNeeded = true;
}


function objPosChanged(ev) {
    switch (ev.target.id) {
        case 'objx':
            ringCF[12] = ev.target.value;
            break;
        case 'objy':
            ringCF[13] = ev.target.value;
            break;
        case 'objz':
            ringCF[14] = ev.target.value;
            break;
    }
    redrawNeeded = true;
}

function eyePosChanged(ev) {
    switch (ev.target.id) {
        case 'eyex':
            eyePos[0] = ev.target.value;
            break;
        case 'eyey':
            eyePos[1] = ev.target.value;
            break;
        case 'eyez':
            eyePos[2] = ev.target.value;
            break;
    }
    mat4.lookAt(viewMat,
        eyePos,
        vec3.fromValues(0, 0, 0), /* focal point */
        vec3.fromValues(0, 0, 1)); /* up */
    mat4.invert (viewMatInverse, viewMat);
    redrawNeeded = true;
}

function keyboardHandler(event) {
    const transXpos = mat4.fromTranslation(mat4.create(), vec3.fromValues(.5, 0, 0));
    const transXneg = mat4.fromTranslation(mat4.create(), vec3.fromValues(-.5, 0, 0));
    const transYpos = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, .5, 0));
    const transYneg = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, -.5, 0));
    const transZpos = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, 0, .5));
    const transZneg = mat4.fromTranslation(mat4.create(), vec3.fromValues(0, 0, -.5));
    const rotXpos = mat4.fromXRotation(mat4.create(), Math.PI/6);
    const rotXneg = mat4.fromXRotation(mat4.create(), -Math.PI/6);
    const rotYpos = mat4.fromYRotation(mat4.create(), Math.PI/6);
    const rotYneg = mat4.fromYRotation(mat4.create(), -Math.PI/6);
    const rotZpos = mat4.fromZRotation(mat4.create(), Math.PI/6);
    const rotZneg = mat4.fromZRotation(mat4.create(), -Math.PI/6);

    if (document.getElementById("radioHouse").checked) {
        switch (event.key) {
            case "x":
                mat4.multiply(houseCF, houseCF, transXneg);  // objectCFs[1] = Trans * objectCFs[1]
                break;
            case "X":
                mat4.multiply(houseCF, houseCF, transXpos);  // objectCFs[1] = Trans * objectCFs[1]
                break;
            case "y":
                mat4.multiply(houseCF, houseCF, transYneg);  // objectCFs[1] = Trans * objectCFs[1]
                break;
            case "Y":
                mat4.multiply(houseCF, houseCF, transYpos);  // objectCFs[1] = Trans * objectCFs[1]
                break;
            case "z":
                mat4.multiply(houseCF, houseCF, transZneg);  // objectCFs[1] = Trans * objectCFs[1]
                break;
            case "Z":
                mat4.multiply(houseCF, houseCF, transZpos);  // objectCFs[1] = Trans * objectCFs[1]
                break;
            case "a":
                mat4.multiply(houseCF, houseCF, rotXneg);
                break;
            case "A":
                mat4.multiply(houseCF, houseCF, rotXpos);
                break;
            case "b":
                mat4.multiply(houseCF, houseCF, rotYneg);
                break;
            case "B":
                mat4.multiply(houseCF, houseCF, rotYpos);
                break;
            case "c":
                mat4.multiply(houseCF, houseCF, rotZneg);
                break;
            case "C":
                mat4.multiply(houseCF, houseCF, rotZpos);
                break;
        }
    } else if (document.getElementById("radioUFO").checked) {
        switch (event.key) {
            case "x":
                mat4.multiply(ufoCF, ufoCF, transXneg);  // objectCFs[0] = Trans * objectCFs[0]
                break;
            case "X":
                mat4.multiply(ufoCF, ufoCF, transXpos);  // objectCFs[0] = Trans * objectCFs[0]
                break;
            case "y":
                mat4.multiply(ufoCF, ufoCF, transYneg);  // objectCFs[0] = Trans * objectCFs[0]
                break;
            case "Y":
                mat4.multiply(ufoCF, ufoCF, transYpos);  // objectCFs[0] = Trans * objectCFs[0]
                break;
            case "z":
                mat4.multiply(ufoCF, ufoCF, transZneg);  // objectCFs[0] = Trans * objectCFs[0]
                break;
            case "Z":
                mat4.multiply(ufoCF, ufoCF, transZpos);  // objectCFs[0] = Trans * objectCFs[0]
                break;
            case "a":
                mat4.multiply(ufoCF, ufoCF, rotXneg);
                break;
            case "A":
                mat4.multiply(ufoCF, ufoCF, rotXpos);
                break;
            case "b":
                mat4.multiply(ufoCF, ufoCF, rotYneg);
                break;
            case "B":
                mat4.multiply(ufoCF, ufoCF, rotYpos);
                break;
            case "c":
                mat4.multiply(ufoCF, ufoCF, rotZneg);
                break;
            case "C":
                mat4.multiply(ufoCF, ufoCF, rotZpos);
                break;
        }
    }/* else if (document.getElementById("radioCactus").checked) {
        switch (event.key) {
            case "x":
                mat4.multiply(cactusCF, cactusCF, transXneg);
                mat4.multiply(cactusCF, cactusCF, transXneg);
                break;
            case "X":
                mat4.multiply(cactusCF, cactusCF, transXpos);
                mat4.multiply(cactusCF, cactusCF, transXpos);
                break;
            case "y":
                mat4.multiply(cactusCF, cactusCF, transYneg);
                mat4.multiply(cactusCF, cactusCF, transYneg);
                break;
            case "Y":
                mat4.multiply(cactusCF, cactusCF, transYpos);
                mat4.multiply(cactusCF, cactusCF, transYpos);
                break;
            case "z":
                mat4.multiply(cactusCF, cactusCF, transZneg);
                mat4.multiply(cactusCF, cactusCF, transZneg);
                break;
            case "Z":
                mat4.multiply(cactusCF, cactusCF, transZpos);
                mat4.multiply(cactusCF, cactusCF, transZpos);
                break;
            case "a":
                mat4.multiply(cactusCF, cactusCF, rotXneg);
                mat4.multiply(cactusCF, cactusCF, rotXneg);
                break;
            case "A":
                mat4.multiply(cactusCF, cactusCF, rotXpos);
                mat4.multiply(cactusCF, cactusCF, rotXpos);
                break;
            case "b":
                mat4.multiply(cactusCF, cactusCF, rotYneg);
                mat4.multiply(cactusCF, cactusCF, rotYneg);
                break;
            case "B":
                mat4.multiply(cactusCF, cactusCF, rotYpos);
                mat4.multiply(cactusCF, cactusCF, rotYpos);
                break;
            case "c":
                mat4.multiply(cactusCF, cactusCF, rotZneg);
                mat4.multiply(cactusCF, cactusCF, rotZneg);
                break;
            case "C":
                mat4.multiply(cactusCF, cactusCF, rotZpos);
                mat4.multiply(cactusCF, cactusCF, rotZpos);
                break;
        }
    }
        */

    switch(event.key){
        case "d":
            eyePos[0] -= .25; break;
        case "D":
            eyePos[0] += .25; break;
        case "e":
            eyePos[1] -= .25; break;
        case "E":
            eyePos[1] += .25; break;
        case "f":
            eyePos[2] -= .25; break;
        case "F":
            eyePos[2] += .25; break;

    }
    mat4.lookAt(viewMat,
        eyePos, /* eye */
        vec3.fromValues(0, 0, 1), /* focal point */
        vec3.fromValues(0, 0, 1)); /* up */
    redrawNeeded = true;
}

function render() {
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    draw3D();
    let now = Date.now();
    let elapse = (now - timeStamp)/1000; /* convert to second */
    timeStamp = now;
    let ringSpinAngle = elapse * (ufoSpeed / 60) * Math.PI * 2;
    mat4.rotateZ (ufoCF, ufoCF, ringSpinAngle);
    // mat4.translate(objectCFs[0], objectCFs[0], vec3.fromValues(0, 0, .01));
    requestAnimationFrame(render);
}

function draw3D() {
    /* We must update the projection and view matrices in the shader */
    gl.uniformMatrix4fv(projUnif, false, persProjMat);
    gl.uniformMatrix4fv(viewUnif, false, viewMat);
    mat4.mul (tmpMat, viewMat, ufoCF);
    mat3.normalFromMat4 (normalMat, tmpMat);
    gl.uniformMatrix3fv (normalUnif, false, normalMat);
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    //mat4.mul (tmpMat, viewMat, objectCFs[0]);
    //mat3.normalFromMat4 (normalMat, tmpMat);
    //gl.uniformMatrix3fv (normalUnif, false, normalMat);

    drawScene();
    // for (let k = 0; k < objects.length; k++) {
    //     gl.uniform1i(useLightingUnif, false);
    //     gl.disableVertexAttribArray(normalAttr);
    //     gl.enableVertexAttribArray(colAttr);
    //     //mat4.mul(tmpMat, tmpMat, objectCFs[k]);
    //     if (showNormal)
    //         objects[k].drawNormal(posAttr, colAttr, modelUnif, objectCFs[k]);
    //     if (showLightVectors)
    //         objects[k].drawVectorsTo(gl, lightPos, posAttr, colAttr, modelUnif, objectCFs[k]);
    // }
}

function resizeHandler() {
    glCanvas.width = window.innerWidth;
    glCanvas.height = 0.9 * window.innerHeight;
    if (glCanvas.width > glCanvas.height) { /* landscape */
        let ratio = glCanvas.height / glCanvas.width;
        mat4.perspective(persProjMat,
            Math.PI / 3, /* 60 degrees vertical field of view */
            1 / ratio, /* must be width/height ratio */
            1, /* near plane at Z=1 */
            20);
        /* far plane at Z=20 */
    }
}

function color (a, b, c){
    return vec3.fromValues(a/255.0, b/255.0, c/255.0);
}