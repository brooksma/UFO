attribute vec3 vertexNormal; //NEED normalAttr
attribute vec3 vertexPos; //posAttr
attribute vec3 vertexCol; //colAttr

uniform mat4 projection;
uniform mat4 view;
uniform mat4 modelCF;
uniform mat3 normalMat;

uniform vec3 lightPosWorld;
uniform vec3 lightPosSecond;
uniform float diffuseCoeff;
uniform float ambientCoeff;
uniform float specularCoeff;
uniform float shininess;
uniform vec3 objectTint;
uniform bool useLighting;
uniform bvec3 isEnabled; // isEnabled: {ambient, diffuse, soecular}

/*varying variables are passed to the fragment shader*/
varying vec4 varColor;

void main() {
  //gl_Position = projection * view * modelCF * vec4(vertexPos, 1);
  gl_PointSize = 4.0;
  //varColor = vec4 (vertexCol, 1.0);

  vec4 vertexPosInEye = view * modelCF * vec4(vertexPos, 1);
  vec4 lightPosInEye = view * vec4(lightPosWorld, 1);
  gl_Position = projection*vertexPosInEye;
  if (useLighting){
      vec3 color = vec3(0,0,0);
      vec3 lightVecInEye = normalize(vec3(lightPosInEye - vertexPosInEye));
      vec3 normalInEye = normalize(normalMat * vertexNormal);
      if(isEnabled[0]){
          color += ambientCoeff * objectTint;
      }
      if(isEnabled[1]){
          float diffuse = clamp (dot(lightVecInEye,normalInEye),0.0,1.0);
          color += diffuse * diffuseCoeff * objectTint;
      }
      if(isEnabled[2]){
          vec3 viewVec = normalize(-vertexPosInEye.xyz);
          vec3 reflectVec = reflect(-lightVecInEye, normalInEye);
          float specular = clamp (dot(viewVec,reflectVec),0.0,1.0);
          color += pow(specular, shininess)* specularCoeff * vec3(1,1,1);
      }
      varColor = vec4(color, 1);
  } else {
      varColor = vec4(vertexCol,1);
  }
}
