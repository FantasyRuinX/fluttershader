
float sdfSphere(vec2 uv, float size){
    return length(uv) - size;
}

float sdfHexagon(vec2 uv){
    return (length(uv.y - uv.x) + length(uv.y + uv.x) + length( uv.x));
}
