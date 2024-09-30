const fs = require("fs").promises;
const path = require("path");

const SRC_DIR = path.resolve(__dirname, "..", "src");
const OUT_PATH = path.resolve(__dirname, "..", "template.tpl");

const SECTIONS = {
  "___TERMS_OF_SERVICE___": "terms-of-service.txt",
  "___INFO___": "info.json",
  "___TEMPLATE_PARAMETERS___": "template-params.json",
  "___WEB_PERMISSIONS___": "web-permissions.json",
  "___SANDBOXED_JS_FOR_WEB_TEMPLATE___": "index.js",
  "___TESTS___": "tests.yaml",
}

async function build() {
  let templateContent = "";
  for (const [section, filename] of Object.entries(SECTIONS)) {
    const content = await fs.readFile(path.join(SRC_DIR, filename), "utf8");
    templateContent += `${section}\n\n${content.trim()}\n\n`;
  }

  await fs.writeFile(OUT_PATH, templateContent);
  console.log("Template written to", OUT_PATH);
}

build();
