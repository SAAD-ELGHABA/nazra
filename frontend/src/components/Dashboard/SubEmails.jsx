import React, { useEffect, useState } from "react";
import { getSubEmails } from "../../api/api";

function SubEmails() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  const getEmails = async () => {
    try {
      const res = await getSubEmails();
      setEmails(res?.data?.emails);
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEmails();
  }, []);

  const formatDate = (dateStr) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  if (loading) return <div>Loading emails...</div>;

  if (emails?.length === 0) return <div>No subscribed emails found.</div>;

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-gray-700">Email</th>
              <th className="px-4 py-2 text-left text-gray-700">Phone</th>
              <th className="px-4 py-2 text-left text-gray-700">Created At</th>
              <th className="px-4 py-2 text-left text-gray-700">Updated At</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {emails
              ?.sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt))
              ?.map((item) => (
                <tr key={item._id} className="hover:bg-gray-100">
                  <td className="px-4 py-2">{item.email}</td>
                  <td className="px-4 py-2">{item?.phone ? item?.phone:"----------"}</td>
                  <td className="px-4 py-2">{formatDate(item.createdAt)}</td>
                  <td className="px-4 py-2">{formatDate(item.updatedAt)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SubEmails;
