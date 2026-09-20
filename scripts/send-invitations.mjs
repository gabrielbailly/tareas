import admin from "firebase-admin";
import nodemailer from "nodemailer";
const raw=process.env.FIREBASE_SERVICE_ACCOUNT, password=process.env.GMAIL_APP_PASSWORD;
if(!raw||!password) throw new Error("Faltan secrets de GitHub.");
admin.initializeApp({credential:admin.credential.cert(JSON.parse(raw))});
const db=admin.firestore();
const transport=nodemailer.createTransport({host:"smtp.gmail.com",port:465,secure:true,auth:{user:"dev@alcaste-lasfuentes.com",pass:password.replace(/\s/g,"")}});
const snap=await db.collection("invites").where("status","==","pending").get();
let sent=0;
for(const d of snap.docs){
 const x=d.data(); if(x.emailSent===true||!x.email) continue;
 const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 try{
  const info=await transport.sendMail({
   from:'"TareasPlus" <dev@alcaste-lasfuentes.com>',to:x.email,
   subject:`Invitación a ${x.projectName} en TareasPlus`,
   text:`${x.invitedByName||"Un usuario"} te ha invitado a colaborar en "${x.projectName}".\n\nhttps://gabrielbailly.github.io/tareas/`,
   html:`<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#14233b"><h2 style="color:#1769ed">TareasPlus</h2><p><strong>${safe(x.invitedByName||"Un usuario")}</strong> te ha invitado a colaborar en <strong>${safe(x.projectName)}</strong>.</p><p style="margin:28px 0"><a href="https://gabrielbailly.github.io/tareas/" style="background:#1769ed;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px">Abrir TareasPlus</a></p><p style="font-size:13px;color:#68768b">Accede con ${safe(x.email)}.</p></div>`
  });
  await d.ref.update({emailSent:true,emailSentAt:admin.firestore.FieldValue.serverTimestamp(),emailMessageId:info.messageId}); sent++;
 }catch(e){console.error(x.email,e.message);await d.ref.update({emailLastError:String(e.message).slice(0,500),emailLastAttemptAt:admin.firestore.FieldValue.serverTimestamp()});}
}
console.log(`Invitaciones enviadas: ${sent}`);
