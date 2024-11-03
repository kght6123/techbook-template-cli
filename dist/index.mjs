import { createJiti } from "../node_modules/jiti/lib/jiti.mjs";

const jiti = createJiti(import.meta.url, {
  "interopDefault": true,
  "alias": {
    "techbook-template-cli": "/Volumes/Develop/techbook-template-cli"
  },
  "transformOptions": {
    "babel": {
      "plugins": []
    }
  }
})

/** @type {import("/Volumes/Develop/techbook-template-cli/src/index.js")} */
const _module = await jiti.import("/Volumes/Develop/techbook-template-cli/src/index.ts");

export default _module;