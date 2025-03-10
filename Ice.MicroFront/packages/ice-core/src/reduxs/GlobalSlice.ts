import { createSlice, createAsyncThunk, Reducer, PayloadAction } from '@reduxjs/toolkit';
import { GptEntity, TenantEntity, UserEntity, WarehouseEntity } from '../apis/Types';
import { iceFetch } from 'ice-common';
import TenantApi from '../apis/auths/TenantApi';
import GptApi from '../apis/ais/GptApi';

const fetchTenant = createAsyncThunk(
    `global/fetchTenant`,
    async (params: {
    }, thunkAPI) => {
        let tenant = await TenantApi.getCurrent();
        return {
            tenant: tenant || ({} as any)
        };
    }
)

const fetchUser = createAsyncThunk(
    `global/fetchUser`,
    async (params: {
    }, thunkAPI) => {
        let user = await iceFetch<UserEntity>('/api/auth/account/current-user');
        return {
            user: user || ({} as any)
        };
    }
)

const fetchGpt = createAsyncThunk(
    `global/fetchGpt`,
    async (params: {
    }, thunkAPI) => {
        let gpt = await GptApi.get();
        return {
            gpt: gpt
        };
    }
)

var _slice = createSlice({
    name: 'global',
    initialState: {
        tenant: {} as TenantEntity,
        gpt: {} as GptEntity,
        user: {} as UserEntity,
        layoutKey: 0,
        warehouse: {} as WarehouseEntity,
        warehouseId: null as (string | null),
    },
    reducers: {
        refreshLayout: (state) => {
            state.layoutKey = state.layoutKey + 1;
            return state;
        },
        setWarehouse: (state, action: PayloadAction<{ warehouse: WarehouseEntity }>) => {
            state.warehouse = action.payload.warehouse;
            state.warehouseId = action.payload.warehouse.id || null;
            return state;
        }
    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(fetchTenant.fulfilled, (state, action) => {
            state.tenant = action.payload.tenant;
        });

        builder.addCase(fetchGpt.fulfilled, (state, action) => {
            state.gpt = action.payload.gpt;
        });

        builder.addCase(fetchUser.fulfilled, (state, action) => {
            state.user = action.payload.user;
        });
    },
});

export const asyncActions = {
    fetchTenant: fetchTenant,
    fetchUser: fetchUser,
    fetchGpt: fetchGpt
}

export const slice = {
    ..._slice,
    asyncActions: asyncActions
}

export const actions = slice.actions;

export const reducer = slice.reducer;