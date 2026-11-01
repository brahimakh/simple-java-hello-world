import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {execFile} from 'node:child_process';
const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const port=4317,host='127.0.0.1',url=`http://${host}:${port}`;
const open=()=>{if(process.argv.includes('--open'))execFile('cmd.exe',['/c','start','',url],{windowsHide:true});};
export const createApp=()=>http.createServer(async(req,res)=>{
 if(req.url==='/__resonance_health'){res.writeHead(200,{'Content-Type':'text/plain'});res.end('resonance-industrielle-v1');return;}
 try{const pathname=decodeURIComponent(new URL(req.url,url).pathname);const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 const data=await readFile(file);res.writeHead(200,{'Content-Type':({'html':'text/html; charset=utf-8','js':'text/javascript; charset=utf-8','css':'text/css; charset=utf-8'})[path.extname(file).slice(1)]??'application/octet-stream','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'"});res.end(data);
 }catch{res.writeHead(404);res.end('Fichier absent. Lancez Demarrer.cmd pour compiler le jeu.');}
});
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 const server=createApp();
 server.on('error',async(e)=>{if(e.code==='EADDRINUSE'){try{const response=await fetch(url+'/__resonance_health');if(await response.text()==='resonance-industrielle-v1'){console.log('Jeu déjà ouvert : '+url);open();return;}}catch{}console.error(`Le port ${port} est utilisé par une autre application. Fermez-la ; le port reste fixe pour préserver les sauvegardes.`);}else console.error(e.message);process.exitCode=1;});
 server.listen(port,host,()=>{console.log(`Résonance industrielle : ${url}\nGardez cette fenêtre ouverte. Ctrl+C arrête le serveur.`);open();});
}
