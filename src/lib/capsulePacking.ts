export interface PackedCircle {
  x: number
  y: number
  r: number
}

export interface PackConfig {
  width: number
  height: number
  /** 순서대로 하나씩 대응되는 각 원의 반지름 */
  radii: number[]
  seed: number
  iterations?: number
}

/** 시드 기반 의사난수 생성기(mulberry32) — 매 로드마다 배치가 바뀌지 않도록 고정 시드를 쓴다. */
export function mulberry32(seed: number): () => number {
  let s = seed
  return () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * 원(캡슐)들을 위에서 떨어뜨려 바닥과 서로에게 부딪히며 자연스럽게 쌓이도록
 * 만드는 아주 단순한 이완(relaxation) 시뮬레이션이다. 실시간으로 도는 물리
 * 엔진이 아니라 모듈이 로드될 때 딱 한 번 실행해서 정적인 좌표를 만들어
 * 내는 용도라 가볍다 — 매 프레임 다시 계산하지 않는다.
 *
 * 매 스텝마다 중력만큼 아주 조금씩 내려가게 하고(큰 폭으로 바닥까지 점프시키지
 * 않는다), 그 사이사이에 원끼리/벽/바닥과의 겹침을 여러 번 풀어준다. 이렇게
 * 하면 이미 바닥에 자리 잡은 원 위에 다른 원이 내려올 때, 바닥까지 파고들지
 * 못하고 그 원 위에서 저지당해 "쌓인" 상태로 멈춘다.
 */
export function packCirclesWithGravity({ width, height, radii, seed, iterations = 700 }: PackConfig): PackedCircle[] {
  const rand = mulberry32(seed)
  const circles: PackedCircle[] = radii.map((r, i) => ({
    // 좌/우 절반에 번갈아 초기 위치를 둬서, 중력으로 뒤섞여도 한쪽으로 쏠리지 않게 한다
    x: i % 2 === 0 ? width * (0.12 + rand() * 0.34) : width * (0.54 + rand() * 0.34),
    y: -r * 2 - i * r * 1.4,
    r,
  }))

  const gravityStep = Math.max(1, height / 90)

  for (let step = 0; step < iterations; step += 1) {
    for (const c of circles) {
      c.y += gravityStep
      c.x += (rand() - 0.5) * 0.5
    }

    for (let pass = 0; pass < 6; pass += 1) {
      for (const c of circles) {
        if (c.x < c.r) c.x = c.r
        if (c.x > width - c.r) c.x = width - c.r
        if (c.y > height - c.r) c.y = height - c.r
      }

      for (let i = 0; i < circles.length; i += 1) {
        for (let j = i + 1; j < circles.length; j += 1) {
          const a = circles[i]
          const b = circles[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const dist = Math.hypot(dx, dy) || 0.0001
          const minDist = a.r + b.r
          if (dist < minDist) {
            const overlap = (minDist - dist) / 2
            const nx = dx / dist
            const ny = dy / dist
            a.x -= nx * overlap
            a.y -= ny * overlap
            b.x += nx * overlap
            b.y += ny * overlap
          }
        }
      }
    }
  }

  return circles
}
