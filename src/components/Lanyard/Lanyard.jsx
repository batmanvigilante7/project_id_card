/* eslint-disable react/no-unknown-property */
'use client';
import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';

import cardGLB from './card.glb';
import lanyard from './lanyard.png';
import * as THREE from 'three';
import './Lanyard.css';

extend({ MeshLineGeometry, MeshLineMaterial });

const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

export default function Lanyard({
  position = [0, 0, 20],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1,
  linkUrl = 'https://www.gitam.edu/',
  physicsSettings = {
    damping: 4,
    mass: 1,
    elasticity: 0.2,
    wind: 0,
    ropeLength: 1
  },
  cameraSettings = {
    orthographic: false,
    autoRotate: false,
    idleSwing: false,
    zoom: 20
  },
  holderType = 'None',
  holderColor = '#ffffff',
  lightingPreset = 'Studio',
  backgroundStyle = 'Glass Studio',
  hologramStyle = 'Foil'
}) {
  // Render count tracking
  console.count("Lanyard Render");

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bgColor = useMemo(() => {
    switch (backgroundStyle) {
      case 'Glass Studio': return new THREE.Color(0xf1f5f9);
      case 'University Lobby': return new THREE.Color(0xfef3c7);
      case 'Auditorium': return new THREE.Color(0x1e1b4b);
      case 'Library': return new THREE.Color(0xfcfcf9);
      case 'Innovation Lab': return new THREE.Color(0x0f172a);
      case 'Conference Hall': return new THREE.Color(0xe2e8f0);
      case 'Campus Entrance': return new THREE.Color(0xecfdf5);
      case 'Minimal White': return new THREE.Color(0xffffff);
      case 'Gradient Studio': return new THREE.Color(0xe0f2fe);
      default: return new THREE.Color(0xf8fafc);
    }
  }, [backgroundStyle]);

  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position: position, fov: cameraSettings.zoom }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => gl.setClearColor(bgColor, transparent ? 0 : 1)}
      >
        <ambientLight intensity={lightingPreset === 'Golden Hour' ? 1.5 : (lightingPreset === 'Night' ? 0.4 : Math.PI)} />
        
        {lightingPreset === 'Golden Hour' && (
          <directionalLight position={[5, 5, 5]} intensity={3} color="#f59e0b" />
        )}
        {lightingPreset === 'Natural' && (
          <directionalLight position={[5, 10, 3]} intensity={2.5} color="#ffffff" />
        )}

        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Suspense fallback={null}>
            <Band
              isMobile={isMobile}
              frontImage={frontImage}
              backImage={backImage}
              imageFit={imageFit}
              lanyardImage={lanyardImage}
              lanyardWidth={lanyardWidth}
              linkUrl={linkUrl}
              physicsSettings={physicsSettings}
              cameraSettings={cameraSettings}
              holderType={holderType}
              holderColor={holderColor}
              hologramStyle={hologramStyle}
            />
          </Suspense>
        </Physics>
        
        <Environment blur={0.75}>
          {lightingPreset === 'Studio' && (
            <>
              <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
              <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
              <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
              <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
            </>
          )}
          {lightingPreset === 'Office' && (
            <>
              <Lightformer intensity={4} color="white" position={[0, 10, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[20, 20, 1]} />
              <Lightformer intensity={1.5} color="white" position={[0, 0, 8]} scale={[10, 10, 1]} />
            </>
          )}
          {lightingPreset === 'Golden Hour' && (
            <>
              <Lightformer intensity={4} color="#fbbf24" position={[8, 2, 5]} scale={[10, 10, 1]} />
              <Lightformer intensity={1} color="#f472b6" position={[-8, -2, 5]} scale={[10, 10, 1]} />
            </>
          )}
        </Environment>
      </Canvas>
    </div>
  );
}

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1,
  linkUrl = null,
  physicsSettings,
  cameraSettings,
  holderType,
  holderColor,
  hologramStyle
}) {
  const band = useRef(),
    fixed = useRef(),
    j1 = useRef(),
    j2 = useRef(),
    j3 = useRef(),
    card = useRef(),
    cardGroup = useRef();
  
  const vec = new THREE.Vector3(),
    ang = new THREE.Vector3(),
    rot = new THREE.Vector3(),
    dir = new THREE.Vector3();
  
  const segmentProps = useMemo(() => ({
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: physicsSettings.damping,
    linearDamping: physicsSettings.damping,
    mass: physicsSettings.mass
  }), [physicsSettings.damping, physicsSettings.mass]);

  // Load GLB model once
  const { nodes, materials } = useGLTF(cardGLB);

  // Persistent Canvas Texture for Lanyard Strap
  const [lanyardMap] = useState(() => new THREE.CanvasTexture(document.createElement('canvas')));

  useEffect(() => {
    const srcImage = lanyardImage || lanyard;
    if (!srcImage) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = srcImage;
    img.onload = () => {
      console.count("Canvas Redraw: Lanyard Strap");
      const canv = lanyardMap.image;
      canv.width = img.width;
      canv.height = img.height;
      const ctx = canv.getContext('2d');
      ctx.drawImage(img, 0, 0);
      lanyardMap.wrapS = lanyardMap.wrapT = THREE.RepeatWrapping;
      lanyardMap.needsUpdate = true;
    };
  }, [lanyardImage, lanyardMap]);

  // Persistent Canvas Texture for ID Card faces (Atlas)
  const baseMap = materials.base.map;
  const baseImg = baseMap.image;

  const [canvas] = useState(() => document.createElement('canvas'));
  const cardMap = useMemo(() => {
    if (baseImg) {
      canvas.width = baseImg.width;
      canvas.height = baseImg.height;
    } else {
      canvas.width = 1024;
      canvas.height = 1024;
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = baseMap.flipY;
    tex.anisotropy = 16;
    return tex;
  }, [baseImg, baseMap.flipY, canvas]);

  // Bake textures onto the persistent canvas texture asynchronously
  useEffect(() => {
    if (!baseImg) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
    cardMap.needsUpdate = true;

    let frontLoaded = false;
    let backLoaded = false;

    const imgFront = new Image();
    const imgBack = new Image();

    const updateTexture = () => {
      console.count("Canvas Redraw: Card Atlas");
      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

      const drawFitted = (img, rect) => {
        const W = canvas.width;
        const H = canvas.height;
        const rx = rect.x * W;
        const ry = rect.y * H;
        const rw = rect.w * W;
        const rh = rect.h * H;
        const pick = imageFit === 'contain' ? Math.min : Math.max;
        const scale = pick(rw / img.width, rh / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        const dx = rx + (rw - dw) / 2;
        const dy = ry + (rh - dh) / 2;
        ctx.save();
        ctx.beginPath();
        ctx.rect(rx, ry, rw, rh);
        ctx.clip();
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();
      };

      if (frontLoaded && imgFront.width) {
        drawFitted(imgFront, FRONT_UV_RECT);
      }
      if (backLoaded && imgBack.width) {
        drawFitted(imgBack, BACK_UV_RECT);
      }
      cardMap.needsUpdate = true;
    };

    if (frontImage) {
      imgFront.src = frontImage;
      imgFront.onload = () => {
        frontLoaded = true;
        updateTexture();
      };
    }

    if (backImage) {
      imgBack.src = backImage;
      imgBack.onload = () => {
        backLoaded = true;
        updateTexture();
      };
    }
  }, [frontImage, backImage, imageFit, baseImg, cardMap, canvas]);

  const [curve] = useState(
    () => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);
  const pointerDownInfo = useRef(null);
  const TAP_MOVE_TOLERANCE = isMobile ? 10 : 6;
  const TAP_TIME_TOLERANCE = 400;

  const len = physicsSettings.ropeLength;
  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], len]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], len]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], len]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.5, 0]
  ]);

  useEffect(() => {
    if (hovered || dragged) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useEffect(() => {
    const handleExport = async (e) => {
      if (!cardGroup.current) return;
      try {
        const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
        const exporter = new GLTFExporter();
        exporter.parse(
          cardGroup.current,
          (gltf) => {
            const blob = new Blob([gltf], { type: 'application/octet-stream' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = e.detail?.filename || 'custom-id-card.glb';
            link.click();
            window.dispatchEvent(new CustomEvent('export-gltf-success', {
              detail: { message: '3D GLB Model exported successfully!' }
            }));
          },
          (error) => {
            console.error('An error occurred during GLB export:', error);
            window.dispatchEvent(new CustomEvent('export-gltf-error', {
              detail: { message: 'Failed to export 3D Model.' }
            }));
          },
          { binary: true }
        );
      } catch (err) {
        console.error(err);
        window.dispatchEvent(new CustomEvent('export-gltf-error', {
          detail: { message: 'Error loading 3D Exporter module.' }
        }));
      }
    };
    window.addEventListener('export-card-glb', handleExport);
    return () => window.removeEventListener('export-card-glb', handleExport);
  }, []);

  const endDrag = () => {
    drag(false);
    pointerDownInfo.current = null;
  };

  useEffect(() => {
    if (!dragged) return;
    window.addEventListener('blur', endDrag);
    return () => window.removeEventListener('blur', endDrag);
  }, [dragged]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Camera updates
    if (cameraSettings.autoRotate) {
      state.camera.position.x = Math.sin(t * 0.4) * 20;
      state.camera.position.z = Math.cos(t * 0.4) * 20;
      state.camera.lookAt(0, 0, 0);
    } else if (cameraSettings.idleSwing) {
      state.camera.position.y = 1 + Math.sin(t * 0.5) * 0.8;
    }

    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    } else {
      if (physicsSettings.wind > 0 && card.current) {
        card.current.wakeUp();
        const forceX = Math.sin(t * 1.5) * physicsSettings.wind * 4;
        card.current.addForce({ x: forceX, y: 0, z: 0 }, true);
      }
    }

    if (fixed.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      if (!dragged && card.current && !card.current.isSleeping()) {
        ang.copy(card.current.angvel());
        rot.copy(card.current.rotation());
        if (Math.abs(rot.y) > 0.01 || Math.abs(ang.y) > 0.01) {
          card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
        }
      }
    }
  });

  curve.curveType = 'chordal';

  // Custom Holder Material presets
  const holderMaterial = useMemo(() => {
    const col = new THREE.Color(holderColor);
    switch (holderType) {
      case 'Transparent':
        return (
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.9}
            opacity={0.3}
            roughness={0.1}
            transparent
            depthWrite={false}
          />
        );
      case 'Matte':
        return (
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.4}
            opacity={0.8}
            roughness={0.6}
            transparent
          />
        );
      case 'Leather':
        return (
          <meshStandardMaterial
            color="#27272a"
            roughness={0.9}
            metalness={0.1}
          />
        );
      case 'Metal Frame':
        return (
          <meshStandardMaterial
            color={col}
            roughness={0.2}
            metalness={0.9}
          />
        );
      case 'Hard Plastic':
      default:
        return (
          <meshStandardMaterial
            color={col}
            roughness={0.5}
            metalness={0.1}
          />
        );
    }
  }, [holderType, holderColor]);

  // High performance GPU-accelerated iridescence hologram shader variables
  const isHologramEnabled = hologramStyle !== 'None';

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} restitution={physicsSettings.elasticity} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          
          <group
            ref={cardGroup}
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={e => {
              e.stopPropagation();
              hover(true);
            }}
            onPointerOut={e => {
              e.stopPropagation();
              hover(false);
            }}
            onPointerDown={e => {
              e.stopPropagation();
              e.target.setPointerCapture(e.pointerId);
              pointerDownInfo.current = { x: e.clientX, y: e.clientY, t: performance.now() };
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}
            onPointerUp={e => {
              e.stopPropagation();
              e.target.releasePointerCapture(e.pointerId);
              const start = pointerDownInfo.current;
              drag(false);
              if (linkUrl && start) {
                const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
                const elapsed = performance.now() - start.t;
                if (moved < TAP_MOVE_TOLERANCE && elapsed < TAP_TIME_TOLERANCE) {
                  window.open(linkUrl, '_blank', 'noopener,noreferrer');
                }
              }
              pointerDownInfo.current = null;
            }}
            onPointerCancel={e => {
              e.stopPropagation();
              endDrag();
            }}
            onPointerLeave={() => {
              if (dragged && !hovered) endDrag();
            }}
          >
            {/* Card Frame Holder Layer */}
            {holderType !== 'None' && (
              <mesh position={[0, 0, -0.005]} scale={[1.05, 1.05, 1.2]}>
                <boxGeometry args={[0.8, 1.125, 0.015]} />
                {holderMaterial}
              </mesh>
            )}

            {/* Base Card Geometry */}
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
                emissive={hovered ? '#ffffff' : '#000000'}
                emissiveIntensity={hovered ? (dragged ? 0.08 : 0.14) : 0}
                
                // Iridescence (GPU shader hologram) settings
                iridescence={isHologramEnabled ? 0.6 : 0}
                iridescenceIOR={1.4}
                iridescenceThicknessRange={[100, 400]}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={lanyardMap}
          repeat={[-4, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}
