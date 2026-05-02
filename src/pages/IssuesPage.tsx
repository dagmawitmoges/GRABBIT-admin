import { useEffect, useState } from "react";
import api from "../utils/axiosInstance";

const IssuesPage = () => {
  const [issues, setIssues] = useState<any[]>([]);

  useEffect(() => {
    const fetchIssues = async () => {
      const res = await api.get("/admin/issues");
      setIssues(res.data);
    };
    fetchIssues();
  }, []);

  const resolveIssue = async (id: string) => {
    await api.put(`/admin/issues/${id}/resolve`);
    setIssues(issues.map((i) => (i.id === id ? { ...i, status: "resolved" } : i)));
  };

  return (
    <div>
      <h1>Issues / Reports</h1>
      <table>
        <thead>
          <tr>
            <th>Reporter</th>
            <th>Description</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((i) => (
            <tr key={i.id}>
              <td>{i.reporter}</td>
              <td>{i.description}</td>
              <td>{i.status}</td>
              <td>
                {i.status !== "resolved" && (
                  <button onClick={() => resolveIssue(i.id)}>Resolve</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IssuesPage;
