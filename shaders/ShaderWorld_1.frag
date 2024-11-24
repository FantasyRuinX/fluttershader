#version 460 core
#include <flutter/runtime_effect.glsl>
precision lowp float;

uniform vec2 uSize;
uniform float uTime;
uniform vec2 uTapOffset;

out vec4 FragColor;

float sdfSphere(vec2 uv, float size){
    return length(uv) - size;
}

float sdfSquare(vec2 uv,float angle){
    uv *= mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
    return max(abs(uv.x), abs(uv.y)) - 0.5;
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

    vec2 uvOriginal = uv;// * (0.75 + sin(uTime) * 0.25);
    float sdf;
    float spd = uTime * 2.;
    vec3 final_colour = vec3(0.);

    float uv_distort = sdfSphere(uvOriginal,0.5);
    uv_distort = sin(uv_distort * 2. - spd) / 2.;
    uv_distort = 0.5/uv_distort;
    uv /= uv_distort;

    for (float i = 0.0; i < 4.0; i++) {
        uv = fract(uv * 1.5)-0.5;

        float angle = 45 + (i * 45) + spd;
        uv *= mat2(cos(angle),-sin(angle),sin(angle),cos(angle));

        sdf = sdfSquare(uv,-spd) * exp(-sdfSquare(uvOriginal,-spd));
        vec3 add_colour = palette(sdf + spd);

        sdf = sin(sdf * 4. - spd) / 4.;
        sdf = abs(sdf);
        sdf = 0.01/sdf;

        final_colour += add_colour * sdf;
    }

    vec4 colorAlphaAdded = vec4(final_colour, 1.);
    FragColor = colorAlphaAdded;
}
