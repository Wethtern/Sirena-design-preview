module.exports = async function(req,res){
if(req.method!=='POST')return res.status(405).json({ok:false});
const token=process.env.TELEGRAM_BOT_TOKEN,chat=process.env.TELEGRAM_CHAT_ID;
if(!token||!chat)return res.status(503).json({ok:false,error:'Приём заявок пока не подключён.'});
let b=req.body;try{if(typeof b==='string')b=JSON.parse(b)}catch{return res.status(400).json({ok:false})}
if(!b||typeof b!=='object')return res.status(400).json({ok:false});
const fields=['name','phone','date','city','type','comment'];const v={};for(const k of fields){v[k]=typeof b[k]==='string'?b[k].trim():'';if(v[k].length>(k==='comment'?1000:120))return res.status(400).json({ok:false})}
if(fields.slice(0,5).some(k=>!v[k])||!/^\+?[\d\s()\-]{7,25}$/.test(v.phone)||!/^\d{4}-\d{2}-\d{2}$/.test(v.date)||b.website)return res.status(400).json({ok:false,error:'Проверьте поля формы.'});
try{const response=await fetch('https://api.telegram.org/bot'+token+'/sendMessage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chat,text:['SIRENA LIVE — новая заявка','Имя: '+v.name,'Телефон: '+v.phone,'Дата: '+v.date,'Город: '+v.city,'Мероприятие: '+v.type,'Комментарий: '+v.comment].join('\n')})});const result=await response.json();if(!response.ok||!result.ok)throw Error();return res.status(200).json({ok:true})}catch{return res.status(502).json({ok:false,error:'Не удалось отправить заявку. Попробуйте позже.'})}
};