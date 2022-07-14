import { createSlice } from '@reduxjs/toolkit';

export const author = createSlice({
  name: 'author',
  initialState: {
    author: ''
  },
  reducers: {
    setAuthor: (state, action) => {
      state.author = action.payload;
    }
  }
});

export const { setAuthor } = author.actions;

export default author.reducer;