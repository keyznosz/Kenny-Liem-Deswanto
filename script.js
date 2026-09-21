/* ------------------------------------------------------------
   SETTINGS
   Put your GitHub username here to list your top public repos.
   Leave it empty ("") to hide that section.
------------------------------------------------------------ */
const GITHUB_USERNAME = "";

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Decorative grid (random pattern, not real activity) ---------- */
(function buildGrid() {
  const grid = document.getElementById("grid");
  const cols = 52, rows = 7;
  let seed = 20260921;
  const rand = () => {              // small seeded random generator
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const frag = document.createDocumentFragment();
  for (let c = 0; c < cols; c++) {
    const wave = 0.5 + 0.5 * Math.sin(c / 5.5);   // busier and quieter stretches
    for (let r = 0; r < rows; r++) {
      const weekend = (r === 0 || r === 6) ? 0.55 : 1;
      const v = rand() * wave * weekend;
      const level = v > 0.62 ? 4 : v > 0.42 ? 3 : v > 0.26 ? 2 : v > 0.12 ? 1 : 0;
      const cell = document.createElement("i");
      cell.style.cssText = "--l:" + level + ";--c:" + c;
      frag.appendChild(cell);
    }
  }
  grid.appendChild(frag);
})();

/* ---------- Optional: load top repos from GitHub ---------- */
(async function loadRepos() {
  if (!GITHUB_USERNAME) return;
  try {
    const res = await fetch(
      "https://api.github.com/users/" + encodeURIComponent(GITHUB_USERNAME) + "/repos?per_page=100&sort=updated"
    );
    if (!res.ok) throw new Error("GitHub returned " + res.status);
    const repos = (await res.json())
      .filter(r => !r.fork && !r.archived)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6);
    if (!repos.length) return;

    const list = document.getElementById("repo-list");
    repos.forEach(r => {
      const item = document.createElement("article");
      item.className = "entry";

      const h3 = document.createElement("h3");
      const a = document.createElement("a");
      a.href = r.html_url;
      a.textContent = r.name;
      h3.appendChild(a);
      item.appendChild(h3);

      if (r.description) {
        const p = document.createElement("p");
        p.textContent = r.description;
        item.appendChild(p);
      }

      const meta = document.createElement("p");
      meta.className = "repo-meta";
      const bits = [];
      if (r.language) bits.push(r.language);
      bits.push(r.stargazers_count + " stars");
      meta.textContent = bits.join(", ");
      item.appendChild(meta);

      list.appendChild(item);
    });
    document.getElementById("github").hidden = false;
  } catch (err) {
    console.warn("Could not load GitHub repos:", err);
  }
})();
