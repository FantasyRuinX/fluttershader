#version 460 core
#include <flutter/runtime_effect.glsl>
precision mediump float;

uniform vec2 uSize;
uniform vec4 uColor;
uniform float uTime;

out vec4 FragColor;

float sdfSphere(vec2 uv, float size){
    return length(uv) - size;
}

float sdfSquare(vec2 uv){
    return length(uv.x * uv.y) + length(uv.x) + length(uv.y);
}

vec3 palette( float t ) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263,0.416,0.557);

    return a + b*cos( 6.28318*(c*t+d) );
}

void main() {
    vec2 uv = ((FlutterFragCoord() / uSize) * 2.) - 1.;
    uv -= vec2(0.,1.);
    vec2 uvOriginal = uv;
    float sdf;

    float void_center = (sdfSphere(uvOriginal,0.25));
    void_center = sin(void_center * 8. - uTime) / 8.;
    void_center = abs(void_center);
    void_center = smoothstep(0.,0.1,void_center);

    for (float i = 0.0; i < 2.0; i++) {
        uv *= vec2(sdfSquare(uvOriginal));
        uv = fract(uv * 1.1) - 0.5;
        sdf = sdfSquare(uv) * exp(-length(uvOriginal));

        sdf = sin(sdf * 8. - uTime) / 8.;
        sdf = abs(sdf);
        sdf = 0.01/sdf;
    }

    vec4 colorAlphaAdded = vec4((uColor.rgb + vec3(0.4)) * (sdf / void_center), uColor.a);
    FragColor = colorAlphaAdded;
}
