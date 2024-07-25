import { createContext, useState } from "react"

const AuthContext = createContext()

const AuthContextProvider = ({children}) => {

    const [authUser, setAuthUser] = useState(false)

    return (
        <AuthContext.Provider value={{authUser, setAuthUser}}>
            {children}
        </AuthContext.Provider>
    )
}

export {AuthContext, AuthContextProvider}
