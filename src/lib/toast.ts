export const toast = {
  success: (message: string) => {
    if (typeof window !== 'undefined') {
      // Simple fallback; replace with a real toast library later
      alert(message)
    } else {
      console.log(message)
    }
  },
  error: (message: string) => {
    if (typeof window !== 'undefined') {
      alert(message)
    } else {
      console.error(message)
    }
  },
}