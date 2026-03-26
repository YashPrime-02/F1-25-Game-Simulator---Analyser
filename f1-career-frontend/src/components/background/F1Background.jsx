import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { motion } from "framer-motion";
import { useRef } from "react";

/* ================= TRACK RING ================= */

function Track() {
  const ref = useRef();

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.z += 0.002; // subtle rotation
    }
  });

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[2.5, 3, 128]} />
      <meshStandardMaterial
        color="#111"
        emissive="#e10600"
        emissiveIntensity={0.6}
        side={2}
      />
    </mesh>
  );
}

/* ================= SPEED LINES ================= */

function SpeedLines() {
  const ref = useRef();

  useFrame(() => {
    if (ref.current) {
      ref.current.position.x += 0.1;
      if (ref.current.position.x > 10) {
        ref.current.position.x = -10;
      }
    }
  });

  return (
    <mesh ref={ref} position={[-10, 0, -2]}>
      <boxGeometry args={[8, 0.05, 0.05]} />
      <meshBasicMaterial color="#e10600" />
    </mesh>
  );
}

/* ================= LIGHT GLOW ================= */

function GlowCore() {
  return (
    <mesh>
      <sphereGeometry args={[1.2, 32, 32]} />
      <meshBasicMaterial
        color="#000000"
        transparent
        opacity={0.15}
      />
    </mesh>
  );
}

/* ================= SCENE ================= */

function Scene() {
  return (
    <>
      {/* LIGHTING */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 3, 3]} intensity={1.5} color="#230b99" />

      {/* ELEMENTS */}
      <GlowCore />
      <Track />
      <SpeedLines />

      {/* SUBTLE DEPTH */}
      <Stars count={1000} factor={2} fade speed={1} />
    </>
  );
}

/* ================= BACKGROUND ================= */

export default function F1Background() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        background: "#050505",
      }}
    >
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        <Scene />
      </Canvas>
    </motion.div>
  );
}