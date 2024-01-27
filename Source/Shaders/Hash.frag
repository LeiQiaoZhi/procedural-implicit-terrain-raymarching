// range [0, 1]
float hash(in vec2 _p) {
    float h = dot(_p, vec2(127.1, 311.7));
    return fract(sin(h) * 43758.5453);
}

float hash(in float _p)
{
    return fract(_p*17.0*fract(_p*0.3183099));
}

// range [0, 1]
vec2 hash2(in vec2 _p){
    _p = vec2(dot(_p, vec2(127.1, 311.7)), dot(_p, vec2(269.5, 183.3)));
    return fract(sin(_p) * 43758.5453123);
}

float hash1( vec2 p )
{
    p  = 59.0*fract( p*0.3183099 );
    return fract( p.x*p.y*(p.x+p.y) );
}

float hash1( float n )
{
    return fract( n*17.0*fract( n*0.3183099 ) );
}

