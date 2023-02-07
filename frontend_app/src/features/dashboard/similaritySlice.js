import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { GET_SIMILARITY_URL } from '../../config/api'

const initialState = {
    activeDistance: 'euclidean',
    euclideanValue: 0.5,
    manhattanValue: 4.5,
    test: {
        euclidean: {
            status: null,
            statusCode: 0,
            total: 0,
            fail: 0,
            pass: 0,
            falsePositive: [],
            falseNegative: []    
        },
        manhattan: {
            status: null,
            statusCode: 0,
            total: 0,
            fail: 0,
            pass: 0,
            falsePositive: [],
            falseNegative: []    
        }
    }
}

axios.defaults.headers['Accept'] = 'application/json'

export const getSimilarity = createAsyncThunk(
    'similarity/getSimilarity',
    async (credentials,{rejectWithValue}) => {
        let response = {}
        await axios.post(GET_SIMILARITY_URL,
                {...credentials}
            ).then(r => {
                response = {status: r.status, data: r.data}
            }).catch(e => {
                response = rejectWithValue(e)
            })
        return response
    }
)

export const similaritySlice = createSlice({
    name: 'similarity',
    initialState,
    reducers: {
        setActiveDistance: (state, action) => {
            state.activeDistance = action.payload
        },
        setEuclideanValue: (state, action) => {
            state.euclideanValue = (Math.round(state.euclideanValue * 100) / 100 === 0.1 && action.payload === 'minus') ? 0.1 : (action.payload === 'plus' ? state.euclideanValue + 0.1 : state.euclideanValue - 0.1)
        },
        setManhattanValue: (state, action) => {
            state.manhattanValue = (Math.round(state.manhattanValue * 100) / 100 === 0.1 && action.payload === 'minus') ? 0.1 : (action.payload === 'plus' ? state.manhattanValue + 0.1 : state.manhattanValue - 0.1)
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(getSimilarity.pending, (state, action) => {
            state.test[action.meta.arg.target].status = 'pending'
        })
        .addCase(getSimilarity.fulfilled, (state, action) => {
            state.test[action.payload.data.target].status = 'fulfilled'
            state.test[action.payload.data.target].statusCode = action.payload.status
            state.test[action.payload.data.target].total = action.payload.data.total
            state.test[action.payload.data.target].fail = action.payload.data.fail
            state.test[action.payload.data.target].pass = action.payload.data.pass
            state.test[action.payload.data.target].falsePositive = action.payload.data.falsePositive
            state.test[action.payload.data.target].falseNegative = action.payload.data.falseNegative
        })
        .addCase(getSimilarity.rejected, (state, action) => {
            state.test[action.meta.arg.target].status = 'rejected'
            state.test[action.meta.arg.target].statusCode = action.payload.response ? action.payload.response.status : 500
        })
    }
})

export const getEuclideanSimilarity = state => state.similarity.test.euclidean
export const getManhattanSimilarity = state => state.similarity.test.manhattan
export const getActiveDistance = state => state.similarity.activeDistance
export const getEuclideanValue = state => state.similarity.euclideanValue
export const getManhattanValue = state => state.similarity.manhattanValue

export const { setActiveDistance, setEuclideanValue, setManhattanValue } = similaritySlice.actions
export default similaritySlice.reducer
