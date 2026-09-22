import type { CSSProperties } from 'react'
import { isNearby, LEFT_LAUNCHABLE, PILE, pickLaunchIndex, RIGHT_LAUNCHABLE } from '../lib/capsuleDome'
import { CAPSULE_PALETTE } from '../lib/capsulePalette'
import type { CapsulePhase } from '../lib/capsulePhases'

interface CapsuleDomeProps {
  leftPhase: CapsulePhase
  leftSeed: string
  rightPhase: CapsulePhase
  rightSeed: string
}

type DomeCapsuleStyle = CSSProperties & { '--dome-delay'?: string; '--dome-duration'?: string }

const DEPTH_Z_BIAS: Record<string, number> = { back: -100, mid: 0, front: 100 }

/**
 * 자판기 상단에 있는 "하나의" 캡슐 더미. 왼쪽/오른쪽 카드에 각각 따로 있는
 * 것이 아니라 이 컴포넌트 하나를 좌우 뽑기 버튼이 공유한다 — 왼쪽 뽑기는
 * 더미의 왼쪽 절반에서, 오른쪽 뽑기는 오른쪽 절반에서 캡슐을 골라 반짝인
 * 뒤 빠져나가는 것처럼 보이게 해서 "저 많은 캡슐 중 하나를 실제로 뽑았다"는
 * 느낌을 준다. 배경색은 CAPSULE_PALETTE에서만 가져오므로, 실제로 이동하는
 * 캡슐(Capsule.tsx)과 항상 같은 색상 소스를 공유한다.
 */
export function CapsuleDome({ leftPhase, leftSeed, rightPhase, rightSeed }: CapsuleDomeProps) {
  // jostle(이웃 캡슐이 밀리는 것)은 선택되는 그 순간에만 짧게 일어난다
  const leftActive = leftPhase === 'selecting' || leftPhase === 'ejecting'
  const rightActive = rightPhase === 'selecting' || rightPhase === 'ejecting'
  // 뽑힌 자리는 뽑기 시퀀스가 완전히 끝날 때까지(쪽지가 다 펼쳐질 때까지) 계속
  // 비어 있어야 한다 — bounce/opening/unfolding 도중에 그 캡슐이 다시 불쑥
  // 나타나면 "순간 리필"처럼 보여서 어색하다. idle/shaking일 때만 정상 표시.
  const leftGone = leftPhase !== 'idle' && leftPhase !== 'shaking'
  const rightGone = rightPhase !== 'idle' && rightPhase !== 'shaking'
  const shaking = leftPhase === 'shaking' || rightPhase === 'shaking'

  // 뽑히는 캡슐은 항상 더미 아래쪽(출구에 가깝고 다른 캡슐에 깔려 잘 안 보이던
  // 자리)에서만 고른다 — 위/앞쪽 캡슐이 아무 이유 없이 튀어나오면 부자연스럽다.
  const leftLaunch = pickLaunchIndex(leftSeed, LEFT_LAUNCHABLE)
  const rightLaunch = pickLaunchIndex(rightSeed, RIGHT_LAUNCHABLE)

  return (
    <div className={`dome-pile ${shaking ? 'dome-pile--shaking' : ''}`} aria-hidden="true">
      {PILE.map((capsule, index) => {
        const isLeftLaunch = leftGone && index === leftLaunch
        const isRightLaunch = rightGone && index === rightLaunch
        const isLeftNeighbor = leftActive && !isLeftLaunch && isNearby(capsule, PILE[leftLaunch])
        const isRightNeighbor = rightActive && !isRightLaunch && isNearby(capsule, PILE[rightLaunch])

        const modifiers = [
          `dome-capsule--${capsule.depth}`,
          isLeftLaunch || isRightLaunch ? 'dome-capsule--launch' : '',
          !isLeftLaunch && !isRightLaunch && (isLeftNeighbor || isRightNeighbor) ? 'dome-capsule--jostle' : '',
          capsule.color === 'clear' ? 'dome-capsule--clear' : '',
        ].join(' ')

        const palette = CAPSULE_PALETTE[capsule.color]
        const style: DomeCapsuleStyle = {
          left: `${capsule.xPct}%`,
          top: `${capsule.yPct}%`,
          scale: capsule.scale,
          rotate: `${capsule.rotate}deg`,
          zIndex: Math.round(capsule.yPct) + DEPTH_Z_BIAS[capsule.depth],
          // 위쪽 절반은 항상 흰색, 아래쪽 절반만 포인트 컬러 — 이동 캡슐(Capsule.tsx)과 같은
          // "흰색 반구 + 컬러 반구" 조형을 공유한다. 44~54% 사이에서만 짧게 섞이는 뚜렷한 반반 분할.
          background: `linear-gradient(180deg, #ffffff 0%, #f1f1f1 44%, ${palette.mid} 54%, ${palette.dark} 100%)`,
          '--dome-delay': `${capsule.wobbleDelay}s`,
          '--dome-duration': `${capsule.wobbleDuration}s`,
        }

        return <div key={capsule.id} className={`dome-capsule ${modifiers}`} style={style} />
      })}
    </div>
  )
}
