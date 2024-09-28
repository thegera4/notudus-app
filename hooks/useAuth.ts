import { useContext } from 'react'
import { AuthContextType } from '@/types'
import { AuthContext } from "@/contexts/authContext"

/**
 * This custom hook returns the 'auth' state (used to know if the user entered biometrics to see private notes) and the 'setAuth' function.
 * @returns {AuthContextType} Object with the auth state and the setAuth function to toggle the 'auth' state.
 */
export const useAuth = (): AuthContextType => useContext(AuthContext);