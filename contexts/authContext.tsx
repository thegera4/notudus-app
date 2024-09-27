import React, { createContext, useContext, useState, ReactNode } from 'react'
import { AuthContextType } from '@/types'

/** This context provides the 'auth' state and the 'setAuth' function.*/
const AuthContext = createContext<AuthContextType>({ auth: false, setAuth: () => { } })

/**
 * This hook returns the 'auth' state (used to know if the user entered biometrics to see private notes) and the 'setAuth' function.
 * @returns {AuthContextType} Object with the auth state and the setAuth function.
 */
export const useAuth = (): AuthContextType => useContext(AuthContext)

/**
 * This component provides the 'auth' state and the 'setAuth' function to its children.
 * @param {ReactNode} props.children The children components that will receive the 'auth' state and the 'setAuth' function.
 * @returns {JSX.Element} The component with the 'auth' state and the 'setAuth' function.
 */
export const AuthProvider = (props: { children: ReactNode }): JSX.Element => {
    const [auth, setAuth] = useState(false)
    const value = { auth, setAuth }
    return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
}