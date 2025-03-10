import { createSlice, createAsyncThunk, Reducer, PayloadAction } from '@reduxjs/toolkit';
import { MessageItemType, MessageRoleType } from '../../apis/Types';

export const slice = createSlice({
    name: 'qa',
    initialState: {
        messages: [] as Array<MessageItemType>
    },
    reducers: {
        addMessage: (state, action: PayloadAction<{messageItem: MessageItemType}>) => {
            let newMessages = [...state.messages];
            newMessages.push(action.payload.messageItem);
            state.messages = newMessages;
            return state;
        },
        clear: (state, action) => {
            return {
                messages: []
            }
        }
    }
});

export const actions = slice.actions;
export const reducer = slice.reducer;