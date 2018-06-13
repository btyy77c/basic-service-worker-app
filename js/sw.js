document.addEventListener('DOMContentLoaded', event => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {}).catch(err => {})
  }
})
