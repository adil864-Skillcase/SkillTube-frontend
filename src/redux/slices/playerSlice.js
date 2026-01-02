import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentVideoIndex: 0,
  isPlaying: false,
  isMuted: true,
  showLibrary: false,
  videos: [],
};

const playerSlice = createSlice({
  name: "player",

  initialState,

  reducers: {
    setVideos: (state, action) => {
      state.videos = action.payload;
      state.currentVideoIndex = 0;
    },

    setCurrentIndex: (state, action) => {
      state.currentVideoIndex = action.payload;
    },

    nextVideo: (state) => {
      if (state.currentVideoIndex < state.videos.length - 1) {
        state.currentVideoIndex += 1;
      }
    },

    prevVideo: (state) => {
      if (state.currentVideoIndex > 0) {
        state.currentVideoIndex -= 1;
      }
    },

    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },

    setPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },

    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
    },

    toggleLibrary: (state) => {
      state.showLibrary = !state.showLibrary;
    },

    setShowLibrary: (state, action) => {
      state.showLibrary = action.payload;
    },

    resetPlayer: (state) => {
      state.currentVideoIndex = 0;
      state.isPlaying = false;
      state.showLibrary = false;
      state.videos = [];
    },
  },
});

export const {
  setVideos,
  setCurrentIndex,
  nextVideo,
  prevVideo,
  togglePlay,
  setPlaying,
  toggleMute,
  toggleLibrary,
  setShowLibrary,
  resetPlayer,
} = playerSlice.actions;

export default playerSlice.reducer;
