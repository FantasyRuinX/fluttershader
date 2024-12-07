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

float sdfStar3D(vec3 point){
    point = abs(point);
    float d = pow(length(point.x * point.y * point.z),0.3);
    return d;
}

float mapStar(vec3 point) {

    //move forward
    point.z += uTime * 4.;

    point.xy = fract(point.xy * fractal) - .5;
    //spacing
    point.z = mod(point.z, .25) - .125;

    return sdfStar3D(point);
}

vec3 palette(float t) {
    return .5 + .5 * cos(6.28318 * (t + vec3(.3, .416, .557)));
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
        point.xy *= rotate2D((distance_traveled * .2) - (uTime * 5.));

        if (index == 0) {d = mapStar(point);}
        else if (index == 1) {d = mapStar(point);}
        else if (index == 2) {d = mapStar(point);}
        else if (index == 3) {d = mapStar(point);}
        distance_traveled += d;
        if (d < .001 || distance_traveled > 100.) break;


    }

    final_colour = palette(distance_traveled * .04 + float(i) * .005);

    FragColor = vec4(final_colour, 1.);
}
