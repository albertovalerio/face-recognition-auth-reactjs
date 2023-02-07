import { LoadIcon } from "./backoffice/LoadIcon"

export const LoaderSlim = (props) => {

    const { status } = props

    return(
        <div className="loader-slim mt-4 mb-4" style={ status === 'pending' ? {display: 'block'} : {display: 'none'}}>
            <LoadIcon />
            <p><small>Loading...</small></p>
        </div>
    )
}