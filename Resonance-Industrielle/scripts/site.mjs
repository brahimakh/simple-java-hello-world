// Builds site/: the installable web version (one bundled script, styles, manifest, offline cache), for GitHub Pages.
import {build} from 'esbuild';
import {mkdir,copyFile,readFile,writeFile,rm} from 'node:fs/promises';
await rm('site',{recursive:true,force:true});await mkdir('site',{recursive:true});
await build({entryPoints:['src/app.ts'],bundle:true,format:'esm',target:'es2022',minify:true,outfile:'site/app.js',charset:'utf8',legalComments:'none'});
for(const f of ['index.html','style.css','onboarding.css','atelier.css','learning.css','effects.css','views.css','mobile.css','manifest.webmanifest','sw.js','icon.svg','icon-maskable.svg'])await copyFile(`src/${f}`,`site/${f}`);
const version=JSON.parse(await readFile('package.json','utf8')).version;
await writeFile('site/sw.js',(await readFile('site/sw.js','utf8')).replace(/resonance-[\d.]+/,'resonance-'+version));
await writeFile('site/.nojekyll','');
console.log('site/ prêt : version web installable '+version+'.');
