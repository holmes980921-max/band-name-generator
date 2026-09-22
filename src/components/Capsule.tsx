import type { CSSProperties } from 'react'
import type { CapsuleColor } from '../lib/capsuleDome'
import { CAPSULE_PALETTE } from '../lib/capsulePalette'
import type { CapsulePhase } from '../lib/capsulePhases'
import { rotationForDistance, type CapsulePoint } from '../lib/rollPhysics'

interface CapsuleProps {
  phase: CapsulePhase
  color: CapsuleColor
  /** 돔 안에서 이 캡슐이 있던 자리 (부모 박스 기준 %) — 이동 애니메이션의 출발점. */
  origin: CapsulePoint
  /** 배출구 아래, 쪽지가 펼쳐질 자리 (부모 박스 기준 %) — 이동 애니메이션의 도착점. */
  target: CapsulePoint
  size?: 'sm' | 'lg'
}

const CAPSULE_UNIT: Record<'sm' | 'lg', number> = { sm: 1, lg: 1.7 }

type CapsuleStyle = CSSProperties & {
  '--capsule-unit'?: number
  '--capsule-mid'?: string
  '--capsule-dark'?: string
  '--origin-x'?: string
  '--origin-y'?: string
  '--target-x'?: string
  '--target-y'?: string
  '--roll-rotation'?: string
}

/**
 * 더미 안 그 캡슐이 실제로 빠져나와(ejecting) 통로를 지나 튕기고 열리는
 * 몸체 애니메이션. origin은 돔 안에서 뽑힌 캡슐의 실제 좌표, target은
 * 쪽지가 펼쳐질 배출 트레이 자리 — 이 둘을 그대로 CSS 좌표로 써서, "다른
 * 캡슐이 새로 나타나는 것"이 아니라 "그 캡슐이 거기서부터 굴러온 것"처럼
 * 보이게 한다. 색상은 반드시 color prop(돔에서 뽑힌 캡슐과 동일한 값)에서만
 * 가져오고 하드코딩하지 않는다.
 */
export function Capsule({ phase, color, origin, target, size = 'sm' }: CapsuleProps) {
  const palette = CAPSULE_PALETTE[color]
  const rotation = rotationForDistance(origin, target)
  const style: CapsuleStyle = {
    '--capsule-unit': CAPSULE_UNIT[size],
    '--capsule-mid': palette.mid,
    '--capsule-dark': palette.dark,
    '--origin-x': `${origin.x}%`,
    '--origin-y': `${origin.y}%`,
    '--target-x': `${target.x}%`,
    '--target-y': `${target.y}%`,
    '--roll-rotation': `${rotation}deg`,
  }

  return (
    <div className="capsule-stage" data-phase={phase} style={style} aria-hidden="true">
      <div className="capsule-body">
        <div className="capsule-half capsule-half-top" />
        <div className="capsule-shine" />
        <div className="capsule-half capsule-half-bottom" />
      </div>
    </div>
  )
}
