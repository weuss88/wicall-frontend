// ============================================================================
// Telecharge des images de fond libres de droits depuis l'API Pexels
// et les range dans public/assets/, pretes a etre referencees dans src/assets.ts
//
// UTILISATION :
//   1. Cree une cle API gratuite : https://www.pexels.com/api/
//   2. Mets-la dans un fichier .env a la racine du projet :
//        PEXELS_API_KEY=xxxxxxxxxxxxxxxxxxxx
//   3. Lance :  npm run fetch-assets
//
// Le script choisit la photo horizontale la plus grande pour chaque requete.
// Rien d'irreversible : il n'ecrase un fichier existant que s'il reussit le
// telechargement. Verifie toujours les visuels (aucun visage IA / deepfake).
// ============================================================================

import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "public", "assets");

// Requetes de recherche par sequence (mots-cles Pexels).
// Ajuste-les librement. Evite tout terme menant a des portraits/visages.
const QUERIES = {
  "accroche.jpg": "server room dark data center",
  "ue.jpg": "european parliament building brussels",
  "usa.jpg": "washington capitol building night",
  "chine.jpg": "beijing skyline night city",
  "monde.jpg": "world map dark connected network",
  "dilemme.jpg": "data center servers blue light",
  "chute.jpg": "green data center solar technology",
};

async function loadDotEnv() {
  const envPath = join(ROOT, ".env");
  if (!existsSync(envPath)) return;
  const txt = await readFile(envPath, "utf8");
  for (const line of txt.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

async function main() {
  await loadDotEnv();
  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    console.error(
      "\n❌  PEXELS_API_KEY manquante.\n" +
        "    Cree une cle gratuite sur https://www.pexels.com/api/ puis ajoute\n" +
        "    PEXELS_API_KEY=... dans un fichier .env a la racine du projet.\n"
    );
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  for (const [filename, query] of Object.entries(QUERIES)) {
    process.stdout.write(`→ ${filename}  («${query}») ... `);
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(
          query
        )}&orientation=landscape&per_page=1&size=large`,
        { headers: { Authorization: key } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const photo = data.photos?.[0];
      if (!photo) throw new Error("aucun resultat");

      const url = photo.src?.original ?? photo.src?.large2x;
      const img = await fetch(url);
      const buf = Buffer.from(await img.arrayBuffer());
      await writeFile(join(OUT_DIR, filename), buf);
      console.log(`ok (credit: ${photo.photographer})`);
    } catch (e) {
      console.log(`ECHEC — ${e.message}`);
    }
  }

  console.log(
    "\n✅  Termine. Renseigne maintenant les chemins dans src/assets.ts, ex :\n" +
      '     Accroche: { file: "assets/accroche.jpg", ken: {...} }\n'
  );
}

main();
