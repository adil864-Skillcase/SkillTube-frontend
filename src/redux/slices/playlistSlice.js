import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getPlaylists, getPlaylistBySlug } from "../../api/endpoints";

export const fetchPlaylists = createAsyncThunk(
  "playlists/fetchAll",
  async () => {
    const res = await getPlaylists();
    return res.data;
  }
);

export const fetchPlaylistBySlug = createAsyncThunk(
  "playlists/fetchBySlug",
  async (slug) => {
    const res = await getPlaylistBySlug(slug);
    return res.data;
  }
);

const initialState = {
  items: [],
  currentPlaylist: null,
  loading: false,
  error: null,
};

const playlistSlice = createSlice({
  name: "playlists",
  initialState,

  reducers: {
    clearCurrentPlaylist: (state) => {
      state.currentPlaylist = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchPlaylists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlaylists.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPlaylists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchPlaylistBySlug.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlaylistBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPlaylist = action.payload;
      })
      .addCase(fetchPlaylistBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearCurrentPlaylist } = playlistSlice.actions;

export default playlistSlice.reducer;
