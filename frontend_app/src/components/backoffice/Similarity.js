import { useDispatch, useSelector } from "react-redux"
import { getActiveDistance, getEuclideanSimilarity, getEuclideanValue, getManhattanSimilarity, getManhattanValue, setActiveDistance, setEuclideanValue, setManhattanValue } from "../../features/dashboard/similaritySlice"
import { Threshold } from "./Threshold"
import { SimilarityResult } from "./SimilarityResult"

export const Similarity = () => {

    const dispatch = useDispatch()
    const activeTab = useSelector(getActiveDistance)
    const euclideanSimilarity = useSelector(getEuclideanSimilarity)
    const manhattanSimilarity = useSelector(getManhattanSimilarity)
    const euclideanTollerance = useSelector(getEuclideanValue)
    const manhattanTollerance = useSelector(getManhattanValue)


    return (
        <div className="col-12 my-box mb-4 similarity-test">
            <div className="heading">
                <h2>Similarity Test | Find The Threshold</h2>
            </div>
            <div className="row info mb-3">
                <div className="col-sm-12">
                    <p>By selecting a threshold (tolerance) as input, the system carries out about 225,000 comparisons between faces belonging to the same person and to different people, calculates the distance and establishes which comparisons are considered valid, i.e. whose distance is less than the indicated threshold if the faces belong to the same person or higher for different people.</p>
                    <p>Among the failed comparisons, the number of false positives (faces belonging to different people that would be accepted) and false negatives (faces belonging to the same person that would be rejected) are shown.</p>
                    <p>Further details are available in the report attached to the project.</p>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    <ul className="nav nav-tabs">
                        <li className="nav-item">
                            <p
                                className={'nav-link ' + (activeTab === 'euclidean' ? 'active' : '')} 
                                onClick={() => dispatch(setActiveDistance('euclidean'))}
                            >Euclidean distance</p>
                        </li>
                        <li className="nav-item">
                            <p
                                className={'nav-link ' + (activeTab === 'manhattan' ? 'active' : '')}onClick={() => dispatch(setActiveDistance('manhattan'))}
                            >Manhattan distance</p>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="row tab-panel px-3">
                <div className={'col-sm-12 ' + (activeTab === 'euclidean' ? '' : 'hidden')}>
                    <Threshold
                        target='euclidean'
                        threshold={euclideanTollerance}
                        setThreshold={setEuclideanValue}
                    />
                    <SimilarityResult target='euclidean' similarity={euclideanSimilarity} />
                </div>
                <div className={'col-sm-12 ' + (activeTab === 'manhattan' ? '' : 'hidden')}>
                    <Threshold
                        target='manhattan'
                        threshold={manhattanTollerance}
                        setThreshold={setManhattanValue}
                    />
                    <SimilarityResult target='manhattan' similarity={manhattanSimilarity} />
                </div>
            </div>
        </div>
    )
}