import { Command } from "commander";

import { config, __dirname } from "./constants";

const CSS_FILE_MAP = {
  'JIS-B5': 'global.css',
  '105mm 173mm': 'global-105x173.css'
};
const cssSrcFileName = CSS_FILE_MAP[config.size] || 'global.css';

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
  .action(
    async ({ h3Port, syncPort }: { h3Port: string; syncPort: string }) => {
      console.info("dev", h3Port, syncPort);
      const main = (await import("./main")).default;
      main();
      // TODO: "src/**/*.ts", "src/**/*.html", "docs/**/*.md"
      (await import("chokidar")).watch(["docs/"]).on("change", async (event, path) => {
        console.info(event, path);
        main();
      });
    },
  );

program
  .command("build")
  .description("techbook build")
  .option("-kdp, --kindle-direct-print", "kindle direct print mode", "false")
  .option("-ts, --tailwind-src <tailwindSrc>", "tailwind src file name", __dirname + "/../src/" + cssSrcFileName)
  .option("-tc, --tailwind-config <tailwindConfig>", "tailwind config file name", __dirname + "/../tailwind.config.ts")
  .option("-tp, --tailwind-postcss <tailwindPostcss>", "postcss config file name", __dirname + "/../postcss.config.cjs")
  .action(async ({ tailwindSrc, tailwindConfig, tailwindPostcss }: { tailwindSrc: string, tailwindConfig: string, tailwindPostcss: string }) => {
      console.info("build", tailwindSrc, tailwindConfig, tailwindPostcss);
      const main = (await import("./main")).default;
      await main();
      (await import("cross-spawn")).default.sync("npx", ["--yes", "tailwindcss@latest", "-i", tailwindSrc, "-o", "./dist/global.css", "--no-autoprefixer", "--postcss", tailwindPostcss, "--config", tailwindConfig], { stdio: "inherit" });
      (await import("cross-spawn")).default.sync("npx", ["--yes", "@vivliostyle/cli", "build", "--style", "./dist/global.css"], { stdio: "inherit" });
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
  .command("tailwind")
  .description("techbook tailwind")
  .option("-ts, --tailwind-src <tailwindSrc>", "tailwind src file name", __dirname + "/../src/" + cssSrcFileName)
  .option("-tc, --tailwind-config <tailwindConfig>", "tailwind config file name", __dirname + "/../tailwind.config.ts")
  .option("-tp, --tailwind-postcss <tailwindPostcss>", "postcss config file name", __dirname + "/../postcss.config.cjs")
  .action(async ({ tailwindSrc, tailwindConfig, tailwindPostcss }: { tailwindSrc: string, tailwindConfig: string, tailwindPostcss: string }) => {
    console.info("tailwind");
    await (await import("wait-on")).default({
      interval: 500,
      resources: [
        "./dist/lockfile",
      ],
    });
    const result = (await import("cross-spawn")).default.sync("npx", ["--yes", "tailwindcss@latest", "-i", tailwindSrc, "-o", "./dist/global.css", "--watch", "--no-autoprefixer", "--postcss", tailwindPostcss, "--config", tailwindConfig], { stdio: "inherit" });
    console.info(result);
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

