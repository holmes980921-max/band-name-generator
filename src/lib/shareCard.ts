// 캡슐 쪽지와 같은 톤(찢어진 종이 가장자리 + 접힘선)을 canvas 좌표계로 옮긴
// 폴리곤. src/index.css의 .note-paper clip-path와 같은 비율 값이다.
const NOTE_POINTS: [number, number][] = [
  [0.02, 0.04],
  [0.18, 0],
  [0.35, 0.03],
  [0.53, 0],
  [0.7, 0.03],
  [0.88, 0],
  [0.98, 0.05],
  [1, 0.22],
  [0.97, 0.4],
  [1, 0.58],
  [0.98, 0.76],
  [1, 0.92],
  [0.88, 1],
  [0.7, 0.97],
  [0.52, 1],
  [0.33, 0.97],
  [0.15, 1],
  [0.03, 0.95],
  [0, 0.78],
  [0.03, 0.6],
  [0, 0.42],
  [0.03, 0.24],
  [0, 0.1],
]

const CARD_WIDTH = 1080
const CARD_HEIGHT = 1080

async function ensureFontsReady(): Promise<void> {
  try {
    await Promise.all([
      document.fonts.load('700 96px "Black Han Sans"'),
      document.fonts.load('700 30px "Gothic A1"'),
      document.fonts.load('400 26px "Gothic A1"'),
    ])
    await document.fonts.ready
  } catch {
    // 폰트 로딩이 실패해도 캡처 자체는 계속 진행한다 (기본 폰트로 대체됨)
  }
}

function drawNote(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  const x0 = cx - w / 2
  const y0 = cy - h / 2

  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
  ctx.shadowBlur = 40
  ctx.shadowOffsetY = 18
  ctx.beginPath()
  NOTE_POINTS.forEach(([fx, fy], i) => {
    const x = x0 + fx * w
    const y = y0 + fy * h
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.closePath()
  const paper = ctx.createLinearGradient(x0, y0, x0 + w, y0 + h)
  paper.addColorStop(0, '#fffdf7')
  paper.addColorStop(0.55, '#fbf3df')
  paper.addColorStop(1, '#f3e6c8')
  ctx.fillStyle = paper
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x0 + w * 0.08, cy)
  ctx.lineTo(x0 + w * 0.92, cy)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx, y0 + h * 0.14)
  ctx.lineTo(cx, y0 + h * 0.86)
  ctx.stroke()
  ctx.restore()
}

function drawCapsule(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, mid: string, dark: string, rotate: number) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotate)
  ctx.beginPath()
  ctx.arc(0, 0, r, Math.PI, 0)
  ctx.closePath()
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI)
  ctx.closePath()
  const grad = ctx.createLinearGradient(0, 0, 0, r)
  grad.addColorStop(0, mid)
  grad.addColorStop(1, dark)
  ctx.fillStyle = grad
  ctx.fill()
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

/** 밴드 이름 길이에 맞게 폰트 크기를 줄여서 카드 폭 안에 들어오게 한다. */
function fitFontSize(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxSize: number, minSize: number): number {
  let size = maxSize
  while (size > minSize) {
    ctx.font = `700 ${size}px "Black Han Sans", sans-serif`
    if (ctx.measureText(text).width <= maxWidth) break
    size -= 4
  }
  return size
}

/**
 * "이 밴드 이름 사용하기" 확정 후 공유할 수 있는 깔끔한 카드 이미지를
 * 새로 그려서 PNG Blob으로 돌려준다. 확정 팝업 화면을 그대로 캡처하는 게
 * 아니라, 버튼 없이 밴드 이름만 크게 보이는 전용 카드를 그린다.
 */
export async function renderShareCard(bandName: string): Promise<Blob> {
  await ensureFontsReady()

  const canvas = document.createElement('canvas')
  canvas.width = CARD_WIDTH
  canvas.height = CARD_HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2d context를 만들지 못했습니다')

  ctx.fillStyle = '#0b0c10'
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

  const glow = ctx.createRadialGradient(
    CARD_WIDTH / 2,
    CARD_HEIGHT * 0.44,
    40,
    CARD_WIDTH / 2,
    CARD_HEIGHT * 0.44,
    CARD_WIDTH * 0.65,
  )
  glow.addColorStop(0, 'rgba(255, 176, 32, 0.16)')
  glow.addColorStop(1, 'rgba(255, 176, 32, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = '#ffb020'
  ctx.font = '700 30px "Gothic A1", sans-serif'
  ctx.fillText('B A N D   N A M E   M A C H I N E', CARD_WIDTH / 2, 150)

  drawCapsule(ctx, CARD_WIDTH * 0.22, 150, 34, '#f472b6', '#be185d', -0.3)
  drawCapsule(ctx, CARD_WIDTH * 0.78, 150, 34, '#60a5fa', '#1d4ed8', 0.3)

  const noteW = CARD_WIDTH * 0.82
  const noteH = CARD_HEIGHT * 0.34
  const noteCy = CARD_HEIGHT * 0.52
  drawNote(ctx, CARD_WIDTH / 2, noteCy, noteW, noteH)

  const fontSize = fitFontSize(ctx, bandName, noteW * 0.82, 92, 40)
  ctx.font = `700 ${fontSize}px "Black Han Sans", sans-serif`
  ctx.fillStyle = '#1a1206'
  ctx.textBaseline = 'middle'
  ctx.fillText(bandName, CARD_WIDTH / 2, noteCy + fontSize * 0.06)
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
  ctx.font = '400 26px "Gothic A1", sans-serif'
  ctx.fillText('캡슐 뽑기로 만든 우리 밴드 이름', CARD_WIDTH / 2, CARD_HEIGHT * 0.84)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.font = '400 22px "Gothic A1", sans-serif'
  ctx.fillText('band-name-generator-zeta.vercel.app', CARD_WIDTH / 2, CARD_HEIGHT - 70)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('이미지를 만들지 못했습니다'))
    }, 'image/png')
  })
}
