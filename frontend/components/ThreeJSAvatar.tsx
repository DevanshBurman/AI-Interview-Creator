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

  // Sync props to refs without re-running mount effect
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isThinkingRef.current = isThinking;
  }, [isThinking]);

  // Mount Three.js Canvas ONCE in isolated containerRef
  useEffect(() => {
    const mountNode = canvasMountRef.current;
    if (!mountNode) return;

    const width = mountNode.clientWidth || 300;
    const height = mountNode.clientHeight || 300;

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

    mountNode.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 1.8;
    controls.minDistance = 0.5;
    controls.maxDistance = 4;

    // Studio Lighting
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

    // Continuous Animation Loop
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
    <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
      <div className="relative w-full aspect-square max-w-[300px] rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-50 flex items-center justify-center cursor-grab active:cursor-grabbing">
        {/* ISOLATED CANVAS MOUNT NODE: Contains ZERO React JSX children to guarantee ZERO DOM reconciliation collisions */}
        <div ref={canvasMountRef} className="absolute inset-0 w-full h-full" />

        {/* REACT JSX OVERLAYS (Sits outside canvasMountRef as siblings) */}
        {!modelLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-xs text-slate-500 font-medium z-10">
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
