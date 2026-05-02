import { useEffect } from "react";
import api from "../utils/axiosInstance";

const TestApi = () => {
  useEffect(() => {
    api.get("/admin/dashboard")
      .then(res => console.log("API OK:", res.data))
      .catch(err => console.log("API ERROR:", err));
  }, []);

  return <p>Testing API...</p>;
};

export default TestApi;
