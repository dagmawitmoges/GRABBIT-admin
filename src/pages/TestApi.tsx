import { useEffect } from "react";
import { supabase } from "../utils/supabase";

const TestApi = () => {
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("vendor_profiles")
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
