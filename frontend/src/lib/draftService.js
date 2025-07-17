import axios from "axios";

export const getAllDrafts = async () => {
  const response = await axios.get('/draft');
  return response.data;
};
