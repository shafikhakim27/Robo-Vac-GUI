import { useEffect, useMemo, useRef, useState } from 'react'
import type { MouseEventHandler, WheelEventHandler } from 'react'

type OccupancyGrid = {
  width: number
  height: number
  resolution: number
  origin: { x: number; y: number }
  data: number[]
}

type Pose = {
  x: number
  y: number
  theta: number
}

type ViewState = {
  zoom: number
  panX: number
  panY: number
}

const CANVAS_WIDTH = 960
const CANVAS_HEIGHT = 720

function App() {
  const [grid, setGrid] = useState<OccupancyGrid | null>(null)
  const [pose, setPose] = useState<Pose | null>(null)
  const [status, setStatus] = useState('Connecting...')
  const [view, setView] = useState<ViewState>({ zoom: 10, panX: 100, panY: 80 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastMouse, setLastMouse] = useState<{ x: number; y: number } | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws')

    ws.onopen = () => setStatus('Connected')
    ws.onclose = () => setStatus('Disconnected')
    ws.onerror = () => setStatus('WebSocket error')

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === 'map') {
          setGrid(msg.map)
        } else if (msg.type === 'pose') {
          setPose(msg.pose)
        }
      } catch {
        setStatus('Invalid message received')
      }
    }

    return () => ws.close()
  }, [])

  const mapPixelSize = useMemo(() => {
    if (!grid) return null
    return {
      widthM: grid.width * grid.resolution,
      heightM: grid.height * grid.resolution,
    }
  }, [grid])

  useEffect(() => {
    if (!grid) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    const worldToCanvas = (wx: number, wy: number): { cx: number; cy: number } => {
      const mx = (wx - grid.origin.x) / grid.resolution
      const my = (wy - grid.origin.y) / grid.resolution
      const cx = mx * view.zoom + view.panX
      const cy = CANVAS_HEIGHT - (my * view.zoom + view.panY)
      return { cx, cy }
    }

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const value = grid.data[y * grid.width + x]
        if (value < 0) {
          ctx.fillStyle = '#6b7280'
        } else {
          const shade = 255 - Math.max(0, Math.min(100, value)) * 2.55
          const gray = Math.round(shade)
          ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`
        }

        const worldX = grid.origin.x + x * grid.resolution
        const worldY = grid.origin.y + y * grid.resolution
        const { cx, cy } = worldToCanvas(worldX, worldY)
        const cellSizePx = Math.max(1, view.zoom)

        ctx.fillRect(cx, cy - cellSizePx, cellSizePx, cellSizePx)
      }
    }

    if (pose) {
      const robotRadiusM = 0.18
      const front = worldToCanvas(
        pose.x + Math.cos(pose.theta) * robotRadiusM,
        pose.y + Math.sin(pose.theta) * robotRadiusM,
      )
      const left = worldToCanvas(
        pose.x + Math.cos(pose.theta + (Math.PI * 3) / 4) * robotRadiusM,
        pose.y + Math.sin(pose.theta + (Math.PI * 3) / 4) * robotRadiusM,
      )
      const right = worldToCanvas(
        pose.x + Math.cos(pose.theta - (Math.PI * 3) / 4) * robotRadiusM,
        pose.y + Math.sin(pose.theta - (Math.PI * 3) / 4) * robotRadiusM,
      )

      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.moveTo(front.cx, front.cy)
      ctx.lineTo(left.cx, left.cy)
      ctx.lineTo(right.cx, right.cy)
      ctx.closePath()
      ctx.fill()
    }
  }, [grid, pose, view])

  const onWheel: WheelEventHandler<HTMLCanvasElement> = (event) => {
    event.preventDefault()
    const zoomDelta = event.deltaY < 0 ? 1.1 : 0.9
    setView((prev) => ({
      ...prev,
      zoom: Math.max(2, Math.min(60, prev.zoom * zoomDelta)),
    }))
  }

  const onMouseDown: MouseEventHandler<HTMLCanvasElement> = (event) => {
    setIsPanning(true)
    setLastMouse({ x: event.clientX, y: event.clientY })
  }

  const onMouseMove: MouseEventHandler<HTMLCanvasElement> = (event) => {
    if (!isPanning || !lastMouse) return

    const dx = event.clientX - lastMouse.x
    const dy = event.clientY - lastMouse.y

    setView((prev) => ({
      ...prev,
      panX: prev.panX + dx,
      panY: prev.panY - dy,
    }))
    setLastMouse({ x: event.clientX, y: event.clientY })
  }

  const stopPanning = () => {
    setIsPanning(false)
    setLastMouse(null)
  }

  return (
    <main>
      <h1>RoboVac Occupancy Grid Viewer</h1>
      <p>
        Status: <strong>{status}</strong>
      </p>
      <p>Controls: Mouse wheel to zoom, drag to pan.</p>
      {mapPixelSize && (
        <p>
          Map size: {mapPixelSize.widthM.toFixed(2)}m × {mapPixelSize.heightM.toFixed(2)}m
        </p>
      )}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopPanning}
        onMouseLeave={stopPanning}
      />
    </main>
  )
}

export default App
