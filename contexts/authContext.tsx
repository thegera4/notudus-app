import React, { createContext, useState, ReactNode } from 'react'
import { AuthContextType } from '@/types'

/** This context provides the 'auth' state and the 'setAuth' function.*/
export const AuthContext = createContext<AuthContextType>({ auth: false, setAuth: () => { } })

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