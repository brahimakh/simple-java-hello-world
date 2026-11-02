import {copyFile,mkdir} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const file of ['index.html','style.css','onboarding.css','atelier.css','learning.css','effects.css','views.css','mobile.css'])await copyFile(`src/${file}`,`dist/${file}`);
console.log('Jeu compilé dans dist/. Aucune ressource distante.');
