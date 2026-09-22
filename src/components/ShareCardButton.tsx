import { useState } from 'react'
import { renderShareCard } from '../lib/shareCard'

interface ShareCardButtonProps {
  bandName: string
}

function fileNameFor(bandName: string): string {
  const safe = bandName.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '-')
  return `band-name-${safe}.png`
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/**
 * 확정된 밴드 이름을 버튼 없는 공유용 카드 이미지로 만들어서, 모바일에서는
 * 공유 시트(카톡/사진앱 등으로 바로 전달)를 우선 시도하고, 지원하지 않는
 * 환경에서는 이미지 다운로드로 자동 대체한다.
 */
export function ShareCardButton({ bandName }: ShareCardButtonProps) {
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleShare = async () => {
    setBusy(true)
    setErrorMessage(null)
    try {
      const blob = await renderShareCard(bandName)
      const fileName = fileNameFor(bandName)
      const file = new File([blob], fileName, { type: 'image/png' })
      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean
        share?: (data?: ShareData) => Promise<void>
      }

      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], title: 'BAND NAME MACHINE', text: bandName })
      } else {
        downloadBlob(blob, fileName)
      }
    } catch (error) {
      if ((error as { name?: string })?.name !== 'AbortError') {
        setErrorMessage('이미지를 만들지 못했어요. 다시 시도해주세요.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleShare}
        disabled={busy}
        className="ghost-button font-ui w-full gap-2 rounded-xl py-3 text-sm"
      >
        <ShareIcon />
        {busy ? '이미지 만드는 중…' : '이미지로 공유하기'}
      </button>
      {errorMessage && <p className="text-xs text-red-400">{errorMessage}</p>}
    </div>
  )
}

function ShareIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" />
      <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
    </svg>
  )
}
