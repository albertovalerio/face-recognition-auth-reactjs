import { useDispatch, useSelector } from "react-redux"
import { getActiveTab, getCameraStatus, getIsFlashing, setCameraStatus, setAuthError, setIsFlashing, setScreenshot } from "../features/auth/authSlice"
import Webcam from "react-webcam"
import '../css/Camera.css'
import { useEffect, useRef } from "react"
import { Preview } from "./Preview"
import * as faceapi from 'face-api.js'
import { getFacenetMessage, getOutline, setFacenetMessage, setOutline } from "../features/auth/facenetSlice"

export const Camera = () => {

    const dispatch = useDispatch()
    const isFlashing = useSelector(getIsFlashing)
    const cameraStatus = useSelector(getCameraStatus)
    const activeTab = useSelector(getActiveTab)
    const message = useSelector(getFacenetMessage)
    const outline = useSelector(getOutline)
    const webcamRef = useRef()
    const containerRef = useRef()
    const canvasRef = useRef()
    const detection = useRef()

    const takeScreenshot = () => {
        dispatch(setCameraStatus('closed'))
        dispatch(setScreenshot(webcamRef.current.getScreenshot()))
        dispatch(setIsFlashing(true))
    }

    const handleCameraError = () => {
        dispatch(setCameraStatus('closed'))
        const err = {}
        err[activeTab] = {serverErr: 'There was a problem accessing the WEBCAM. Grant permission and reload the page.'}
        dispatch(setAuthError(err))
    }


    const handleStreamVideo = async (e) => {
        const err = {}
        err[activeTab] = {serverErr: null}
        dispatch(setAuthError(err))

        await faceapi.nets.tinyFaceDetector.loadFromUri('facenet/models/tiny_face_detector')
        let counter = 0
        detection.current = setInterval( async () => {
            if (counter <= 40) {
                const faces = await faceapi.detectAllFaces(webcamRef.current.video, new faceapi.TinyFaceDetectorOptions())
                if (faces.length === 1 && faces[0].score > 0.5) {
                    counter++
                    dispatch(setOutline('#00ff00'))
                    dispatch(setFacenetMessage('Stand still for ' + Math.round(4 - (counter / 10)) + ' seconds.'))
                } else {
                    counter = 0
                    dispatch(setOutline('#f00000'))
                    dispatch(setFacenetMessage('Place the face in the oval.'))
                }
            } else {
                takeScreenshot()
            }
        }, 100)
    }

    useEffect(() => {
        return () => {
            clearInterval(detection.current)
        }
    },[cameraStatus])


    return(
        <div className="camera-container" style={{backgroundImage: 'url("/images/camera.jpg")'}} ref={containerRef}>
            {(cameraStatus === 'opened') &&
                <>
                <Webcam
                    className="camera-video"
                    id="webcam"
                    ref={webcamRef}
                    screenshotFormat='image/jpeg'
                    screenshotQuality= {1}
                    width={570}
                    height={700}
                    mirrored={true}
                    videoConstraints={{facingMode: 'user'}}
                    onUserMedia={(e) => handleStreamVideo(e)}
                    onUserMediaError={handleCameraError}
                />
                <canvas id="camera-canvas" ref={canvasRef}>Your browser does not support the HTML canvas tag.</canvas>
                <div className="camera-face-overlay" style={{borderColor: outline}}>
                    <div className="camera-face-message">{message}</div>
                </div>
                </>
            }
            <Preview containerRef={containerRef} />
            <div
                className="camera-flash"
                style = {{
                    animation: isFlashing && 'flashAnimation 750ms ease-out',
                }}
                onAnimationEnd={() => dispatch(setIsFlashing(false))}
            />
        </div>
    )
}