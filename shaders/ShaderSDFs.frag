precision lowp float;

//2D SDFs
float sdfSphere(vec2 uv, float size){
    return length(uv) - size;
}

float sdfHexagon(vec2 uv){
    return (length(uv.y - uv.x) + length(uv.y + uv.x) + length( uv.x));
}

float sdfSquare(vec2 uv){
    return max(abs(uv.x), abs(uv.y)) - 0.5;
}

float sdfSquare(vec2 uv,float angle){
float cosA = cos(angle);
float sinA = sin(angle);
uv *= mat2(cosA, -sinA, sinA, cosA);
return max(abs(uv.x), abs(uv.y)) - 0.5;
}

float sdfStar(vec2 uv){
    float d = pow(length((uv.x * uv.y)),0.4);
    return pow(d + sdfSphere(uv,0.5),1.5);
}
//---------------------------------

//3D SDFs
float sdfSphere3D(vec3 point, float size){
    return length(point) - size;
}

float sdfSquare3D(vec3 point,float size){
    vec3 q = abs(point) - size;
    return length(max(q,.0)) + min(max(q.x,max(q.y,q.z)),.0);
}


float sdfOctahedron3D(vec3 p, float s) {
    p = abs(p);
    return (p.x + p.y + p.z - s) * 0.5;
}
//---------------------------------