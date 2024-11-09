import { version } from "../package.json";
import { Command } from "commander";

console.log('Hello, world!', process.argv);

const program = new Command();

program
  .name("techbook-template-cli")
  .description("TechBook Template CLI utilities.")
  .version(version);

program
  .command("dev")
  .description("techbook dev server")
  .option("-ph, --h3-port <port>", "h3 server port number", "3000")
  .option("-ps, --sync-port <port>", "sync port number", "3001")
  .action(
    async ({ h3Port, syncPort }: { h3Port: string; syncPort: string }) => {
      console.log("dev", h3Port, syncPort);
    },
  );

program
  .command("build")
  .description("techbook build pdf")
  .action(async () => {
    console.log("build");
  });

program
  .command("kdp")
  .description("techbook build pdf for kindle direct publishing")
  .action(async () => {
    console.log("kdp");
  });

program
  .command("viewer")
  .description("techbook viewer")
  .option("-p, --port <port>", "express server port number", "3000")
  .action(async ({ port }: { port: string }) => {
    console.log("viewer");
    await (await import("./viewer")).default({ port: parseInt(port) });
  });

program.parse();

