import React, { useEffect, useMemo, useRef } from 'react'

function usePrefersReducedMotion() {
    const query = useMemo(() => (typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null), [])
    return query?.matches ?? false
}

export default function TextCubeCanvas({
    sizeHalf = 150,
    cameraZ = 420,
    focalLength = 360,
    mouseMaxYaw = 0.6,
    mouseMaxPitch = 0.6,
    followEasing = 0.08,
    rollSpeed = 0.01,
    offsetX = -200,
    initialYaw = 0.4,
    initialPitch = -0.25,
    baseSpinYaw = 0.003,
    baseSpinPitch = 0.002,
    shapeType = 'icosahedron', // 'icosahedron' | 'cube' | 'text'
    glowColor = 'rgba(92, 141, 255, 0.9)'
}) {
    const canvasRef = useRef(null)
    const containerRef = useRef(null)
    const prefersReducedMotion = usePrefersReducedMotion()

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const container = containerRef.current
        let animationId
        let width = 0
        let height = 0
        let centerX = 0
        let centerY = 0

        // Build geometry
        function buildGeometry(type) {
            const s = sizeHalf
            if (type === 'cube') {
                const v = [
                    [-s, -s, -s], [ s, -s, -s], [ s,  s, -s], [ -s,  s, -s],
                    [-s, -s,  s], [ s, -s,  s], [ s,  s,  s], [ -s,  s,  s]
                ]
                const edges = [
                    [0,1],[1,2],[2,3],[3,0],
                    [4,5],[5,6],[6,7],[7,4],
                    [0,4],[1,5],[2,6],[3,7]
                ]
                return { vertices: v, edges }
            }
            // Icosahedron
            const t = (1 + Math.sqrt(5)) / 2
            const n = Math.sqrt(1 + t*t)
            const a = s / n
            const b = (t * s) / n
            const v = [
                [-a,  b,  0], [ a,  b,  0], [-a, -b,  0], [ a, -b,  0],
                [ 0, -a,  b], [ 0,  a,  b], [ 0, -a, -b], [ 0,  a, -b],
                [ b,  0, -a], [ b,  0,  a], [-b,  0, -a], [-b,  0,  a]
            ]
            const edges = [
                [0,1],[0,5],[0,7],[0,10],[0,11],
                [1,5],[1,7],[1,8],[1,9],
                [2,3],[2,4],[2,6],[2,10],[2,11],
                [3,4],[3,6],[3,8],[3,9],
                [4,5],[4,9],[4,11],
                [5,9],[5,11],
                [6,7],[6,8],[6,10],
                [7,8],[7,10],
                [8,9],
                [10,11]
            ]
            return { vertices: v, edges }
        }

        let yaw = initialYaw, pitch = initialPitch, roll = 0
        let targetYaw = 0, targetPitch = 0

        function resize() {
            const rect = container.getBoundingClientRect()
            width = Math.max(320, Math.floor(rect.width))
            height = Math.max(260, Math.floor(rect.height))
            canvas.width = width
            canvas.height = height
            centerX = width / 2
            centerY = height / 2
            centerX += offsetX
        }

        function onMouseMove(e) {
            const rect = container.getBoundingClientRect()
            const mx = e.clientX - rect.left - rect.width / 2
            const my = e.clientY - rect.top - rect.height / 2
            targetYaw = (mx / (rect.width / 2)) * mouseMaxYaw
            targetPitch = (my / (rect.height / 2)) * mouseMaxPitch
        }

        function multiplyMatrixVector(m, v) {
            const x = v[0], y = v[1], z = v[2]
            return [
                m[0]*x + m[1]*y + m[2]*z,
                m[3]*x + m[4]*y + m[5]*z,
                m[6]*x + m[7]*y + m[8]*z,
            ]
        }

        function getRotationMatrix(yawR, pitchR, rollR) {
            const cy = Math.cos(yawR), sy = Math.sin(yawR)
            const cp = Math.cos(pitchR), sp = Math.sin(pitchR)
            const cr = Math.cos(rollR), sr = Math.sin(rollR)
            const Rz = [cr, -sr, 0, sr, cr, 0, 0, 0, 1]
            const Ry = [cy, 0, sy, 0, 1, 0, -sy, 0, cy]
            const Rx = [1, 0, 0, 0, cp, -sp, 0, sp, cp]
            const A = [
                Rz[0]*Ry[0] + Rz[1]*Ry[3] + Rz[2]*Ry[6], Rz[0]*Ry[1] + Rz[1]*Ry[4] + Rz[2]*Ry[7], Rz[0]*Ry[2] + Rz[1]*Ry[5] + Rz[2]*Ry[8],
                Rz[3]*Ry[0] + Rz[4]*Ry[3] + Rz[5]*Ry[6], Rz[3]*Ry[1] + Rz[4]*Ry[4] + Rz[5]*Ry[7], Rz[3]*Ry[2] + Rz[4]*Ry[5] + Rz[5]*Ry[8],
                Rz[6]*Ry[0] + Rz[7]*Ry[3] + Rz[8]*Ry[6], Rz[6]*Ry[1] + Rz[7]*Ry[4] + Rz[8]*Ry[7], Rz[6]*Ry[2] + Rz[7]*Ry[5] + Rz[8]*Ry[8],
            ]
            return [
                A[0]*Rx[0] + A[1]*Rx[3] + A[2]*Rx[6], A[0]*Rx[1] + A[1]*Rx[4] + A[2]*Rx[7], A[0]*Rx[2] + A[1]*Rx[5] + A[2]*Rx[8],
                A[3]*Rx[0] + A[4]*Rx[3] + A[5]*Rx[6], A[3]*Rx[1] + A[4]*Rx[4] + A[5]*Rx[7], A[3]*Rx[2] + A[4]*Rx[5] + A[5]*Rx[8],
                A[6]*Rx[0] + A[7]*Rx[3] + A[8]*Rx[6], A[6]*Rx[1] + A[7]*Rx[4] + A[8]*Rx[7], A[6]*Rx[2] + A[7]*Rx[5] + A[8]*Rx[8],
            ]
        }

        function draw() {
            ctx.clearRect(0, 0, width, height)

            const grd = ctx.createRadialGradient(centerX, centerY, Math.min(width, height) * 0.1, centerX, centerY, Math.max(width, height) * 0.8)
            grd.addColorStop(0, 'rgba(92, 141, 255, 0.06)')
            grd.addColorStop(1, 'rgba(0, 0, 0, 0)')
            ctx.fillStyle = grd
            ctx.fillRect(0, 0, width, height)

            yaw += (targetYaw - yaw) * followEasing
            pitch += (targetPitch - pitch) * followEasing
            // subtle base spins to emphasize 3D
            yaw += baseSpinYaw
            pitch += baseSpinPitch
            roll += rollSpeed

            const { vertices, edges } = buildGeometry(shapeType)
            const R = getRotationMatrix(yaw, pitch, roll)
            const transformed = vertices.map(v => multiplyMatrixVector(R, v))

            const cz = cameraZ
            const f = focalLength
            const projected = transformed.map(p => {
                const z = p[2] + cz
                const sx = (f * p[0]) / z + centerX
                const sy = (f * p[1]) / z + centerY
                return { x: sx, y: sy, z }
            })

            // Depth sort edges (avg z of the two vertices)
            const edgeDepths = edges.map(([i, j]) => ({ i, j, z: (projected[i].z + projected[j].z) / 2 }))
                .sort((a, b) => a.z - b.z)

            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            for (let k = 0; k < edgeDepths.length; k++) {
                const { i, j, z } = edgeDepths[k]
                const p0 = projected[i]
                const p1 = projected[j]
                const depthScale = Math.max(0.6, Math.min(1.4, 520 / z))
                ctx.strokeStyle = 'rgba(255,255,255,0.85)'
                ctx.shadowColor = glowColor
                ctx.shadowBlur = 14 * depthScale
                ctx.lineWidth = 2.0 * depthScale

                ctx.beginPath()
                ctx.moveTo(p0.x, p0.y)
                ctx.lineTo(p1.x, p1.y)
                ctx.stroke()
            }
            ctx.shadowBlur = 0
        }

        function loop() {
            draw()
            animationId = window.requestAnimationFrame(loop)
        }

        function start() {
            resize()
            if (!prefersReducedMotion) loop()
        }

        function stop() {
            if (animationId) cancelAnimationFrame(animationId)
        }

        window.addEventListener('resize', resize)
        window.addEventListener('mousemove', onMouseMove)
        start()

        return () => {
            stop()
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', onMouseMove)
        }
    }, [sizeHalf, cameraZ, focalLength, mouseMaxYaw, mouseMaxPitch, followEasing, rollSpeed, offsetX, initialYaw, initialPitch, baseSpinYaw, baseSpinPitch, shapeType, glowColor, prefersReducedMotion])

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
    )
}


