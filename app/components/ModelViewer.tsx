"use client";

import { Suspense, useMemo, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  useGLTF,
  Center,
  Environment,
  ContactShadows,
  OrbitControls,
  Float,
  Html,
  useProgress,
} from "@react-three/drei";
import * as THREE from "three";


// --- Types ---

/**
 * Props for the ModelViewer component.
 * Configures the 3D model display, lighting, and interaction.
 */
interface ModelViewerProps {
  /** Path to the .glb file */
  src: string;
  /** Scale of the model */
  scale?: number;
  /** Initial rotation [x, y, z] */
  rotation?: [number, number, number];
  /** Position [x, y, z] */
  position?: [number, number, number];
  /** Camera position [x, y, z] */
  cameraPosition?: [number, number, number];
  /** Lighting intensity */
  intensity?: number;
  /** Environment preset */
  preset?: "city" | "studio" | "apartment" | "sunset" | "dawn" | "night";
  /** Tailwind classes for the container */
  className?: string;
  /** Enable floating animation */
  float?: boolean;
  /** Enable zoom interaction */
  enableZoom?: boolean;
  /** Enable auto-rotation */
  autoRotate?: boolean;
  /** Allow viewing from all angles (true) or restrict to horizontal (false) */
  viewAllAngles?: boolean;
  /** If true, preloads the model for faster LCP */
  priority?: boolean;
  /** Toggle all shadows (renderer and contact shadows) */
  shadows?: boolean;
  /** Opacity of the contact shadow (0 to 1) */
  shadowIntensity?: number;
  /** Allow rotating the model with a single-finger drag */
  singleFingerRotate?: boolean;
  /** Allow user-driven rotation at all */
  enableRotate?: boolean;
}

// --- Sub-components ---

/**
 * Loading Indicator
 * Displays a premium progress bar/spinner while the model loads.
 */
function Loader() {
  const { progress } = useProgress();

  const progressValue = useMemo(() => progress.toFixed(0), [progress]);

  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 border-4 border-black/10 border-t-black rounded-full animate-spin" />
        <span className="text-xs font-bold tracking-widest text-black/50">
          {progressValue}%
        </span>
      </div>
    </Html>
  );
}

/**
 * Environment Wrapper
 * Wraps Environment in Suspense to prevent state update conflicts
 */
function EnvironmentWrapper({ preset }: { preset: string }) {
  return (
    <Suspense fallback={null}>
      <Environment preset={preset as any} blur={0.8} />
    </Suspense>
  );
}

/**
 * The actual 3D Model component.
 * Handles loading the GLTF file and applying material enhancements.
 */
function Model({
  src,
  scale = 1,
  rotation = [0, 0, 0],
  position = [0, 0, 0],
  shadows = true,
}: {
  src: string;
  scale?: number;
  rotation?: [number, number, number];
  position?: [number, number, number];
  shadows?: boolean;
}) {
  const { scene } = useGLTF(src, "https://www.gstatic.com/draco/versioned/decoders/1.5.6/");

  // Clone the scene to allow multiple instances with independent materials
  // and apply shadow/material properties.
  const clone = useMemo(() => {
    const clonedScene = scene.clone(true);
    clonedScene.traverse((obj: THREE.Object3D) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        // Only enable shadow casting/receiving if shadows are enabled globally
        mesh.castShadow = shadows;
        mesh.receiveShadow = shadows;
        if (mesh.material) {
          // Enhance material quality for better visual fidelity
          (mesh.material as THREE.MeshStandardMaterial).envMapIntensity = 1.5;
          (mesh.material as THREE.MeshStandardMaterial).roughness = 0.6;
          (mesh.material as THREE.MeshStandardMaterial).needsUpdate = true;
        }
      }
    });
    return clonedScene;
  }, [scene, shadows]);

  return (
    <group position={position}>
      <Center top>
        <primitive object={clone} scale={scale} rotation={rotation} />
      </Center>
    </group>
  );
}

