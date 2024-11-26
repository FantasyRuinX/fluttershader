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

float sdfSquare(vec2 uv,float angle){
    float cosA = cos(angle);
    float sinA = sin(angle);
    uv *= mat2(cosA, -sinA, sinA, cosA);
    return max(abs(uv.x), abs(uv.y)) - 0.5;
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

    vec2 uvOriginal = uv;// * (0.75 + sin(uTime) * 0.25);
    float sdf;
    float spd = uTime * 3.;
    vec3 final_colour = vec3(0.);

    for (float i = 0.0; i < 2.0; i++) {
        uv = fract(uv * 1.5)-0.5;

        float uv_distort = sdfSphere(uvOriginal,0.);
        uv_distort = sin(uv_distort * 2. - spd) / 2.;
        uv_distort = 0.5/uv_distort;
        uv /= uv_distort;

        sdf = max(abs(uv.x), abs(uv.y)) - 0.5 * (-max(abs(uv.x), abs(uv.y)) - 0.5);
        vec3 add_colour = palette(sdf + spd);

        sdf = sin(sdf * 4. - spd) / 4.;
        sdf = abs(sdf);
        sdf = 0.01/sdf;

        final_colour += add_colour * max(sdf,abs(0.01/sdfSquare(uv,-spd)));
    }

    vec4 colorAlphaAdded = vec4(final_colour, 1.);
    FragColor = colorAlphaAdded;
}
