const {JSDOM}=require('jsdom'),fs=require('fs'),path=require('path'),os=require('os');
const R=p=>path.join(__dirname,'..',p);   // paths relative to the repo root
const STUDIO=R('index.html'),DEMO=R('demo/signoff.html'),SAMPLE=R('src/sample_scenario.json');
let pass=0,fail=0;
const ok=(c,m)=>{c?pass++:(fail++,console.log('FAIL:',m));};

function load(file){
  const dom=new JSDOM(fs.readFileSync(file,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
  if(dom.window.GRADE_DELAY!==undefined)dom.window.GRADE_DELAY=0;   // grade synchronously in tests
  return dom;
}
const toN1=doc=>{for(let i=0;i<5&&!doc.querySelector('.choice');i++)doc.getElementById('go').click();};
const dom=load(DEMO);
const w=dom.window,d=w.document;
ok(!!w.DATA,'DATA parsed');
const sc=w.DATA.scenarios[0];

// single scenario auto-starts
ok(d.getElementById('player').className.indexOf('hidden')<0,'player visible on single scenario');
ok(d.querySelector('.stitle').textContent.includes('What is this scenario about'),'concept intro rendered first');
d.getElementById('go').click();
ok(d.querySelector('.stitle').textContent.includes('Two days'),'brief rendered');
ok(d.querySelectorAll('ol.steps li').length===sc.steps.length,'rail steps rendered');

// walk every choice branch of n1
['A','B','C'].forEach((k,i)=>{
  w.start('signoff');
  toN1(d);                                      // intro -> brief -> room -> n1
  ok(!!d.querySelector('.prompt'),'n1 prompt for '+k);
  const btns=d.querySelectorAll('.choice');
  ok(btns.length===3,'3 choices');
  btns[i].click();
  ok(!!d.querySelector('.lesson'),'consequence lesson shown for '+k);
  d.getElementById('go').click();               // -> n2 multi
  ok(d.querySelectorAll('.opt').length===5,'multi options for '+k);
});

// multi grading: correct set
w.start('signoff');toN1(d);d.querySelectorAll('.choice')[1].click();d.getElementById('go').click();
const boxes=[...d.querySelectorAll('.opt input')];
[0,1,3].forEach(i=>{boxes[i].checked=true;});
d.getElementById('sub').click();
ok(d.querySelector('#fb .lesson.good'),'multi full marks flagged good');
d.getElementById('go').click();
ok(d.querySelector('#ans'),'evaluate node reached');

// rubric: model answer scores 3/3
const model="When a refund is approved the system sends an SMS to the customer's mobile. If the customer has no mobile number on file the system falls back to email, and ops owns the decision when neither is available.";
d.getElementById('ans').value=model;
d.getElementById('sub').click();
const met=d.querySelectorAll('.crit.met').length;
ok(met===3,'model answer scores 3/3, got '+met);
ok(!!d.querySelector('#fb .scorepill.full'),'full-marks pill shown');
d.getElementById('go').click();
ok(d.querySelector('.prompt').textContent.includes('scope creep'),'pass routes to the hold-the-line decision');
d.querySelectorAll('.choice')[1].click();
ok(d.querySelector('.lesson.good'),'holding the line with the cost visible is the good move');
d.getElementById('go').click();
ok(d.querySelector('.moral'),'ending rendered');
ok(d.querySelector('.stitle').textContent.includes('nowhere to hide'),'routed to good ending');
ok(!d.getElementById('code'),'v0.3: no separate session summary box on the ending');
ok(!!d.querySelector('.send #lname'),'v0.3: send-to-trainer box on the ending');
ok(!!d.querySelector('.pathbox .pth .pend'),'v0.3: folded path diagram on the ending');
const sent=decodeURIComponent(d.getElementById('sendWa').getAttribute('href').split('text=')[1]);
const sum=sent.split('\n');
ok(/PUP2:[A-Za-z0-9_-]+/.test(sent),'v0.3: the message carries a PUP2 result code');
const rep=w.reportHTML('good',w.S.ending,'Test');
ok(rep.includes('Your path')&&rep.includes('What happened')&&rep.includes('class="pth"'),'v0.3: saved report has the path diagram and what happened');
ok(sum[0].includes("The Requirement That Wasn't"),'summary names the scenario');
ok(sum.some(l=>l.startsWith('Anchor: Challenges assumptions, reframes and holds a point of view - pushes past the happy path')),'summary carries the anchor and behaviour');
ok(sum.some(l=>l==='Pillar: Boundary defining posture'),'summary carries the pillar, derived from the anchor');
ok(!sum.some(l=>l.startsWith('Competency:')),'summary no longer says Competency');
ok(sum.some(l=>l.startsWith('Chose:')),'summary states the choice in words');
ok(sum.some(l=>l.startsWith('Written answer: 3/3')),'summary states the rubric score');
ok(sum.some(l=>l.startsWith('Ending: ')),'summary names the ending');
ok(sum.some(l=>l.startsWith('PUP|signoff|Challenges assumptions, reframes and holds a point of view|')),'compact code carries the anchor for pivoting');

// weak answer routes to partial
w.start('signoff');toN1(d);d.querySelectorAll('.choice')[0].click();d.getElementById('go').click();
d.querySelectorAll('.opt input')[0].checked=true;d.getElementById('sub').click();
ok(d.querySelector('#fb .lesson')&&!d.querySelector('#fb .lesson.good'),'partial multi flagged');
d.getElementById('go').click();
const weak='We will notify the customer promptly after approval.';
d.getElementById('ans').value=weak;
d.getElementById('sub').click();
ok(!!d.getElementById('retry')&&d.getElementById('retry').textContent==='Improve my answer','v0.3: improve offered on fail');
ok(d.getElementById('go')&&d.getElementById('go').textContent==='Submit as is','v0.3: or submit as it is');
ok(/^You met \d of 3 rubric points - \d missed\./.test(d.querySelector('#fb .aifb').textContent),'v0.3: says how many rubric points were missed');
ok(d.querySelector('#fb .tleft').textContent.includes('2 more attempts'),'v0.3: says how many attempts are left');
ok(d.querySelector('#fb .aifb').textContent.includes('name the channel that actually fires'),'coach sentence names the mechanism');
d.getElementById('retry').click();
ok(d.getElementById('rlab').textContent.startsWith('Attempt 2 of 3'),'retry shows the attempt count');
ok(d.getElementById('ans').value===weak,'v0.3: the answer stays in the box to improve');
d.getElementById('sub').click();d.getElementById('retry').click();d.getElementById('sub').click();
ok(!d.getElementById('retry')&&d.getElementById('go').textContent==='Continue','v0.3: after the third attempt only Continue is left');
d.getElementById('go').click();
ok(d.querySelector('.stitle').textContent.includes('readable two ways'),'routed to partial ending');

// near-miss unlocks immediately
w.start('signoff');toN1(d);d.querySelectorAll('.choice')[1].click();d.getElementById('go').click();
[0,1,3].forEach(i=>{d.querySelectorAll('.opt input')[i].checked=true;});
d.getElementById('sub').click();d.getElementById('go').click();
d.getElementById('ans').value='We send an SMS, and if the customer has no mobile number on file we use email.';
d.getElementById('sub').click();
ok(d.querySelector('.scorepill').textContent.trim()==='2 / 3','near miss scores 2/3');
ok(!!d.getElementById('go'),'a near miss can be submitted as is on the first attempt');

// model answer button
w.start('signoff');toN1(d);d.querySelectorAll('.choice')[1].click();d.getElementById('go').click();
[0,1,3].forEach(i=>{d.querySelectorAll('.opt input')[i].checked=true;});
d.getElementById('sub').click();d.getElementById('go').click();
ok(!d.getElementById('modelBtn'),'v0.3: no model answer button for trainees');
{const tw=load(STUDIO).window,tf=path.join(os.tmpdir(),'trainer.html');
 fs.writeFileSync(tf,tw.build(JSON.parse(fs.readFileSync(SAMPLE,'utf8')),'trainer'));
 const tr=load(tf).window,td=tr.document;tr.start('signoff');tr.goTo('n3');
 ok(!!td.getElementById('modelBtn'),'model answer button present in the trainer view');
 td.getElementById('modelBtn').click();
 ok(td.getElementById('ans').value.length>40,'model answer loads into the box');
 ok(td.querySelector('#fb .aifb'),'model explanation shown');
 td.getElementById('sub').click();
 ok(td.querySelector('.scorepill.full'),'the shipped model answer scores full marks');
 ok(!!td.querySelector('.tview'),'trainer view is labelled');
 const tt=tw.build(JSON.parse(fs.readFileSync(SAMPLE,'utf8')),'trainee'),js=tt.slice(tt.indexOf('/*__SCENARIO_JSON__*/'));
 ok(!/"(trainerNote|reveals|redFlags)"/.test(tt.split('var DATA')[1]||tt),'trainee export strips trainer-only fields');}

// speaker-framed prompt
const jd=JSON.parse(fs.readFileSync(SAMPLE,'utf8'));
ok(!!jd.scenarios[0].nodes.n3.speaker,'sample uses an in-character prompt');
w.start('signoff');toN1(d);d.querySelectorAll('.choice')[1].click();d.getElementById('go').click();
[0,1,3].forEach(i=>{d.querySelectorAll('.opt input')[i].checked=true;});
d.getElementById('sub').click();d.getElementById('go').click();
ok(!!d.querySelector('.vpq'),'speaker prompt renders as dialogue');

// referential integrity across all nodes
const targets=id=>sc.nodes[id]||sc.endings[id];
Object.entries(sc.nodes).forEach(([k,n])=>{
  [n.to,n.toPass,n.toFail].filter(Boolean).forEach(t=>ok(!!targets(t),k+' -> '+t));
  (n.choices||[]).forEach((c,i)=>ok(!!targets(c.to||n.to),k+' choice'+i+' -> '+(c.to||n.to)));
});

// studio: validator catches a broken deck
const st=load(STUDIO);
const sw=st.window;
ok(sw.document.getElementById('status').textContent==='valid','studio loads sample as valid');
const broken=JSON.parse(JSON.stringify(sw.JSON?sc:sc));
const bad={deckTitle:'x',scenarios:[{id:'b',title:'t',start:'a',steps:['s'],
  nodes:{a:{type:'narrative',step:0,to:'nowhere',text:'x'},orphan:{type:'narrative',to:'a',text:'y'}},endings:{}}]};
const errs=sw.validate(bad);
ok(errs.some(e=>e.includes('nowhere')),'validator catches dangling to');
ok(errs.some(e=>e.includes('unreachable')),'validator catches unreachable node');
const bad2={deckTitle:'x',scenarios:[{id:'c',title:'t',start:'a',steps:['s'],
  nodes:{a:{type:'evaluate',criteria:[{label:'no kw'}],toPass:'e',toFail:'e'}},endings:{e:{title:'x'}}}]};
const e2=sw.validate(bad2);
ok(e2.some(x=>x.includes('no keywords')),'validator catches keywordless criterion');
ok(e2.some(x=>x.includes('no verdict')),'validator catches ending without verdict');
// build() round trip
const built=sw.build(JSON.parse(fs.readFileSync(SAMPLE,'utf8')));
ok(built.indexOf('__SCENARIO_JSON__')<0,'placeholder replaced on export');
ok(built.indexOf('<\\/script>')<0,'script tags unescaped on export');
ok(built.trim().endsWith('</html>'),'export is a complete document');

// house style sweep on all output
[STUDIO,DEMO].forEach(f=>{
  const t=fs.readFileSync(f,'utf8');
  ok(!t.includes('\u2014'),'no em dash in '+f.split('/').pop());
  ['leverage','robust','seamless','delve'].forEach(bw=>ok(!new RegExp('\\b'+bw+'\\b','i').test(t),'no "'+bw+'" in '+f.split('/').pop()));
});
/* ---- affordances ---- */
const d2=load(DEMO).window;
d2.start('signoff');
const doc=d2.document;
toN1(doc);                                              // n1
ok(doc.querySelector('[data-aff="i"]'),'i button on choice node');
doc.querySelector('[data-aff="i"]').click();
ok(!doc.getElementById('ctxPanel').classList.contains('hidden'),'context panel opens');
ok(doc.getElementById('ctxPanel').textContent.includes('Two days'),'context carries the briefing');
doc.querySelectorAll('.choice')[1].click();doc.getElementById('go').click(); // n2
ok(doc.querySelector('[data-aff="i"]'),'i button on multi node');
[0,1,3].forEach(i=>{doc.querySelectorAll('.opt input')[i].checked=true;});
doc.getElementById('sub').click();doc.getElementById('go').click();          // evaluate
ok(doc.getElementById('eBtn'),'e button on evaluate node');
ok(doc.getElementById('rub').classList.contains('folded'),'rubric collapsed by default');
doc.querySelector('[data-aff="i"]').click();
ok(doc.getElementById('ctxPanel').textContent.includes('example does the work'),'context carries the consequence the learner earned');
doc.getElementById('eBtn').click();
ok(!doc.getElementById('rub').classList.contains('folded'),'e expands the rubric');
doc.getElementById('eBtn').click();
ok(doc.getElementById('rub').classList.contains('folded'),'e collapses again');
doc.getElementById('ans').value="When a refund is approved the system sends an SMS. If the customer has no mobile number on file it falls back to email, and ops owns the decision.";
doc.getElementById('sub').click();
ok(doc.getElementById('rlab').textContent.startsWith('3 of 3'),'score shown on the collapsed rubric label');
ok(doc.querySelectorAll('.crit.met').length===3,'ticks set even while collapsed');
doc.getElementById('go').click();
ok(doc.querySelector('[data-aff="i"]'),'i button on the hold-the-line choice');
doc.querySelectorAll('.choice')[0].click();doc.getElementById('go').click();
ok(doc.querySelector('.stitle').textContent.includes('wrong week'),'deferring routes to its own ending');
ok(doc.querySelector('[data-aff="i"]'),'i button on the ending');

/* showRubric:true starts open */
const j=JSON.parse(fs.readFileSync(SAMPLE,'utf8'));
j.scenarios[0].nodes.n3.showRubric=true;
const st2=load(STUDIO).window;
fs.writeFileSync(path.join(os.tmpdir(),'open.html'),st2.build(j));
const d3=load(path.join(os.tmpdir(),'open.html')).window.document;
toN1(d3);d3.querySelectorAll('.choice')[1].click();d3.getElementById('go').click();
[0,1,3].forEach(i=>{d3.querySelectorAll('.opt input')[i].checked=true;});
d3.getElementById('sub').click();d3.getElementById('go').click();
ok(!d3.getElementById('rub').classList.contains('folded'),'showRubric:true starts expanded');
ok(d3.getElementById('eBtn').classList.contains('on'),'e button reflects expanded state');

/* ---- theme ---- */
const td=load(DEMO).window;
const tdoc=td.document;
ok(tdoc.getElementById('themeBtn'),'theme button present');
ok(!tdoc.documentElement.getAttribute('data-theme'),'starts dark');
tdoc.getElementById('themeBtn').click();
ok(tdoc.documentElement.getAttribute('data-theme')==='light','toggles to light');
tdoc.getElementById('themeBtn').click();
ok(!tdoc.documentElement.getAttribute('data-theme'),'toggles back to dark');
const css=fs.readFileSync(DEMO,'utf8');
ok(css.includes("html[data-theme='light']"),'light tokens present');
ok(!/fill="#[0-9A-Fa-f]{6}"/.test(css.split('var SCENES=')[1].split('function sceneHTML')[0]),'scene art uses tokens, not hex');
ok(/\.scene\{[^}]*height:clamp/.test(css),'banner height capped');

/* ---- validator: new evaluate rules ---- */
const sv=load(STUDIO).window;
const thin={deckTitle:'x',scenarios:[{id:'t',title:'t',start:'a',steps:['s'],
  nodes:{a:{type:'evaluate',criteria:[{label:'L',keywords:['sms','email'],coach:'c'}],
    prompt:'p',model:'nothing relevant here',modelExplain:'x',toPass:'e',toFail:'e'}},
  endings:{e:{title:'x',verdict:'v'}}}]};
const te=sv.validate(thin);
ok(te.some(x=>x.includes('only 2 keywords')),'validator flags thin keyword lists');
ok(te.some(x=>x.includes('model answer scores 0/1')),'validator grades the model answer against its own rubric');
const nocoach=JSON.parse(JSON.stringify(thin));
nocoach.scenarios[0].nodes.a.criteria[0]={label:'L',keywords:['a','b','c','d','e','f','g','h']};
delete nocoach.scenarios[0].nodes.a.model;
const nc=sv.validate(nocoach);
ok(nc.some(x=>x.includes('no coach sentence')),'validator requires a coach sentence');
ok(nc.some(x=>x.includes('no model answer')),'validator requires a model answer');
ok(sv.validate(JSON.parse(fs.readFileSync(SAMPLE,'utf8'))).length===0,'sample passes the stricter validator');

/* ---- anchor tagging ---- */
const cd=load(DEMO).window.document;
ok(cd.getElementById('railKicker').textContent.startsWith('Challenges assumptions, reframes and holds a point of view'),'rail shows the anchor');
const legacy=path.join(os.tmpdir(),'legacy.html');
fs.writeFileSync(legacy,fs.readFileSync(DEMO,'utf8').replace('"anchor": "Challenges','"competency": "Challenges'));
const ld=load(legacy).window.document;
ok(ld.getElementById('railKicker').textContent.startsWith('Challenges assumptions, reframes and holds a point of view'),'older files tagged with competency still show the anchor');

/* ---- authored line breaks ---- */
ok(/\.stext,[^{]*\.lesson[^{]*\{white-space:pre-line\}/.test(css),'text blocks keep authored line breaks (pre-line)');
const lb=load(DEMO).window;
const lbp=lb.document.querySelector('.stext');
ok(lb.getComputedStyle(lbp).whiteSpace==='pre-line','narrative paragraph computes to pre-line');

/* ---- redFlags: shown in the folded rubric, never graded ---- */
const rw=load(DEMO).window,rd=rw.document;
const n3=rw.DATA.scenarios[0].nodes.n3;
n3.redFlags={rule:'Never blame the customer.',phrases:['her fault','should have known']};
rw.start('signoff');rw.goTo('n3');
const rl=rd.querySelector('#rub .redline');
ok(!!rl,'red line renders inside the rubric');
ok(rd.getElementById('rub').classList.contains('folded'),'red line stays hidden until the rubric is opened');
ok(rl&&rl.textContent.includes('not graded')&&rl.textContent.includes('Never blame the customer.'),'red line shows its label and rule');
ok(rd.querySelectorAll('#rub .rlp').length===2,'red line shows each phrase');
ok(rd.querySelectorAll('#rub .crit').length===n3.criteria.length,'red line is not counted as a criterion');
rd.getElementById('ans').value=n3.model+' Honestly it was her fault.';
rd.getElementById('sub').click();
ok(rd.querySelector('.scorepill').textContent.replace(/\s/g,'')===n3.criteria.length+'/'+n3.criteria.length,'an answer with a red-flag phrase still scores on the criteria alone');
const rfv=JSON.parse(fs.readFileSync(SAMPLE,'utf8'));
const rfn=rfv.scenarios[0].nodes.n3;
rfn.redFlags={rule:'x',phrases:['ops owns']};
ok(sv.validate(rfv).some(x=>x.includes('red-flag phrase(s): ops owns')),'validator flags a model answer that crosses its own red line');
rfn.redFlags={rule:'x',phrases:[]};
ok(sv.validate(rfv).some(x=>x.includes('redFlags has no phrases')),'validator flags empty redFlags');
rfn.redFlags=['her fault'];
ok(sv.validate(rfv).length===0,'redFlags as a plain array is accepted');

/* ---- visual blocks: post, people, image ---- */
const bw=load(DEMO).window,bd=bw.document;
const bsc=bw.DATA.scenarios[0];
bsc.nodes.brief.blocks=[
  {type:'people',title:'Three people',people:[{name:'Meera Rao',role:'Operations',lines:'Signed the spec.'},{name:'Arjun',role:'Tech lead'}]},
  {type:'image',alt:'The refunds queue on a Monday',at:'bottom'}];
bsc.nodes.room.blocks=[{type:'post',author:'Priya',meta:'Wednesday',text:'We are in good shape.',reply:{from:'Assistant',text:'Notify the customer.',link:'Spec'},stats:'3 reactions'}];
bw.start('signoff');bd.getElementById('go').click();
const top=bd.querySelector('.panel figure.blk.people'),img=bd.querySelector('.panel figure.blk.img');
ok(!!top,'people block renders');
ok(top&&top.textContent.includes('Meera Rao')&&top.textContent.includes('MR'),'people block shows names and initials');
ok(top&&top.compareDocumentPosition(bd.querySelector('.stext'))&4,'top block sits above the text');
ok(img&&bd.querySelector('.stext').compareDocumentPosition(img)&4,'bottom block sits below the text');
ok(img&&img.querySelector('.b-ph')&&img.textContent.includes('Image to come'),'image with no src shows a placeholder');
bd.getElementById('go').click();
const post=bd.querySelector('.panel figure.blk.post');
ok(post&&post.querySelector('.b-shot')&&post.textContent.includes('Notify the customer.'),'post block renders with its quoted reply');
bd.getElementById('go').click();
const ctx=bd.getElementById('ctxPanel');
ok(ctx&&ctx.textContent.includes('Meera Rao, Operations')&&ctx.textContent.includes('Assistant: Notify the customer.'),'the i panel keeps what blocks said');
const badb=JSON.parse(fs.readFileSync(SAMPLE,'utf8'));
badb.scenarios[0].nodes.brief.blocks=[{type:'video'},{type:'image',src:'http://x.png'},{type:'people',people:[]}];
const be=sv.validate(badb);
ok(be.some(x=>x.includes('unknown type "video"')),'validator rejects an unknown block type');
ok(be.some(x=>x.includes('has no alt'))&&be.some(x=>x.includes('https link or a data:image')),'validator checks image alt and src');
ok(be.some(x=>x.includes('has nobody in it')),'validator rejects an empty people block');
const good=JSON.parse(fs.readFileSync(SAMPLE,'utf8'));
good.scenarios[0].nodes.brief.blocks=[{type:'image',alt:'A queue',src:'data:image/png;base64,AAAA'}];
ok(sv.validate(good).length===0,'a valid image block passes');

/* ---- multi feedback: names extras; per-option breakdown when options carry a why ---- */
const mw=load(DEMO).window,md=mw.document,mn=mw.DATA.scenarios[0].nodes.n2;
const pickMulti=idx=>{mw.start('signoff');mw.goTo('n2');
  md.querySelectorAll('.opt input').forEach(cb=>{cb.checked=idx.includes(+cb.value);});md.getElementById('sub').click();
  return md.querySelector('#fb .lesson').textContent;};
let fbt=pickMulti([0,1,3,4]);
ok(fbt.startsWith('All 3 that matter - plus 1 that does not')&&fbt.includes('This one does not belong')&&!fbt.includes('still need'),'without any why: extra pick named in one message');
ok(!md.querySelector('#fb .mb'),'without any why: no breakdown');
fbt=pickMulti([0,1,4]);
ok(fbt.startsWith('Partial - 2 of 3')&&fbt.includes('still need')&&fbt.includes('This one does not belong'),'without any why: missed and extra both named');
ok(pickMulti([0,1,3]).startsWith('Complete'),'exact pick is complete');
mn.options[0].why='the channel decides what gets built';mn.options[4].why='the font does not change what gets built';
pickMulti([0,1,4]);
const rows=[...md.querySelectorAll('#fb .mb li')];
ok(rows.length===mn.options.length,'breakdown lists every option');
ok(rows.map(r=>r.className).join(',')==='hit,hit,skip,miss,wrong','breakdown marks picked, missed, wrong and rightly left out');
ok(rows[0].querySelector('.why').textContent.includes('channel decides')&&rows[4].querySelector('.why').textContent.includes('font does not'),'breakdown shows each why under its option');
ok(md.querySelector('#fb .lesson').textContent.includes('Each one is below'),'lesson points to the breakdown');
ok([...md.querySelectorAll('.opt input')].every(cb=>cb.disabled),'options lock after submit');
fbt=pickMulti([0,1,3]);
ok(fbt.startsWith('Complete')&&md.querySelectorAll('#fb .mb li.hit').length===3,'a full-marks run still sees the why for every right answer');

/* ---- v0.3: banner art can be removed or replaced ---- */
const aw=load(DEMO).window,ad=aw.document,an=aw.DATA.scenarios[0].nodes;
an.brief.scene='none';aw.start('signoff');ad.getElementById('go').click();
ok(!ad.querySelector('#stage .scene'),'scene "none" drops the banner');
an.brief.scene='office';an.brief.sceneImg='https://example.com/a.png';aw.start('signoff');ad.getElementById('go').click();
ok(ad.querySelector('#stage .scene.img img')&&ad.querySelector('#stage .scene.img img').getAttribute('src')==='https://example.com/a.png','sceneImg replaces the art');
delete an.brief.sceneImg;aw.DATA.scenarios[0].hideArt=true;aw.start('signoff');
ok(!ad.querySelector('#stage .scene'),'hideArt removes built-in art on every screen');

/* ---- v0.3: dashboard reads result codes and draws each learner's path ---- */
const dw=load(STUDIO).window,dd=dw.document;
const res=dw.sampleResults();
ok((res.match(/PUP2:/g)||[]).length>=10,'sample results generate result codes');
const parsed=dw.parseResults(res);
ok(parsed.length>=10,'result codes parse back');
const sc0=JSON.parse(fs.readFileSync(SAMPLE,'utf8')).scenarios[0];
const ph=dw.pathOf(sc0,parsed[0]);
ok(ph.includes('class="dpath"')&&ph.includes('class="pend"'),'drill-down path diagram renders for a learner');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
