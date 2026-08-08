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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [modelLoaded, setModelLoaded] = useState<boolean>(false);

  // Mutable refs to prevent React re-mounting / WebGL context destruction
  const isSpeakingRef = useRef<boolean>(isSpeaking);
  const isThinkingRef = useRef<boolean>(isThinking);

  // Sync props to refs without re-running useEffect
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isThinkingRef.current = isThinking;
  }, [isThinking]);

  // Three.js Mount Once Effect with Safe DOM Lifecycle
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Safely clear inner HTML without causing React Virtual DOM removeChild collisions
    try {
      container.innerHTML = '';
    } catch (e) {
      // Ignore initial DOM clearing error
    }

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 1.8;
    controls.minDistance = 0.5;
    controls.maxDistance = 4;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff8ee, 1.8);
    keyLight.position.set(2, 4, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 0.9);
    fillLight.position.set(-2, 2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xc7d2fe, 1.2);
    rimLight.position.set(0, 3, -2);
    scene.add(rimLight);

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
        avatarModel.position.y = -box.min.y - size.y * 0.1;
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
        camera.position.set(0, faceY, 1.2);
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

    // Continuous Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      if (avatarModel) {
        controls.update();

        if (isSpeakingRef.current) {
          if (jawBone) {
            jawBone.rotation.x = Math.abs(Math.sin(elapsedTime * 16)) * 0.18;
          }
        } else if (jawBone) {
          jawBone.rotation.x = 0;
        }

        if (isThinkingRef.current) {
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

    // Fail-safe cleanup block using try-catch to prevent React removeChild crash
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      try {
        if (renderer.domElement && renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      } catch (e) {
        // Suppress DOM removal race condition safely
      }
      try {
        renderer.dispose();
      } catch (e) {
        // Ignore WebGL disposal error
      }
    };
  }, []); // Mount ONCE

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
      <div
        ref={containerRef}
        className="relative w-full aspect-square max-w-[300px] rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-50 flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        {!modelLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-xs text-slate-500 font-medium">
            Loading 3D Presenter...
          </div>
        )}

        {/* Interactive Tip Pill */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/60 backdrop-blur-sm text-[9px] font-mono text-slate-300 pointer-events-none z-10">
          Mouse / Touch to Rotate 3D
        </div>

        {/* Compact Status Pill at Very Bottom */}
        <div className="absolute bottom-1 left-2 right-2 px-3 py-1 rounded-xl bg-slate-900/90 backdrop-blur-md text-[10px] font-semibold flex items-center justify-between text-white shadow-md z-10 pointer-events-none">
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
