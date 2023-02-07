import { useSelector } from 'react-redux'
import '../css/Loader.css'
import { getFacenetStatus } from '../features/auth/facenetSlice'

export const Loader = () => {

    const status = useSelector(getFacenetStatus)

    return(
        <div className="loader" style={ status === 'pending' ? {visibility: 'visible', opacity: 1} : {visibility: 'hidden', opacity: 0}}>
            <div className="loader-dialog" style={ status === 'pending' ? {marginTop: '5rem'} : {marginTop: '-14rem'}}>
                <div className="loader-content">
                    <div className="loader-body">
                        <img alt='face scanning animation' src='/images/face_id.gif' />
                        <p>Scanning</p>
                    </div>
                </div>
            </div>
        </div>
    )
}