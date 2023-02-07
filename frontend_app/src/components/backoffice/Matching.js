import { useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getUser } from "../../features/auth/authSlice"
import { detectFacesForMatching, getPhotoA, getPhotoB, resetMatchState, setMatchError, setMatchImage } from "../../features/dashboard/matchSlice"
import { MatchingChart } from "./MatchingChart"
import * as faceapi from 'face-api.js'
import { LoaderSlim } from "../LoaderSlim"

export const Matching = () => {

    const dispatch = useDispatch()
    const photoAInputRef = useRef()
    const photoBInputRef = useRef()
    const user = useSelector(getUser)
    const photoA = useSelector(getPhotoA)
    const photoB = useSelector(getPhotoB)


    const handleClickUpload = (source) => {
        if (source === 'photo_A') {
            photoAInputRef.current.value = ''
            photoAInputRef.current.click()
        } else if (source === 'photo_B') {
            photoBInputRef.current.value = ''
            photoBInputRef.current.click()
        }
    }

    const handleUpload = (e) => {
        const source = e.target.id.replace('_input', '')
        const input = e.target
        if (input.files && input.files[0] && input.files[0].size < 1500000) {
            const reader = new FileReader()
            reader.onload = (r) => {
                dispatch(setMatchImage({source,src:r.target.result}))
                dispatch(setMatchError({source,error:null}))
            }
            reader.readAsDataURL(input.files[0])
        } else if (input.files && input.files[0] && input.files[0].size > 1500000) {
            dispatch(resetMatchState(source))
            dispatch(setMatchError({source,error:'The IMAGE file too large (max 1.5 MB).'}))
        } else {
            dispatch(resetMatchState(source))
            dispatch(setMatchError({source,error:'No IMAGE selected.'}))
        }
    }

    const handleFaceDetection = async (source) => {
        const el = document.getElementById(source + '_container')
        el.innerHTML = ''
        dispatch(detectFacesForMatching(source)).then(r => {
            if (r.meta.requestStatus === 'fulfilled' && r.payload.length === 1) {
                renderFaceDetected(source, r.payload.map(f => f.detection)).then(face => {
                    el.appendChild(face[0])
                })
            }
        })
    }

    const renderFaceDetected = async (source, detection) => {
        const input = document.getElementById(source)
        const canvases = await faceapi.extractFaces(input, detection)
        return canvases
    }

    const euclideanDistance = (featuresA, featuresB) => {
        return featuresA.map((x, i) => Math.abs( x - featuresB[i] ) ** 2).reduce((sum, now) => sum + now) ** (1/2)
    }

    const manhattanDistance = (featuresA, featuresB) => {
        return featuresA.map((x, i) => Math.abs( x - featuresB[i] )).reduce((sum, now) => sum + now)
    }

    return(
        <div className="col-12 my-box mb-4">
            <div className="heading">
                <h2>Face Matching | Testing Area</h2>
            </div>
            <div className="row info mb-4">
                <div className="col-sm-12">
                    <p>By loading two images containing one and only one face each, the table below shows the detail of the face as detected by the neural network and the Euclidean and Manhattan distances calculated starting from the vectorial representation of the two faces.</p>
                    <p>The greater the similarity, the smaller will be the distances between the two faces.</p>
                    <p>Subsequently, the numerical features of the detected faces are shown in the graph below. The greater the similarity, the more overlapping the two lines will be between the two faces.</p>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-6">
                    <input
                        id="photo_A_input"
                        type="file"
                        className="hidden"
                        ref={photoAInputRef}
                        accept="image/*"
                        onChange={(e) => handleUpload(e)}
                    />
                    <input
                        id="photo_B_input"
                        type="file"
                        className="hidden"
                        ref={photoBInputRef}
                        accept="image/*"
                        onChange={(e) => handleUpload(e)}
                    />
                    <div className="image-container">
                        <img id="photo_A" alt="profile picture" src={ photoA.src != null ? photoA.src : user.registerPic } onLoad={() => handleFaceDetection('photo_A')} />
                        <div className="my-icon zoom-in" onClick={(e) => handleClickUpload('photo_A')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
                        </div>
                    </div>
                </div>
                <div className="col-sm-6">
                    {
                        user.loginPic || photoB.src != null ? 
                        <div className="image-container">
                            <img id="photo_B" alt="profile picture" src={ photoB.src != null ? photoB.src : user.loginPic } onLoad={() => handleFaceDetection('photo_B')} />
                            <div className="my-icon zoom-in" onClick={(e) => handleClickUpload('photo_B')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
                            </div>
                        </div> : 
                        <div className="image-container">
                            <div className="upload" onClick={(e) => handleClickUpload('photo_B')}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M144 480C64.47 480 0 415.5 0 336C0 273.2 40.17 219.8 96.2 200.1C96.07 197.4 96 194.7 96 192C96 103.6 167.6 32 256 32C315.3 32 367 64.25 394.7 112.2C409.9 101.1 428.3 96 448 96C501 96 544 138.1 544 192C544 204.2 541.7 215.8 537.6 226.6C596 238.4 640 290.1 640 352C640 422.7 582.7 480 512 480H144zM223 263C213.7 272.4 213.7 287.6 223 296.1C232.4 306.3 247.6 306.3 256.1 296.1L296 257.9V392C296 405.3 306.7 416 320 416C333.3 416 344 405.3 344 392V257.9L383 296.1C392.4 306.3 407.6 306.3 416.1 296.1C426.3 287.6 426.3 272.4 416.1 263L336.1 183C327.6 173.7 312.4 173.7 303 183L223 263z"/></svg>
                                <p><span>Upload</span> image.</p>
                            </div>
                        </div>
                    }
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 mt-4">
                    <div className="overflow-x-auto text-center">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th className="whitespace-nowrap">Face #1</th>
                                    <th className="whitespace-nowrap">Face #2</th>
                                    <th className="whitespace-nowrap">Euclidean D.</th>
                                    <th className="whitespace-nowrap">Manhattan D.</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        {
                                            photoA.error ? 
                                            <div className="alert alert-danger">{photoA.error}</div> :
                                            <div id="photo_A_container" />
                                        }
                                        <LoaderSlim status={photoA.status} />
                                    </td>
                                    <td>
                                        {
                                            photoB.error ? 
                                            <div className="alert alert-danger">{photoB.error}</div> :
                                            <div id="photo_B_container" />
                                        }
                                        <LoaderSlim status={photoB.status} />
                                    </td>
                                    <td>
                                        {
                                            (photoA.status === 'pending' || photoB.status === 'pending') ? <LoaderSlim status={'pending'} /> : (photoA.faces.length === 1 && photoB.faces.length === 1) ?
                                            <div className={'distance-score alert ' + (((Math.round(euclideanDistance(photoA.faces[0].descriptor, photoB.faces[0].descriptor) * 10000) / 10000) > 0.5) ? 'alert-danger' : 'alert-success')}>{(Math.round(euclideanDistance(photoA.faces[0].descriptor, photoB.faces[0].descriptor) * 10000) / 10000)}</div> : "---"
                                        }
                                    </td>
                                    <td>
                                        {
                                            (photoA.status === 'pending' || photoB.status === 'pending') ? <LoaderSlim status={'pending'} /> : (photoA.faces.length === 1 && photoB.faces.length === 1) ?
                                            <div className={'distance-score alert ' + (((Math.round(manhattanDistance(photoA.faces[0].descriptor, photoB.faces[0].descriptor) * 10000) / 10000) > 4.5) ? 'alert-danger' : 'alert-success')}>{(Math.round(manhattanDistance(photoA.faces[0].descriptor, photoB.faces[0].descriptor) * 10000) / 10000)}</div> : "---"
                                        }
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 mt-5">
                    <MatchingChart photoA={photoA} photoB={photoB} />
                </div>
            </div>
        </div>
    )
}