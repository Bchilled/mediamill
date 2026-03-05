import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';

const AI_COLORS = {
  claude: { core: '#7C6EFA', mid: '#4433DD', outer: '#110033', label: 'Claude',  company: 'Anthropic' },
  gemini: { core: '#00DDFF', mid: '#0077BB', outer: '#001122', label: 'Gemini',  company: 'Google'    },
  openai: { core: '#00FFB3', mid: '#008855', outer: '#001108', label: 'GPT-4',   company: 'OpenAI'    },
  grok:   { core: '#FF7700', mid: '#AA3300', outer: '#220500', label: 'Grok',    company: 'xAI'       },
};

const plasmaVert = `
uniform float uTime;
varying vec3 vNormal;varying vec3 vPos;varying float vDisp;
vec3 m3(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 m4(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 perm(vec4 x){return m4(((x*34.)+1.)*x);}
float sn(vec3 v){
  vec3 i=floor(v+dot(v,vec3(1./3.)));
  vec3 x0=v-i+dot(i,vec3(1./6.));
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
  vec3 i1=min(g,l.zxy);vec3 i2=max(g,l.zxy);
  vec3 x1=x0-i1+1./6.;vec3 x2=x0-i2+1./3.;vec3 x3=x0-.5;
  i=m3(i);
  vec4 p=perm(perm(perm(i.z+vec4(0,i1.z,i2.z,1))+i.y+vec4(0,i1.y,i2.y,1))+i.x+vec4(0,i1.x,i2.x,1));
  vec4 j=p-49.*floor(p*(1./7.)*(1./7.));
  vec4 x_=floor(j*(1./7.));vec4 y_=floor(j-7.*x_);
  vec4 x=x_*(1./7.)+1./14.;vec4 y=y_*(1./7.)+1./14.;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 nm=inversesqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=nm.x;p1*=nm.y;p2*=nm.z;p3*=nm.w;
  vec4 m=max(.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 96.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
void main(){
  vNormal=normal;float t=uTime*.3;
  float n=sn(position*1.6+vec3(t,t*.7,t*.5))*.16
         +sn(position*3.2+vec3(t*1.2,t,t*.8))*.07
         +sn(position*6.4+vec3(t*.7,t*1.1,t))*.03;
  vDisp=n;vec3 d=position+normal*n;vPos=d;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(d,1.);
}`;

const plasmaFrag = `
uniform float uTime;uniform vec3 uCore;uniform vec3 uMid;uniform vec3 uOuter;
varying vec3 vNormal;varying vec3 vPos;varying float vDisp;
void main(){
  vec3 vd=normalize(cameraPosition-vPos);
  float f=max(dot(normalize(vNormal),vd),0.);
  float heat=clamp(vDisp*4.+.55,0.,1.);
  vec3 col=mix(uOuter,uMid,heat);col=mix(col,uCore,pow(heat,1.8)*1.3);
  col+=uCore*pow(heat,4.)*.7;
  float alpha=pow(f,.3)*(.88+heat*.12);
  col*=.93+sin(uTime*7.+vPos.x*5.+vPos.y*3.)*.07;
  gl_FragColor=vec4(col,alpha);
}`;

const haloVert=`varying vec3 vN;varying vec3 vP;void main(){vN=normal;vP=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const haloFrag=`uniform vec3 uC;uniform float uT;uniform float uA;varying vec3 vN;varying vec3 vP;void main(){vec3 vd=normalize(cameraPosition-vP);float f=pow(1.-max(dot(normalize(vN),vd),0.),4.);gl_FragColor=vec4(uC,f*uA*(.7+sin(uT*.8)*.3));}`;

function PlasmaSun({ colors, position, onClick, pulseOffset }) {
  const g = useRef();
  const pU = useMemo(()=>({uTime:{value:0},uCore:{value:new THREE.Color(colors.core)},uMid:{value:new THREE.Color(colors.mid)},uOuter:{value:new THREE.Color(colors.outer)}}),[]);
  const h1 = useMemo(()=>({uC:{value:new THREE.Color(colors.core)},uT:{value:0},uA:{value:0.12}}),[]);
  const h2 = useMemo(()=>({uC:{value:new THREE.Color(colors.mid)}, uT:{value:0},uA:{value:0.05}}),[]);

  useFrame(({clock})=>{
    const t=clock.getElapsedTime()+pulseOffset;
    pU.uTime.value=t;h1.uT.value=t;h2.uT.value=t;
    g.current.rotation.y=t*.05;
    g.current.rotation.x=Math.sin(t*.11)*.06;
  });

  return (
    <group ref={g} position={position} onClick={onClick}>
      <mesh>
        <sphereGeometry args={[1.1,96,96]}/>
        <shaderMaterial vertexShader={plasmaVert} fragmentShader={plasmaFrag} uniforms={pU} transparent depthWrite={false}/>
      </mesh>
      <mesh>
        <sphereGeometry args={[1.6,32,32]}/>
        <shaderMaterial vertexShader={haloVert} fragmentShader={haloFrag} uniforms={h1} transparent depthWrite={false} side={THREE.BackSide} blending={THREE.AdditiveBlending}/>
      </mesh>
      <mesh>
        <sphereGeometry args={[2.2,32,32]}/>
        <shaderMaterial vertexShader={haloVert} fragmentShader={haloFrag} uniforms={h2} transparent depthWrite={false} side={THREE.BackSide} blending={THREE.AdditiveBlending}/>
      </mesh>
      <pointLight color={colors.core} intensity={6} distance={60} decay={2}/>
      <Billboard>
        <Text position={[0,-1.9,0]} fontSize={0.18} color="#EEEEFF" anchorX="center" anchorY="middle">{colors.label}</Text>
        <Text position={[0,-2.15,0]} fontSize={0.11} color={colors.core} anchorX="center" anchorY="middle">{colors.company}</Text>
      </Billboard>
    </group>
  );
}

function BinaryOrbit({suns,onSelect}){
  const r=useRef();
  useFrame(({clock})=>{r.current.rotation.y=clock.getElapsedTime()*.06;});
  return(
    <group ref={r}>
      {suns.map((sun,i)=>{
        const angle=(i/suns.length)*Math.PI*2;
        const dist=suns.length===1?0:2.8;
        const colors=AI_COLORS[sun.provider]||AI_COLORS.claude;
        return <PlasmaSun key={sun.id} colors={colors} position={[Math.cos(angle)*dist,0,Math.sin(angle)*dist]} onClick={e=>{e.stopPropagation();onSelect?.(sun.id);}} pulseOffset={i*2.1}/>;
      })}
    </group>
  );
}

export default function Suns({suns,onSelect}){
  if(!suns?.length)return null;
  return <BinaryOrbit suns={suns} onSelect={onSelect}/>;
}
