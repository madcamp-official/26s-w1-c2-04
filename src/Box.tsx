import type { ReactNode } from 'react'

type BoxProps = {
  children?: ReactNode
} // box안에 들어갈 자식요소들 타입, ?는 필수가 아님을 의미

function Box({ children = '박스' }: BoxProps) {
  //스타일이 포함된 UI
  return (
    <div
      style={{
        padding: '24px', //여백
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
