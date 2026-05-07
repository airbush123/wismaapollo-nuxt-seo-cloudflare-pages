const html = require('fs').readFileSync('dist/blog/hotel-di-kuala-kurun/index.html', 'utf8');

// The main article container
const articleStart = html.indexOf('<div class="container article">');
const footerStart = html.indexOf('<!-- FOOTER');

const content = html.substring(articleStart, footerStart);
const opens = (content.match(/<div(\s|>)/g) || []).length;
const closes = (content.match(/<\/div>/g) || []).length;

console.log('Opened divs:', opens, 'Closed divs:', closes);
