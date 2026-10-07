const fs = require('fs');

const filePath = 'src/components/products/products-client.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Strip UTF-8 BOM if present
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.slice(1);
}

// Fix corrupted characters
// Line 27: e.g. "€2.30 – €4.30 / kg"
content = content.replace(/\/\/ e\.g\. .*\r?\n/, '// e.g. "€2.30 – €4.30 / kg"\n');

// Line 85: split on dash/em-dash
content = content.replace(/post\.title\?\.split\('[^']+'\)\[0\]/, "post.title?.split(/\\s*[-—–]\\s*/)[0]");

// Line 158: currency symbols
content = content.replace("group.currency === 'GBP' ? 'Â£' : 'â‚¬'", "group.currency === 'GBP' ? '£' : '€'");

// Line 163: price range dash
content = content.replace(/ \+ ' [^']+ ' \+ symbol \+ overallMax/, " + ' – ' + symbol + overallMax");

// Line 347: fish emoji
content = content.replace(/<div className="text-4xl mb-4">.*<\/div>/, '<div className="text-4xl mb-4">🐟</div>');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Encoding clean up complete.');
