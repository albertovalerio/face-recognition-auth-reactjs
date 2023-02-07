import { useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { detectFacesByNet, getDetectImage, getDetectImageError, getDetections, resetDetections, setDetectImage, setDetectImageError, setDetectTime } from "../../features/dashboard/detectSlice"
import { LoaderSlim } from "../LoaderSlim"
import * as faceapi from 'face-api.js'
import { ExecTime } from "./ExecTime"

export const Detection = () => {

    const dispatch = useDispatch()
    const nets = ['ssd_mobilenetv1', 'tiny_face_detector', 'mtcnn', 'tiny_yolov2']
    const netsTitles = ['SSD MobileNet v1', 'Tiny Face Detector', 'Multi-task Cascaded Convolutional Neural Networks', 'Tiny YOLO v2']
    const imageToDetect = useSelector(getDetectImage)
    const imageInputRef = useRef()
    const imageRef = useRef()
    const detections = useSelector(getDetections)
    const imageError = useSelector(getDetectImageError)

    const handleClickUpload = () => {
        imageInputRef.current.value = ''
        imageInputRef.current.click()
    }

    const handleUpload = () => {
        const input = imageInputRef.current
        if (input.files && input.files[0] && input.files[0].size < 1500000) {
            const reader = new FileReader()
            reader.onload = (r) => {
                dispatch(setDetectImage(r.target.result))
                dispatch(setDetectImageError(null))
            }
            reader.readAsDataURL(input.files[0])
        } else if (input.files && input.files[0] && input.files[0].size > 1500000) {
            dispatch(setDetectImageError('The IMAGE file too large (max 1.5 MB).'))
        } else {
            dispatch(setDetectImageError('No IMAGE selected.'))
        }
    }

    const handleFaceDetection = () => {
        dispatch(resetDetections())
        
        nets.forEach(n => {
            const elContainer = document.getElementById(n + '_container')
            elContainer.innerHTML = ''
        })
        const t0_init = performance.now()
        dispatch(detectFacesByNet(nets[0])).then(r0 => {
            if (r0.meta.requestStatus === 'fulfilled' && r0.payload.length) {
                renderFaceDetected(document.getElementById(nets[0] + '_container'), r0.payload)
                const t0_fin = performance.now()
                dispatch(setDetectTime({net:nets[0],time: Math.round((t0_fin - t0_init) / 1000 * 10000) / 10000}))
            }
            const t1_init = performance.now()
            dispatch(detectFacesByNet(nets[1])).then(r1 => {
                if (r1.meta.requestStatus === 'fulfilled' && r1.payload.length) {
                    renderFaceDetected(document.getElementById(nets[1] + '_container'), r1.payload)
                    const t1_fin = performance.now()
                    dispatch(setDetectTime({net:nets[1],time: Math.round((t1_fin - t1_init) / 1000 * 10000) / 10000}))
                }
                const t2_init = performance.now()
                dispatch(detectFacesByNet(nets[2])).then(r2 => {
                    if (r2.meta.requestStatus === 'fulfilled' && r2.payload.length) {
                        renderFaceDetected(document.getElementById(nets[2] + '_container'), r2.payload)
                        const t2_fin = performance.now()
                        dispatch(setDetectTime({net:nets[2],time: Math.round((t2_fin - t2_init) / 1000 * 10000) / 10000}))
                    }
                    const t3_init = performance.now()
                    dispatch(detectFacesByNet(nets[3])).then(r3 => {
                        if (r3.meta.requestStatus === 'fulfilled' && r3.payload.length) {
                            renderFaceDetected(document.getElementById(nets[3] + '_container'), r3.payload)
                            const t3_fin = performance.now()
                            dispatch(setDetectTime({net:nets[3],time: Math.round((t3_fin - t3_init) / 1000 * 10000) / 10000}))
                        }
                    })
                })
            })
        })
    }

    const renderFaceDetected = async (container, faces) => {
        container.innerHTML = ''
        const canvases = await faceapi.extractFaces(imageRef.current, faces)
        canvases.forEach((face, i) => {
            const elCanvasContainer = document.createElement('div')
            elCanvasContainer.classList = 'canvas-container'
            const score = Math.round(faces[i].score * 1000) / 1000
            const elScore = document.createElement('p')
            elScore.classList = 'badge ' + (score >= 0.75 ? 'badge-success' : (score <= 0.5 ? 'badge-danger' : 'badge-warning'))
            elScore.innerText = 'Score: ' + score
            elCanvasContainer.appendChild(face)
            elCanvasContainer.appendChild(elScore)
            container.appendChild(elCanvasContainer)
        })
    }

    return(
        <div className="col-12 my-box mb-4">
            <div className="heading">
                <h2>Face Detection | Comparing algorithms</h2>
            </div>
            <div className="row info">
                <div className="col-lg-4">
                    <input
                        type="file"
                        className="hidden"
                        ref={imageInputRef}
                        accept="image/*"
                        onChange={() => handleUpload()}
                    />
                    {
                        imageToDetect ? 
                        <div className="image-container">
                            <img
                                id="image_to_detect"
                                alt="profile picture"
                                src={ imageToDetect }
                                ref={ imageRef }
                                onLoad={() => handleFaceDetection()}
                            />
                            <div className="my-icon zoom-in" onClick={() => handleClickUpload()}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
                            </div>
                            {
                                imageError && <div className="table mt-3 text-center"><div className="alert alert-danger">{imageError}</div></div>
                            }
                        </div> : 
                        <div className="image-container">
                            <div className="upload" onClick={() => handleClickUpload()}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M144 480C64.47 480 0 415.5 0 336C0 273.2 40.17 219.8 96.2 200.1C96.07 197.4 96 194.7 96 192C96 103.6 167.6 32 256 32C315.3 32 367 64.25 394.7 112.2C409.9 101.1 428.3 96 448 96C501 96 544 138.1 544 192C544 204.2 541.7 215.8 537.6 226.6C596 238.4 640 290.1 640 352C640 422.7 582.7 480 512 480H144zM223 263C213.7 272.4 213.7 287.6 223 296.1C232.4 306.3 247.6 306.3 256.1 296.1L296 257.9V392C296 405.3 306.7 416 320 416C333.3 416 344 405.3 344 392V257.9L383 296.1C392.4 306.3 407.6 306.3 416.1 296.1C426.3 287.6 426.3 272.4 416.1 263L336.1 183C327.6 173.7 312.4 173.7 303 183L223 263z"/></svg>
                                <p><span>Carica</span> immagine.</p>
                            </div>
                        </div>
                    }
                </div>
                <div className="col-lg-8 pl-4">
                    <p>The table below shows how different pre-trained neural networks operate on a given image, listing the face detections (if any) and the related score (=percentage by which the detection is actually considered a face).</p>
                    <p>The table also compares the execution times of each single algorithm, expressed in seconds.</p>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12 mt-4">
                    <div className="overflow-x-auto text-center">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th className="whitespace-nowrap">Neural Network</th>
                                    <th className="whitespace-nowrap">Detection</th>
                                    <th className="whitespace-nowrap">Exec. Time</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                Object.values(detections).map((d,i) => {
                                    return (
                                        <tr key={i}>
                                            <td>{netsTitles[i]}</td>
                                            <td>
                                                <div id={nets[i] + '_container'} className={'net-container ' + (d.error ? 'alert alert-danger' : '')}>{d.error ? d.error : '--'}</div>
                                                <LoaderSlim status={d.status} />
                                            </td>
                                            <td><ExecTime net={nets[i]} detections={detections} /></td>
                                        </tr>
                                    )
                                })
                            }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}