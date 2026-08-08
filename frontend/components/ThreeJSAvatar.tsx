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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Viewport & Camera Setup
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 1.4); // Focused directly on origin (0,0,0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    // 2. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff8ee, 1.7);
    keyLight.position.set(2, 3.5, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 0.9);
    fillLight.position.set(-2, 2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xc7d2fe, 1.1);
    rimLight.position.set(0, 3, -2);
    scene.add(rimLight);

    // 3. Load 3D GLB Model
    const loader = new GLTFLoader();
    let avatarModel: THREE.Group | null = null;
    let jawBone: THREE.Object3D | null = null;
    let initialY = 0;

    loader.load(
      '/models/interviewer.glb',
      (gltf) => {
        avatarModel = gltf.scene;

        // Calculate model bounding box
        const box = new THREE.Box3().setFromObject(avatarModel);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Target face/head level (around top 20% of bounding box height)
        const faceLevelY = box.max.y - size.y * 0.22;
        initialY = -faceLevelY;

        // Position face level directly at origin (0, 0, 0)
        avatarModel.position.set(-center.x, initialY, -center.z);

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.55 / (maxDim || 1);
        avatarModel.scale.set(scale, scale, scale);

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

        camera.lookAt(0, -0.05, 0); // Focus directly on centered face
        scene.add(avatarModel);
        setModelLoaded(true);
      },
      undefined,
      (err) => {
        console.error('Error loading GLB model:', err);
      }
    );

    // 4. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      if (avatarModel) {
        avatarModel.position.y = initialY + Math.sin(elapsedTime * 1.5) * 0.006;
        avatarModel.rotation.y = Math.sin(elapsedTime * 0.8) * 0.04;

        if (isSpeaking) {
          if (jawBone) {
            jawBone.rotation.x = Math.abs(Math.sin(elapsedTime * 16)) * 0.18;
          } else {
            avatarModel.scale.set(
              avatarModel.scale.x,
              avatarModel.scale.y * (1 + Math.abs(Math.sin(elapsedTime * 14)) * 0.015),
              avatarModel.scale.z
            );
          }
        }

        if (isThinking) {
          avatarModel.rotation.z = Math.sin(elapsedTime * 2) * 0.02;
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
        className="relative w-full aspect-square max-w-[300px] rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-50 flex items-center justify-center"
      >
        {/* Compact Status Pill at Very Bottom */}
        <div className="absolute bottom-1 left-2 right-2 px-3 py-1 rounded-xl bg-slate-900/90 backdrop-blur-md text-[10px] font-semibold flex items-center justify-between text-white shadow-md z-10">
          <div className="flex items-center gap-1.5 truncate">
            {isSpeaking ? (
              <>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping flex-shrink-0" />
                <span className="text-indigo-300 font-bold truncate">3D Presenter Speaking...</span>
              </>
            ) : isThinking ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                <span className="text-amber-300 font-bold truncate">Evaluating Answer...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="text-slate-200 truncate">Listening to {candidateName.split(' ')[0]}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