// --- Main Component ---

/**
 * ModelViewer Component
 *
 * Renders a 3D model using React Three Fiber.
 * Supports loading states, floating animations, orbit controls, and environment lighting.
 */
export default function ModelViewer({
  src,
  scale = 1,
  rotation = [0, 0, 0],
  position = [0, 0, 0],
  cameraPosition = [0, 0, 4.5],
  preset = "city",
  intensity = 1.2,
  className = "w-full h-full",
  float = true,
  enableZoom = false,
  autoRotate = true,
  viewAllAngles = false,
  priority = false,
  shadows = true, // Default to true
  shadowIntensity = 0.3, // Default intensity
  singleFingerRotate = true,
  enableRotate = true,
}: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Intersection Observer to pause rendering when not visible
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        rootMargin: "100px", // Start loading slightly before visible
        threshold: 0.1,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Preload the model if priority is true (e.g., for hero sections)
  useEffect(() => {
    if (priority) {
      try {
        useGLTF.preload(src, "https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
      } catch (error) {
        console.warn("Failed to preload model:", error);
      }
    }
  }, [priority, src]);

  const touchControls = useMemo(() => {
    if (!enableRotate || singleFingerRotate) return undefined;
    return {
      ONE: THREE.TOUCH.PAN,
      TWO: THREE.TOUCH.ROTATE,
    };
  }, [singleFingerRotate, enableRotate]);

  return (
    <div
      ref={containerRef}
      className={`relative ${enableRotate && singleFingerRotate ? "cursor-grab active:cursor-grabbing" : ""
        } ${className}`}
    >
      <Canvas
        // Toggle renderer shadow map based on prop
        shadows={shadows}
        dpr={[1, 1.5]}
        camera={{ position: cameraPosition, fov: 30 }}
        gl={{
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
        }}
        className="w-full h-full"
        style={{ touchAction: enableRotate && singleFingerRotate ? "none" : "pan-y" }}
        frameloop={isVisible ? "always" : "demand"} // Pause rendering when not visible
      >
        {/* Lighting Setup */}
        <ambientLight intensity={intensity * 0.4} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={intensity}
          castShadow={shadows} // Only cast if enabled
          shadow-mapSize={1024}
          shadow-bias={-0.0001}
        />
        <spotLight
          position={[-5, 5, -5]}
          intensity={intensity * 1.2}
          color="white"
          angle={0.5}
          penumbra={1}
        />

        <Suspense fallback={<Loader />}>
          {float ? (
            <Float
              speed={2}
              rotationIntensity={0.2}
              floatIntensity={0.5}
              floatingRange={[-0.1, 0.1]}
            >
              <Model
                src={src}
                scale={scale}
                rotation={rotation}
                position={position}
                shadows={shadows}
              />
            </Float>
          ) : (
            <Model
              src={src}
              scale={scale}
              rotation={rotation}
              position={position}
              shadows={shadows}
            />
          )}
        </Suspense>

        {/* Environment in separate Suspense to avoid state update conflicts */}
        <EnvironmentWrapper preset={preset} />

        {/* Only render Contact Shadows if enabled and intensity > 0 */}
        {shadows && shadowIntensity > 0 && (
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={shadowIntensity}
            scale={10}
            blur={2.5}
            far={4}
            resolution={128}
          />
        )}

        <OrbitControls
          enablePan={false}
          enableZoom={enableZoom}
          minDistance={2}
          maxDistance={8}
          enableRotate={enableRotate}
          autoRotate={autoRotate && isVisible} // Only auto-rotate when visible
          autoRotateSpeed={0.8}
          minPolarAngle={viewAllAngles ? 0 : Math.PI / 2 - 0.4}
          maxPolarAngle={viewAllAngles ? Math.PI : Math.PI / 2 + 0.4}
          enableDamping
          dampingFactor={0.05}
          touches={touchControls}
        />
      </Canvas>
    </div>
  );
}
