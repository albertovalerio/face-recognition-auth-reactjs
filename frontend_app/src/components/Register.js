import { PictureControls } from "./PictureControls"
import { useDispatch, useSelector } from "react-redux"
import { getActiveTab, getAuthError, getRequest, getScreenshot, registerUser, setAuthError, setRegisterEmail, setRegisterName, setRegisterPassword, setRegisterRepeatPassword } from "../features/auth/authSlice"
import { Navigate } from "react-router-dom";
import { getFaces } from "../features/auth/facenetSlice";

export const Register = ({enableInput}) => {

    const isFirefox = typeof InstallTrigger !== 'undefined';

    const activeTab = useSelector(getActiveTab)
    const dispatch = useDispatch()
    const request = useSelector(getRequest)
    const name = request.register.name
    const email = request.register.email
    const password = request.register.password
    const repeatPassword = request.register.repeatPassword
    const screenshot = useSelector(getScreenshot)
    const error = useSelector(getAuthError)
    const faces = useSelector(getFaces)

    const manageForm = (e) => {
        e.preventDefault()
        validateInputs()
        validatePassword()
        if(
            name != null &&
            error.register.email == null &&
            error.register.password == null &&
            screenshot != null &&
            repeatPassword === password &&
            faces.length !== 0
        ){
            const user = {name, email, password, screenshot, descriptor: Object.values(faces[0].descriptor)}
            dispatch(registerUser(user)).then(payload => {
                if (payload.meta.requestStatus === 'fulfilled') {
                    <Navigate to="/dashboard" />
                }
            })
        }
    }

    const validateInputs = () => {
        if(name == null){
            dispatch(setAuthError({register:{name: 'The NAME field is required.'}}))
        } else {
            dispatch(setAuthError({register:{name:null}}))
        }
        if(email == null){
            dispatch(setAuthError({register:{email: 'The EMAIL field is required.'}}))
        } else if (!email.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
            dispatch(setAuthError({register:{email: 'The EMAIL field is not in the standard form.'}}))
        } else {
            dispatch(setAuthError({register:{email:null}}))
        }
        if(screenshot == null){
            dispatch(setAuthError({register:{screenshot: 'A face IMAGE is required.'}}))
        } else {
            dispatch(setAuthError({register:{screenshot:null}}))
        }
        if(password !== repeatPassword){
            dispatch(setAuthError({register:{repeatPassword: 'The PASSWORD and REPEAT PASSWORD fields do not match.'}}))
        } else {
            dispatch(setAuthError({register:{repeatPassword:null}}))
        }
    }

    const validatePassword = () => {
        let warnings = []
        if(password == null){
            warnings.push('The PASSWORD field is required.')
        } else {
            if (password.length < 6){
                warnings.push('The PASSWORD field must exceed 6 characters.')
            }
            if (!password.match(/[A-Z]/g)){
                warnings.push('The PASSWORD field must contain at least one uppercase letter.')
            }
            if (!password.match(/[a-z]/g)){
                warnings.push('The PASSWORD field must contain at least one lowercase letter.')
            }
        }
        dispatch(setAuthError({register: {password: (warnings.length > 0 ? warnings : null)} }))
    }

    return(
        <form className={'login100-form ' + (activeTab === 'register' ? 'active' : '')}>
            
            <div className="my-wrap-input wrap-input50 wrap-input50-m" onClick={() => enableInput('name')}>
                <input
                    type="text"
                    name="name"
                    id="name"
                    className="my-input input50"
                    placeholder="Name"
                    disabled={isFirefox ? false : true}
                    value={name || ''}
                    onChange={(e) => dispatch(setRegisterName(e.target.value))}
                />
            </div>

            <div className="my-wrap-input wrap-input50" onClick={() => enableInput('register-email')}>
                <input
                    type="email"
                    name="register-email"
                    id="register-email"
                    className="my-input input50"
                    placeholder="Email"
                    disabled={isFirefox ? false : true}
                    value={email || ''}
                    onChange={(e) => dispatch(setRegisterEmail(e.target.value))}
                />
            </div>

            <div className="my-wrap-input wrap-input50 wrap-input50-m" onClick={() => enableInput('register-password')}>
                <input
                    type="password"
                    name="register-password"
                    id="register-password"
                    className="my-input input50"
                    placeholder="Password"
                    disabled={isFirefox ? false : true}
                    value={password || ''}
                    onKeyUp={validatePassword}
                    onChange={(e) => dispatch(setRegisterPassword(e.target.value))}
                />
            </div>

            <div className="my-wrap-input wrap-input50" onClick={() => enableInput('repeat-password')}>
                <input
                    type="password"
                    name="repeat-password"
                    id="repeat-password"
                    className="my-input input50"
                    placeholder="Repeat Password"
                    disabled={isFirefox ? false : true}
                    value={repeatPassword || ''}
                    onChange={(e) => dispatch(setRegisterRepeatPassword(e.target.value))}
                />
            </div>

            <PictureControls />

            <div className="container-login100-form-btn">
                <button
                    type="button"
                    className="my-submit-btn zoom-in"
                    onClick={(e) => manageForm(e)}
                >Register</button>
            </div>

        </form>
    )
}