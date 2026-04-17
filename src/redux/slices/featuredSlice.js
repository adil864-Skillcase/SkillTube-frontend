import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getHomeFeatured } from "../../api/endpoints";

export const fetchFeatured = createAsyncThunk("featured/fetchHome", async () => {
  const res = await getHomeFeatured();
  return res.data;
});

const initialState = {
  section: null,
  loading: false,
  error: null,
};

const featuredSlice = createSlice({
  name: "featured",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeatured.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeatured.fulfilled, (state, action) => {
        state.loading = false;
        state.section = action.payload;
      })
      .addCase(fetchFeatured.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default featuredSlice.reducer;
