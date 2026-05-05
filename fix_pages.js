const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('c:/annotator-platform/apps/frontend/app/(dashboard)', function(filePath) {
  if (filePath.endsWith('page.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Remove imports
    content = content.replace(/import \{ Sidebar \} from '[^']+';\n?/g, '');
    content = content.replace(/import \{ TopBar \} from '[^']+';\n?/g, '');
    
    // Remove Sidebar and TopBar components
    content = content.replace(/[ \t]*\{\/\* Sidebar \*\/\}\n[ \t]*<Sidebar \/>\n\n?/g, '');
    content = content.replace(/[ \t]*\{\/\* Top Bar \*\/\}\n[ \t]*<TopBar title="[^"]+" \/>\n\n?/g, '');

    // Fix wrapper
    content = content.replace(/<div className="w-\[1440px\][^"]+">\n/g, '');
    content = content.replace(/[ \t]*\{\/\* Main Content \*\/\}\n[ \t]*<div className="flex-1 inline-flex flex-col justify-start items-start gap-6">\n/g, '<div className="flex-1 flex flex-col justify-start items-start gap-6 w-full">\n');
    
    // Remove one closing div at the end since we removed the outer wrapper
    if (content !== original) {
      content = content.replace(/    <\/div>\n  \);\n}/, '  );\n}');
      fs.writeFileSync(filePath, content);
      console.log('Fixed:', filePath);
    }
  }
});
