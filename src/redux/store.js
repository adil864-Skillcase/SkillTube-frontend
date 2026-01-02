import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import playlistReducer from "./slices/playlistSlice";
import playerReducer from "./slices/playerSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    playlists: playlistReducer,
    player: playerReducer,
  },
});

export default store;
