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

mat2 rotate2D(float a) {
    return mat2(cos(a), -sin(a), sin(a), cos(a));
}

float mapOctahedron(vec3 point) {
    float sdf;
    //move forward
    point.z += uTime * 4.;

    point = fract(point * .5) - .5;
    point.z = mod(point.z, .25) - .125;
    sdf = sdfOctahedron3D(point,.15);

    //spacing
    return sdf;
}

float mapMixOctSqu(vec3 point) {
    float sdf,sdf2;
    //move forward
    point.z += sin(point.z + (uTime * 4.));

    point = fract(point) - .5;
    point.z = mod(point.z, .25) - .125;
    sdf = sdfOctahedron3D(point,.15);
    sdf2 = sdfSquare3D(point,.05);

    //spacing
    return mix(sdf,sdf2,.5 + sin(point.z + (uTime * 4.)) * .5);
}

float mapStar(vec3 point) {
    float sdf;
    //move forward
    point.z += sin(point.z + (uTime * 4.));

    point = fract(point * 1.5) - .5;
    point.z = mod(point.z, .5) - .25;
    sdf = sdfOctahedron3D(point,.05);

    //spacing
    return (length(point) - 0.05) - sdf;
}

float mapGalaxy(vec3 point) {
    float sdf,sdf2;
    //move forward
    point.z += uTime * 4.;

    point = fract(point) - .5;
    point.z = mod(point.z, .5) - .25;
    sdf = length(point);

    //spacing
    return sdf;
}

vec3 paletteCyan(float t){
    vec3 a = vec3(0.0, 0.5, 1.0);   // Base cyan color
    vec3 b = vec3(0.2, 0.7, 1.0);   // Lighter cyan shade
    vec3 c = vec3(0.0, 1.0, 1.0);   // Full cyan
    vec3 d = vec3(0.4, 0.4, 0.8);   // Slightly darker cyan tone
    return a * b - b * cos(6.28318 - (c * t + d));
}

vec3 palette(float t) {
    return .5+.5*cos(6.28318*(t+vec3(.3,.416,.557)));
}

void main() {
    //Set uv and calculate offset
    vec2 uv = ((FlutterFragCoord() / uSize) * 2.) - 1.;
    vec2 offset = ((uTapOffset / uSize) * 2.) - 1;
    float spd = uTime * 2.5;
    uv -= vec2(0., 1.);
    uv -= offset - vec2(0., 1.);

    //Set ray marching
    float distance_traveled = 0.;
    vec3 world_origin = vec3(0., 0., -3.);
    vec3 ray_direction = normalize(vec3(uv, 1.));
    vec3 final_colour = vec3(0.);
    float d;

    //Ray marching
    int i;
    for (int i = 0; i < 80; i++) {
        vec3 point = world_origin + ray_direction * distance_traveled;

        if (index == 0) {
            point.xy *= rotate2D((distance_traveled * .15));
            d = mapGalaxy(point);}
        else if (index == 1) {
            point.xy *= rotate2D((distance_traveled * .15));
            d = mapOctahedron(point);}
        else if (index == 2) {d = mapMixOctSqu(point);}
        else if (index == 3) {
            point.xy *= rotate2D((distance_traveled * .15));
            d = mapStar(point);}
        distance_traveled += d;
        if (d < .001 || distance_traveled > 80.) break;
    }

    final_colour = palette(distance_traveled*.04 + float(i)*.005);

    FragColor = vec4(final_colour, 1.);
}
