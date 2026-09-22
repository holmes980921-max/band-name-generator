import type { SelectedCapsule } from '../lib/capsuleDome'
import type { CapsulePhase } from '../lib/capsulePhases'
import { Note } from './Note'

interface WordOutputProps {
  capsule: SelectedCapsule
  phase: CapsulePhase
}

/**
 * 자판기 배출구/트레이 한 쪽 — 쪽지만 이 자리에서 렌더링한다. 이동하는
 * 캡슐 몸체는 더 이상 여기 속하지 않는다: 돔 안 그 캡슐의 실제 좌표에서
 * 출발해야 하므로, machine-glass 전체 좌표계를 공유하는 VendingMachine이
 * <Capsule/> 두 개를 직접 그린다(이 트레이 위치가 도착 지점이 된다).
 */
export function WordOutput({ capsule, phase }: WordOutputProps) {
  return (
    <div className="output-window relative flex h-full flex-1 items-center justify-center">
      <Note phase={phase} text={capsule.word} size="sm" />
    </div>
  )
}
