import { Canvas } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { motion } from "framer-motion";

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 2, 2]} intensity={1} />

      <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
        <mesh>
          <sphereGeometry args={[2.5, 64, 64]} />
          <meshStandardMaterial
            color="#111"
            emissive="#e10600"
            emissiveIntensity={0.3}
            wireframe
          />
        </mesh>
      </Float>
    </>
  );
}

 export default function F1Background() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    >
      <Canvas camera={{ position: [0, 0, 6] }}>
        <Scene />
      </Canvas>
    </motion.div>
  );
}

