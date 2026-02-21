import { useState, useEffect } from 'react'

/**
 * Custom hook for managing state in localStorage
 * @param {string} key - The localStorage key
 * @param {any} initialValue - The initial value if key doesn't exist
 * @returns {[any, function]} - A tuple of [value, setValue] similar to useState
 */
export function useLocalStorage(key, initialValue) {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return initialValue
      }

      // Get from localStorage
      const item = window.localStorage.getItem(key)
      
      // Parse stored json or return initialValue if null
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // If error, return initial value
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Save state
      setStoredValue(valueToStore)
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      // Handle errors (e.g., quota exceeded, localStorage disabled)
      console.warn(`Error setting localStorage key "${key}":`, error)
      // Still update state even if localStorage fails
      setStoredValue(value instanceof Function ? value(storedValue) : value)
    }
  }

  // Sync with localStorage changes from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.warn(`Error parsing localStorage value for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [key])

  return [storedValue, setValue]
}
