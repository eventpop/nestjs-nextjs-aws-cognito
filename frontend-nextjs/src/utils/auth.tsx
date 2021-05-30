import {
  useState,
  useContext,
  createContext,
  useEffect,
} from 'react'

export interface IAuthContext {
  authState: IAuthState
  setAuthToken: (token: string) => void
  signIn: (email: string, token: string) => void
  signOut: () => void
  isLoading: boolean
}

export interface IAuthState {
  token: string
  email: string
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext)

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({} as IAuthState)
  const [isLoading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (localStorage.getItem('email') !== authState.email) {
      setAuthState({
        ...authState,
        email: localStorage.getItem('email'),
      })
      setLoading(false)
    }
  }, [authState])

  const signIn = (email, token) => {
    setAuthState({
      ...authState,
      email,
      token,
    })
    if (typeof window !== 'undefined') {
      localStorage.setItem('email', email)
    }
  }

  const setAuthToken = (token) => {
    setAuthState({
      ...authState,
      token,
    })
  }

  const signOut = () => {
    setAuthState({} as IAuthState)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('email')
    }
  }

  return (
    <AuthContext.Provider
      value={{ authState, setAuthToken, signIn, signOut, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { useAuth, AuthProvider }
