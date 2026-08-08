'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface ThreeJSAvatarProps {
  isSpeaking: boolean;
  isThinking: boolean;
  candidateName: string;
}

export default function ThreeJSAvatar({
  isSpeaking,
  isThinking,
  candidateName,
}: ThreeJSAvatarProps) {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [modelLoaded, setModelLoaded] = useState<boolean>(false);

  // Mutable refs to prevent React re-mounting / WebGL context destruction
  const isSpeakingRef = useRef<boolean>(isSpeaking);
  const isThinkingRef = useRef<boolean>(isThinking);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sync props to refs without re-running mount effect
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isThinkingRef.current = isThinking;
  }, [isThinking]);

  // Handle Mouse Parallax for Desktop
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseRef.current = {
        x: (e.clientX / innerWidth - 0.5) * 0.4,
        y: (e.clientY / innerHeight - 0.5) * 0.4,
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Mount Three.js Canvas ONCE in isolated containerRef
  useEffect(() => {
    const mountNode = canvasMountRef.current;
    if (!mountNode) return;

    const width = mountNode.clientWidth || 340;
    const height = mountNode.clientHeight || 340;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0f19); // Midnight Studio background

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    mountNode.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 1.8;
    controls.minDistance = 0.5;
    controls.maxDistance = 4;
    controls.enableZoom = false;

    // 1. Studio Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.2);
    keyLight.position.set(2.5, 4, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x818cf8, 1.4); // Electric Indigo fill
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xc7d2fe, 1.8);
    rimLight.position.set(0, 3, -2.5);
    scene.add(rimLight);

    // Dynamic State Light Beam (Audio/State reactive spotlight)
    const stateSpotlight = new THREE.SpotLight(0x4f46e5, 3, 10, Math.PI / 6, 0.5, 1);
    stateSpotlight.position.set(0, 4, 0);
    scene.add(stateSpotlight);

    // 2. Neural Particle Constellation Background
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8;
      particlePositions[i + 1] = Math.random() * 4 - 1;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8 - 1;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.04,
      transparent: true,
      opacity: 0.6,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 3. Geometric Studio Floor Grid
    const gridHelper = new THREE.GridHelper(10, 20, 0x4f46e5, 0x1e293b);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    let avatarModel: THREE.Group | null = null;
    let jawBone: THREE.Object3D | null = null;

    // Load GLB Model ONCE
    const loader = new GLTFLoader();
    loader.load(
      '/models/interviewer.glb',
      (gltf) => {
        avatarModel = gltf.scene;

        const box = new THREE.Box3().setFromObject(avatarModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 1.0 / (maxDim || 1);
        avatarModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

        box.setFromObject(avatarModel);
        box.getCenter(center);
        box.getSize(size);

        avatarModel.position.x = -center.x;
        avatarModel.position.y = -box.min.y - size.y * 0.08;
        avatarModel.position.z = -center.z;

        avatarModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }

          const nameLower = child.name.toLowerCase();
          if (nameLower.includes('jaw') || nameLower.includes('mouth') || nameLower.includes('head')) {
            jawBone = child;
          }
        });

        const faceY = avatarModel.position.y + size.y * 0.82;
        camera.position.set(0, faceY, 1.25);
        controls.target.set(0, faceY, 0);
        controls.update();

        scene.add(avatarModel);
        setModelLoaded(true);
      },
      undefined,
      (err) => {
        console.error('Error loading GLB model:', err);
      }
    );

    // Continuous Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Rotate particle constellation slowly
      particleSystem.rotation.y = elapsedTime * 0.05;

      if (avatarModel) {
        // Desktop mouse parallax camera movement
        camera.position.x += (mouseRef.current.x * 0.3 - camera.position.x) * 0.05;
        camera.position.y += (mouseRef.current.y * 0.2 + (avatarModel.position.y + 0.8) - camera.position.y) * 0.05;
        controls.update();

        // State Animations
        if (isSpeakingRef.current) {
          stateSpotlight.color.setHex(0x6366f1); // Violet light beam
          stateSpotlight.intensity = 4 + Math.sin(elapsedTime * 10) * 1.5;
          if (jawBone) {
            jawBone.rotation.x = Math.abs(Math.sin(elapsedTime * 16)) * 0.18;
          }
        } else if (isThinkingRef.current) {
          stateSpotlight.color.setHex(0xf59e0b); // Amber scan light beam
          stateSpotlight.intensity = 3 + Math.sin(elapsedTime * 6) * 1.0;
          avatarModel.rotation.z = Math.sin(elapsedTime * 3) * 0.025;
          if (jawBone) jawBone.rotation.x = 0;
        } else {
          stateSpotlight.color.setHex(0x10b981); // Emerald calm listening light
          stateSpotlight.intensity = 2.5;
          avatarModel.rotation.z = Math.sin(elapsedTime * 1.2) * 0.01;
          if (jawBone) jawBone.rotation.x = 0;
        }
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!mountNode) return;
      const w = mountNode.clientWidth;
      const h = mountNode.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountNode && renderer.domElement && mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div className="relative w-full aspect-square max-w-[340px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 flex items-center justify-center cursor-grab active:cursor-grabbing">
        {/* ISOLATED CANVAS MOUNT NODE */}
        <div ref={canvasMountRef} className="absolute inset-0 w-full h-full" />

        {/* Ambient Radial Glass Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />

        {/* REACT JSX OVERLAYS */}
        {!modelLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-xs text-indigo-300 font-medium z-10 space-y-2">
            <span className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading 3D AI Studio...</span>
          </div>
        )}

        {/* Desktop Parallax Tip */}
        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-[9px] font-mono text-slate-300 pointer-events-none z-10 shadow-sm">
          3D Studio &bull; Drag to Rotate
        </div>

        {/* Contextual Status Bar */}
        <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-[11px] font-semibold flex items-center justify-between text-white shadow-xl z-10 pointer-events-none">
          <div className="flex items-center gap-2 truncate">
            {isSpeaking ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping flex-shrink-0" />
                <span className="text-indigo-300 font-bold truncate">Interviewer Speaking...</span>
              </>
            ) : isThinking ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                <span className="text-amber-300 font-bold truncate">Evaluating Response...</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="text-slate-200 truncate">Listening to {candidateName ? candidateName.split(' ')[0] : 'Candidate'}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
