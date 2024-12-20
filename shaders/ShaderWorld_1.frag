#version 460 core
#include <flutter/runtime_effect.glsl>
precision lowp float;

uniform vec2 uSize;
uniform float uTime;
uniform vec2 uTapOffset;

//palette variables
uniform vec3 a, b, c, d;
//

uniform float index;
uniform float fractal;

out vec4 FragColor;

#include "ShaderSDFs.frag"

vec3 palette( float t ) {
    return a + b*cos( 6.28318*(c*t+d) );
}

void main() {

    //Set uv and calculate offset
    vec2 uv = ((FlutterFragCoord() / uSize) * 2.) - 1.;
    vec2 offset = ((uTapOffset/uSize) * 2.) - 1;
    uv -= vec2(0.,1.);
    uv -= offset - vec2(0.,1.);

    vec2 uvOriginal = uv;
    float sdf,sdfMix;
    float spd = uTime * 3.;
    vec3 final_colour = vec3(0.);

    for (float i = 0.0; i < 3.0; i++) {
        uv = fract(uv * fractal)-0.5;

        float uv_distort = sdfSphere(uvOriginal,0.);
        uv_distort = sin(uv_distort * 2. - spd) / 2.;
        uv_distort = 0.5/uv_distort;
        uv /= uv_distort;

        if (index == 0) {
            sdf = sdfSquare(uv) * exp(-sdfSquare(uvOriginal));
            sdfMix = abs(0.01/sdfSquare(uv,-spd));}
        else if (index == 1) {
            sdf = sdfSphere(uv,0.25) * exp(-sdfSphere(uvOriginal,0.25));
            sdfMix = abs(0.01/sdfSphere(uv,0.25));}
        else if (index == 2) {
            sdf = sdfHexagon(uv) * exp(-sdfHexagon(uvOriginal));
            sdfMix = abs(0.01/sdfHexagon(uv));}
        else if (index == 3) {
            sdf = sdfStar(uv) * exp(-sdfStar(uvOriginal));
            sdfMix = abs(0.01/sdfStar(uv));}

        vec3 add_colour = palette(sdf + spd);

        sdf = sin(sdf * 4. - spd) / 4.;
        sdf = abs(sdf);
        sdf = 0.01/sdf;

        final_colour += add_colour * max(sdf,sdfMix);
    }

    vec4 colorAlphaAdded = vec4(final_colour, 1.);
    FragColor = colorAlphaAdded;
}
