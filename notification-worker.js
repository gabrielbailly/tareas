const APP_ID="c83e67e2-505f-4970-8e3e-f1f352037ab3";
const FIREBASE_PROJECT="tareas-6e2c1";
const FIREBASE_API_KEY="AIzaSyDca0zhf5ECMHG3tIuKqpcTnO1vGHY0uh4";
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

  // Verify the Firebase ID token with Firebase Auth REST.
  // The previous version used Google's generic tokeninfo endpoint, which is not
  // the correct verifier for Firebase Secure Token ID tokens and could reject
  // otherwise valid signed-in users.
  const vr=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({idToken})
  });
  if(!vr.ok){
    const detail=await vr.text();
    return Response.json({ok:false,stage:"firebase-auth",detail},{status:401,headers});
  }
  const authData=await vr.json();
  const callerUid=authData.users?.[0]?.localId;
  if(!callerUid||callerUid!==creator)
    return Response.json({ok:false,stage:"authorization",message:"Only task creator may notify"},{status:403,headers});

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

  if(!env.ONESIGNAL_REST_API_KEY)
    return Response.json({ok:false,stage:"config",message:"Missing ONESIGNAL_REST_API_KEY"},{status:500,headers});

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
  const resultText=await push.text();
  let result; try{result=JSON.parse(resultText)}catch{result={raw:resultText}}
  return Response.json({ok:push.ok,stage:"onesignal",recipients:assignees,result},{status:push.status,headers});
 }
};
