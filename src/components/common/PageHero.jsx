export function PageHero({ title, children }) {
  return (
    <div className="hero-banner page-hero">
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}
