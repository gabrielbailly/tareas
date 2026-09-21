const APP_ID="c83e67e2-505f-4970-8e3e-f1f352037ab3";
const FIREBASE_PROJECT="tareas-6e2c1";
const ALLOWED_ORIGIN="https://gabrielbailly.github.io";

function cors(origin){
  return {
    "Access-Control-Allow-Origin": origin===ALLOWED_ORIGIN?origin:ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers":"Authorization, Content-Type",
    "Access-Control-Allow-Methods":"POST, OPTIONS",
    "Vary":"Origin"
  };
}
function field(f){
  if(!f)return null;
  return f.stringValue ?? f.booleanValue ?? f.integerValue ?? null;
}
function stringArray(f){
  return (f?.arrayValue?.values||[]).map(v=>v.stringValue).filter(Boolean);
}

export default {
 async fetch(request,env){
  const origin=request.headers.get("Origin")||"";
  const headers=cors(origin);
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers});
  const url=new URL(request.url);
  if(url.pathname!=="/task-assigned"||request.method!=="POST")
    return new Response("Not found",{status:404,headers});

  const auth=request.headers.get("Authorization");
  if(!auth?.startsWith("Bearer "))return new Response("Unauthorized",{status:401,headers});
  const idToken=auth.slice(7);
  let body;
  try{body=await request.json()}catch{return new Response("Bad request",{status:400,headers})}
  if(!body.taskId)return new Response("Missing taskId",{status:400,headers});

  // Read through Firestore REST using the caller's Firebase ID token.
  // Firestore security rules therefore decide whether this signed-in user may read the task.
  const taskUrl=`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/tasks/${encodeURIComponent(body.taskId)}`;
  const tr=await fetch(taskUrl,{headers:{Authorization:`Bearer ${idToken}`}});
  if(!tr.ok)return new Response("Task not accessible",{status:403,headers});
  const task=await tr.json(), f=task.fields||{};
  const creator=field(f.createdBy);
  const assignees=stringArray(f.assigneeIds).filter(id=>id&&id!==creator);
  if(!assignees.length)return Response.json({sent:false,reason:"no-other-assignees"},{headers});

  // Only the creator can trigger the assignment notification.
  // Verify caller UID from Firebase's tokeninfo endpoint.
  const vr=await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if(!vr.ok)return new Response("Invalid token",{status:401,headers});
  const claims=await vr.json();
  if(claims.sub!==creator||claims.aud!==FIREBASE_PROJECT)
    return new Response("Only task creator may notify",{status:403,headers});

  let projectName="TareasPlus";
  const pid=field(f.projectId);
  if(pid){
    const pr=await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/projects/${encodeURIComponent(pid)}`,{headers:{Authorization:`Bearer ${idToken}`}});
    if(pr.ok){const p=await pr.json();projectName=field(p.fields?.name)||projectName}
  }

  const title=field(f.title)||"Nueva tarea";
  const due=field(f.date);
  const priority=field(f.priority)||"Normal";
  const contents=due
    ? `${title} · ${projectName} · vence ${due}`
    : `${title} · ${projectName}`;

  const push=await fetch("https://api.onesignal.com/notifications",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Key ${env.ONESIGNAL_REST_API_KEY}`
    },
    body:JSON.stringify({
      app_id:APP_ID,
      target_channel:"push",
      include_aliases:{external_id:assignees},
      headings:{es:"Nueva tarea asignada",en:"New task assigned"},
      contents:{es:contents,en:contents},
      url:"https://gabrielbailly.github.io/tareas/",
      data:{type:"task_assigned",taskId:body.taskId,projectId:pid,priority}
    })
  });
  const result=await push.text();
  return new Response(result,{status:push.status,headers:{...headers,"Content-Type":"application/json"}});
 }
};
