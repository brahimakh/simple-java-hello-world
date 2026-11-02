// Builds a single self-contained HTML file that runs by double-click (file://), without Node or a server.
import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
const bundle=await build({entryPoints:['src/app.ts'],bundle:true,format:'iife',target:'es2022',minify:true,write:false,charset:'utf8',legalComments:'none'});
const js=bundle.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const css=(await Promise.all(['style.css','onboarding.css','atelier.css','learning.css','effects.css','views.css','mobile.css'].map(f=>readFile(`src/${f}`,'utf8')))).join('\n');
let html=await readFile('src/index.html','utf8');
html=html.replace(/<link rel="stylesheet" href="\/[a-z-]+\.css">/g,'').replace('</head>',`<style>${css}</style></head>`).replace('<script type="module" src="/app.js"></script>',()=>`<script>${js}</script>`);
await writeFile('Resonance-Industrielle.html',html);
console.log(`Resonance-Industrielle.html : ${(html.length/1024).toFixed(0)} Ko, autonome (aucune ressource externe).`);
