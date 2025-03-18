import { createContext, useState } from "react"

const QueContext = createContext()

const QueContextProvider = ({children}) => {

    console.log('createContext: ', createContext)
    console.log('useState: ', useState)

    const [que, setQue] = useState([])

    return (
        <QueContext.Provider value={{que, setQue}}>
            {children}
        </QueContext.Provider>
    )
}

export {QueContext, QueContextProvider}