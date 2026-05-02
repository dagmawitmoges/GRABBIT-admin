import { useEffect } from "react";
import { supabase } from "../utils/supabase";

const TestApi = () => {
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("vendors") // or "dashboard" depending on your table/view
        .select("*");

      if (error) {
        console.error("API ERROR:", error.message);
      } else {
        console.log("API OK:", data);
      }
    };

    fetchData();
  }, []);

  return <p>Testing Supabase API...</p>;
};

export default TestApi;
