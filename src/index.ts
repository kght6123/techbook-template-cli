import { Command } from "commander";

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
  .option("-ph, --h3-port <port>", "h3 server port number", "3000")
  .option("-ps, --sync-port <port>", "sync port number", "3001")
  .option("-kdp, --kindle-direct-print", "kindle direct print mode", "false")
  .action(
    async ({ h3Port, syncPort }: { h3Port: string; syncPort: string }) => {
      console.info("build", h3Port, syncPort);
      const main = (await import("./main")).default;
      main();
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
  .option("-s, --src <src>", "tailwind src file name", "global.css")
  .action(async ({ src }: { src: string }) => {
    console.info("tailwind");
    await (await import("wait-on")).default({
      interval: 500,
      resources: [
        "./dist/lockfile",
      ],
    });
    const result = (await import("cross-spawn")).default.sync("npx", ["--yes", "tailwindcss@latest", "-i", `./src/${src}`, "-o", "./dist/global.css", "--watch", "--no-autoprefixer", "--postcss", "./postcss.config.cjs"], { stdio: "inherit" });
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

