import { createContext, useState } from "react"

const AuthContext = createContext()

const AuthContextProvider = ({children}) => {

    console.log('createContext: ', createContext)
    console.log('useState: ', useState)

    const [authUser, setAuthUser] = useState(false)

    return (
        <AuthContext.Provider value={{authUser, setAuthUser}}>
            {children}
        </AuthContext.Provider>
    )
}

export {AuthContext, AuthContextProvider}
