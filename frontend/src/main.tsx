import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { TooltipProvider } from "@/components/ui/tooltip"

const rootElement = document.getElementById('root')

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </StrictMode>,
  )
} else {
  console.error("Failed to find the root element. Ensure index.html contains <div id='root'></div>")
}