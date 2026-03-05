import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';

const AI_COLORS = {
  claude: { core: '#7C6EFA', mid: '#4433DD', outer: '#220066', label: 'Claude',  company: 'Anthropic' },
  gemini: { core: '#00DDFF', mid: '#0088CC', outer: '#002244', label: 'Gemini',  company: 'Google'    },
  openai: { core: '#00FFB3', mid: '#009966', outer: '#002211', label: 'GPT-4',   company: 'OpenAI'    },
  grok:   { core: '#FF6600', mid: '#CC3300', outer: '#330800', label: 'Grok',    company: 'xAI'       },
};

const plasmaVert = `
uniform float uTime;
varying vec3 vNormal;
varying vec3 vPos;
varying float vDisp;
vec3 mod289v3(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289v4(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289v4(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-vec3(0.5);
  i=mod289v3(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  vec3 ns=0.142857142857*vec3(1.,2.,-1.)-vec3(0.,0.,0.);
  vec4 j=p-49.*floor(p*0.0204081632653*0.0204081632653);
  vec4 x_=floor(j*0.0204081632653);
  vec4 y_=floor(j-7.*x_);
  vec4 x=x_*0.142857142857+0.333333333333;
  vec4 y=y_*0.142857142857+0.333333333333;
  vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;
  vec4 s1=floor(b1)*2.+1.;
  vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
  m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
void main(){
  vNormal=normal;
  float t=uTime*0.35;
  float n=snoise(position*1.8+vec3(t,t*0.7,t*0.5))*0.18
         +snoise(position*3.5+vec3(t*1.3,t,t*0.9))*0.08
         +snoise(position*7.0+vec3(t*0.8,t*1.1,t))*0.035;
  vDisp=n;
  vec3 displaced=position+normal*n;
  vPos=displaced;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(displaced,1.0);
}`;

const plasmaFrag = `
uniform float uTime;
uniform vec3 uCore;
uniform vec3 uMid;
uniform vec3 uOuter;
varying vec3 vNormal;
varying vec3 vPos;
varying float vDisp;
void main(){
  vec3 viewDir=normalize(cameraPosition-vPos);
  float facing=max(dot(normalize(vNormal),viewDir),0.);
  float fresnel=pow(1.-facing,2.5);
  float heat=clamp(vDisp*4.+0.55,0.,1.);
  vec3 col=mix(uOuter,uMid,heat);
  col=mix(col,uCore,pow(heat,1.8)*1.3);
  col+=uCore*pow(heat,4.)*0.8;
  float limb=pow(facing,0.35);
  float alpha=limb*(0.88+heat*0.12);
  float flicker=0.94+sin(uTime*8.1+vPos.x*5.+vPos.y*3.)*0.06;
  gl_FragColor=vec4(col*flicker,alpha);
}`;

const haloVert = `
varying vec3 vNormal;
varying vec3 vPos;
void main(){
  vNormal=normal;
  vPos=(modelMatrix*vec4(position,1.0)).xyz;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}`;

const haloFrag = `
uniform vec3 uColor;
uniform float uTime;
uniform float uScale;
varying vec3 vNormal;
varying vec3 vPos;
void main(){
  vec3 viewDir=normalize(cameraPosition-vPos);
  float f=pow(1.-max(dot(normalize(vNormal),viewDir),0.),3.5);
  float pulse=0.75+sin(uTime*0.9)*0.25;
  gl_FragColor=vec4(uColor,f*uScale*pulse);
}`;

function PlasmaSun({ colors, position, onClick, pulseOffset }) {
  const groupRef = useRef();
  const plasmaU = useMemo(() => ({
    uTime:  { value: 0 },
    uCore:  { value: new THREE.Color(colors.core) },
    uMid:   { value: new THREE.Color(colors.mid) },
    uOuter: { value: new THREE.Color(colors.outer) },
  }), []);
  const halo1U = useMemo(() => ({ uColor: { value: new THREE.Color(colors.core) }, uTime: { value: 0 }, uScale: { value: 0.2 } }), []);
  const halo2U = useMemo(() => ({ uColor: { value: new THREE.Color(colors.mid) },  uTime: { value: 0 }, uScale: { value: 0.1 } }), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + pulseOffset;
    plasmaU.uTime.value = t;
    halo1U.uTime.value = t;
    halo2U.uTime.value = t;
    groupRef.current.rotation.y = t * 0.05;
    groupRef.current.rotation.x = Math.sin(t * 0.11) * 0.06;
  });

  return (
    <group ref={groupRef} position={position} onClick={onClick}>
      <mesh>
        <sphereGeometry args={[1.1, 96, 96]} />
        <shaderMaterial vertexShader={plasmaVert} fragmentShader={plasmaFrag} uniforms={plasmaU} transparent depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.7, 32, 32]} />
        <shaderMaterial vertexShader={haloVert} fragmentShader={haloFrag} uniforms={halo1U} transparent depthWrite={false} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh>
        <sphereGeometry args={[3.0, 32, 32]} />
        <shaderMaterial vertexShader={haloVert} fragmentShader={haloFrag} uniforms={halo2U} transparent depthWrite={false} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight color={colors.core} intensity={8} distance={80} decay={2} />
      <Billboard>
        <Text position={[0,-2.2,0]} fontSize={0.2} color="#EEEEFF" anchorX="center" anchorY="middle">{colors.label}</Text>
        <Text position={[0,-2.5,0]} fontSize={0.13} color={colors.core} anchorX="center" anchorY="middle">{colors.company}</Text>
      </Billboard>
    </group>
  );
}

function BinaryOrbit({ suns, onSelect }) {
  const ref = useRef();
  useFrame(({ clock }) => { ref.current.rotation.y = clock.getElapsedTime() * 0.06; });
  return (
    <group ref={ref}>
      {suns.map((sun, i) => {
        const angle = (i / suns.length) * Math.PI * 2;
        const r = suns.length === 1 ? 0 : 2.8;
        const colors = AI_COLORS[sun.provider] || AI_COLORS.claude;
        return <PlasmaSun key={sun.id} colors={colors} position={[Math.cos(angle)*r,0,Math.sin(angle)*r]} onClick={e=>{e.stopPropagation();onSelect?.(sun.id);}} pulseOffset={i*2.1} />;
      })}
    </group>
  );
}

export default function Suns({ suns, onSelect }) {
  if (!suns?.length) return null;
  return <BinaryOrbit suns={suns} onSelect={onSelect} />;
}
