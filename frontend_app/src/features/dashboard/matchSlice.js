import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as faceapi from 'face-api.js'


const initialState = {
    photo_A: {
        status: null,
        src: null,
        faces: [],
        error: null
    },
    photo_B: {
        status: null,
        src: null,
        faces: [],
        error: null
    }
}

export const detectFacesForMatching = createAsyncThunk(
    'match/detectFacesForMatching',
    async (source) => {
        await faceapi.nets.ssdMobilenetv1.loadFromUri('facenet/models/ssd_mobilenetv1')
        await faceapi.nets.faceLandmark68Net.loadFromUri('facenet/models/face_landmark_68')
        await faceapi.nets.faceRecognitionNet.loadFromUri('facenet/models/face_recognition')
        const faces = await faceapi.detectAllFaces(source).withFaceLandmarks().withFaceDescriptors()
        return faces
    }
)

export const matchSlice = createSlice({
    name: 'match',
    initialState,
    reducers: {
        setMatchImage: (state, action) => {
            state[action.payload.source].src = action.payload.src
        },
        setMatchError: (state, action) => {
            state[action.payload.source].error = action.payload.error
        },
        resetMatchState: (state, action) => {
            const emptyObject = {status: null,src: null,faces: [],error: null}
            if (action.payload === 'photo_A') {
                state.photo_A = emptyObject
            } else if (action.payload === 'photo_B') {
                state.photo_B = emptyObject
            } else {
                state.photo_A = emptyObject
                state.photo_B = emptyObject
            }
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(detectFacesForMatching.pending, (state, action) => {
            state[action.meta.arg].status = 'pending'
        })
        .addCase(detectFacesForMatching.fulfilled, (state, action) => {
            state[action.meta.arg].status = 'fulfilled'
            let msg = null
            if (action.payload.length === 0) {
                msg = ['The face could not be identified. Insert an IMAGE where the face is clear.']
            } else if (action.payload.length > 1) {
                msg = ['More than one face has been detected. Insert an IMAGE where there is only you.']
            }
            state[action.meta.arg].error = msg
            state[action.meta.arg].faces = msg == null ? action.payload : []
        })
        .addCase(detectFacesForMatching.rejected, (state, action) => {
            state[action.meta.arg].status = 'rejected'
            state[action.meta.arg].error = ['A general error occurred with face detection. Please, try again.']
        })
    }
})

export const getPhotoA = state => state.match.photo_A
export const getPhotoB = state => state.match.photo_B

export const { setActiveInput, setMatchImage, setMatchError, resetMatchState } = matchSlice.actions
export default matchSlice.reducer