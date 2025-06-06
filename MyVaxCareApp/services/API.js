// api.js

import axios from 'axios';

// Định nghĩa BASE_URL
// const BASE_URL = 'https://quocan283.pythonanywhere.com/'; // cập nhật lại link
const BASE_URL = 'http://192.168.172.227:8000/';

// Tạo instance của axios với baseURL
export default axios.create({
  baseURL: BASE_URL
});
// Hàm authApi để tạo instance của axios với token Authorization
export const authApi = (token) => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}

