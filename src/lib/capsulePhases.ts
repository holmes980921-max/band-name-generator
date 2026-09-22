export type CapsulePhase = 'idle' | 'shaking' | 'selecting' | 'ejecting' | 'bounce' | 'opening' | 'unfolding'

interface PhaseStep {
  phase: CapsulePhase
  duration: number
}

/**
 * 캡슐 뽑기 연출의 타임라인.
 * shaking(버튼을 누르자 더미 전체가 짧게 흔들림) -> selecting(캡슐 하나가
 * 반짝이며 선택되고 이웃 캡슐이 밀림) -> ejecting(선택된 캡슐이 그 자리에서
 * 통로/배출구를 지나 밖으로 굴러 나옴) -> bounce(바닥에서 여러 번 튕기며
 * 감속) -> opening(캡슐이 열림) -> unfolding(쪽지가 나와서 펼쳐짐) 순서로
 * 진행되고, 끝나면 idle로 돌아간다.
 */
const SEQUENCE: PhaseStep[] = [
  { phase: 'shaking', duration: 200 },
  { phase: 'selecting', duration: 180 },
  { phase: 'ejecting', duration: 520 },
  { phase: 'bounce', duration: 320 },
  { phase: 'opening', duration: 240 },
  { phase: 'unfolding', duration: 300 },
]

/** prefers-reduced-motion 사용자를 위한 최소한의 시퀀스: 캡슐 연출을 건너뛰고 짧게 페이드만 한다. */
const REDUCED_SEQUENCE: PhaseStep[] = [{ phase: 'unfolding', duration: 120 }]

/**
 * phase를 순서대로 예약해서 바꿔주고, 마지막에 idle로 되돌린 뒤 onDone을 호출한다.
 * 반환값을 호출하면 예약된 타이머를 전부 취소한다 (effect cleanup용).
 */
export function runCapsuleSequence(
  setPhase: (phase: CapsulePhase) => void,
  onDone: () => void,
  reduced = false,
): () => void {
  const timeouts: number[] = []
  let elapsed = 0
  const sequence = reduced ? REDUCED_SEQUENCE : SEQUENCE

  for (const step of sequence) {
    timeouts.push(window.setTimeout(() => setPhase(step.phase), elapsed))
    elapsed += step.duration
  }

  timeouts.push(
    window.setTimeout(() => {
      setPhase('idle')
      onDone()
    }, elapsed),
  )

  return () => timeouts.forEach((id) => window.clearTimeout(id))
}
