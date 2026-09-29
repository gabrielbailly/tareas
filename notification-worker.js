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
  if(!["/task-assigned","/comment-added"].includes(url.pathname)||request.method!=="POST")
    return new Response("Not found",{status:404,headers});

  const auth=request.headers.get("Authorization");
  if(!auth?.startsWith("Bearer "))return new Response("Unauthorized",{status:401,headers});
  const idToken=auth.slice(7);
  let body;
  try{body=await request.json()}catch{return new Response("Bad request",{status:400,headers})}
  if(!body.taskId)return new Response("Missing taskId",{status:400,headers});

  if(url.pathname==="/comment-added"){
    if(!body.commentId)return new Response("Missing commentId",{status:400,headers});
    const commentUrl=`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/tasks/${encodeURIComponent(body.taskId)}/comments/${encodeURIComponent(body.commentId)}`;
    const cr=await fetch(commentUrl,{headers:{Authorization:`Bearer ${idToken}`}});
    if(!cr.ok)return new Response("Comment not accessible",{status:403,headers});
    const comment=await cr.json(),cf=comment.fields||{};
    const authorId=field(cf.authorId),authorName=field(cf.authorName)||"Alguien",commentText=field(cf.text)||"";

    const vr=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,{
      method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken})
    });
    if(!vr.ok)return Response.json({ok:false,stage:"firebase-auth"},{status:401,headers});
    const authData=await vr.json(),callerUid=authData.users?.[0]?.localId;
    if(!callerUid||callerUid!==authorId)return Response.json({ok:false,stage:"authorization"},{status:403,headers});

    const taskUrl=`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/tasks/${encodeURIComponent(body.taskId)}`;
    const tr=await fetch(taskUrl,{headers:{Authorization:`Bearer ${idToken}`}});
    if(!tr.ok)return new Response("Task not accessible",{status:403,headers});
    const task=await tr.json(),tf=task.fields||{},assignees=stringArray(tf.assigneeIds).filter(id=>id&&id!==authorId);
    if(!assignees.length)return Response.json({sent:false,reason:"no-other-assignees"},{headers});
    if(!env.ONESIGNAL_REST_API_KEY)return Response.json({ok:false,stage:"config",message:"Missing ONESIGNAL_REST_API_KEY"},{status:500,headers});
    const title=field(tf.title)||"Tarea";
    const preview=commentText.length>100?commentText.slice(0,97)+"…":commentText;
    const push=await fetch("https://api.onesignal.com/notifications",{
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":`Key ${env.ONESIGNAL_REST_API_KEY}`},
      body:JSON.stringify({
        app_id:APP_ID,target_channel:"push",include_aliases:{external_id:assignees},
        headings:{es:`${authorName} ha comentado`,en:`${authorName} commented`},
        contents:{es:`${title}: ${preview}`,en:`${title}: ${preview}`},
        url:"https://gabrielbailly.github.io/tareas/",
        data:{type:"comment_added",taskId:body.taskId,commentId:body.commentId}
      })
    });
    const resultText=await push.text();let result;try{result=JSON.parse(resultText)}catch{result={raw:resultText}}
    return Response.json({ok:push.ok,stage:"onesignal",recipients:assignees,result},{status:push.status,headers});
  }

  // Read through Firestore REST using the caller's Firebase ID token.
  // Firestore security rules therefore decide whether this signed-in user may read the task.
  const taskUrl=`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/tasks/${encodeURIComponent(body.taskId)}`;
  const tr=await fetch(taskUrl,{headers:{Authorization:`Bearer ${idToken}`}});
  if(!tr.ok)return new Response("Task not accessible",{status:403,headers});
  const task=await tr.json(), f=task.fields||{};
  const creator=field(f.createdBy);
  const currentAssignees=stringArray(f.assigneeIds);
  const requested=Array.isArray(body.notifyUserIds)?body.notifyUserIds.filter(x=>typeof x==="string"):currentAssignees;
  const assignees=requested.filter(id=>id&&id!==creator&&currentAssignees.includes(id));
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
  if(!callerUid) return Response.json({ok:false,stage:"authorization",message:"Invalid Firebase user"},{status:403,headers});
  // Firestore already allowed this signed-in user to read the task, so the caller is an authorized project member.
  // Notification recipients are constrained to users currently assigned to the task.

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
