import React, { useEffect, useState } from 'react';
import { getBlogs } from '../api/api';
import { motion } from 'framer-motion';
import { Edit, Trash2 } from "lucide-react";
function Blog({isAdmin=false , setBlog,onDelete}) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const getBlogArticles = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await getBlogs(pageNumber); 
      if (response?.data?.blogs?.length) {
        setBlogs(response?.data?.blogs);
        setHasMore(response.page < response.totalPages);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBlogArticles(page);
  }, []);

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
      {blogs.map((blog) => (
        <motion.div
          key={blog._id}
          className="bg-white shadow-md rounded-lg mb-6 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {blog.images[0] && (
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
            isAdmin && localStorage.getItem("User_Data_token") &&
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
        </motion.div>
      ))}

      {loading && (
        <div className="flex justify-center space-x-2 mt-6">
          {[...Array(5)].map((_, i) => (
            <motion.div
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
