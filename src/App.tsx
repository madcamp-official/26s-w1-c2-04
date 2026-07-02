import { useState } from 'react'

import './App.css'
import Box from './Box'

function App() {
  const [count, setCount] = useState(0)

  let x = 6

  return (
    <>
      <section id="center">

        <div>
          <h1>시작
          </h1>
          <p>
            <code>src/App.tsx</code>를 수정하고 저장하여 <code>HMR</code>을
            테스트해 보세요
          </p>
          <Box>hello</Box>

        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          현재 숫자: {count}
        </button>
      </section>
    </>
  )
}

export default App
