import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { GET_PROFILE_PIC } from '../../config/api'

const initialState = {
    status: null,
    statusCode: 0,
    picture: null
}

axios.defaults.headers['Accept'] = 'application/json'

export const getProfilePicture = createAsyncThunk(
    'auth/getProfilePicture',
    async (credentials,{rejectWithValue}) => {
        let response = {}
        await axios.post(GET_PROFILE_PIC,
                {...credentials}
            ).then(r => {
                response = {status: r.status, data: r.data}
            }).catch(e => {
                response = rejectWithValue(e)
            })
        return response
    }
)

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(getProfilePicture.pending, (state) => {
            state.status = 'pending'
        })
        .addCase(getProfilePicture.fulfilled, (state, action) => {
            state.status = 'fulfilled'
            state.statusCode = action.payload.status
            state.picture = action.payload.data.blob
        })
        .addCase(getProfilePicture.rejected, (state, action) => {
            state.status = 'rejected'
            state.statusCode = action.payload.response ? action.payload.response.status : 500
        })
    }
})

export const getUserStatus = state => state.user.status
export const getUserStatusCode = state => state.user.statusCode
export const getPicture = state => state.user.picture

export const {  } = userSlice.actions
export default userSlice.reducer
