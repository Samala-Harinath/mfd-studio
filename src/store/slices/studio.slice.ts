import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Tenant } from "@/lib/sample-data";
import type { SessionUser, StudioStatus, SyncState } from "@/features/studio/types";

export type StudioState = {
  status: StudioStatus;
  user: SessionUser | null;
  tenant: Tenant | null;
  sync: SyncState;
  syncError: string;
};

const initialState: StudioState = {
  status: "loading",
  user: null,
  tenant: null,
  sync: "idle",
  syncError: "",
};

const studioSlice = createSlice({
  name: "studio",
  initialState,
  reducers: {
    hydrateSession(state, action: PayloadAction<{ user: SessionUser | null; tenant: Tenant | null }>) {
      state.status = "ready";
      state.user = action.payload.user;
      state.tenant = action.payload.tenant;
    },
    clearSession(state) {
      state.status = "ready";
      state.user = null;
      state.tenant = null;
      state.sync = "idle";
      state.syncError = "";
    },
    setTenant(state, action: PayloadAction<Tenant>) {
      state.tenant = action.payload;
    },
    setSync(state, action: PayloadAction<SyncState>) {
      state.sync = action.payload;
      if (action.payload !== "error") state.syncError = "";
    },
    setSyncError(state, action: PayloadAction<string>) {
      state.sync = "error";
      state.syncError = action.payload;
    },
  },
});

export const { hydrateSession, clearSession, setTenant, setSync, setSyncError } = studioSlice.actions;
export const studioReducer = studioSlice.reducer;
