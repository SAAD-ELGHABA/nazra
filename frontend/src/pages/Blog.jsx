import React, { useCallback, useEffect, useRef, useState } from "react";
import { Edit, FileText, Trash2 } from "lucide-react";
import { getBlogs } from "@/api/api";
import { Button } from "@/components/ui/button";
import AdminErrorState from "@/components/admin/feedback/AdminErrorState";
import AdminEmptyState from "@/components/admin/feedback/AdminEmptyState";
import AdminLoadingState from "@/components/admin/feedback/AdminLoadingState";
import AdminTablePagination from "@/components/admin/table/AdminTablePagination";
import { useAdminListQuery } from "@/hooks/useAdminListQuery";

export default function Blog({
  isAdmin = false,
  setBlog,
  onDelete,
  refreshKey = 0,
}) {
  const requestId = useRef(0);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState({ totalPages: 1, total: 0, limit: 10 });
  const { page, setQuery } = useAdminListQuery({ defaults: { page: 1 } });

  const loadArticles = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const response = await getBlogs(page);
      if (currentRequest !== requestId.current) return;
      const nextBlogs = response?.data?.data || response?.data?.blogs || [];
      const responseMeta = response?.data?.meta || response?.data || {};
      setBlogs(nextBlogs);
      setMeta({
        totalPages: Math.max(1, Number(responseMeta.totalPages) || 1),
        total: Number(responseMeta.total ?? responseMeta.totalItems) || nextBlogs.length,
        limit: Math.max(1, Number(responseMeta.limit) || 10),
      });
    } catch (loadError) {
      if (currentRequest === requestId.current) {
        setError(loadError?.response?.data?.message || "Blog articles could not be loaded.");
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadArticles();
    return () => {
      requestId.current += 1;
    };
  }, [loadArticles, refreshKey]);

  return (
    <section aria-labelledby="article-list-title" className="space-y-5 border-t pt-8">
      <div>
        <h2 id="article-list-title" className="text-xl font-semibold">Published articles</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select an article to edit it or remove it from the blog.
        </p>
      </div>

      {loading ? (
        <AdminLoadingState variant="cards" rows={3} title="Loading articles" />
      ) : error ? (
        <AdminErrorState
          title="We couldn't load blog articles"
          description={error}
          onRetry={loadArticles}
        />
      ) : blogs.length === 0 ? (
        <AdminEmptyState
          icon={FileText}
          title="No articles yet"
          description="Create and publish the first NAZRA article using the editor above."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {blogs.map((article) => (
            <article key={article._id} className="overflow-hidden rounded-xl border bg-card shadow-sm">
              {article.images?.[0]?.url && (
                <img
                  src={article.images[0].url}
                  alt=""
                  className="h-44 w-full object-cover"
                />
              )}
              <div className="space-y-3 p-5">
                <h3 className="text-lg font-semibold">{article.title}</h3>
                <div
                  className="line-clamp-3 text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html:
                      article?.content?.slice(0, 240) +
                      (article?.content?.length > 240 ? "…" : ""),
                  }}
                />
                {isAdmin && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setBlog(article)}>
                      <Edit aria-hidden="true" />
                      Edit
                    </Button>
                    <Button type="button" variant="destructive" onClick={() => onDelete(article)}>
                      <Trash2 aria-hidden="true" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && !error && meta.totalPages > 1 && (
        <AdminTablePagination
          page={Math.min(page, meta.totalPages)}
          totalPages={meta.totalPages}
          total={meta.total}
          pageSize={meta.limit}
          onPageChange={(nextPage) => setQuery({ page: nextPage })}
        />
      )}
    </section>
  );
}
