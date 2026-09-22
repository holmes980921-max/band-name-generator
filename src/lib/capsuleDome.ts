import { mulberry32, packCirclesWithGravity } from './capsulePacking'

export type CapsuleColor = 'red' | 'blue' | 'yellow' | 'green' | 'purple' | 'pink' | 'clear'

export type CapsuleDepth = 'back' | 'mid' | 'front'

export interface PileCapsule {
  id: string
  /** 자판기 돔 안에서의 위치 (0~100%, 돔 영역 기준) */
  xPct: number
  yPct: number
  scale: number
  rotate: number
  color: CapsuleColor
  /** 앞/뒤 레이어: back은 작고 어둡게, front는 크고 선명하게 그려 깊이감을 만든다. */
  depth: CapsuleDepth
  wobbleDelay: number
  wobbleDuration: number
}

/** 실제로 뽑혀서 이동하는 캡슐의 데이터. 애니메이션 lifecycle 전체 동안 이 객체(특히 color)가 유지된다. */
export interface SelectedCapsule {
  id: string
  color: CapsuleColor
  word: string
}

// 돔 영역과 대략 같은 가로세로 비율(폭:높이)의 "가상 픽셀" 공간에서 중력
// 시뮬레이션을 돌린다. 실제 렌더링 크기는 %로 환산되므로 정확히 같은
// 픽셀일 필요는 없지만, 비율이 비슷해야 "맞닿은 원"이 실제 화면에서도
// 찌그러지지 않고 맞닿은 것처럼 보인다.
const DOME_SIM_WIDTH = 380
const DOME_SIM_HEIGHT = 152
const BASE_RADIUS = 17
const PILE_SEED = 934871
// 챔버 테두리(.dome-chamber의 inset)를 감안한 여유 — 이 마진이 없으면 큰(front)
// 캡슐이 벽 쪽에서 유리 테두리 밖으로 살짝 삐져나와 보일 수 있다.
const WALL_MARGIN_X = 12
const TOP_MARGIN = 6

const DEPTH_RADIUS: Record<CapsuleDepth, number> = { back: 13.5, mid: 17, front: 21.5 }
const COLOR_CYCLE: CapsuleColor[] = ['red', 'blue', 'yellow', 'green', 'purple', 'pink', 'clear']
// mid를 가장 많이 섞고 back/front를 적당히 배치해 깊이감을 준다
const DEPTH_SEQUENCE: CapsuleDepth[] = [
  'front', 'mid', 'back', 'mid', 'front', 'mid', 'back', 'front', 'mid',
  'back', 'mid', 'front', 'mid', 'back', 'front', 'mid', 'back', 'mid',
]

/**
 * 자판기 상단 돔 안에 쌓여 있는 큰 캡슐 더미. 왼쪽/오른쪽 뽑기가 공유하는
 * 하나의 무더기다. 좌표를 손으로 배치하는 대신, 중력 시뮬레이션
 * (packCirclesWithGravity)을 한 번 돌려서 캡슐들이 실제로 서로에게/바닥에
 * 부딪히며 자연스럽게 쌓인 결과를 그대로 쓴다 — 그래서 위쪽 캡슐도 반드시
 * 아래쪽 캡슐 위에 얹혀 있거나 다른 캡슐에 맞닿아 있고, 공중에 혼자 떠 있는
 * 캡슐은 없다. depth(back/mid/front)는 반지름에 반영되어(back은 작게,
 * front는 크게) 시뮬레이션 결과 자체에 깊이감이 자연스럽게 녹아든다.
 */
function buildPile(): PileCapsule[] {
  const radii = DEPTH_SEQUENCE.map((depth) => DEPTH_RADIUS[depth])
  // 실제 벽보다 약간 좁은 상자 안에서 시뮬레이션하고, 결과를 다시 가운데로
  // 밀어 넣어서(margin만큼 offset) 챔버 테두리에 닿지 않는 여유를 만든다.
  const circles = packCirclesWithGravity({
    width: DOME_SIM_WIDTH - WALL_MARGIN_X * 2,
    height: DOME_SIM_HEIGHT - TOP_MARGIN,
    radii,
    seed: PILE_SEED,
  })
  const rand = mulberry32(PILE_SEED + 1)

  return circles.map((circle, index) => ({
    id: `p${index + 1}`,
    xPct: ((circle.x + WALL_MARGIN_X) / DOME_SIM_WIDTH) * 100,
    yPct: ((circle.y + TOP_MARGIN) / DOME_SIM_HEIGHT) * 100,
    scale: circle.r / BASE_RADIUS,
    rotate: Math.round((rand() - 0.5) * 40),
    color: COLOR_CYCLE[index % COLOR_CYCLE.length],
    depth: DEPTH_SEQUENCE[index],
    wobbleDelay: Math.round(rand() * 18) / 10,
    wobbleDuration: 4 + Math.round(rand() * 14) / 10,
  }))
}

