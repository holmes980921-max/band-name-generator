import type { CSSProperties } from 'react'
import type { CapsulePhase } from '../lib/capsulePhases'

interface NoteProps {
  phase: CapsulePhase
  text: string
  size?: 'sm' | 'lg'
}

const NOTE_UNIT: Record<'sm' | 'lg', number> = { sm: 1, lg: 1.9 }

type NoteStyle = CSSProperties & { '--capsule-unit'?: number }

/**
 * 캡슐 안에서 나온, 접혔다 펼쳐진 쪽지. 더 이상 전광판/디스플레이가 없으므로
 * 이 컴포넌트가 "평소에 단어를 보여주는" 유일한 요소다 — idle일 때는 이미
 * 완전히 펼쳐진 상태로 text를 보여주고, selecting/ejecting/bounce/opening
 * 동안에는 숨어 있다가(캡슐이 그 자리를 대신 보여줌) unfolding에서 다시
 * 펼쳐지며 등장한다.
 */
export function Note({ phase, text, size = 'sm' }: NoteProps) {
  const style: NoteStyle = { '--capsule-unit': NOTE_UNIT[size] }

  return (
    <div className="note-stage" data-phase={phase} style={style}>
      <div className="note-paper">
        <span className="note-word">{text}</span>
      </div>
    </div>
  )
}
