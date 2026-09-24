import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Link,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import {
  Search,
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Calendar,
  Upload,
  Check,
  Package,
  SlidersHorizontal,
} from "lucide-react";
import { api } from "./api.js";
import {
  Header,
  ItemCard,
  ItemImage,
  Badge,
  Empty,
  ErrorBox,
} from "./components.jsx";
import { categories, today, validatePost } from "../shared/listings.js";
function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <>
      <a className="skip-link" href="#main">
        Pereiti prie turinio
      </a>
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/pamesti" element={<Feed type="lost" />} />
          <Route path="/rasti" element={<Feed type="found" />} />
          <Route path="/naujas" element={<Create />} />
          <Route path="/skelbimai/:id" element={<Detail />} />
          <Route path="/kaip-veikia" element={<How />} />
          <Route
            path="*"
            element={
              <section className="page">
                <h1>Puslapis nerastas</h1>
                <Link to="/">Grįžti į pradžią</Link>
              </section>
            }
          />
        </Routes>
      </main>
      <footer>
        <Link className="brand" to="/">
          radau.
        </Link>
        <span>Maži daiktai. Didelis palengvėjimas.</span>
        <span>404 Found © 2026 · Studentų projektas</span>
      </footer>
    </>
  );
}
function Feed({ type }) {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "",
    category = params.get("category") || "",
    location = params.get("location") || "",
    status = params.get("status") || "active",
    from = params.get("from") || "",
    to = params.get("to") || "";
  const [reload, setReload] = useState(0);
  const filtered = Boolean(q || category || location || from || to);
  const [posts, setPosts] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  function filter(key, value) {
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        value ? p.set(key, value) : p.delete(key);
        return p;
      },
      { replace: true },
    );
  }
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const p = new URLSearchParams({ q, category, location, status, from, to });
    if (type) p.set("type", type);
    api("/posts?" + p, { signal: controller.signal })
      .then(setPosts)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [q, category, location, status, type, from, to, reload]);
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="overline">
            <span /> MAŽIAU PAIEŠKŲ. DAUGIAU RADIMŲ.
          </span>
          <h1>
            Pametei?
            <br />
            Gal kažkas jau <em>rado.</em>
          </h1>
          <p>
            Ausinės, raktai ar mėgstamiausia kuprinė.
            <br />
            Padėk daiktams sugrįžti pas savo žmones.
          </p>
          <div className="hero-actions">
            <Link className="action lost-action" to="/naujas?type=lost">
              <span>−</span> Pamečiau daiktą <ArrowUpRight size={19} />
            </Link>
            <Link className="action found-action" to="/naujas?type=found">
              <span>+</span> Radau daiktą <ArrowUpRight size={19} />
            </Link>
          </div>
          <div className="community">
            <span className="mini-logo">404</span>
            <span>Sukurta studentų. Skirta bendruomenei.</span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <span className="art-label">KAŽKUR VISAI NETOLI</span>
          <div className="floating-card">
            <div className="found-stamp">
              <Check size={14} /> RASTA!
            </div>
            <img src="/illustrations/headphones.svg" alt="" />
            <div className="art-card-bottom">
              <span>Kažkieno mėgstamiausios.</span>
              <span>↗</span>
            </div>
          </div>
          <div className="key-tag">
            ✳{" "}
            <span>
              Geri dalykai
              <br />
              sugrįžta.
            </span>
          </div>
          <span className="art-star">✳</span>
        </div>
      </section>
      <section className="feed">
        <div className="section-heading">
          <div>
            <span className="overline">BENDRUOMENĖS SKELBIMAI</span>
            <h2>
              {type === "lost"
                ? "Padėk surasti."
                : type === "found"
                  ? "Gal tai tavo?"
                  : "Kažkas pametė. Kažkas rado."}
            </h2>
          </div>
          <span className="live-note">
            <i /> Viena vieta visiems radiniams
          </span>
        </div>
        <div className="search-bar">
          <Search size={21} />
          <input
            aria-label="Ieškoti daiktų"
            placeholder="Ko ieškai? Ausinės, raktai, kuprinė..."
            value={q}
            onChange={(e) => filter("q", e.target.value)}
          />
          <div className="location-filter">
            <MapPin size={18} />
            <input
              aria-label="Filtruoti pagal vietą"
              placeholder="Visos vietos"
              value={location}
              onChange={(e) => filter("location", e.target.value)}
            />
          </div>
        </div>
        <div className="filter-row">
          <div className="tabs">
            <Link className={!type ? "selected" : ""} to={"/?" + params}>
              Visi skelbimai
            </Link>
            <Link
              className={type === "lost" ? "selected" : ""}
              to={"/pamesti?" + params}
            >
              Pamesti
            </Link>
            <Link
              className={type === "found" ? "selected" : ""}
              to={"/rasti?" + params}
            >
              Rasti
            </Link>
          </div>
          <div className="selects">
            <SlidersHorizontal size={16} />
            <select
              aria-label="Kategorija"
              value={category}
              onChange={(e) => filter("category", e.target.value)}
            >
              <option value="">Visos kategorijos</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              aria-label="Būsena"
              value={status}
              onChange={(e) => filter("status", e.target.value)}
            >
              <option value="active">Aktyvūs</option>
              <option value="returned">Grąžinti</option>
            </select>
          </div>
        </div>
        <div className="date-filters">
          <label>
            Data nuo
            <input
              aria-label="Data nuo"
              type="date"
              value={from}
              max={to || today()}
              onChange={(e) => filter("from", e.target.value)}
            />
          </label>
          <label>
            Data iki
            <input
              aria-label="Data iki"
              type="date"
              value={to}
              min={from}
              max={today()}
              onChange={(e) => filter("to", e.target.value)}
            />
          </label>
          {filtered && (
            <button
              className="button"
              onClick={() => setParams(status === "returned" ? { status } : {})}
            >
              Išvalyti filtrus
            </button>
          )}
        </div>
        <div className="results-label" role="status" aria-live="polite">
          {loading
            ? "Ieškome…"
            : `${posts.length} ${posts.length % 10 === 1 && posts.length % 100 !== 11 ? "skelbimas" : posts.length % 10 >= 2 && posts.length % 10 <= 9 && !(posts.length % 100 >= 11 && posts.length % 100 <= 19) ? "skelbimai" : "skelbimų"}`}
          <span>Naujausi pirmiausia</span>
        </div>
        <ErrorBox message={error} />
        {error && (
          <button className="button" onClick={() => setReload((n) => n + 1)}>
            Bandyti dar kartą
          </button>
        )}
        {loading ? (
          <div className="empty">Krauname skelbimus…</div>
        ) : !error && posts.length ? (
          <div className="grid">
            {posts.map((p) => (
              <ItemCard key={p.id} post={p} />
            ))}
          </div>
        ) : (
          !error && <Empty filtered={filtered} />
        )}
      </section>
      <section className="bottom-banner">
        <span className="banner-symbol">↗</span>
        <div>
          <h2>Radai? Kažkam tai svarbu.</h2>
          <p>
            Viena nuotrauka ir minutė tavo laiko gali išgelbėti kažkieno dieną.
          </p>
        </div>
        <Link className="button dark" to="/naujas?type=found">
          Pasidalinti radiniu <ArrowRight size={18} />
        </Link>
      </section>
    </>
  );
}
function Create() {
  const [params] = useSearchParams();
  const [type, setType] = useState(
      params.get("type") === "found" ? "found" : "lost",
    ),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [created, setCreated] = useState(null),
    [preview, setPreview] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [copyState, setCopyState] = useState("");
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setError("");
    const data = new FormData(e.currentTarget);
    data.set("type", type);
    const errors = validatePost(Object.fromEntries(data));
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setError("Patikrink pažymėtus laukus.");
      e.currentTarget.elements.namedItem(Object.keys(errors)[0])?.focus();
      return;
    }
    setBusy(true);
    try {
      const result = await api("/posts", { method: "POST", body: data });
      try {
        localStorage.setItem("radau-manage-" + result.id, result.manageToken);
      } catch {}
      setCreated(result);
      window.scrollTo(0, 0);
    } catch (e) {
      setFieldErrors(e.fields || {});
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (created)
    return (
      <section className="page narrow success">
        <Check size={40} />
        <h1>Skelbimas paskelbtas!</h1>
        <p>
          Išsisaugok valdymo kodą. Jo reikės pažymėti, kad daiktas grąžintas,
          ypač kitame įrenginyje.
        </p>
        <code className="token">{created.manageToken}</code>
        <button
          className="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(created.manageToken);
              setCopyState("Kodas nukopijuotas.");
            } catch {
              setCopyState(
                "Pažymėk ir nukopijuok kodą iš aukščiau esančio lauko.",
              );
            }
          }}
        >
          Kopijuoti kodą
        </button>
        <p role="status">{copyState}</p>
        <Link className="button dark" to={"/skelbimai/" + created.id}>
          Peržiūrėti skelbimą <ArrowRight size={18} />
        </Link>
      </section>
    );
  return (
    <section className="page narrow">
      <Link className="back" to="/">
        ← Visi skelbimai
      </Link>
      <span className="overline">MAŽAS ŽINGSNIS, DIDELĖ PAGALBA</span>
      <h1>Pasidalink skelbimu.</h1>
      <p>Pridėk detales, kurios padės atpažinti daiktą.</p>
      <form onSubmit={submit} noValidate aria-busy={busy}>
        <fieldset className="type-picker">
          <legend>Skelbimo tipas</legend>
          <button
            type="button"
            aria-pressed={type === "lost"}
            className={type === "lost" ? "selected" : ""}
            onClick={() => setType("lost")}
          >
            − Pamečiau daiktą
          </button>
          <button
            type="button"
            aria-pressed={type === "found"}
            className={type === "found" ? "selected" : ""}
            onClick={() => setType("found")}
          >
            + Radau daiktą
          </button>
        </fieldset>
        <label>
          Daikto pavadinimas
          <input
            name="title"
            aria-invalid={Boolean(fieldErrors.title)}
            aria-describedby={fieldErrors.title ? "error-title" : undefined}
            required
            minLength={3}
            maxLength={100}
            placeholder="Pvz., juodos Sony belaidės ausinės"
          />
        </label>
        {fieldErrors.title && (
          <p className="field-error" id="error-title">
            {fieldErrors.title}
          </p>
        )}
        <div className="form-grid">
          <label>
            Kategorija
            <select
              name="category"
              aria-invalid={Boolean(fieldErrors.category)}
              aria-describedby={
                fieldErrors.category ? "error-category" : undefined
              }
              required
            >
              <option value="">Pasirink kategoriją</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          {fieldErrors.category && (
            <p className="field-error" id="error-category">
              {fieldErrors.category}
            </p>
          )}
          <label>
            Data
            <input
              type="date"
              name="date"
              aria-invalid={Boolean(fieldErrors.date)}
              aria-describedby={fieldErrors.date ? "error-date" : undefined}
              required
              max={today()}
            />
          </label>
        </div>
        {fieldErrors.date && (
          <p className="field-error" id="error-date">
            {fieldErrors.date}
          </p>
        )}
        <label>
          Vieta
          <input
            name="location"
            aria-invalid={Boolean(fieldErrors.location)}
            aria-describedby={
              fieldErrors.location ? "error-location" : undefined
            }
            required
            minLength={2}
            maxLength={150}
            placeholder="Pvz., SMK, II aukšto koridorius"
          />
        </label>
        {fieldErrors.location && (
          <p className="field-error" id="error-location">
            {fieldErrors.location}
          </p>
        )}
        <label>
          Aprašymas
          <textarea
            name="description"
            aria-invalid={Boolean(fieldErrors.description)}
            aria-describedby={
              fieldErrors.description ? "error-description" : undefined
            }
            required
            minLength={10}
            maxLength={2000}
            rows={4}
            placeholder="Kaip atrodo daiktas? Kada ir kur jį matei?"
          />
        </label>
        {fieldErrors.description && (
          <p className="field-error" id="error-description">
            {fieldErrors.description}
          </p>
        )}
        <label className="upload">
          <Upload size={25} />
          <strong>Pridėk nuotrauką</strong>
          <span>JPG, PNG arba WebP · iki 5 MB · neprivaloma</span>
          <input
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              setPreview("");
              setError("");
              const f = e.target.files[0];
              if (
                f &&
                !["image/jpeg", "image/png", "image/webp"].includes(f.type)
              ) {
                setError("Pasirink JPG, PNG arba WebP nuotrauką.");
                e.target.value = "";
                return;
              }
              if (f?.size > 5 * 1024 * 1024) {
                setError("Nuotrauka turi būti iki 5 MB.");
                e.target.value = "";
                return;
              }
              if (f) setPreview(URL.createObjectURL(f));
            }}
          />
          {preview && (
            <img
              className="preview"
              src={preview}
              alt="Pasirinktos nuotraukos peržiūra"
            />
          )}
        </label>
        <label>
          Kontaktinė informacija
          <input
            name="contact"
            aria-invalid={Boolean(fieldErrors.contact)}
            aria-describedby={fieldErrors.contact ? "error-contact" : undefined}
            required
            minLength={5}
            maxLength={200}
            placeholder="El. paštas arba telefono numeris"
          />
        </label>
        {fieldErrors.contact && (
          <p className="field-error" id="error-contact">
            {fieldErrors.contact}
          </p>
        )}
        <p className="hint">
          Kontaktai bus matomi skelbimo lankytojams. Nekelk dokumentų numerių ar
          kitų privačių duomenų.
        </p>
        <ErrorBox message={error} />
        <button className="button dark submit" disabled={busy}>
          {busy ? "Skelbiame…" : "Paskelbti skelbimą"}{" "}
          <ArrowUpRight size={18} />
        </button>
      </form>
    </section>
  );
}
function Detail() {
  const { id } = useParams();
  const [post, setPost] = useState(null),
    [error, setError] = useState(""),
    [token, setToken] = useState(""),
    [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setPost(null);
    setError("");
    setToken("");
    try {
      setToken(localStorage.getItem("radau-manage-" + id) || "");
    } catch {}
    api("/posts/" + id, { signal: controller.signal })
      .then(setPost)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => controller.abort();
  }, [id, reload]);
  async function resolve(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/posts/" + id + "/resolve", {
        method: "PATCH",
        headers: { Authorization: "Bearer " + token.trim() },
      });
      setPost((p) => ({ ...p, status: "returned" }));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="page">
      <Link className="back" to="/">
        ← Visi skelbimai
      </Link>
      <ErrorBox message={error} />
      {error && !post && (
        <button className="button" onClick={() => setReload((n) => n + 1)}>
          Bandyti dar kartą
        </button>
      )}
      {post ? (
        <div className="detail">
          <div className="detail-image">
            <ItemImage src={post.image} title={post.title} />
          </div>
          <div>
            <Badge post={post} />
            <h1>{post.title}</h1>
            <p className="detail-meta">
              <MapPin size={18} />
              {post.location}
            </p>
            <p className="detail-meta">
              <Calendar size={18} />
              {new Date(post.date + "T12:00:00").toLocaleDateString(
                "lt-LT",
              )} · {post.category}
            </p>
            <p className="description">{post.description}</p>
            <div className="contact">
              <span className="overline">SUSISIEKTI</span>
              <p>
                {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(post.contact) ? (
                  <a href={"mailto:" + encodeURIComponent(post.contact)}>
                    {post.contact}
                  </a>
                ) : (
                  post.contact
                )}
              </p>
              <small>
                Prieš perduodant daiktą, paprašyk apibūdinti išskirtinę detalę.
              </small>
            </div>
            {post.is_demo ? (
              <p className="hint">
                Demonstracinis skelbimas. Kontaktas išgalvotas, daiktas nėra
                realiai registruotas.
              </p>
            ) : post.status !== "returned" ? (
              <form className="resolve" onSubmit={resolve}>
                <h2>Daiktas jau grąžintas?</h2>
                <p className="hint">
                  Skelbimą užbaigia jo kūrėjas. Įvesk paskelbus gautą kodą.
                </p>
                <label>
                  Skelbimo valdymo kodas
                  <input
                    aria-label="Skelbimo valdymo kodas"
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                  />
                </label>
                <button disabled={busy} className="button dark">
                  {busy ? "Atnaujiname…" : "Pažymėti kaip grąžintą"}{" "}
                  <Check size={18} />
                </button>
              </form>
            ) : (
              <p className="resolved">
                <Check size={18} /> Daiktas grąžintas. Ačiū už pagalbą!
              </p>
            )}
          </div>
        </div>
      ) : (
        !error && <p>Krauname skelbimą…</p>
      )}
    </section>
  );
}
function How() {
  return (
    <section className="page narrow">
      <span className="overline">404 FOUND / RADAU</span>
      <h1>Daiktai turi grįžti namo.</h1>
      <p>„Radau“ sujungia pamestų ir rastų daiktų skelbimus vienoje vietoje.</p>
      {[
        [
          "01",
          "Paieškok",
          "Peržiūrėk pamestus ir rastus daiktus. Susiaurink paiešką pagal kategoriją ar vietą.",
        ],
        [
          "02",
          "Pasidalink",
          "Sukurk skelbimą, pridėk nuotrauką ir kontaktą. Išsisaugok valdymo kodą.",
        ],
        [
          "03",
          "Susisiek ir grąžink",
          "Sutark dėl perdavimo, patikrink išskirtines daikto detales ir užbaik skelbimą.",
        ],
      ].map(([n, t, d]) => (
        <article className="how-step" key={n}>
          <span>{n}</span>
          <div>
            <h2>{t}</h2>
            <p>{d}</p>
          </div>
        </article>
      ))}
      <Link className="button dark" to="/naujas">
        Įkelti skelbimą <ArrowRight size={18} />
      </Link>
      <p className="hint">
        Universitetinis komandos „404 Found“ projektas. Komanda: Lukas, Aleks,
        Andrej ir Rokas.
      </p>
    </section>
  );
}
export default App;
