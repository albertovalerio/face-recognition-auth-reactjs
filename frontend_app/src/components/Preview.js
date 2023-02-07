import { useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getScreenshot } from "../features/auth/authSlice"
import * as faceapi from 'face-api.js'
import { detectFaces, getStyles, setFacenetError, setStyles } from "../features/auth/facenetSlice"

export const Preview = (props) => {

    const { containerRef } = props
    const dispatch = useDispatch()
    const screenshot = useSelector(getScreenshot)
    const styles = useSelector(getStyles)

    const canvasRef = useRef()
    const previewRef = useRef()

    const getScreenshotDims = (blob) => {
        return new Promise ( (resolved, rejected) => {
            const i = new Image()
            i.onload = () => resolved({blobW: i.width, blobH: i.height})
            i.src = blob
        })
    }

    const cropImage = (imgW, imgH) => {
        const css = {}
        const contW = containerRef.current.clientWidth
        const contH = containerRef.current.clientHeight
        const scaledW = Math.round( (imgW * contH * 100) / imgH ) / 100
        const scaledH = Math.round( (imgH * contW * 100) / imgW ) / 100
        const left = Math.round( (contW - scaledW) * 50 ) / 100
        const top = Math.round( (contH - scaledH) * 50 ) / 100

        if (scaledW <= contW) {
            css['preview'] = {width: scaledW, height: contH, top: 0, left}
            css['canvas'] = {top: 0, left}
        } else {
            css['preview'] = {width: contW, height: scaledH, top, left: 0}
            css['canvas'] = {top, left: 0}
        }
        dispatch(setStyles(css))    
    }

    const handleScreenshot = async (blob) => {
        const { blobW, blobH } = await getScreenshotDims(blob)
        cropImage(blobW, blobH)
        dispatch(setFacenetError(null))
        dispatch(detectFaces({previewRef, canvasRef})).then(r => {
            const faces = r.payload
            //faceapi.draw.drawFaceLandmarks(canvasRef.current, faces)
            if (faces && faces.length > 0) {
                let options = {
                    lineWidth: 4,
                    boxColor: (faces.length === 1 && faces[0].detection.score > 0.75) ? '#00ff00' : '#f00000',
                    drawLabelOptions: {fontColor: '#1e40af'}
                }
                faces.map(face => {
                    const box = face.detection.box
                    options['label'] = 'Score: ' + (Math.round(face.detection.score * 100) / 100)
                    const drawBox = new faceapi.draw.DrawBox(box, options)
                    return drawBox.draw(canvasRef.current)
                })
            } 
        })
    }


    return (
        <>
        <div className="preview">
            {
                screenshot != null && <>
                    <canvas id="preview-canvas" ref={canvasRef} style={styles.canvas}>Your browser does not support the HTML canvas tag.</canvas>
                    <img ref={previewRef} src={screenshot} alt="preview" style={styles.preview} onLoad={() => handleScreenshot(screenshot)} />
                </>
            }
        </div>
        <div className={'camera-overlay ' + (screenshot != null ? 'hidden' : '')} />
        </>
    )
}