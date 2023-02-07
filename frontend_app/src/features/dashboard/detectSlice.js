import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as faceapi from 'face-api.js'


const initialState = {
    image: '',
    imageError: null,
    detections: {
        ssd_mobilenetv1:{
            status: null,
            faces: [],
            time: 0,
            error: null
        },
        tiny_face_detector:{
            status: null,
            faces: [],
            time: 0,
            error: null
        },
        mtcnn:{
            status: null,
            faces: [],
            time: 0,
            error: null
        },
        tiny_yolov2:{
            status: null,
            faces: [],
            time: 0,
            error: null
        },
    }
}

export const detectFacesByNet = createAsyncThunk(
    'detect/detectFacesByNet',
    async (net) => {
        let faces = []
        const el = 'image_to_detect'
        switch (net) {
            case 'tiny_face_detector':
                await faceapi.nets.tinyFaceDetector.loadFromUri('facenet/models/tiny_face_detector')
                faces = await faceapi.detectAllFaces(el, new faceapi.TinyFaceDetectorOptions())
            break;
            case 'mtcnn':
                await faceapi.nets.mtcnn.loadFromUri('facenet/models/mtcnn')
                faces = await faceapi.detectAllFaces(el, new faceapi.MtcnnOptions())
            break;
            case 'tiny_yolov2':
                await faceapi.nets.tinyYolov2.loadFromUri('facenet/models/tiny_yolov2_separable_conv')
                faces = await faceapi.detectAllFaces(el, new faceapi.TinyYolov2Options())
            break;                    
            default:
                await faceapi.nets.ssdMobilenetv1.loadFromUri('facenet/models/ssd_mobilenetv1')
                faces = await faceapi.detectAllFaces(el, new faceapi.SsdMobilenetv1Options())
            break;
        }
        return faces
    }
)

export const detectSlice = createSlice({
    name: 'detect',
    initialState,
    reducers: {
        setDetectImage: (state, action) => {
            state.image = action.payload
        },
        setDetectImageError: (state, action) => {
            state.imageError = action.payload
        },
        resetDetections: (state) => {
            const emptyObject = {status: null,faces: [],time: 0,error: null}
            state.detections = {
                ssd_mobilenetv1: emptyObject,
                tiny_face_detector: emptyObject,
                mtcnn: emptyObject,
                tiny_yolov2: emptyObject,
            }
        },
        setDetectTime: (state, action) => {
            state.detections[action.payload.net].time = action.payload.time
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(detectFacesByNet.pending, (state, action) => {
            state.detections[action.meta.arg].status = 'pending'
        })
        .addCase(detectFacesByNet.fulfilled, (state, action) => {
            state.detections[action.meta.arg].status = 'fulfilled'
            if (action.payload.length === 0) {
                state.detections[action.meta.arg].error = 'A face could not be detected.'
            }
            state.detections[action.meta.arg].faces = action.payload
        })
        .addCase(detectFacesByNet.rejected, (state, action) => {
            state.detections[action.meta.arg].status = 'rejected'
            state.detections[action.meta.arg].error = 'A general error occurred with face detection. Please, try again.'
        })
    }
})

export const getDetectImage = state => state.detect.image
export const getDetectImageError = state => state.detect.imageError
export const getDetections = state => state.detect.detections

export const { setDetectImage, setDetectImageError, resetDetections, setDetectTime } = detectSlice.actions
export default detectSlice.reducer