import type { ReactNode } from 'react'

type BoxProps = {
  children?: ReactNode
}

function Box({ children = '박스' }: BoxProps) {
  return (
    <div
      style={{
        padding: '24px',
        border: '2px solid var(--accent)',
        borderRadius: '12px',
        backgroundColor: 'var(--accent-bg)',
        color: 'var(--text-h)',
      }}
    >
      {children}
    </div>
  )
}

export default Box
