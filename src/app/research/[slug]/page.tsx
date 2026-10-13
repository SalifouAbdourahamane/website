import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { posts, postBySlug, fmtDate } from "@/content/posts";
import { programmeBySlug } from "@/content/programmes";
import { news, monthYear } from "@/content/news";
import { NewsArt } from "@/components/NewsArt";
import { Share } from "@/components/PostTools";
import { Icon } from "@/components/Icon";

export const dynamicParams = false;
export function generateStaticParams() { return posts.map(p => ({ slug: p.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = postBySlug((await params).slug);
  if (!p) return {};
  return {
    title: p.title, description: p.dek, alternates: { canonical: `/research/${p.slug}` },
    openGraph: { type: "article", title: p.title, description: p.dek, publishedTime: p.date, authors: p.authors },
  };
}

/* The DeepMind blog template: centred date and topic, a large centred title, the byline, Share,
   a full-width image, then a 624 px text column with wider figures. */
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = postBySlug((await params).slug);
  if (!post) notFound();
  const programme = post.programme ? programmeBySlug(post.programme) : undefined;
  const item = news.find(n => n.href === `/research/${post.slug}`);
  const byline = post.authors.length ? post.authors.join(", ") : post.team ?? "Namu AI Lab";
  const more = news.filter(n => n.href !== `/research/${post.slug}`).slice(0, 3);
  const ld = {
    "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.dek, datePublished: post.date,
    author: post.authors.length ? post.authors.map(name => ({ "@type": "Person", name })) : { "@type": "Organization", name: "Namu AI Lab" },
    publisher: { "@type": "Organization", "@id": "https://lab.namu-ai.org/#org", name: "Namu AI Lab" },
    mainEntityOfPage: `https://lab.namu-ai.org/research/${post.slug}`,
  };

  return (
    <article className="page-top">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <header className="wrap post-hd">
        <div className="metarow"><time dateTime={post.date}>{fmtDate(post.date)}</time>{programme ? <a href={`/programmes/${programme.slug}`} style={{ textDecoration: "none" }}>{programme.name}</a> : <span>{post.kind}</span>}</div>
        <h1 className="h1">{post.title}</h1>
        <p className="by">{byline}</p>
        <Share title={post.title} />
      </header>
      <div className="wrap"><div className="post-media"><NewsArt art={item?.art ?? "intro"} ratio="wide" /></div></div>

      <div className="prose">
        <p style={{ fontSize: 20, color: "var(--ink)", lineHeight: 1.45 }}>{post.dek}</p>
        {post.body}
      </div>

      <div className="post-foot">
        {post.artefacts.length > 0 && <div className="row"><span>Artefacts</span><span>{post.artefacts.map(a => <a key={a.href} href={a.href} className="textlink" style={{ marginLeft: 16 }}><span>{a.label}</span><Icon name="external" size={14} stroke={1.6} /></a>)}</span></div>}
        {post.origin && <div className="row"><span>{post.origin.label.replace(/ on namu-ai\.org$/, "")}</span><a href={post.origin.href} className="textlink"><span>namu-ai.org</span><Icon name="external" size={14} stroke={1.6} /></a></div>}
        <div className="row"><span>{post.readMinutes} min read</span><span>{byline}</span></div>
      </div>

      <section className="section" aria-labelledby="h-more" style={{ marginTop: 72 }}>
        <div className="wrap">
          <div className="section-head"><h2 id="h-more" className="h2">Related posts</h2><a className="pill" href="/research#latest">View all</a></div>
          <div className="cardgrid" style={{ marginTop: 0 }}>
            {more.map(n => (
              <a key={n.href} className="acard" href={n.href}>
                <div className="art"><NewsArt art={n.art} ratio="wide" /></div>
                <h3 className="h3">{n.title}</h3>
                <div className="metarow"><span>{monthYear(n.date)}</span><span>{n.topic}</span></div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
