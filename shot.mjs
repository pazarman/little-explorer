import { chromium } from "@playwright/test";
const S="/tmp/claude-0/-home-user-little-explorer/cbc6782a-d4b2-5d88-aca3-c7fc63773eab/scratchpad/critic";
const ids = process.argv.slice(2);
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const id of ids) {
  const p = await b.newPage({ viewport: { width: 393, height: 851 }, deviceScaleFactor: 2 });
  const errs=[]; p.on("pageerror",e=>errs.push(String(e))); p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.addInitScript(()=>{localStorage.setItem("fionaNameSet","1");localStorage.setItem("fionaBuddySet","1");});
  await p.goto("http://localhost:8765/index.html");
  await p.waitForSelector("#hub:not(.hidden)");
  await p.evaluate((i) => startLevel(i), id);
  await p.waitForTimeout(1600);
  await p.screenshot({ path: `${S}/g-${id}.png` });
  console.log(id, errs.length ? "ERRORS "+errs.slice(0,2) : "ok");
  await p.close();
}
await b.close();
