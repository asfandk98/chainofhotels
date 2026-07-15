import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { getPublicBlogPost, getPublicBlogPosts } from "@/lib/api";
import { toAbsoluteImageUrl } from "@/lib/resolveImage";

function getCategory(post: { category?: { name?: string } | string }): string {
  if (typeof post.category === "string") return post.category;
  return post.category?.name ?? "JOURNAL";
}

function getImage(post: { image?: string; image_url?: string; featured_image?: string }): string | null {
  return (
    toAbsoluteImageUrl(post.image_url) ??
    toAbsoluteImageUrl(post.image) ??
    toAbsoluteImageUrl(post.featured_image) ??
    null
  );
}

function fmtDate(raw?: string): string {
  if (!raw) return "";
  return new Date(raw)
    .toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })
    .toUpperCase();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublicBlogPost(slug);
  if (!post) return { title: "Story Not Found | Lumina Dubai" };
  return {
    title: post.meta_title || `${post.title} | Lumina Dubai`,
    description: post.meta_description || post.excerpt,
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublicBlogPost(slug);

  if (!post) return notFound();

  // Related stories — same category, excluding this post, capped at 3.
  const allPosts = await getPublicBlogPosts();
  const related = allPosts
    .filter((p) => p.slug !== post.slug && getCategory(p) === getCategory(post))
    .slice(0, 3);

  const tags = post.tags
    ? post.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <>
      <Header />

      <main className="pt-32 pb-section-gap">
        {/* Hero */}
        <section className="px-container-padding-mobile md:px-container-padding-desktop mb-12">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block bg-secondary text-surface px-4 py-1.5 font-label-caps mb-6">
              {getCategory(post).toUpperCase()}
            </span>
            <h1 className="font-display-lg-mobile md:font-display-lg text-on-surface leading-tight mb-6">
              {post.title}
            </h1>
            <p className="font-label-caps text-[10px] text-on-surface-variant">{fmtDate(post.publish_date ?? post.created_at)}</p>
          </div>
        </section>

        {/* Hero image */}
        {getImage(post) && (
          <section className="px-container-padding-mobile md:px-container-padding-desktop mb-16">
            <div className="max-w-5xl mx-auto aspect-[16/9] overflow-hidden rounded-xl border border-outline-variant/10">
              <img src={getImage(post)!} alt={post.title} className="w-full h-full object-cover" />
            </div>
          </section>
        )}

        {/* Content */}
        <section className="px-container-padding-mobile md:px-container-padding-desktop mb-20">
          <article
            className="max-w-3xl mx-auto font-body-lg text-on-surface-variant leading-relaxed
              [&>h2]:font-headline-lg-mobile [&>h2]:text-on-surface [&>h2]:mt-12 [&>h2]:mb-4
              [&>p]:mb-6 [&>ul]:mb-6 [&>ul]:list-disc [&>ul]:pl-6 [&>li]:mb-2"
            dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
          />

          {tags.length > 0 && (
            <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-outline-variant/10 flex flex-wrap gap-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-1.5 rounded-full border border-outline-variant/30 text-on-surface-variant font-label-caps text-[10px]"
                >
                  {tag.toUpperCase()}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="px-container-padding-mobile md:px-container-padding-desktop">
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-on-surface mb-12 text-center">
              More From {getCategory(post)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter max-w-6xl mx-auto">
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug ?? r.id}`} className="group cursor-pointer block">
                  <div className="aspect-[4/5] overflow-hidden rounded-xl mb-6 relative">
                    {getImage(r) ? (
                      <img
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        src={getImage(r)!}
                        alt={r.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface-container text-3xl">📝</div>
                    )}
                  </div>
                  <p className="font-label-caps text-[10px] text-on-surface-variant mb-2">{fmtDate(r.publish_date ?? r.created_at)}</p>
                  <h3 className="font-headline-lg-mobile text-title-md text-on-surface group-hover:text-secondary transition-colors">
                    {r.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back link */}
        <section className="px-container-padding-mobile md:px-container-padding-desktop mt-16 text-center">
          <Link href="/blog" className="font-label-caps text-secondary hover:underline">
            ← BACK TO THE JOURNAL
          </Link>
        </section>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}