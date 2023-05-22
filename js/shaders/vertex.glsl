varying vec2 vUv;
varying float time;

void main() {
    vUv = uv;
    vec3 p = position;
    p.z += sin(position.y * 10.0 + time) * 0.1;

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (30.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}