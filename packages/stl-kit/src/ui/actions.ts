/** Save an STL through the browser's download. */
export function downloadStl(stl: ArrayBuffer, name: string) {
  const url = URL.createObjectURL(new Blob([stl], { type: 'model/stl' }))
  Object.assign(document.createElement('a'), { href: url, download: name }).click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** The share sheet on phones and tablets, the clipboard elsewhere. */
export async function shareLink(url: string, title: string): Promise<'shared' | 'copied' | 'failed'> {
  if (navigator.share && matchMedia('(pointer: coarse)').matches) {
    try {
      await navigator.share({ title, url })
    } catch {
      // cancelled
    }
    return 'shared'
  }
  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    window.prompt('Copy this link:', url)
    return 'failed'
  }
}
