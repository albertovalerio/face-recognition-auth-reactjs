import '../css/Auth.css'
import { Camera } from './Camera'
import { FormTabs } from './FormTabs'

export const Auth = () => {

    return (
        <div className="container wrap-login100">
            <div className="row">
                <div className="col-lg-6 col-md-12 l-side">
                    <Camera />                        
                </div>
                <div className="col-lg-6 col-md-12 r-side">
                    <FormTabs />
                </div>
            </div>
        </div>
    )
}