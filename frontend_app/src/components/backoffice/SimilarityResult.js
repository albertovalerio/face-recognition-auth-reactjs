import { LoadIcon } from "./LoadIcon"

export const SimilarityResult = (props) => {

    const { target, similarity } = props

    return (
        <>
        <div className="row mt-4">
            <div className="col-sm-12">
                <div className="overflow-x-auto">
                    <table className="table table-bordered">
                        <tbody>
                            <tr>
                                <td>Total comparisons:</td>
                                <td className="text-right" colSpan={2}>{similarity.status === 'pending' ? <LoadIcon /> : (similarity.total ? similarity.total + ' (100.00 %)' : '0')}</td>
                            </tr>
                            <tr>
                                <td className="font-weight-bold">Passed (accuracy):</td>
                                <td className="text-right font-weight-bold" colSpan={2}>{similarity.status === 'pending' ? <LoadIcon /> : (similarity.pass ? similarity.pass + ' (' + (Math.round(similarity.pass * 100 / similarity.total * 100) / 100) + ' %)' : '0')}</td>
                            </tr>
                            <tr>
                                <td rowSpan={3} style={{verticalAlign:'top'}}>Failed:</td>
                                <td className="text-right" colSpan={2}>{similarity.status === 'pending' ? <LoadIcon /> : (similarity.fail ? similarity.fail + ' (' + (Math.round(similarity.fail * 100 / similarity.total * 100) / 100) + ' %)' : '0')}</td>
                            </tr>
                            <tr>
                                <td><small>of which false positives:</small></td>
                                <td className="text-right"><small>{similarity.status === 'pending' ? <LoadIcon /> : similarity.falsePositive.length}</small></td>
                            </tr>
                            <tr>
                                <td><small>and false negative:</small></td>
                                <td className="text-right"><small>{similarity.status === 'pending' ? <LoadIcon /> : similarity.falseNegative.length}</small></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div className="row mt-4">
            <div className="col-sm-12">
                <div className="overflow-x-auto text-center">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th className="whitespace-nowrap">Top 10 False Positive</th>
                                <th className="whitespace-nowrap">Top 10 False Negative</th>
                            </tr>
                        </thead>
                        <tbody>
                            { 
                            similarity.status === 'pending' ? <tr><td><LoadIcon /></td><td><LoadIcon /></td></tr> : (similarity.falsePositive.length === 0 && similarity.falseNegative.length === 0 ? <tr className="bg-light"><td>No data.</td><td>No data.</td></tr> :
                                [...Array(10).keys()].map(i => {
                                    return (<tr key={i}>
                                        <td>
                                            {
                                                similarity.falsePositive[i] ? 
                                                <div className="row mismatch text-center">
                                                    <div className="col-6">
                                                        <img src={similarity.falsePositive[i].faceA} alt="face a" />
                                                        <span>{similarity.falsePositive[i].personA}</span>
                                                    </div>
                                                    <div className="col-6">
                                                        <img src={similarity.falsePositive[i].faceB} alt="face b" />
                                                        <span>{similarity.falsePositive[i].personB}</span>
                                                    </div>
                                                </div> : 'No data.'
                                            }
                                        </td>
                                        <td>
                                            {
                                                similarity.falseNegative[i] ? 
                                                <div className="row mismatch text-center">
                                                    <div className="col-6">
                                                        <img src={similarity.falseNegative[i].faceA} alt="face a" />
                                                        <span>{similarity.falseNegative[i].personA}</span>
                                                    </div>
                                                    <div className="col-6">
                                                        <img src={similarity.falseNegative[i].faceB} alt="face b" />
                                                        <span>{similarity.falseNegative[i].personB}</span>
                                                    </div>
                                                </div> : 'No data.'
                                            }
                                        </td>
                                    </tr>)
                                }))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        </>
    )
}