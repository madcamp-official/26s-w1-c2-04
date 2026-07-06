import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

//리액트에 진입시키는 통로
createRoot(document.getElementById('root')!).render(
  //잠재적 문제를 찾는 도구...??
  <StrictMode> 
    <App />
  </StrictMode>,
)
