precision lowp float;

//Sphere
float sdfSphere(vec2 uv, float size){
    return length(uv) - size;
}

//Hexagon
float sdfHexagon(vec2 uv){
    return (length(uv.y - uv.x) + length(uv.y + uv.x) + length( uv.x));
}

//Square
float sdfSquare(vec2 uv){
    return max(abs(uv.x), abs(uv.y)) - 0.5;
}

float sdfSquare(vec2 uv,float angle){
float cosA = cos(angle);
float sinA = sin(angle);
uv *= mat2(cosA, -sinA, sinA, cosA);
return max(abs(uv.x), abs(uv.y)) - 0.5;
}

//Star
float sdfStar(vec2 uv){
    float d = pow(length((uv.x * uv.y)),0.4);
    return pow(d + sdfSphere(uv,0.5),1.5);
}