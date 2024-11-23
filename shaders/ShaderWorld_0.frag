#version 460 core
#include <flutter/runtime_effect.glsl>
precision lowp float;

uniform vec2 uSize;
uniform vec4 uColor;
uniform float uTime;
uniform vec2 uTapOffset;

out vec4 FragColor;

float sdfSphere(vec2 uv, float size){
    return length(uv) - size;
}

float sdfSquare(vec2 uv){
    return length(uv.x * uv.y) + length(uv.x) + length(uv.y);
}

float sdfLineWave(vec2 uv,float spd,float thickness,float frequency,float amplitude,float angle){
    uv *= mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
    return thickness / length(uv.y + (cos((uv.x * frequency) + spd) * amplitude));
}

vec3 palette( float t ) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263,0.416,0.557);

    return a + b*cos( 6.28318*(c*t+d) );
}

void main() {

    //Set uv and calculate offset
    vec2 uv = ((FlutterFragCoord() / uSize) * 2.) - 1.;
    vec2 offset = ((uTapOffset/uSize) * 2.) - 1;
    uv -= vec2(0.,1.);
    uv -= offset - vec2(0.,1.);

    vec2 uvOriginal = uv;
    float sdf;
    float spd = uTime * 4.;
    vec3 add_colour = palette(spd);

    float uv_distort = sdfSphere(uvOriginal,0.5);
    uv_distort = sin(uv_distort * 2. - spd) / 2.;
    uv_distort = 0.5/uv_distort;
    //uv /= uv_distort;

    for (float i = 0.0; i < 3.0; i++) {
        uv = fract(uv * 1.25)-0.5;

        sdf = sdfSquare(uv) * exp(-length(uvOriginal));
        sdf = sin(sdf * 2. - spd) / 2.;
        sdf = abs(sdf);
        sdf = 0.02/sdf;

        add_colour += palette(spd) * (sdf);
    }

    vec4 colorAlphaAdded = vec4((uColor.rgb + add_colour) * (sdf), uColor.a);
    FragColor = colorAlphaAdded;
}
