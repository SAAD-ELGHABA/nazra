import React, { useCallback, useEffect, useState } from 'react';
import { getBlogs } from '../api/api';
import { motion as Motion } from 'framer-motion';
import { Edit, Trash2 } from "lucide-react";
function Blog({isAdmin=false , setBlog,onDelete, refreshKey = 0}) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const getBlogArticles = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true);
      setError("");
      const response = await getBlogs(pageNumber); 
      const nextBlogs = response?.data?.data || response?.data?.blogs || [];
      const meta = response?.data?.meta || response?.data || {};
      if (nextBlogs.length) {
        setBlogs((previous) => pageNumber === 1 ? nextBlogs : [...previous, ...nextBlogs]);
        setHasMore(Number(meta.page) < Number(meta.totalPages));
      } else {
        if (pageNumber === 1) setBlogs([]);
        setHasMore(false);
      }
    } catch (error) {
      setError(error?.response?.data?.message || "Blog articles could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setBlogs([]);
    setHasMore(true);
    setPage((currentPage) => {
      if (currentPage === 1) getBlogArticles(1);
      return 1;
    });
  }, [refreshKey, getBlogArticles]);

  useEffect(() => {
    getBlogArticles(page);
  }, [page, getBlogArticles]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
        document.documentElement.scrollHeight
      ) {
        if (!loading && hasMore) {
          setPage((prev) => prev + 1);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  return (
    <div className="my-10 h-screen w-full md:max-w-4xl mx-auto p-4">
        <div className='md:text-3xl font-semibold'>
            Blog
        </div>
      {error && (
        <div className="my-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button type="button" onClick={() => getBlogArticles(1)} className="mt-2 rounded bg-red-700 px-3 py-2 text-white">
            Retry
          </button>
        </div>
      )}
      {blogs.map((blog) => (
        <Motion.div
          key={blog._id}
          className="bg-white shadow-md rounded-lg mb-6 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {blog.images?.[0] && (
            <img
              src={blog.images[0].url}
              alt={blog.title}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4">
            <h2 className="text-xl font-bold mb-2">{blog.title}</h2>
            <div
            dangerouslySetInnerHTML={{
                __html: blog?.content?.slice(0, 200) + (blog.content.length > 200 ? "..." : "")
            }}
            />

          </div>
          {
            isAdmin &&
            <div className="flex gap-3 my-4">
                <button
                    onClick={()=>setBlog(blog)}
                    className="flex items-center gap-2 px-4 py-2 border border-black text-black font-medium rounded-lg
                            hover:bg-black hover:text-white transition-colors duration-200"
                >
                    <Edit size={16} /> Modify
                </button>

                <button
                    onClick={()=>onDelete(blog?._id)}
                    className="flex items-center gap-2 px-4 py-2 border border-black text-black font-medium rounded-lg
                            hover:bg-red-600 hover:text-white transition-colors duration-200"
                >
                    <Trash2 size={16} /> Delete
                </button>
            </div>
          }
        </Motion.div>
      ))}

      {loading && (
        <div className="flex justify-center space-x-2 mt-6">
          {[...Array(5)].map((_, i) => (
            <Motion.div
              key={i}
              className="w-4 h-4 bg-gray-500 rounded-full"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
            />
          ))}
        </div>
      )}

      {!hasMore && !loading && blogs.length > 0 && (
        <p className="text-center text-gray-400 mt-4">No more articles.</p>
      )}
    </div>
  );
}

export default Blog;
