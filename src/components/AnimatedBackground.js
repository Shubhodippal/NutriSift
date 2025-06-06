import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles({ count = 1000 }) {
  const mesh = useRef();
  const light = useRef();
  
  // Colors
  const particleColor = useMemo(() => new THREE.Color('#7eafff'), []); 
  const highlightColor = useMemo(() => new THREE.Color('#ffcb75'), []);
  
  // Generate particles
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const time = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      // Reduce speed by 3x for slower animation
      const speed = (0.01 + Math.random() / 200) / 3;
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
  
  // Animation - SLOWER movement
  useFrame(() => {
    const positions = mesh.current.geometry.attributes.position.array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const { time, factor, speed, x, y, z } = particles[i];
      
      // Slow down oscillation factors
      const a = Math.cos(time) + Math.sin(time * 0.4) / 10; // from 0.8 to 0.4
      const b = Math.sin(time) + Math.cos(time * 0.7) / 10; // from 1.5 to 0.7
      
      positions[i3] = x + a * factor;
      positions[i3 + 1] = y + b * factor;
      positions[i3 + 2] = z + b * factor;
      
      particles[i].time += speed;
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
    
    // Slow down light movement
    light.current.position.set(
      Math.sin(Date.now() / 25000) * 500, // from 10000 to 25000
      Math.cos(Date.now() / 25000) * 500, // from 10000 to 25000
      Math.sin(Date.now() / 20000) * 500  // from 7000 to 20000
    );
  });
  
  return (
    <>
      <pointLight ref={light} distance={1000} intensity={3} color="#7eafff" />
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
          opacity={0.7}
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
        <color attach="background" args={['#111827']} />
        <Particles count={1800} /> {/* Reduced particle count */}
      </Canvas>
    </div>
  );
}

export default AnimatedBackground;