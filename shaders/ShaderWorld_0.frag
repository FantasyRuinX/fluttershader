#version 460 core
#include <flutter/runtime_effect.glsl>
precision lowp float;

uniform vec2 uSize;
uniform float uTime;
uniform vec2 uTapOffset;

//palette variables
uniform vec3 a, b, c, d;
//

out vec4 FragColor;

float sdfSphere(vec2 uv, float size){
    return length(uv) - size;
}

float sdfHexagon(vec2 uv){
    return (length(uv.y - uv.x) + length(uv.y + uv.x) + length( uv.x));
}

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
        sdf = sdfHexagon(uv) * exp(-sdfHexagon(uvOriginal));

        add_colour = palette(sdfHexagon(uvOriginal) + spd);

        sdf = sin(sdf * 8. + spd) / 8.;
        sdf = abs(sdf);
        sdf = pow(0.025/sdf,2.);

        final_colour += add_colour * sdf;
    }

    vec4 colorAlphaAdded = vec4(final_colour,1.);
    FragColor = colorAlphaAdded;
}
