import { writeFile } from "node:fs/promises";
import { ICON_NAMES } from "../components/ui/icon-names";

// Downloads a Material Symbols Rounded subset holding only ICON_NAMES, with
// the FILL axis kept for `<Icon fill>` and the other axes pinned to the
// values `.ms` uses in globals.css (wght 400, GRAD 0, opsz 24).
const OUT = "components/ui/material-symbols-rounded.woff2";

const sorted = [...ICON_NAMES].sort();
if (sorted.join() !== ICON_NAMES.join()) {
  throw new Error("ICON_NAMES must be alphabetical");
}

const cssUrl =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0..1,0" +
  `&icon_names=${ICON_NAMES.join(",")}&display=block`;

async function main() {
  // Google serves woff2 only to browsers it recognises.
  const css = await fetch(cssUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
    },
  }).then((response) => {
    if (!response.ok) throw new Error(`${response.status} for ${cssUrl}`);
    return response.text();
  });

  const fontUrl = css.match(/src: url\((.+?)\) format\('woff2'\)/)?.[1];
  if (!fontUrl) throw new Error(`No woff2 URL in:\n${css}`);

  const font = Buffer.from(await (await fetch(fontUrl)).arrayBuffer());
  await writeFile(OUT, font);
  console.log(
    `Wrote ${OUT} (${font.length} bytes, ${ICON_NAMES.length} icons)`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