export const PILE: PileCapsule[] = buildPile()

/** 왼쪽/오른쪽 뽑기 버튼이 각자 "자기 쪽" 캡슐을 뽑는 것처럼 보이도록 절반씩 나눈 인덱스 풀. */
export const LEFT_INDICES = PILE.reduce<number[]>((acc, capsule, index) => {
  if (capsule.xPct < 50) acc.push(index)
  return acc
}, [])

export const RIGHT_INDICES = PILE.reduce<number[]>((acc, capsule, index) => {
  if (capsule.xPct >= 50) acc.push(index)
  return acc
}, [])

/**
 * 실제 자판기라면 배출되는 캡슐은 항상 출구에 가장 가까운, 다른 캡슐에
 * 깔려서 잘 안 보이던 아래쪽 캡슐이어야 한다 — 더미 위쪽/앞쪽에 떠 있는
 * 캡슐이 갑자기 튀어나오면 위에 있던 캡슐들이 그대로인 채라 부자연스럽다.
 * yPct(아래일수록 큰 값)가 큰 순으로 정렬해서 하위 절반만 "뽑힐 수 있는"
 * 후보로 남긴다.
 */
function bottomHalf(indices: number[]): number[] {
  const sorted = [...indices].sort((a, b) => PILE[b].yPct - PILE[a].yPct)
  const count = Math.max(2, Math.ceil(sorted.length / 2))
  return sorted.slice(0, count)
}

export const LEFT_LAUNCHABLE = bottomHalf(LEFT_INDICES)
export const RIGHT_LAUNCHABLE = bottomHalf(RIGHT_INDICES)

function hashSeed(seed: string): number {
  let sum = 0
  for (let i = 0; i < seed.length; i += 1) sum += seed.charCodeAt(i)
  return sum
}

/** seed(보통 word.id)마다 "이번에 튀어나올 캡슐"이 달라 보이도록 하는 결정론적 선택. */
export function pickLaunchIndex(seed: string, pool: number[]): number {
  if (pool.length === 0) return 0
  return pool[hashSeed(seed) % pool.length]
}

/**
 * word에 대해 뽑힐 캡슐 데이터를 만든다. 돔이 반짝이며 내보내는 캡슐과
 * 정확히 같은 색을 쓰도록, 같은 seed/pool 조합으로 같은 PILE 항목을 고른다.
 * 이 결과(color)는 word.id가 바뀌기 전까지 selecting -> ejecting -> bounce
 * -> opening -> unfolding 모든 단계에서 동일하게 유지된다.
 */
export function getCapsuleForSide(seed: string, wordText: string, side: 'left' | 'right'): SelectedCapsule {
  const pool = side === 'left' ? LEFT_LAUNCHABLE : RIGHT_LAUNCHABLE
  const capsule = PILE[pickLaunchIndex(seed, pool)]
  return { id: seed, color: capsule.color, word: wordText }
}

/**
 * getCapsuleForSide와 똑같은 seed/pool 조합으로 같은 PILE 항목을 고르되,
 * 색상뿐 아니라 돔 안에서의 위치(xPct/yPct)까지 돌려준다. 이동하는 캡슐이
 * "그 자리에 있던 바로 그 캡슐"처럼 보이도록, 뽑힌 캡슐의 출발점을 여기서
 * 구한 돔 좌표로 맞춘다. 색상 선택 로직(pickLaunchIndex) 자체는 건드리지
 * 않는다 — 같은 함수를 그대로 재사용할 뿐이다.
 */
export function getLaunchCapsule(seed: string, side: 'left' | 'right'): PileCapsule {
  const pool = side === 'left' ? LEFT_LAUNCHABLE : RIGHT_LAUNCHABLE
  return PILE[pickLaunchIndex(seed, pool)]
}

/** 두 캡슐이 돔 안에서 서로 가까이 있는지 (이웃 캡슐에 jostle 효과를 줄 때 사용). */
export function isNearby(a: PileCapsule, b: PileCapsule, threshold = 18): boolean {
  const dx = a.xPct - b.xPct
  const dy = a.yPct - b.yPct
  return Math.hypot(dx, dy) <= threshold
}
