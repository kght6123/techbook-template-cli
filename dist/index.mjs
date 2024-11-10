import { Command } from 'commander';
import spawn from 'cross-spawn';
import waitOn from 'wait-on';

console.log("Hello, world!", process.argv);
const program = new Command();
program.name("techbook-template-cli").description("TechBook Template CLI utilities.").version((await import('./chunks/package.mjs')).version);
program.command("dev").description("techbook dev server").option("-ph, --h3-port <port>", "h3 server port number", "3000").option("-ps, --sync-port <port>", "sync port number", "3001").option("-kdp, --kindle-direct-print <kindleDirectPrint>", "kindle direct print mode", "false").action(
  async ({ h3Port, syncPort }) => {
    console.info("dev", h3Port, syncPort);
    const main = (await import('./chunks/main.mjs')).default;
    main();
    (await import('chokidar')).watch(["docs/"]).on("add", async (event, path) => {
      console.info(event, path);
      main();
    }).on("change", async (event, path) => {
      console.info(event, path);
      main();
    }).on("unlink", async (event, path) => {
      console.info(event, path);
      main();
    });
  }
);
program.command("build").description("techbook build pdf").action(async () => {
  console.info("build");
});
program.command("kdp").description("techbook build pdf for kindle direct publishing").action(async () => {
  console.info("kdp");
});
program.command("viewer").description("techbook viewer").option("-p, --port <port>", "express server port number", "3000").action(async ({ port }) => {
  console.info("viewer");
  await (await import('./chunks/viewer.mjs')).default({ port: parseInt(port) });
});
program.command("tailwind").description("techbook tailwind").option("-s, --src <src>", "tailwind src file name", "global.css").action(async ({ src }) => {
  console.info("tailwind");
  await waitOn({
    interval: 500,
    resources: [
      "./dist/lockfile"
    ]
  });
  const result = spawn.sync("npx", ["--yes", "tailwindcss@latest", "-i", `./src/${src}`, "-o", "./dist/global.css", "--watch", "--no-autoprefixer", "--postcss", "./postcss.config.cjs"], { stdio: "inherit" });
  console.info(result);
});
program.command("browser").description("techbook browser").option("-p, --port <port>", "browser sync port number", "3001").option("-pp, --proxy-port <proxyPort>", "browser proxy port number", "3000").action(async ({ port, proxyPort }) => {
  console.info("browser");
  await waitOn({
    interval: 500,
    resources: [
      "./dist/global.css",
      "./dist/lockfile"
    ]
  });
  const bs = await import('browser-sync');
  bs.init({
    ui: false,
    port: parseInt(port),
    files: [
      "dist/lockfile",
      "dist/global.css",
      "images/*"
    ],
    reloadDelay: 4e3,
    reloadThrottle: 4e3,
    startPath: "/index.html#src=/dist/publication.json&bookMode=true&renderAllPages=true&style=/dist/global.css",
    browser: "google chrome",
    injectChanges: false,
    proxy: {
      target: `localhost:${proxyPort}`,
      proxyReq: [
        (proxyReq) => {
          proxyReq.setHeader("X-Special-Proxy-Header", "foobar");
        }
      ],
      proxyRes: [
        (proxyRes, req, res) => {
          res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0"
          );
          res.setHeader("Pragma", "no-cache");
        }
      ]
    }
  });
});
program.parse();
