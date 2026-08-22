// Pings IndexNow (Bing/Yandex and friends) with every URL in our sitemap.
import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/).filter((l)=>l.includes("=")&&!l.startsWith("#")).map((l)=>[l.slice(0,l.indexOf("=")),l.slice(l.indexOf("=")+1)]));
const key = env.INDEXNOW_KEY;
const xml = await (await fetch("https://launchbid.lol/sitemap.xml")).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    host: "launchbid.lol",
    key,
    keyLocation: `https://launchbid.lol/${key}.txt`,
    urlList: urls,
  }),
});
console.log(`pinged ${urls.length} urls -> ${res.status} ${res.statusText}`);
