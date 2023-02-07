import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getUser, logoutUser, resetAuthState, setAuthError, setUser } from "../../features/auth/authSlice"
import { resetMatchState } from "../../features/dashboard/matchSlice"
import { getPicture, getProfilePicture, getUserStatus, getUserStatusCode } from "../../features/dashboard/userSlice"

export const Menu = () => {

    const dispatch = useDispatch()
    const user = useSelector(getUser)
    const status = useSelector(getUserStatus)
    const code = useSelector(getUserStatusCode)
    const profilePicture = useSelector(getPicture)

    const logout = () => {
        dispatch(resetAuthState())
        dispatch(resetMatchState())
        dispatch(logoutUser({token:user.token}))
        setTimeout(() => {
            dispatch(resetAuthState())
        }, 5000)
    }

    const unauthorized = () => {
        dispatch(resetAuthState())
        dispatch(logoutUser({token:user.token}))
        dispatch(setAuthError({login:{serverErr:'Expired or invalid token. Please log in.'}}))
    }

    
    useEffect(() => {
        dispatch(getProfilePicture({email:user.email,token:user.token})).then(payload => {
            if (payload.meta.requestStatus === 'rejected') {
                dispatch(setUser(null))
                localStorage.removeItem('user')
                setTimeout(() => {
                    window.location.reload()
                }, 5000)
            }
        })
    },[dispatch, user.email, user.token])

    return(
        <div className="row">
            <div className="col-12">
                <div className="image-container">
                    {
                        (status === 'rejected' && (code === 401 || code === 403)) ?
                        unauthorized() : <img alt="profile picture" src={ profilePicture } />
                    }
                </div>
                <div className="user-container">
                    <h4>{user.name}</h4>
                    <p>{user.email}</p>
                </div>
                <button type="button" className="zoom-in">Dashboard</button>
                <button type="button" className="zoom-in" onClick={logout}>Log out</button>
            </div>
        </div>
    )
}