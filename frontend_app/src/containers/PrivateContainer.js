import { useSelector } from "react-redux"
import { getUser } from "../features/auth/authSlice"
import { Navigate } from "react-router-dom"

export const PrivateContainer = ({children}) => {

    const user = useSelector(getUser)

    return(
        user == null ? <Navigate to="/" /> : children
    )
}