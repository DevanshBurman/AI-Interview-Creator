'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [modelLoaded, setModelLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer Setup
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // Clean executive studio background

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.45, 1.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 2. Studio Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.6);
    keyLight.position.set(2, 4, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 0.8);
    fillLight.position.set(-2, 2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xc7d2fe, 1.0);
    rimLight.position.set(0, 3, -2);
    scene.add(rimLight);

    // 3. Load User 3D GLB Model
    const loader = new GLTFLoader();
    let avatarModel: THREE.Group | null = null;
    let jawBone: THREE.Object3D | null = null;

    loader.load(
      '/models/interviewer.glb',
      (gltf) => {
        avatarModel = gltf.scene;

        // Auto-center and fit model in camera viewport
        const box = new THREE.Box3().setFromObject(avatarModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        avatarModel.position.x += avatarModel.position.x - center.x;
        avatarModel.position.y += avatarModel.position.y - center.y + 0.35;
        avatarModel.position.z += avatarModel.position.z - center.z;

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.6 / (maxDim || 1);
        avatarModel.scale.set(scale, scale, scale);

        avatarModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
          // Search for jaw/head bones for lip-sync animation
          const nameLower = child.name.toLowerCase();
          if (nameLower.includes('jaw') || nameLower.includes('mouth') || nameLower.includes('head')) {
            jawBone = child;
          }
        });

        scene.add(avatarModel);
        setModelLoaded(true);
      },
      undefined,
      (err) => {
        console.error('Error loading GLB model:', err);
        setLoadError('Loading 3D model...');
      }
    );

    // 4. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      if (avatarModel) {
        // Natural Breathing & Sway
        avatarModel.position.y = Math.sin(elapsedTime * 1.5) * 0.015;
        avatarModel.rotation.y = Math.sin(elapsedTime * 0.8) * 0.06;

        // Speaking Lip-Sync / Jaw Motion
        if (isSpeaking) {
          const mouthScale = 1 + Math.abs(Math.sin(elapsedTime * 16)) * 0.25;
          if (jawBone) {
            jawBone.rotation.x = Math.abs(Math.sin(elapsedTime * 16)) * 0.15;
          } else {
            avatarModel.scale.set(
              avatarModel.scale.x,
              avatarModel.scale.y * (1 + Math.abs(Math.sin(elapsedTime * 14)) * 0.02),
              avatarModel.scale.z
            );
          }
        }

        // Thinking Tilt
        if (isThinking) {
          avatarModel.rotation.z = Math.sin(elapsedTime * 2) * 0.03;
        } else {
          avatarModel.rotation.z = 0;
        }
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isSpeaking, isThinking]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
      <div
        ref={containerRef}
        className="relative w-full aspect-square max-w-[300px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-50"
      >
        {/* Live Status Pill Overlay */}
        <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-[11px] font-semibold flex items-center justify-between text-white shadow-md z-10">
          <div className="flex items-center gap-2 truncate">
            {isSpeaking ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping flex-shrink-0" />
                <span className="text-indigo-300 font-bold truncate">3D Model Asking Question...</span>
              </>
            ) : isThinking ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                <span className="text-amber-300 font-bold truncate">Evaluating Answer...</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="text-slate-200 truncate">Listening to {candidateName.split(' ')[0]}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
