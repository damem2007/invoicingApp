import { useEffect } from 'react'
import './global.css'

export default function App() {
  useEffect(() => {
    import('./prototype.js')
  }, [])

  return null
}
