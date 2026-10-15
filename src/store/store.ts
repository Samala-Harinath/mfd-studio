import { configureStore } from "@reduxjs/toolkit";
import { studioReducer } from "@/store/slices/studio.slice";

export function makeStore() {
  return configureStore({
    reducer: {
      studio: studioReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
