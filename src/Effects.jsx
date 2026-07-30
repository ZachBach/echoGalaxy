import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RenderPipeline } from 'three/webgpu'
import { pass } from 'three/tsl'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'

// Node-based bloom for WebGPURenderer, on both backends — replaces the
// WebGL-only @react-three/postprocessing composer. Note: r183 renamed
// PostProcessing → RenderPipeline; BloomNode ships in three's addons,
// not three/tsl.
export default function Effects({
  strength = 0.55,
  radius = 0.25,
  threshold = 0.04,
}) {
  const { gl, scene, camera } = useThree()

  const pipeline = useMemo(() => {
    const scenePass = pass(scene, camera)
    const color = scenePass.getTextureNode('output')
    const rp = new RenderPipeline(gl)
    rp.outputNode = color.add(bloom(color, strength, radius, threshold))
    return rp
  }, [gl, scene, camera, strength, radius, threshold])

  useEffect(() => () => pipeline.dispose(), [pipeline])

  // Positive priority makes R3F skip its own render — the pipeline owns
  // the frame from here.
  useFrame(() => pipeline.render(), 1)

  return null
}
