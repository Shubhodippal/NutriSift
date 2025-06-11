import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles({ count = 1000, isMobile = false }) {
  const mesh = useRef();
  const light = useRef();
  
  // Colors - lighter and more transparent for mobile
  const particleColor = useMemo(() => new THREE.Color(isMobile ? '#a0c2ff' : '#7eafff'), [isMobile]);
  const highlightColor = useMemo(() => new THREE.Color(isMobile ? '#ffd899' : '#ffcb75'), [isMobile]);
  
  // Generate particles - this shouldn't change after initial creation
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const time = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = (0.01 + Math.random() / 200) / (isMobile ? 2.5 : 3);
      const x = Math.random() * 2000 - 1000;
      const y = Math.random() * 2000 - 1000;
      const z = Math.random() * 2000 - 1000;
      
      temp.push({ time, factor, speed, x, y, z });
    }
    return temp;
  }, [count]); // Only depends on count, NOT isMobile to prevent recreation
  
  // Create buffers - keep these stable
  const buffers = useMemo(() => {
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
    
    return { positions, colors };
  }, [count, particles, particleColor, highlightColor]);
  
  // Animation - store local positions array to avoid buffer resizing issues
  const positionArray = useRef(new Float32Array(buffers.positions));
  const frameCount = useRef(0);
  
  useFrame(() => {
    if (!mesh.current) return;
    
    // For mobile, update less frequently but never stop completely
    if (isMobile && frameCount.current++ % 3 !== 0) return;
    
    // Work with local copy of positions
    const positions = positionArray.current;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const { time, factor, speed, x, y, z } = particles[i];
      
      // Gentle movement even on mobile
      const a = Math.cos(time) + Math.sin(time * 0.4) / 10; 
      const b = Math.sin(time) + Math.cos(time * 0.7) / 10; 
      
      positions[i3] = x + a * factor;
      positions[i3 + 1] = y + b * factor;
      positions[i3 + 2] = z + b * factor;
      
      particles[i].time += speed;
    }
    
    // Copy local positions to actual buffer
    mesh.current.geometry.attributes.position.array.set(positions);
    mesh.current.geometry.attributes.position.needsUpdate = true;
    
    // Slower light movement on mobile but still moving
    if (light.current) {
      light.current.position.set(
        Math.sin(Date.now() / (isMobile ? 28000 : 25000)) * 500, 
        Math.cos(Date.now() / (isMobile ? 28000 : 25000)) * 500, 
        Math.sin(Date.now() / (isMobile ? 23000 : 20000)) * 500  
      );
    }
  });
  
  return (
    <>
      <pointLight 
        ref={light} 
        distance={1000} 
        intensity={isMobile ? 1.8 : 3} 
        color={isMobile ? "#a0c2ff" : "#7eafff"} 
      />
      <points ref={mesh}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={buffers.positions.length / 3}
            array={buffers.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={buffers.colors.length / 3}
            array={buffers.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isMobile ? 3.5 : 4.5}
          sizeAttenuation={true}
          depthWrite={false}
          vertexColors
          transparent
          opacity={isMobile ? 0.5 : 0.7}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

function AnimatedBackground() {
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile devices once at component mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Use a fixed count that doesn't change after mount to prevent buffer issues
  const particleCount = useMemo(() => {
    return window.innerWidth <= 768 ? 600 : 1800;
  }, []);
  
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
        frameloop="always"
      >
        <color attach="background" args={['#111827']} />
        <Particles 
          count={particleCount}
          isMobile={isMobile} 
        />
      </Canvas>
    </div>
  );
}

export default AnimatedBackground;