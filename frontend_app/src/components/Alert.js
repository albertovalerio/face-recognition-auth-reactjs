import { useSelector } from "react-redux"
import { getActiveTab, getAuthError, getRequest } from "../features/auth/authSlice"
import { getFacenetError } from "../features/auth/facenetSlice"

export const Alert = () => {

    const errorAuth = useSelector(getAuthError)
    const errorFacenet = useSelector(getFacenetError)
    const activeTab = useSelector(getActiveTab)
    const request = useSelector(getRequest)

    const getAuthErrorList = (tab) => Object.values(errorAuth[tab]).filter(e => e != null)
    const getErrorList = errorFacenet == null ? getAuthErrorList(activeTab) : getAuthErrorList(activeTab).concat(errorFacenet)

    return(
        <>
        <div className={'alert alert-success ' + (request.code === 200 && getErrorList.length === 0 ? '' : 'hidden')} role="alert">
            <ul>
                <li>{request.msg}</li>
            </ul>
        </div>
        <div className={'alert alert-danger ' + (getErrorList.length === 0 ? 'hidden' : '')} role="alert">
            <ul>
                {getErrorList.map((e,i) => {
                    if(Array.isArray(e)){
                        return e.map((j,y) => <li key={y}>{j}</li>)
                    } else {
                        return <li key={i}>{e}</li>
                    }
                })}
            </ul>
        </div>
        </>
    )
}