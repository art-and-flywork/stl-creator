import type { ReactNode } from 'react'
import { track } from '../analytics'

/** Where visitors can tip Art & Flywork for free personal use. */
export const KOFI_URL = 'https://ko-fi.com/artandflywork'

/** A link to Ko-fi that counts its clicks; `from` says where it sits. */
export function SupportLink({
  from,
  creator,
  className,
  children = 'Buy me a coffee',
}: {
  from: string
  creator?: string
  className?: string
  children?: ReactNode
}) {
  return (
    <a
      className={className}
      href={KOFI_URL}
      target="_blank"
      rel="noreferrer"
      onClick={() => track('support', creator ? { from, creator } : { from })}
    >
      {children}
    </a>
  )
}
