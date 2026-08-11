import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const json = (res, status, body) => res.status(status).json(body)
const now = () => new Date().toISOString()

let initialized = false
async function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL ausente')
  const sql = neon(process.env.DATABASE_URL)
  if (!initialized) {
    await sql`CREATE TABLE IF NOT EXISTS users (id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, bio TEXT, profile_image_url TEXT, banner_image_url TEXT, banner_position INTEGER NOT NULL DEFAULT 50, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`
    await sql`CREATE TABLE IF NOT EXISTS task_templates (id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, title TEXT NOT NULL, description TEXT, type TEXT NOT NULL DEFAULT 'POSITIVE', recurrence_type TEXT NOT NULL DEFAULT 'DAILY', days_of_week TEXT, active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`
    await sql`CREATE TABLE IF NOT EXISTS tasks (id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, title TEXT NOT NULL, description TEXT, date DATE NOT NULL, completed BOOLEAN NOT NULL DEFAULT FALSE, interacted BOOLEAN NOT NULL DEFAULT FALSE, skipped BOOLEAN NOT NULL DEFAULT FALSE, type TEXT NOT NULL DEFAULT 'POSITIVE', source_template_id BIGINT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(user_id, date, source_template_id))`
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0`
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS best_streak INTEGER NOT NULL DEFAULT 0`
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_completed_date DATE`
    await sql`CREATE TABLE IF NOT EXISTS follows (follower_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, following_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY(follower_id, following_id), CHECK(follower_id <> following_id))`
    initialized = true
  }
  return sql
}

function tokenFor(user) { return jwt.sign({ sub: String(user.id) }, process.env.JWT_SECRET, { expiresIn: '30d' }) }
async function currentUser(req, sql) {
  const raw = req.headers.authorization || ''
  if (!raw.startsWith('Bearer ')) return null
  try {
    const decoded = jwt.verify(raw.slice(7), process.env.JWT_SECRET)
    const rows = await sql.query('SELECT * FROM users WHERE id = $1', [decoded.sub])
    return rows[0] || null
  } catch { return null }
}
function publicUser(user) { return { id: Number(user.id), name: user.name, email: user.email, bio: user.bio, createdAt: user.created_at, profileImageUrl: user.profile_image_url, bannerImageUrl: user.banner_image_url, bannerPosition: user.banner_position ?? 50 } }
function taskOut(t) { return { id:Number(t.id), title:t.title, description:t.description, date:String(t.date).slice(0,10), completed:t.completed, interacted:t.interacted, type:t.type, sourceTemplateId:t.source_template_id, createdAt:t.created_at, updatedAt:t.updated_at } }
function templateOut(t) { return { id:Number(t.id), title:t.title, description:t.description, type:t.type, recurrenceType:t.recurrence_type, daysOfWeek:t.days_of_week, active:t.active, createdAt:t.created_at, updatedAt:t.updated_at } }
async function body(req) { return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}) }
async function requireUser(req, res, sql) { const u = await currentUser(req, sql); if (!u) { json(res, 401, { message:'Não autenticado' }); return null } return u }
async function generateRecurring(sql, userId, date) {
  const templates = await sql.query('SELECT * FROM task_templates WHERE user_id=$1 AND active=true', [userId])
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay() || 7
  for (const t of templates) {
    if (t.recurrence_type === 'WEEKLY' && !(t.days_of_week || '').split(',').includes(String(weekday))) continue
    await sql.query('INSERT INTO tasks(user_id,title,description,date,type,source_template_id) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(user_id,date,source_template_id) DO NOTHING', [userId,t.title,t.description,date,t.type,t.id])
  }
}
const isoDate = d => d.toISOString().slice(0,10)
const pct = r => Number(r.denominator) > 0 && Number(r.interacted) > 0 ? Math.round(Number(r.good) * 100 / Number(r.denominator)) : null
async function daily(sql,userId,start,end){ return sql.query(`SELECT date, COUNT(*) FILTER (WHERE type='POSITIVE' OR (type='NEGATIVE' AND completed AND interacted)) denominator, COUNT(*) FILTER (WHERE (type='POSITIVE' AND completed AND interacted) OR (type='NEGATIVE' AND NOT completed AND interacted)) good, COUNT(*) FILTER (WHERE interacted) interacted FROM tasks WHERE user_id=$1 AND date BETWEEN $2 AND $3 AND skipped=false GROUP BY date ORDER BY date`,[userId,start,end]) }
async function streakData(sql,userId){
  const today=new Date(), todayS=isoDate(today), rows=await daily(sql,userId,'2000-01-01',todayS), good=new Set(rows.filter(r=>(pct(r)??0)>=50).map(r=>String(r.date).slice(0,10)))
  let current=0, cursor=new Date(today); while(good.has(isoDate(cursor))){current++;cursor.setUTCDate(cursor.getUTCDate()-1)}
  let best=0,run=0,last=null; for(const r of rows){const ds=String(r.date).slice(0,10);if((pct(r)??0)>=50){run=last&&((new Date(ds)-new Date(last))/86400000===1)?run+1:1;best=Math.max(best,run);last=ds}else run=0}
  const dow=(today.getUTCDay()+6)%7, monday=new Date(today);monday.setUTCDate(today.getUTCDate()-dow); const names=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']; const weekDays=names.map((dayName,i)=>{const d=new Date(monday);d.setUTCDate(monday.getUTCDate()+i);const ds=isoDate(d);return{date:ds,dayName,completed:good.has(ds),isToday:ds===todayS,isFuture:d>today}})
  const lastCompletedDate=good.has(todayS)?todayS:(last||null); await sql.query('UPDATE users SET current_streak=$1,best_streak=GREATEST(best_streak,$2),last_completed_date=$3 WHERE id=$4',[current,best,lastCompletedDate,userId])
  return{currentStreak:current,bestStreak:best,lastCompletedDate,completedToday:good.has(todayS),weekDays}
}

export default async function handler(req, res) {
  try {
    const sql = await db()
    const path = new URL(req.url, 'http://localhost').pathname.replace(/^\/api/, '') || '/'
    const method = req.method

    if (path === '/auth/register' && method === 'POST') {
      const b = await body(req); if (!b.name || !b.email || !b.password || b.password.length < 6) return json(res, 400, { message:'Dados inválidos' })
      const exists = await sql.query('SELECT id FROM users WHERE lower(email)=lower($1)', [b.email]); if (exists.length) return json(res,409,{message:'E-mail já cadastrado'})
      const password = await bcrypt.hash(b.password, 12); const rows = await sql.query('INSERT INTO users(name,email,password) VALUES($1,$2,$3) RETURNING *',[b.name,b.email,password]); const u=rows[0]
      return json(res,201,{ token:tokenFor(u), userId:Number(u.id), name:u.name, email:u.email, profileImageUrl:null })
    }
    if (path === '/auth/login' && method === 'POST') {
      const b=await body(req); const rows=await sql.query('SELECT * FROM users WHERE lower(email)=lower($1)',[b.email||'']); const u=rows[0]
      if (!u || !(await bcrypt.compare(b.password||'',u.password))) return json(res,401,{message:'E-mail ou senha inválidos'})
      return json(res,200,{token:tokenFor(u),userId:Number(u.id),name:u.name,email:u.email,profileImageUrl:u.profile_image_url})
    }
    const user = await requireUser(req,res,sql); if (!user) return
    const id = Number(user.id)

    if (path === '/users/me') {
      if (method === 'GET') return json(res,200,publicUser(user))
      if (method === 'PUT') { const b=await body(req); const rows=await sql.query('UPDATE users SET name=$1,email=$2,bio=$3 WHERE id=$4 RETURNING *',[b.name||user.name,b.email||user.email,b.bio??null,id]); return json(res,200,publicUser(rows[0])) }
    }
    if (path === '/users/me/password' && method === 'PUT') { const b=await body(req); if (!(await bcrypt.compare(b.currentPassword||'',user.password))) return json(res,400,{message:'Senha atual incorreta'}); await sql.query('UPDATE users SET password=$1 WHERE id=$2',[await bcrypt.hash(b.newPassword||'',12),id]); return json(res,200,{message:'Senha alterada'}) }

    if(path==='/streak'&&method==='GET') return json(res,200,await streakData(sql,id))
    if(path==='/stats/dashboard'&&method==='GET'){
      const today=new Date(),end=isoDate(today),from=new Date(today);from.setUTCDate(today.getUTCDate()-29);const monthStart=end.slice(0,8)+'01',rows=await daily(sql,id,isoDate(from),end),by=new Map(rows.map(r=>[String(r.date).slice(0,10),pct(r)])),last30Days=[]
      for(let i=0;i<30;i++){const d=new Date(from);d.setUTCDate(from.getUTCDate()+i);const ds=isoDate(d);last30Days.push({date:ds,label:ds.slice(8,10)+'/'+ds.slice(5,7),percentage:by.get(ds)??null})}
      const monthRows=rows.filter(r=>String(r.date).slice(0,10)>=monthStart),valid=monthRows.map(pct).filter(v=>v!==null),counts=(await sql.query("SELECT COUNT(*) total, COUNT(*) FILTER (WHERE type='POSITIVE' AND completed AND interacted) completed FROM tasks WHERE user_id=$1 AND date BETWEEN $2 AND $3 AND skipped=false",[id,monthStart,end]))[0],streak=await streakData(sql,id)
      return json(res,200,{scoreHoje:by.get(end)??null,streakAtual:streak.currentStreak,tarefasTotalMes:Number(counts.total),tarefasConcluidasMes:Number(counts.completed),taxaConclusaoMes:valid.length?Math.round(valid.reduce((a,b)=>a+b,0)/valid.length):null,last30Days})
    }
    if(path==='/stats/monthly-performance'&&method==='GET'){
      const today=new Date(),year=today.getUTCFullYear(),rows=await daily(sql,id,`${year}-01-01`,isoDate(today)),names=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],groups=Array.from({length:12},()=>[]);for(const r of rows){const v=pct(r);if(v!==null)groups[new Date(r.date).getUTCMonth()].push(v)}
      return json(res,200,names.map((month,i)=>({month,percentage:i>today.getUTCMonth()?null:(groups[i].length?Math.round(groups[i].reduce((a,b)=>a+b,0)/groups[i].length):null)})))
    }
    if(path==='/social/rankings'&&method==='GET'){
      const rows=await sql.query(`SELECT u.*,COUNT(DISTINCT f.follower_id) followers_count,EXISTS(SELECT 1 FROM follows me WHERE me.follower_id=$1 AND me.following_id=u.id) is_following FROM users u LEFT JOIN follows f ON f.following_id=u.id GROUP BY u.id ORDER BY u.current_streak DESC,u.best_streak DESC,u.id LIMIT 20`,[id]);return json(res,200,rows.map((u,i)=>({id:Number(u.id),name:u.name,initial:(u.name||'?').trim()[0].toUpperCase(),currentStreak:u.current_streak,bestStreak:u.best_streak,rank:i+1,isFollowing:u.is_following,followersCount:Number(u.followers_count),profileImageUrl:u.profile_image_url})))
    }
    const socialProfile=path.match(/^\/social\/profile\/(\d+)$/);if(socialProfile&&method==='GET'){const uid=Number(socialProfile[1]),rows=await sql.query(`SELECT u.*,COUNT(DISTINCT t.id) FILTER(WHERE t.completed AND t.interacted) completed,COUNT(DISTINCT fi.follower_id) followers,COUNT(DISTINCT fo.following_id) following,EXISTS(SELECT 1 FROM follows x WHERE x.follower_id=$1 AND x.following_id=u.id) is_following FROM users u LEFT JOIN tasks t ON t.user_id=u.id LEFT JOIN follows fi ON fi.following_id=u.id LEFT JOIN follows fo ON fo.follower_id=u.id WHERE u.id=$2 GROUP BY u.id`,[id,uid]);if(!rows[0])return json(res,404,{message:'Usuário não encontrado'});const u=rows[0];return json(res,200,{id:Number(u.id),name:u.name,initial:(u.name||'?').trim()[0].toUpperCase(),bio:u.bio,currentStreak:u.current_streak,bestStreak:u.best_streak,totalTasksCompleted:Number(u.completed),isFollowing:u.is_following,followersCount:Number(u.followers),followingCount:Number(u.following),profileImageUrl:u.profile_image_url,bannerImageUrl:u.banner_image_url,bannerPosition:u.banner_position})}
    const follow=path.match(/^\/social\/follow\/(\d+)$/);if(follow&&(method==='POST'||method==='DELETE')){const uid=Number(follow[1]);if(method==='POST'&&uid!==id)await sql.query('INSERT INTO follows(follower_id,following_id) SELECT $1,$2 WHERE EXISTS(SELECT 1 FROM users WHERE id=$2) ON CONFLICT DO NOTHING',[id,uid]);else if(method==='DELETE')await sql.query('DELETE FROM follows WHERE follower_id=$1 AND following_id=$2',[id,uid]);return res.status(204).end()}
    const followList=path.match(/^\/social\/(followers|following)\/(\d+)$/);if(followList&&method==='GET'){const uid=Number(followList[2]),followers=followList[1]==='followers',rows=await sql.query(`SELECT u.*,EXISTS(SELECT 1 FROM follows me WHERE me.follower_id=$1 AND me.following_id=u.id) is_following FROM follows f JOIN users u ON u.id=${followers?'f.follower_id':'f.following_id'} WHERE ${followers?'f.following_id':'f.follower_id'}=$2 ORDER BY u.name`,[id,uid]);return json(res,200,rows.map(u=>({id:Number(u.id),name:u.name,initial:(u.name||'?').trim()[0].toUpperCase(),profileImageUrl:u.profile_image_url,bio:u.bio,isFollowing:u.is_following})))}

    if (path === '/tasks' && method === 'GET') { const date=req.query.date; if (!date) return json(res,400,{message:'Data obrigatória'}); await generateRecurring(sql,id,date); const rows=await sql.query('SELECT * FROM tasks WHERE user_id=$1 AND date=$2 AND skipped=false ORDER BY id',[id,date]); return json(res,200,rows.map(taskOut)) }
    if (path === '/tasks' && method === 'POST') { const b=await body(req); const rows=await sql.query('INSERT INTO tasks(user_id,title,description,date,type,interacted) VALUES($1,$2,$3,$4,$5,true) RETURNING *',[id,b.title,b.description??null,b.date,b.type||'POSITIVE']); return json(res,201,taskOut(rows[0])) }
    const taskMatch=path.match(/^\/tasks\/(\d+)(\/toggle)?$/)
    if (taskMatch) { const taskId=Number(taskMatch[1]); const rows=await sql.query('SELECT * FROM tasks WHERE id=$1 AND user_id=$2',[taskId,id]); if(!rows[0]) return json(res,404,{message:'Tarefa não encontrada'}); let out
      if(method==='PATCH'&&taskMatch[2]) out=(await sql.query('UPDATE tasks SET completed=NOT completed,interacted=true,updated_at=NOW() WHERE id=$1 RETURNING *',[taskId]))[0]
      else if(method==='PUT'){const b=await body(req); out=(await sql.query('UPDATE tasks SET title=$1,description=$2,date=$3,type=$4,interacted=true,updated_at=NOW() WHERE id=$5 RETURNING *',[b.title,b.description??null,b.date,b.type||'POSITIVE',taskId]))[0]}
      else if(method==='DELETE'){ if(rows[0].source_template_id) await sql.query('UPDATE tasks SET skipped=true WHERE id=$1',[taskId]); else await sql.query('DELETE FROM tasks WHERE id=$1',[taskId]); return res.status(204).end() }
      else return json(res,405,{message:'Método não permitido'}); return json(res,200,taskOut(out)) }
    if (path === '/tasks/summary' && method === 'GET') { const y=Number(req.query.year),m=Number(req.query.month); const start=`${y}-${String(m).padStart(2,'0')}-01`; const end=new Date(Date.UTC(y,m,0)).toISOString().slice(0,10); const rows=await sql.query('SELECT date, count(*) FILTER (WHERE interacted) total, count(*) FILTER (WHERE interacted AND completed) completed FROM tasks WHERE user_id=$1 AND date BETWEEN $2 AND $3 AND skipped=false GROUP BY date',[id,start,end]); const out={}; for(const r of rows){const total=Number(r.total),completed=Number(r.completed),percentage=total?Math.round(completed*100/total):0; out[String(r.date).slice(0,10)]={date:String(r.date).slice(0,10),total,completed,percentage,color:percentage>=80?'GREEN':percentage>=60?'LIGHT_GREEN':percentage>=40?'YELLOW':'RED'}} return json(res,200,out) }

    if (path === '/templates' && method === 'GET') { const rows=await sql.query('SELECT * FROM task_templates WHERE user_id=$1 ORDER BY id DESC',[id]); return json(res,200,rows.map(templateOut)) }
    if (path === '/templates' && method === 'POST') { const b=await body(req); const rows=await sql.query('INSERT INTO task_templates(user_id,title,description,type,recurrence_type,days_of_week) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[id,b.title,b.description??null,b.type,b.recurrenceType,b.daysOfWeek??null]); return json(res,201,templateOut(rows[0])) }
    const tmplMatch=path.match(/^\/templates\/(\d+)(\/toggle)?$/)
    if(tmplMatch){const templateId=Number(tmplMatch[1]); const found=await sql.query('SELECT * FROM task_templates WHERE id=$1 AND user_id=$2',[templateId,id]); if(!found[0]) return json(res,404,{message:'Template não encontrado'}); let out
      if(method==='PATCH'&&tmplMatch[2]) out=(await sql.query('UPDATE task_templates SET active=NOT active,updated_at=NOW() WHERE id=$1 RETURNING *',[templateId]))[0]
      else if(method==='PUT'){const b=await body(req); out=(await sql.query('UPDATE task_templates SET title=$1,description=$2,type=$3,recurrence_type=$4,days_of_week=$5,updated_at=NOW() WHERE id=$6 RETURNING *',[b.title,b.description??null,b.type,b.recurrenceType,b.daysOfWeek??null,templateId]))[0]}
      else if(method==='DELETE'){await sql.query('DELETE FROM task_templates WHERE id=$1',[templateId]);return res.status(204).end()} else return json(res,405,{message:'Método não permitido'}); return json(res,200,templateOut(out))}
    return json(res,404,{message:'Rota não encontrada'})
  } catch (error) { console.error(error); return json(res,500,{message:'Erro interno do servidor'}) }
}
