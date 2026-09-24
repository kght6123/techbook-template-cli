import { Command } from "commander";

import { customCssPath } from "./constants";

const program = new Command();

program
  .name("techbook-template-cli")
  .description("TechBook Template CLI utilities.")
  .version((await import("../package.json")).version);

program
  .command("dev")
  .description("techbook dev")
  .option("-ph, --h3-port <port>", "h3 server port number", "3000")
  .option("-ps, --sync-port <port>", "sync port number", "3001")
  .option("-kdp, --kindle-direct-print", "kindle direct print mode", "false")
  .option("-cc, --custom-css <customCss>", "custom css file name", customCssPath)
  .action(
    async ({ h3Port, syncPort, customCss }: { h3Port: string; syncPort: string; customCss: string }) => {
      console.info("dev", h3Port, syncPort, customCss);
      const main = (await import("./main")).default;
      const writeGlobalCss = (await import("./css")).default;
      main();
      writeGlobalCss(customCss);
      // TODO: "src/**/*.ts", "src/**/*.html", "docs/**/*.md"
      (await import("chokidar")).watch(["docs/"]).on("change", async (event, path) => {
        console.info(event, path);
        main();
      });
      (await import("chokidar")).watch([customCss]).on("change", (event, path) => {
        console.info(event, path);
        writeGlobalCss(customCss);
      });
    },
  );

program
  .command("build")
  .description("techbook build")
  .option("-kdp, --kindle-direct-print", "kindle direct print mode", "false")
  .option("-cc, --custom-css <customCss>", "custom css file name", customCssPath)
  // ページ数が多いとVivlioStyleの既定の120秒では組版が終わらないため、既定値を延ばしている。
  .option("-vt, --vivliostyle-timeout <vivliostyleTimeout>", "vivliostyle build timeout (seconds)", "600")
  .action(async ({ customCss, vivliostyleTimeout }: { customCss: string, vivliostyleTimeout: string }) => {
      console.info("build", customCss, vivliostyleTimeout);
      const main = (await import("./main")).default;
      await main();
      (await import("./css")).default(customCss);
      (await import("cross-spawn")).default.sync("npx", ["--yes", "@vivliostyle/cli", "build", "--style", "./dist/global.css", "--timeout", vivliostyleTimeout], { stdio: "inherit" });
    },
  );

program
  .command("viewer")
  .description("techbook viewer")
  .option("-p, --port <port>", "express server port number", "3000")
  .action(async ({ port }: { port: string }) => {
    console.info("viewer");
    await (await import("./viewer")).default({ port: parseInt(port) });
  });

program
  .command("browser")
  .description("techbook browser")
  .option("-p, --port <port>", "browser sync port number", "3001")
  .option("-pp, --proxy-port <proxyPort>", "browser proxy port number", "3000")
  .action(async ({ port, proxyPort }: { port: string, proxyPort: string }) => {
    console.info("browser");
    await (await import("wait-on")).default({
      interval: 500,
      resources: [
        "./dist/global.css",
        "./dist/lockfile",
      ],
    });
    const bs = await import("browser-sync");
    bs.init({
      ui: false,
      port: parseInt(port),
      files: [
        "dist/lockfile",
        "dist/global.css",
        "images/*",
      ],
      reloadDelay: 4000,
      reloadThrottle: 4000,
      startPath: "/index.html#src=/dist/publication.json&bookMode=true&renderAllPages=true&style=/dist/global.css",
      browser: "google chrome",
      injectChanges: false,
      proxy: {
        target: `localhost:${proxyPort}`,
        proxyReq: [
          (proxyReq) => {
            // @ts-ignore
            proxyReq.setHeader("X-Special-Proxy-Header", "foobar");
          },
        ],
        proxyRes: [
          (proxyRes, req, res) => {
            // @ts-ignore
            res.setHeader(
              "Cache-Control",
              "no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0",
            );
            // @ts-ignore
            res.setHeader("Pragma", "no-cache");
          },
        ],
      },
    });
  });

program.parse();

