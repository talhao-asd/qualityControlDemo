import { createSlice } from '@reduxjs/toolkit';

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    searchText: '',
    sortOrder: 'desc',
    sonuc: 'tumu',
  },
  reducers: {
    setSearchText: (state, action) => {
      state.searchText = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    setSonuc: (state, action) => {
      state.sonuc = action.payload;
    },
  },
});

export const { setSearchText, setSortOrder, setSonuc } = searchSlice.actions;
export default searchSlice.reducer;
