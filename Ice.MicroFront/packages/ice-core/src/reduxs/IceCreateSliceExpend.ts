import { iceCreateSlick } from 'ice-common';
import type { BaseApi, IceSlickOptionType, IceSliceState, IceSlice } from 'ice-common';
import { createAsyncThunk, AsyncThunk } from '@reduxjs/toolkit';
import type { Reducer, PayloadAction, ActionCreatorWithPayload } from '@reduxjs/toolkit';
import consts from '../consts/consts';

const expand = (option: IceSlickOptionType, fetchDatas: () => Promise<Array<any>>, ) => {
    option.reducers['clearAllDatas'] = (state, action) => {
        state.allDatas = null;
    }

    // First, create the thunk
    const fetchAllDatas = createAsyncThunk(
        `${option.name}/fetchAllDatas`,
        async (params: {
            enforce?: boolean,
        }, thunkAPI) => {
            const allDatas: Array<any> = (thunkAPI.getState() as any)[option.name].allDatas;
            // 如果数据存在则不进行请求
            if (allDatas && params.enforce != true) {
                return {
                    allDatas: allDatas
                };
            }

            let list = await fetchDatas();
            return {
                allDatas: list
            };
        }
    );

    const extraReducers = option.extraReducers as any;
    option.extraReducers = (builder) => {
        builder.addCase(fetchAllDatas.fulfilled, (state, action) => {
            state.allDatas = action.payload.allDatas;
        });

        if (extraReducers) {
            extraReducers(builder);
        }
    }

    option.asyncActions['fetchAllDatas'] = fetchAllDatas;

    return option;
}

export default (
    name: string, 
    api: BaseApi<any>,
    fetchDatas: () => Promise<Array<any>>, 
    cexpand?: (option: IceSlickOptionType) => IceSlickOptionType) => {
    return iceCreateSlick(name, api, (option) => {
        let optionex = expand(option, fetchDatas);
        if (cexpand) {
            optionex = cexpand(optionex);
        }
        return optionex;
    }) as IceSlice & {
        actions: IceSlice['actions'] & {
            clearAllDatas: ActionCreatorWithPayload<{}>
        },
        reducer: Reducer<IceSliceState & {
            allDatas?: Array<any>
        }>,
        asyncActions: {
            fetchPageDatas: IceSlice['asyncActions']['fetchPageDatas'],
            refreshPageDatas: IceSlice['asyncActions']['refreshPageDatas'],
            fetchAllDatas: AsyncThunk<any, {
                enforce?: boolean,
            }, any>,
            [k: string]: AsyncThunk<any, any, any>
        }
    };
}