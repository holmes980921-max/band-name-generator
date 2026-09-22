export interface CapsulePoint {
  /** machine-glass 박스 기준 백분율 좌표 */
  x: number
  y: number
}

/**
 * 캡슐이 실제로 이동한 거리(퍼센트 좌표 기준)에 비례해서 회전량을 정한다.
 * 픽셀 단위의 진짜 물리 계산은 아니지만 "많이 움직일수록 많이 구른다"는
 * 시각적 연결감을 주기 위한 근사치다. 420~1080도 사이로 제한해 너무 적게
 * 돌거나 지나치게 많이 도는 것을 막는다.
 */
export function rotationForDistance(origin: CapsulePoint, target: CapsulePoint): number {
  const dx = target.x - origin.x
  const dy = target.y - origin.y
  const distance = Math.hypot(dx, dy)
  const rotation = 420 + distance * 9
  return Math.round(Math.min(Math.max(rotation, 420), 1080))
}
