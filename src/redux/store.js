import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import playlistReducer from "./slices/playlistSlice";
import playerReducer from "./slices/playerSlice";
import categoryReducer from "./slices/categorySlice";
import featuredReducer from "./slices/featuredSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    playlists: playlistReducer,
    player: playerReducer,
    categories: categoryReducer,
    featured: featuredReducer,
  },
});

export default store;
