"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { getPublicBlogPosts, type BlogPostSummary } from "@/lib/api";
import { toAbsoluteImageUrl } from "@/lib/resolveImage";

function getCategory(post: BlogPostSummary): string {
  if (typeof post.category === "string") return post.category;
  return post.category?.name ?? "UNCATEGORIZED";
}

function getImage(post: BlogPostSummary): string | null {
  return (
    toAbsoluteImageUrl(post.image_url) ??
    toAbsoluteImageUrl(post.image) ??
    toAbsoluteImageUrl(post.featured_image) ??
    null
  );
}

function getHref(post: BlogPostSummary): string {
  const key = post.slug ?? post.id;
  return key ? `/blog/${key}` : "#";
}

function fmtDate(post: BlogPostSummary): string {
  const raw = post.publish_date ?? post.created_at;
  if (!raw) return "";
  return new Date(raw).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" }).toUpperCase();
}

export default function BlogListingPage() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ALL STORIES");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getPublicBlogPosts()
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => set.add(getCategory(p).toUpperCase()));
    return ["ALL STORIES", ...Array.from(set)];
  }, [posts]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchesCategory = activeCategory === "ALL STORIES" || getCategory(p).toUpperCase() === activeCategory;
      const matchesSearch =
        !search.trim() ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.excerpt ?? "").toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [posts, activeCategory, search]);

  const [featured, ...rest] = filtered;

  return (
    <>
      <Header />

      <main className="pt-32 pb-section-gap">
        {/* Hero */}
        <section className="px-container-padding-mobile md:px-container-padding-desktop mb-16">
          <div className="max-w-4xl">
            <p className="font-label-caps text-secondary mb-4">THE CURATED JOURNAL</p>
            <h1 className="font-display-lg-mobile md:font-display-lg text-on-surface leading-tight">
              Refined Perspectives on <br className="hidden md:block" /> Arabian Opulence
            </h1>
          </div>
        </section>

        {/* Filter & Search */}
        <section className="px-container-padding-mobile md:px-container-padding-desktop mb-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-surface-container-low p-6 md:p-8 rounded-xl border border-outline-variant/20 editorial-shadow">
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full font-label-caps tracking-widest transition-all duration-300 ${
                    activeCategory === cat
                      ? "bg-secondary text-surface"
                      : "bg-surface-variant text-on-surface-variant border border-outline-variant/30 hover:border-secondary hover:text-secondary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-96 group">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-b border-outline-variant py-3 px-2 font-body-md text-on-surface focus:outline-none focus:border-secondary transition-all duration-500 placeholder:text-on-surface-variant/40"
                placeholder="Search the journal..."
                type="text"
              />
              <span className="material-symbols-outlined absolute right-2 top-3 text-on-surface-variant group-focus-within:text-secondary transition-colors">
                search
              </span>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="px-container-padding-mobile md:px-container-padding-desktop">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
              <div className="md:col-span-8 aspect-[16/10] bg-surface-container animate-pulse rounded-xl" />
              <div className="md:col-span-4 aspect-[4/5] bg-surface-container animate-pulse rounded-xl" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-title-md text-on-surface mb-2">No stories match your search</p>
              <p className="text-on-surface-variant italic">Try a different category or keyword</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
              {/* Featured */}
              {featured && (
                <Link
                  href={getHref(featured)}
                  className="md:col-span-8 group cursor-pointer overflow-hidden rounded-xl border border-outline-variant/10 relative block"
                >
                  <div className="aspect-[16/10] overflow-hidden relative">
                    {getImage(featured) ? (
                      <img
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        src={getImage(featured)!}
                        alt={featured.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface-container text-4xl">📝</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-transparent to-transparent opacity-80" />
                  </div>
                  <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                    <span className="inline-block bg-secondary text-surface px-4 py-1.5 font-label-caps mb-4">
                      {getCategory(featured).toUpperCase()}
                    </span>
                    <p className="font-label-caps text-[10px] text-on-surface-variant mb-2">{fmtDate(featured)}</p>
                    <h2 className="font-headline-lg-mobile md:font-headline-lg text-white mb-4">{featured.title}</h2>
                    <p className="font-body-md text-on-surface-variant/80 max-w-xl line-clamp-2">{featured.excerpt}</p>
                  </div>
                </Link>
              )}

              {/* Rest */}
              {rest.map((post, i) => (
                <Link
                  key={post.id}
                  href={getHref(post)}
                  className={`md:col-span-4 group cursor-pointer block ${i > 0 ? "mt-8" : ""}`}
                >
                  <div className="aspect-[4/5] overflow-hidden rounded-xl mb-6 relative">
                    {getImage(post) ? (
                      <img
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        src={getImage(post)!}
                        alt={post.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface-container text-3xl">📝</div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-secondary text-surface px-4 py-1.5 font-label-caps">
                        {getCategory(post).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <p className="font-label-caps text-[10px] text-on-surface-variant mb-2">{fmtDate(post)}</p>
                  <h3 className="font-headline-lg-mobile text-title-md text-on-surface mb-3 group-hover:text-secondary transition-colors">
                    {post.title}
                  </h3>
                  <p className="font-body-md text-on-surface-variant line-clamp-2">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}



