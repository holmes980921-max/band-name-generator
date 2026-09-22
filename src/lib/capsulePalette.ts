import type { CapsuleColor } from './capsuleDome'

/**
 * 돔 안의 캡슐과, 실제로 뽑혀 이동하는 캡슐이 공유하는 단일 색상 팔레트.
 * 이 값 하나만 바뀌면 더미와 이동 캡슐의 색이 항상 같이 바뀐다.
 */
export const CAPSULE_PALETTE: Record<CapsuleColor, { mid: string; dark: string }> = {
  red: { mid: '#f87171', dark: '#b91c1c' },
  blue: { mid: '#60a5fa', dark: '#1d4ed8' },
  yellow: { mid: '#fde047', dark: '#ca8a04' },
  green: { mid: '#4ade80', dark: '#15803d' },
  purple: { mid: '#c084fc', dark: '#7e22ce' },
  pink: { mid: '#f472b6', dark: '#be185d' },
  clear: { mid: 'rgba(255,255,255,0.55)', dark: 'rgba(255,255,255,0.2)' },
}
