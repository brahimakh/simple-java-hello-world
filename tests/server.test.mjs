import {test} from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createApp} from '../scripts/server.mjs';
test('serveur local : HTML, modules compilés, CSS et aucun fichier source exposé',async()=>{
 const server=createApp();server.listen(0,'127.0.0.1');await once(server,'listening');
 const base=`http://127.0.0.1:${server.address().port}`;
 try{
   for(const name of ['/','/app.js','/engine.js','/content.js','/save.js','/style.css','/i18n.js','/onboarding.js','/guide-view.js','/onboarding.css']){const response=await fetch(base+name);assert.equal(response.status,200,name);assert.ok((await response.text()).length>100);assert.match(response.headers.get('content-security-policy'),/connect-src 'self'/);}
   assert.equal((await fetch(base+'/PROMPT-REFERENCE.md')).status,404);
   assert.equal((await fetch(base+'/%2e%2e%2fpackage.json')).status,403);
   assert.equal(await (await fetch(base+'/__resonance_health')).text(),'resonance-industrielle-v1');
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
