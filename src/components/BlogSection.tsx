"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPublicBlogPosts, type BlogPostSummary } from "@/lib/api";
import { toAbsoluteImageUrl } from "@/lib/resolveImage";
import { posts as demoPosts } from "@/data/posts";
import Reveal from "./Reveal";

const PER_PAGE = 4; // 2 rows of the 2-col grid per page

function getPostTitle(post: BlogPostSummary) {
  return post.title;
}

function getPostCategory(post: BlogPostSummary) {
  if (typeof post.category === "string") return post.category;
  return post.category?.name ?? "";
}

function getPostImage(post: BlogPostSummary) {
  return (
    toAbsoluteImageUrl(post.image_url) ??
    toAbsoluteImageUrl(post.image) ??
    toAbsoluteImageUrl(post.featured_image) ??
    null
  );
}

function getPostHref(post: BlogPostSummary) {
  const key = post.slug ?? post.id;
  return key ? `/blog/${key}` : "#";
}

export default function BlogSection() {
  const [apiPosts, setApiPosts] = useState<BlogPostSummary[] | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    getPublicBlogPosts().then(setApiPosts);
  }, []);

  // Fall back to static demo posts until the API responds, or if it
  // genuinely returns nothing (endpoint not built yet, empty blog, etc.)
  const usingDemo = !apiPosts || apiPosts.length === 0;
  const items = usingDemo ? demoPosts : apiPosts;

  const pageCount = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const visible = items.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  const prev = () => setPage((p) => (p - 1 + pageCount) % pageCount);
  const next = () => setPage((p) => (p + 1) % pageCount);

  return (
    <section className="py-section-gap px-container-padding-mobile md:px-container-padding-desktop bg-surface-container-lowest">
      <Reveal className="flex justify-between items-center mb-16">
        <h3 className="font-headline-lg-mobile md:font-headline-lg">
          Editorial Insights
        </h3>
        {pageCount > 1 && (
          <div className="flex gap-4">
            <button
              onClick={prev}
              className="w-12 h-12 border border-secondary/20 flex items-center justify-center rounded-full hover:bg-secondary/10 transition-all"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              onClick={next}
              className="w-12 h-12 border border-secondary/20 flex items-center justify-center rounded-full hover:bg-secondary/10 transition-all"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </Reveal>

      <Reveal className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {visible.map((post) => {
          const image = usingDemo
            ? (post as (typeof demoPosts)[number]).image
            : getPostImage(post as BlogPostSummary);

          return (
            <Link
              key={post.id}
              href={usingDemo ? "#" : getPostHref(post as BlogPostSummary)}
              className="flex flex-col md:flex-row gap-8 items-center glass-card p-6 rounded-2xl group cursor-pointer overflow-hidden"
            >
              <div className="w-full md:w-48 h-48 flex-shrink-0 overflow-hidden rounded-lg">
                {image ? (
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-all duration-700"
                    role="img"
                    aria-label={post.alt ?? getPostTitle(post as BlogPostSummary)}
                    style={{ backgroundImage: `url('${image}')` }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface-container text-3xl">
                    📝
                  </div>
                )}
              </div>
              <div className="flex-1">
                <span className="font-label-caps text-secondary text-[10px] mb-2 block">
                  {usingDemo ? (post as (typeof demoPosts)[number]).category : getPostCategory(post as BlogPostSummary)}
                </span>
                <h4 className="font-title-md mb-4 group-hover:text-secondary transition-all">
                  {getPostTitle(post as BlogPostSummary)}
                </h4>
                <p className="font-body-md text-on-surface-variant text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <span className="font-label-caps text-[10px] tracking-widest text-secondary flex items-center gap-2">
                  READ MORE
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </Link>
          );
        })}
      </Reveal>
    </section>
  );
}