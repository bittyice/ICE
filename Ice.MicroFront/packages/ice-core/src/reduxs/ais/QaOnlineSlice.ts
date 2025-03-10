import { createSlice, createAsyncThunk, Reducer, PayloadAction } from '@reduxjs/toolkit';
import { MessageItemType, MessageRoleType } from '../../apis/Types';

type MessageInfoType = {
    connectionId: string,
    hasNew: boolean,
    messages: Array<MessageItemType>
}

export const slice = createSlice({
    name: 'qaOnline',
    initialState: {
        messageGroup: [] as Array<MessageInfoType>
    },
    reducers: {
        addMessage: (state, action: PayloadAction<{ 
            connectionId: string, 
            setNewSign: boolean } & MessageItemType>) => {
            let messageItem: MessageItemType = {
                role: action.payload.role,
                content: action.payload.content,
                original: action.payload.original,
                href: action.payload.href,
                time: action.payload.time
            };
            // 在组中查找对于的消息
            let newMessageGroup = [...state.messageGroup];
            let messagesInfoIndex = newMessageGroup.findIndex(e => e.connectionId == action.payload.connectionId);
            let messagesInfo: MessageInfoType;
            if (messagesInfoIndex < 0) {
                messagesInfo = {
                    connectionId: action.payload.connectionId,
                    hasNew: false,
                    messages: []
                };
                newMessageGroup.unshift(messagesInfo);
            }
            else {
                messagesInfo = newMessageGroup[messagesInfoIndex];
                newMessageGroup.splice(messagesInfoIndex, 1);
                newMessageGroup.unshift(messagesInfo);
            }
            messagesInfo.hasNew = action.payload.setNewSign;
            messagesInfo.messages.push(messageItem);
            state.messageGroup = newMessageGroup;
        },
        clear: (state, action: PayloadAction<{ connectionId: string }>) => {
            let newMessageGroup = [...state.messageGroup];
            let messageInfo = newMessageGroup.find(e => e.connectionId == action.payload.connectionId);
            if (!messageInfo) {
                console.error('未找到 messageInfo');
                return state;
            }
            messageInfo.messages = [];
            state.messageGroup = newMessageGroup;
            return state;
        },
        remove: (state, action: PayloadAction<{ connectionId: string }>) => {
            let newMessageGroup = state.messageGroup.filter(e => e.connectionId != action.payload.connectionId);
            state.messageGroup = newMessageGroup;
            return state;
        },
        cancelNew: (state, action: PayloadAction<{ connectionId: string }>) => {
            let newMessageGroup = [...state.messageGroup];
            let messageInfo = newMessageGroup.find(e => e.connectionId == action.payload.connectionId);
            if (!messageInfo) {
                console.error('未找到 messageInfo');
                return state;
            }
            messageInfo.hasNew = false;
            state.messageGroup = newMessageGroup;
            return state;
        }
    }
});

export const actions = slice.actions;
export const reducer = slice.reducer;