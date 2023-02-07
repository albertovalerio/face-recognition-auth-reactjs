import { useDispatch } from "react-redux"
import { getSimilarity } from "../../features/dashboard/similaritySlice"

export const Threshold = (props) => {

    const { target, threshold, setThreshold } = props
    const dispatch = useDispatch()

    return (
        <div className="row">
            <div className="col-md-6">
                <div className="input-group">
                    <button
                        type="button"
                        className="btn btn-default spinner-down"
                        onClick={() => dispatch(setThreshold('minus'))}
                    >-</button>
                    <input
                        type="text"
                        className="form-control"
                        value={Math.round(threshold * 100) / 100}
                        readOnly
                    />
                    <button
                        type="button"
                        className="btn btn-default spinner-up"
                        onClick={() => dispatch(setThreshold('plus'))}
                    >+</button>
                </div>
            </div>
            <div className="col-md-6">
                <button
                    type="button"
                    className="my-submit-btn zoom-out"
                    onClick={() => dispatch(getSimilarity({target,threshold}))}
                >Start testing</button>
            </div>
        </div>
    )
}