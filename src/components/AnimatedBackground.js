import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles({ count = 2000 }) {
  const mesh = useRef();
  const light = useRef();
  
  // Properly memoize the colors to avoid re-renders
  const particleColor = useMemo(() => new THREE.Color('#5d93ff'), []);
  const highlightColor = useMemo(() => new THREE.Color('#ffb347'), []);
  
  // Generate particles
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const time = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const x = Math.random() * 2000 - 1000;
      const y = Math.random() * 2000 - 1000;
      const z = Math.random() * 2000 - 1000;
      
      temp.push({ time, factor, speed, x, y, z });
    }
    return temp;
  }, [count]);
  
  // Create positions and colors for particles
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = particles[i].x;
      positions[i3 + 1] = particles[i].y;
      positions[i3 + 2] = particles[i].z;
      
      const mixer = particles[i].factor > 80 ? 0.4 : 0.2;
      const color = particleColor.clone().lerp(highlightColor, mixer);
      
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }
    
    return [positions, colors];
  }, [count, particles, particleColor, highlightColor]);
  
  // Animation - slower movement
  useFrame(() => {
    const positions = mesh.current.geometry.attributes.position.array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const { time, factor, speed, x, y, z } = particles[i];
      
      const a = Math.cos(time) + Math.sin(time * 0.8) / 10;
      const b = Math.sin(time) + Math.cos(time * 1.5) / 10;
      
      positions[i3] = x + a * factor;
      positions[i3 + 1] = y + b * factor;
      positions[i3 + 2] = z + b * factor;
      
      particles[i].time += speed;
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
    
    light.current.position.set(
      Math.sin(Date.now() / 10000) * 500,
      Math.cos(Date.now() / 10000) * 500,
      Math.sin(Date.now() / 7000) * 500
    );
  });
  
  return (
    <>
      <pointLight ref={light} distance={1000} intensity={2.5} color="#4f8cff" />
      <points ref={mesh}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={4.5}
          sizeAttenuation={true}
          depthWrite={false}
          vertexColors
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

function AnimatedBackground() {
  return (
    <div className="threejs-background">
      <Canvas
        camera={{ position: [0, 0, 50], fov: 75, near: 1, far: 5000 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <Particles count={1800} />
      </Canvas>
    </div>
  );
}

export default AnimatedBackground;