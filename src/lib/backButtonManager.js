// Centralized stack manager for Android hardware back button events.
// Modals and popups register their close handlers here.
// When the back button is pressed, the top handler in the stack is executed first.

const stack = []

export function registerBackHandler(handler) {
  if (typeof handler !== 'function') return () => {}
  const entry = { id: Symbol(), handler }
  stack.push(entry)

  // Return unregister function
  return () => {
    const idx = stack.findIndex(item => item.id === entry.id)
    if (idx !== -1) {
      stack.splice(idx, 1)
    }
  }
}

export function handleBackButtonStack() {
  if (stack.length > 0) {
    // Pop the topmost handler and execute it
    const top = stack.pop()
    if (typeof top.handler === 'function') {
      try {
        top.handler()
      } catch (err) {
        console.error('Error executing back button handler:', err)
      }
    }
    return true
  }
  return false
}

export function getBackStackLength() {
  return stack.length
}
