// Produces the page body published on claude.ai (the viewer adds its own <html>/<head> skeleton).
import {readFile,writeFile} from 'node:fs/promises';
const h=await readFile('Resonance-Industrielle.html','utf8');
const head=h.match(/<head>([\s\S]*?)<\/head>/)[1],body=h.match(/<body>([\s\S]*)<\/body>/)[1];
const style=head.match(/<style>[\s\S]*?<\/style>/)[0].replace('<style>','<style>:root{color-scheme:dark}html,body{background:#070b10}');
await writeFile(process.argv[2]??'resonance-artifact.html','<title>Résonance industrielle</title>\n<meta name="theme-color" content="#070b10">\n'+style+'\n'+body);
