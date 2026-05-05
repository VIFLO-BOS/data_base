const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      results.push(file);
    }
  });
  return results;
}

const files = walk("apps/frontend");
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  // Replace font-[\x27Figtree\x27], font-[\x27Poppins\x27], font-[\x27Inter\x27]
  const regex = /font-\[\x27(?:Figtree|Poppins|Inter)\x27\]/g;
  if (regex.test(content)) {
    content = content.replace(regex, "");
    // cleanup extra spaces caused by removal
    content = content.replace(/  +/g, " ");
    content = content.replace(/ \x22/g, "\x22");
    fs.writeFileSync(file, content);
    changedFiles++;
  }
});
console.log("Updated " + changedFiles + " files.");
