"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { getBlogPosts, deleteBlogPost, type BlogPost } from "@/lib/admin";
import { toAbsoluteImageUrl } from "@/lib/resolveImage";

const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  draft: "bg-surface-container-highest text-on-surface-variant border-outline-variant/30",
  archived: "bg-violet-500/10 text-violet-400 border-violet-500/30",
};

export default function BlogPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{ total?: number; last_page?: number }>({});

  const fetchPosts = () => {
    setLoading(true);
    getBlogPosts(page)
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          setPosts(data.data);
          setMeta(data.meta ?? {});
        }
      })
      .catch(() => toast.error("Failed to load posts"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const remove = async (id: string | number) => {
    if (!confirm("Delete this post?")) return;
    try {
      await deleteBlogPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    }
  };

  const fmt = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-secondary">Blog Posts</h1>
          <p className="text-on-surface-variant text-sm mt-1">{meta.total ?? posts.length} posts</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/blog/categories"
            className="border border-outline-variant/30 text-on-surface-variant hover:text-secondary hover:border-secondary/50 px-4 py-2.5 rounded-xl text-sm font-medium transition"
          >
            Categories
          </Link>
          <Link
            href="/admin/blog/create"
            className="flex items-center gap-2 bg-secondary text-on-secondary px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Post
          </Link>
        </div>
      </div>

      <div className="bg-surface-container luxury-shadow rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-outline-variant/10">
            <tr>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant opacity-60">Title</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant opacity-60">Category</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant opacity-60">Status</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant opacity-60">Featured</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant opacity-60">Date</th>
              <th className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant opacity-60 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-16">
                  <div className="w-6 h-6 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-on-surface-variant">No posts yet</td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-surface-container-highest transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {toAbsoluteImageUrl(post.featured_image) ? (
                        <img
                          src={toAbsoluteImageUrl(post.featured_image)!}
                          className="w-10 h-10 rounded-lg object-cover"
                          alt={post.title}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-xl">
                          📝
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-on-surface line-clamp-1">{post.title}</p>
                        <p className="text-xs text-on-surface-variant line-clamp-1">{post.excerpt ?? ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">{post.category?.name ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
                        STATUS_STYLES[post.status] ?? STATUS_STYLES.draft
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {post.featured ? (
                      <span className="flex items-center gap-1 text-secondary text-xs">
                        <span className="material-symbols-outlined text-sm">star</span> Featured
                      </span>
                    ) : (
                      <span className="text-on-surface-variant/50 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant text-xs">{fmt(post.publish_date ?? post.created_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="p-2 text-on-surface-variant hover:text-secondary hover:bg-surface-container-highest rounded-lg transition"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </Link>
                      <button
                        onClick={() => remove(post.id)}
                        className="p-2 text-on-surface-variant hover:text-error hover:bg-surface-container-highest rounded-lg transition"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(meta.last_page ?? 0) > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: meta.last_page ?? 0 }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm transition ${
                p === page ? "bg-secondary text-on-secondary" : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}