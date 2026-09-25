const fs = require('fs');
const path = require('path');

const indexHtmlPath = 'frontend/index.html';
const sitemapPath = 'frontend/public/sitemap.xml';
const robotsPath = 'frontend/public/robots.txt';
const footerPath = 'frontend/src/components/Footer.jsx';
const vercelPath = 'vercel.json';

// 1. Update vercel.json for rewrites
let vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
if (!vercel.rewrites) vercel.rewrites = [];
if (!vercel.rewrites.some(r => r.source === '/(.*)' && r.destination === '/index.html')) {
  // Move api rewrite to the top to ensure it hits first
  vercel.rewrites = vercel.rewrites.filter(r => r.source !== '/(.*)');
  vercel.rewrites.push({ source: '/(.*)', destination: '/index.html' });
  fs.writeFileSync(vercelPath, JSON.stringify(vercel, null, 2));
}

// 2. Update robots.txt
const robotsContent = `User-agent: *
Allow: /
Disallow: /api/
Crawl-delay: 2

Sitemap: https://rudra.dophera.tech/sitemap.xml
`;
fs.writeFileSync(robotsPath, robotsContent);

// 3. Update Footer.jsx
let footerContent = fs.readFileSync(footerPath, 'utf8');
if (!footerContent.includes('seo-footer-text')) {
  const seoHtml = `
      <div className="seo-footer-text" style={{ textAlign: 'center', maxWidth: '800px', margin: '20px auto', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        <p><strong>Backbenchers</strong> is the premier student-built study portal for <strong>JK Lakshmipat University (JKLU)</strong>. We provide comprehensive B.Tech study materials, including <strong>previous year question papers (PYQs)</strong>, handwritten notes, formulas, and exam preparation resources. Created by <strong>Rudrapal Singh Shekhawat</strong> (Dophera), this platform helps JKLU students access everything they need to excel in their semester exams.</p>
      </div>`;
  footerContent = footerContent.replace('<p className="footer-copyright">', seoHtml + '\n      <p className="footer-copyright">');
  fs.writeFileSync(footerPath, footerContent);
}

// 4. Extract Subjects for Sitemap and index.html
const subjectsDataPath = 'frontend/src/data/subjects.js';
const subjectsCode = fs.readFileSync(subjectsDataPath, 'utf8');
// Extract code and name using regex since it's an ES module and hard to require directly without Babel
const subjectRegex = /code:\s*'([^']+)',\s*name:\s*'([^']+)'/g;
const subjects = [];
let match;
while ((match = subjectRegex.exec(subjectsCode)) !== null) {
  if (!subjects.some(s => s.code === match[1])) {
    subjects.push({ code: match[1], name: match[2] });
  }
}

// Generate sitemap
let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://rudra.dophera.tech/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
`;
for (let i = 1; i <= 8; i++) {
  sitemapContent += `  <url><loc>https://rudra.dophera.tech/semester/${i}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
}
subjects.forEach(sub => {
  sitemapContent += `  <url><loc>https://rudra.dophera.tech/subject/${sub.code}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
});
sitemapContent += `</urlset>`;
fs.writeFileSync(sitemapPath, sitemapContent);

// 5. Update index.html
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// Replace basic meta tags
indexHtml = indexHtml.replace(
  '<meta name="description" content="Backbenchers is the JK Lakshmipat University student study hub for B.Tech notes, previous-year question papers, formulas, and exam preparation resources.">',
  '<meta name="description" content="Backbenchers is the premier JK Lakshmipat University (JKLU) student study hub. Access B.Tech notes, previous year question papers (PYQs), formulas, and exam preparation resources. Built by Rudra (Dophera).">\n    <meta name="keywords" content="JKLU, JK Lakshmipat University, JKLU previous year question papers, JKLU PYQ, Backbenchers JKLU, Rudra, Dophera, JKLU B.Tech notes, JKLU study materials">\n    <meta name="author" content="Rudrapal Singh Shekhawat (Rudra / Dophera)">'
);

// Add Noscript and JSON-LD before </body>
if (!indexHtml.includes('<noscript id="seo-content">')) {
  let noscriptContent = `
    <!-- SEO Fallback Content for Crawlers -->
    <noscript id="seo-content">
      <div style="padding: 20px; font-family: sans-serif;">
        <h1>Backbenchers - JK Lakshmipat University (JKLU) Study Portal</h1>
        <p>Welcome to Backbenchers, the ultimate student-built study portal for JK Lakshmipat University (JKLU) B.Tech students. Created by Rudrapal Singh Shekhawat (Dophera).</p>
        <h2>Previous Year Question Papers (PYQs) and Notes</h2>
        <p>Access our comprehensive collection of previous year question papers, notes, and study materials for all semesters and subjects at JKLU.</p>
        <ul>
          <li><a href="/semester/1">Semester 1 Subjects</a></li>
          <li><a href="/semester/2">Semester 2 Subjects</a></li>
          <li><a href="/semester/3">Semester 3 Subjects</a></li>
          <li><a href="/semester/4">Semester 4 Subjects</a></li>
          <li><a href="/semester/5">Semester 5 Subjects</a></li>
          <li><a href="/semester/6">Semester 6 Subjects</a></li>
          <li><a href="/semester/7">Semester 7 Subjects</a></li>
          <li><a href="/semester/8">Semester 8 Subjects</a></li>
        </ul>
        <h3>Available Subjects</h3>
        <ul>
`;
  subjects.forEach(sub => {
    noscriptContent += `          <li><a href="/subject/${sub.code}">${sub.code} - ${sub.name} Previous Year Question Papers</a></li>\n`;
  });
  noscriptContent += `        </ul>
      </div>
    </noscript>
`;

  const jsonLd = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollegeOrUniversity",
          "@id": "https://rudra.dophera.tech/#jklu",
          "name": "JK Lakshmipat University",
          "alternateName": "JKLU",
          "url": "https://jklu.edu.in/"
        },
        {
          "@type": "WebApplication",
          "@id": "https://rudra.dophera.tech/#webapp",
          "name": "Backbenchers",
          "url": "https://rudra.dophera.tech/",
          "description": "Student study portal for JKLU B.Tech notes and previous year question papers.",
          "applicationCategory": "EducationalApplication",
          "creator": {
            "@type": "Person",
            "name": "Rudrapal Singh Shekhawat",
            "alternateName": ["Rudra", "Dophera"]
          },
          "provider": {
            "@id": "https://rudra.dophera.tech/#jklu"
          }
        },
        {
          "@type": "WebSite",
          "@id": "https://rudra.dophera.tech/#website",
          "url": "https://rudra.dophera.tech/",
          "name": "Backbenchers | JKLU B.Tech Notes & PYQs",
          "publisher": {
            "@id": "https://rudra.dophera.tech/#webapp"
          }
        }
      ]
    }
    </script>
`;

  // Remove the old JSON-LD
  indexHtml = indexHtml.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '');
  
  indexHtml = indexHtml.replace('</body>', jsonLd + noscriptContent + '  </body>');
  fs.writeFileSync(indexHtmlPath, indexHtml);
}

console.log('SEO files generated and updated successfully');
