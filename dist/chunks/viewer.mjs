import express from 'express';

async function main({ port = 3e3 }) {
  const app = express();
  app.use("/dist/dist", express.static("./dist"));
  app.use("/dist/images", express.static("./images"));
  app.use("/dist", express.static("./dist"));
  app.use(express.static("./node_modules/@vivliostyle/viewer/lib"));
  console.log(
    `preview: http://localhost:${port}/index.html#src=/dist/publication.json&bookMode=true&renderAllPages=true&style=/dist/global.css&style=data:,/*%3Cviewer%3E*/%40page%7Bsize%3AJIS-B5%3B%7D/*%3C/viewer%3E*/&f=epubcfi(/6!)`
  );
  app.listen(port);
  return app;
}

export { main as default };