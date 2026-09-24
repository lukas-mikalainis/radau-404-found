import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Search, MapPin, ArrowUpRight, Package, Plus } from "lucide-react";
export function Header() {
  return (
    <header>
      <Link className="brand" to="/">
        <span className="brand-icon">
          <Search size={23} />
        </span>
        radau<span className="brand-dot">.</span>
      </Link>
      <nav aria-label="Pagrindinis meniu">
        <NavLink to="/pamesti">Pamesti</NavLink>
        <NavLink to="/rasti">Rasti</NavLink>
        <NavLink to="/kaip-veikia">Kaip tai veikia?</NavLink>
      </nav>
      <Link className="button dark" to="/naujas">
        <Plus size={17} /> Įkelti skelbimą
      </Link>
    </header>
  );
}
export function Badge({ post }) {
  return (
    <span
      className={
        "badge " + (post.status === "returned" ? "returned" : post.type)
      }
    >
      <i />
      {post.status === "returned"
        ? "Grąžinta"
        : post.type === "lost"
          ? "Pamesta"
          : "Rasta"}
    </span>
  );
}
export function ItemCard({ post }) {
  return (
    <Link className="item-card" to={"/skelbimai/" + post.id}>
      <div className={"item-image " + post.category}>
        <Badge post={post} />
        <ItemImage src={post.image} title={post.title} />
        <span className="card-arrow">
          <ArrowUpRight size={18} />
        </span>
      </div>
      <div className="item-copy">
        <span className="eyebrow">
          {post.category}
          {post.is_demo ? " · Pavyzdys" : ""}
        </span>
        <h3>{post.title}</h3>
        <p>
          <MapPin size={14} />
          {post.location}
        </p>
        <small>
          {new Date(post.date + "T12:00:00").toLocaleDateString("lt-LT")}
        </small>
      </div>
    </Link>
  );
}
export function Empty({ reset, filtered = true }) {
  return (
    <div className="empty">
      <Search size={35} />
      <h3>
        {filtered
          ? "Kol kas nieko neradome"
          : "Čia gali prasidėti kažkieno paieška"}
      </h3>
      <p>
        {filtered
          ? "Pabandyk kitą žodį arba pakeisk filtrus."
          : "Šiame sąraše skelbimų dar nėra. Pasidalink pamestu ar rastu daiktu."}
      </p>
      {reset && (
        <button className="button" onClick={reset}>
          Išvalyti filtrus
        </button>
      )}
      {!filtered && (
        <Link className="button dark" to="/naujas">
          Įkelti skelbimą
        </Link>
      )}
    </div>
  );
}
export function ItemImage({ src, title }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return src && !failed ? (
    <img src={src} alt={title} loading="lazy" onError={() => setFailed(true)} />
  ) : (
    <div className="image-fallback">
      <Package size={64} strokeWidth={1} />
      <span>{src ? "Nuotrauka nepasiekiama" : "Be nuotraukos"}</span>
    </div>
  );
}
export function ErrorBox({ message }) {
  return message ? (
    <p role="alert" className="error">
      {message}
    </p>
  ) : null;
}
