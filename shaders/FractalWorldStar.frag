/*#version 460 core
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

float sdfSphere(vec2 uv, float size, float intencity){
    return pow(length(uv) * size,intencity);
}

float sdfStar(vec2 uv){
    float d = pow(length(uv.x * uv.y),0.4);
    return pow(d + sdfSphere(uv,1.,50.),.5);
}

float sdfStarSingle(vec2 uv){
    float d = pow(length(uv.x * uv.y),0.4);
    return pow(d + sdfSphere(uv,1.,20.),.5);
}

vec3 palette(float t){
    vec3 a = vec3(.5,.5,.5);
    vec3 b = vec3(.5,.5,.5);
    vec3 c = vec3(1.,1.,1.);
    vec3 d = vec3(0.5843, 0.2235, 0.9216);
    return a - b * cos(6.28318 - (c * t + d));
}

void main() {

    vec2 uv = (gl_FragCoord.xy * 2. - u_resolution) / u_resolution.y;
    vec2 uvOriginal = uv;
    vec3 final_colour,col;
    float d,angle = u_time * 2.;

    //uv *= mat2(cos(.8),-sin(.8),sin(.8),cos(.8));


    for(int i = 0; i < 4; i++){

        //Wave
        uv = fract(uv * 1.75) - 0.5;
        float d = sdfStar(uv);
        vec3 col = palette(d + (angle));
    
        d = sin(d*4. + u_time) / 8.;
        d = 0.02/d;
        d = pow(d,2.);
        d = clamp(d,.2,.5);

        //Star bg
        float dbg = sdfStarSingle(uvOriginal);
    
        dbg = sin(dbg*.5 - u_time) / (clamp(sin(u_time) * 10.,2.,10.));
        dbg = 0.02/dbg;
        dbg *= 2.;
        dbg = pow(dbg,2.5);

        float final_alpha = (d * dbg * 2.);

        final_colour += (col * final_alpha);
    }

    gl_FragColor = vec4(final_colour,1.0);
    
}
*/
#version 460 core
#include <flutter/runtime_effect.glsl>

uniform vec2 uSize;
uniform vec4 uColor;
uniform float uTime;

out vec4 FragColor;

float sdfSphere(vec2 uv, float size){
    return length(uv) * size;
}

void main() {
    vec2 uv = ((FlutterFragCoord() / uSize) * 2.) - 1.;
    vec4 colorAlphaAdded = vec4(uColor.rgb * uColor.a, uColor.a);
    float sdf = 0.2/sdfSphere(uv,1.);
    sdf = sin(sdf*2. + uTime) / 2.;

    FragColor = colorAlphaAdded * (sdf);
}