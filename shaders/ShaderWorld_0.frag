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
    float spd = uTime * 4.;
    float sdf;
    vec3 add_colour;
    vec3 final_colour = vec3(0.);

    float uv_distort = sdfSphere(uvOriginal,0.5);
    uv_distort = sin(uv_distort * 2. - spd) / 2.;
    uv_distort = 0.5/uv_distort;
    uv /= uv_distort;

    for (float i = 0.0; i < 2.0; i++) {

        uv = fract(uv * 1.5)-0.5;

        if (index == 0) {sdf = sdfHexagon(uv) * exp(-sdfHexagon(uvOriginal));}
        if (index == 1) {sdf = sdfSphere(uv,0.25) * exp(-sdfSphere(uvOriginal,0.25));}

        add_colour = palette(sdfHexagon(uvOriginal) + spd);

        float oldsdf = sdf;
        sdf = sin(sdf * 8. + spd) / 8.;
        sdf = abs(sdf);
        sdf = pow(0.025/sdf,2.);

        final_colour += add_colour * min(oldsdf,sdf);
    }

    vec4 colorAlphaAdded = vec4(final_colour,1.);
    FragColor = colorAlphaAdded;
}
