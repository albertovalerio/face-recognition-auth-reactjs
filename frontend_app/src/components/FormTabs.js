import { Login } from "./Login"
import { Register } from './Register'
import { useDispatch, useSelector } from "react-redux"
import { getActiveTab, setActiveTab } from "../features/auth/authSlice"
import { Alert } from "./Alert"

export const FormTabs = () => {

    const dispatch = useDispatch()
    const activeTab = useSelector(getActiveTab)

    const enableInput = (elementId) => {
        const el = document.getElementById(elementId)
        el.disabled = false
        el.focus()
    } 

    return(
        <>
        <ul className="nav nav-tabs">
            <li
                className={'nav-item '+ (activeTab === 'login' ? 'active' : '')}
                onClick={() => dispatch(setActiveTab('login'))}
            >Login</li>
            <li
                className={'nav-item '+ (activeTab === 'register' ? 'active' : '')}
                onClick={() => dispatch(setActiveTab('register'))}
            >Register</li>
        </ul>
        <div className='form-container'>
            <Alert />
            <Login enableInput={enableInput} />
            <Register enableInput={enableInput} />
        </div>
        </>
    )
}