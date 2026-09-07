const {JSDOM}=require('jsdom'),fs=require('fs');
let pass=0,fail=0;
const ok=(c,m)=>{c?pass++:(fail++,console.log('FAIL:',m));};

function load(file){
  const dom=new JSDOM(fs.readFileSync(file,'utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
  return dom;
}
const dom=load('/mnt/user-data/outputs/sample_signoff_standalone.html');
const w=dom.window,d=w.document;
ok(!!w.DATA,'DATA parsed');
const sc=w.DATA.scenarios[0];

// single scenario auto-starts
ok(d.getElementById('player').className.indexOf('hidden')<0,'player visible on single scenario');
ok(d.querySelector('.stitle').textContent.includes('Two days'),'brief rendered');
ok(d.querySelectorAll('ol.steps li').length===sc.steps.length,'rail steps rendered');

// walk every choice branch of n1
['A','B','C'].forEach((k,i)=>{
  w.start('signoff');
  d.getElementById('go').click();               // brief -> n1
  ok(!!d.querySelector('.prompt'),'n1 prompt for '+k);
  const btns=d.querySelectorAll('.choice');
  ok(btns.length===3,'3 choices');
  btns[i].click();
  ok(!!d.querySelector('.lesson'),'consequence lesson shown for '+k);
  d.getElementById('go').click();               // -> n2 multi
  ok(d.querySelectorAll('.opt').length===5,'multi options for '+k);
});

// multi grading: correct set
w.start('signoff');d.getElementById('go').click();d.querySelectorAll('.choice')[1].click();d.getElementById('go').click();
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
ok(!!d.querySelector('#fb .lesson.good'),'pass note shown');
d.getElementById('go').click();
ok(d.querySelector('.moral'),'ending rendered');
ok(d.querySelector('.stitle').textContent.includes('blank cell'),'routed to good ending');
const sum=d.getElementById('code').textContent.split('\n');
ok(sum[0].includes("The Requirement That Wasn't"),'summary names the scenario');
ok(sum.some(l=>l.startsWith('Chose:')),'summary states the choice in words');
ok(sum.some(l=>l.startsWith('Written answer: 3/3')),'summary states the rubric score');
ok(sum.some(l=>l.startsWith('Ending: ')),'summary names the ending');
ok(sum[sum.length-1].startsWith('PUP|signoff|'),'compact code is the last line');

// weak answer routes to partial
w.start('signoff');d.getElementById('go').click();d.querySelectorAll('.choice')[0].click();d.getElementById('go').click();
d.querySelectorAll('.opt input')[0].checked=true;d.getElementById('sub').click();
ok(d.querySelector('#fb .lesson')&&!d.querySelector('#fb .lesson.good'),'partial multi flagged');
d.getElementById('go').click();
d.getElementById('ans').value='We will notify the customer promptly after approval.';
d.getElementById('sub').click();
ok(!!d.getElementById('retry'),'retry offered on fail');
d.getElementById('go').click();
ok(d.querySelector('.stitle').textContent.includes('readable two ways'),'routed to partial ending');

// referential integrity across all nodes
const targets=id=>sc.nodes[id]||sc.endings[id];
Object.entries(sc.nodes).forEach(([k,n])=>{
  [n.to,n.toPass,n.toFail].filter(Boolean).forEach(t=>ok(!!targets(t),k+' -> '+t));
  (n.choices||[]).forEach((c,i)=>ok(!!targets(c.to||n.to),k+' choice'+i+' -> '+(c.to||n.to)));
});

// studio: validator catches a broken deck
const st=load('/mnt/user-data/outputs/puppeteer_studio_v0_1.html');
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
const built=sw.build(JSON.parse(fs.readFileSync('sample_scenario.json','utf8')));
ok(built.indexOf('__SCENARIO_JSON__')<0,'placeholder replaced on export');
ok(built.indexOf('<\\/script>')<0,'script tags unescaped on export');
ok(built.trim().endsWith('</html>'),'export is a complete document');

// house style sweep on all output
['/mnt/user-data/outputs/puppeteer_studio_v0_1.html','/mnt/user-data/outputs/sample_signoff_standalone.html'].forEach(f=>{
  const t=fs.readFileSync(f,'utf8');
  ok(!t.includes('\u2014'),'no em dash in '+f.split('/').pop());
  ['leverage','robust','seamless','delve'].forEach(bw=>ok(!new RegExp('\\b'+bw+'\\b','i').test(t),'no "'+bw+'" in '+f.split('/').pop()));
});
/* ---- affordances ---- */
const d2=load('/mnt/user-data/outputs/sample_signoff_standalone.html').window;
d2.start('signoff');
const doc=d2.document;
doc.getElementById('go').click();                       // n1
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
ok(doc.querySelector('[data-aff="i"]'),'i button on the ending');

/* showRubric:true starts open */
const j=JSON.parse(fs.readFileSync('/home/claude/sample_scenario.json','utf8'));
j.scenarios[0].nodes.n3.showRubric=true;
const st2=load('/mnt/user-data/outputs/puppeteer_studio_v0_1.html').window;
fs.writeFileSync('/tmp/open.html',st2.build(j));
const d3=load('/tmp/open.html').window.document;
d3.getElementById('go').click();d3.querySelectorAll('.choice')[1].click();d3.getElementById('go').click();
[0,1,3].forEach(i=>{d3.querySelectorAll('.opt input')[i].checked=true;});
d3.getElementById('sub').click();d3.getElementById('go').click();
ok(!d3.getElementById('rub').classList.contains('folded'),'showRubric:true starts expanded');
ok(d3.getElementById('eBtn').classList.contains('on'),'e button reflects expanded state');

/* ---- theme ---- */
const td=load('/mnt/user-data/outputs/sample_signoff_standalone.html').window;
const tdoc=td.document;
ok(tdoc.getElementById('themeBtn'),'theme button present');
ok(!tdoc.documentElement.getAttribute('data-theme'),'starts dark');
tdoc.getElementById('themeBtn').click();
ok(tdoc.documentElement.getAttribute('data-theme')==='light','toggles to light');
tdoc.getElementById('themeBtn').click();
ok(!tdoc.documentElement.getAttribute('data-theme'),'toggles back to dark');
const css=fs.readFileSync('/mnt/user-data/outputs/sample_signoff_standalone.html','utf8');
ok(css.includes("html[data-theme='light']"),'light tokens present');
ok(!/fill="#[0-9A-Fa-f]{6}"/.test(css.split('var SCENES=')[1].split('function sceneHTML')[0]),'scene art uses tokens, not hex');
ok(/\.scene\{[^}]*height:clamp/.test(css),'banner height capped');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
