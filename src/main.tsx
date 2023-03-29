import { preloadWorkerAndWASM } from 'flac.wasm/worker'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import App from './App'

ReactDOM.createRoot(document.querySelector('#root')!).render(
  <React.StrictMode>
    <App />
    <ToastContainer
      position="top-center"
      theme="colored"
      hideProgressBar
      pauseOnFocusLoss
    />
  </React.StrictMode>
)

preloadWorkerAndWASM()
