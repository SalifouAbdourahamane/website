export default function NotFound() {
  return (
    <section className="page-top wrap intro" style={{ minHeight: "70svh", display: "grid", alignContent: "center" }}>
      <p className="eyebrow">Page not found</p>
      <h1 className="h1">This page is not part of the Lab yet</h1>
      <p className="lede">It may have moved, or it may not be written yet.</p>
      <div className="acts"><a className="pill lg dark" href="/">Home</a><a className="pill lg" href="/research">Research</a></div>
    </section>
  );
}
