import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCategories } from "../../api/endpoints";

export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (includeInactive = false) => {
    const res = await getCategories(includeInactive);
    return res.data;
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default categorySlice.reducer;
