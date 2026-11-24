(function(){'use strict';
const $=id=>document.getElementById(id),SS=window.SapSolver;
let state={raw:[],header:0,rows:[],filename:'',results:null};
const fmt=SS.money,pct=u=>(u/10000).toFixed(4),rateFmt=n=>Number(n).toLocaleString('pt-PT',{maximumFractionDigits:2});
function parseNumber(value){
 if(typeof value==='number')return Number.isFinite(value)?value:NaN;
 let s=String(value??'').trim().replace(/[€%\s\u00a0]/g,'').replace(/[−–]/g,'-');
 if(!s)return NaN;
 const d=s.lastIndexOf('.'),c=s.lastIndexOf(',');
 if(d>=0&&c>=0)s=c>d?s.replace(/\./g,'').replace(',','.'):s.replace(/,/g,'');
 else if(c>=0)s=s.replace(/\./g,'').replace(',','.');
 else if((s.match(/\./g)||[]).length>1){const arr=s.split('.');s=arr.slice(0,-1).join('')+'.'+arr.at(-1)}
 return Number(s);
}
function cents(v){const x=parseNumber(v);return Number.isFinite(x)?Math.round(x*100):NaN}
function units(v){let x=parseNumber(v);if(!Number.isFinite(x))return NaN;return Math.round(x*10000)}
function rate(v){const n=parseNumber(v);return Number.isFinite(n)?n:NaN}
function normalize(s){return String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim()}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function notify(txt,type='good'){const info=$('fileInfo');info.hidden=false;info.innerHTML=(type==='error'?'⚠ ':'✓ ')+esc(txt);info.style.background=type==='error'?'#fff2ec':'#f0faf6';info.style.color=type==='error'?'#a34d35':'#2f7664'}
function csvParse(txt){
 txt=txt.replace(/^\uFEFF/,'');const first=(txt.split(/\r?\n/).find(x=>x.trim())||'');let sep='\t';const tabs=(first.match(/\t/g)||[]).length,semis=(first.match(/;/g)||[]).length,commas=(first.match(/,/g)||[]).length;
 if(semis>tabs&&semis>=commas)sep=';';else if(commas>tabs&&commas>semis)sep=',';
 const rows=[];let row=[],field='',quote=false;
 for(let i=0;i<txt.length;i++){const ch=txt[i];if(ch==='"'){if(quote&&txt[i+1]==='"'){field+='"';i++}else quote=!quote}else if(ch===sep&&!quote){row.push(field);field=''}else if((ch==='\n'||ch==='\r')&&!quote){if(ch==='\r'&&txt[i+1]==='\n')i++;row.push(field);if(row.some(v=>String(v).trim()!==''))rows.push(row);row=[];field=''}else field+=ch}row.push(field);if(row.some(v=>String(v).trim()!==''))rows.push(row);return rows;
}
function sniffColumns(header){
 const heads=header.map(normalize);
 const find=(f)=>heads.findIndex(f);
 const m={pct:find(x=>x==='%'||x==='percentagem'||x.includes('% distribuicao')||x.includes('percentage')||x==='percentual'),net:find(x=>x.includes('s/iva')||x.includes('sem iva')||x.includes('valor liquido')||x==='net'),rate:find(x=>x==='iva'||x==='iva %'||x==='taxa iva'||x==='taxa de iva'||x==='vat'||x==='iva^'),gross:find(x=>x==='total'||x.includes('c/iva')||x.includes('com iva')||x==='total com iva'),description:find(x=>x.includes('descricao c.custo')||x.includes('descricao c custo')||x.includes('texto sap')||x.includes('centro custo')||x.includes('centro de custo')||x.includes('descricao'))};
 return m;
}
function findHeader(data){let best={index:0,score:-1};for(let i=0;i<Math.min(20,data.length);i++){const cols=sniffColumns(data[i].map(String));const score=['pct','net','rate','gross'].reduce((n,k)=>n+(cols[k]>=0?1:0),0);if(score>best.score)best={index:i,score}}return best.index}
function mappingOption(select,head,chosen,optional){let html=optional?'<option value="-1">Não disponível</option>':'';head.forEach((s,i)=>html+=`<option value="${i}" ${i===chosen?'selected':''}>${i+1}: ${esc(String(s||'(vazia)').slice(0,75))}</option>`);select.innerHTML=html;if(chosen<0&&optional)select.value='-1';else if(chosen<0)select.value='0'}
function prepare(raw,filename){state.raw=raw.filter(a=>Array.isArray(a)&&a.some(x=>String(x??'').trim()!==''));state.filename=filename;state.header=findHeader(state.raw);if(!state.raw.length){notify('Não foram encontradas linhas.', 'error');return}const headers=state.raw[state.header]||[];const mapping=sniffColumns(headers);
 mappingOption($('mapPercent'),headers,mapping.pct,false);mappingOption($('mapNet'),headers,mapping.net,false);mappingOption($('mapRate'),headers,mapping.rate,false);mappingOption($('mapGross'),headers,mapping.gross,true);mappingOption($('mapDescription'),headers,mapping.description,true);$('headerRow').value=state.header+1;$('mapping').hidden=false;
 if(mapping.pct>=0&&mapping.net>=0&&mapping.rate>=0)applyMapping();else notify('Ficheiro lido. Identifica as colunas de percentagem, sem IVA e taxa de IVA e clica em Aplicar importação.');
}
function applyMapping(){const start=Number($('headerRow').value)||1,headerIdx=Math.max(0,start-1),p=Number($('mapPercent').value),v=Number($('mapNet').value),t=Number($('mapRate').value),g=Number($('mapGross').value),d=Number($('mapDescription').value);const arr=[];
 for(let i=headerIdx+1;i<state.raw.length;i++){
  const row=state.raw[i],un=units(row[p]),net=cents(row[v]),rt=rate(row[t]),gr=g>=0?cents(row[g]):NaN;
  if(!Number.isInteger(un)||!Number.isInteger(net)||!Number.isFinite(rt)||net<0||rt<0||rt>100)continue;
  if(un>1000000||un<0)continue;
  const desc=d>=0?String(row[d]??'').trim():'';
  arr.push({sourceRow:i+1,label:desc||`Linha ${i+1}`,units:un,net,rate:rt,importedGross:Number.isInteger(gr)?gr:null});
 }
 if(!arr.length){notify('Não encontrei linhas válidas. Verifica a correspondência das colunas e a linha de cabeçalhos.','error');return}
 state.rows=arr;state.results=null;$('dataPanel').hidden=false;$('targetPanel').hidden=false;$('resultPanel').hidden=true;refreshRows();const total=arr.reduce((s,r)=>s+r.net,0),gross=arr.reduce((s,r)=>s+SS.gross(r.net,r.rate),0);$('targetNet').value=fmt(total);$('targetGross').value=fmt(gross);renderGroups();notify(`${arr.length} linhas importadas de ${state.filename}. Confirma os valores e introduz o total com IVA pretendido.`);$('dataPanel').scrollIntoView({behavior:'smooth',block:'start'});
}
function refreshRows(){const rows=state.rows;$('rowsCount').textContent=`${rows.length} linhas · Podes editar os campos se a importação não corresponder ao SAP.`;
 const body=$('sourceTable').querySelector('tbody');body.innerHTML=rows.map((r,i)=>`<tr><td>${i+1}</td><td><input class="name" value="${esc(r.label)}" data-idx="${i}" data-key="label" aria-label="Descrição linha ${i+1}"></td><td><input value="${pct(r.units)}" data-idx="${i}" data-key="units" aria-label="Percentagem linha ${i+1}"></td><td><input value="${fmt(r.net)}" data-idx="${i}" data-key="net" aria-label="Sem IVA linha ${i+1}"></td><td><input value="${rateFmt(r.rate)}" data-idx="${i}" data-key="rate" aria-label="IVA linha ${i+1}"></td><td><b>${fmt(SS.gross(r.net,r.rate))}</b></td><td><button class="remove-row" data-remove="${i}" title="Remover linha">×</button></td></tr>`).join('');
 const total=rows.reduce((s,r)=>s+r.net,0),gross=rows.reduce((s,r)=>s+SS.gross(r.net,r.rate),0),p=rows.reduce((s,r)=>s+r.units,0);
 $('currentFooter').innerHTML=`<span><strong>${rows.length}</strong> linhas</span><span>Sem IVA <strong>${fmt(total)} €</strong></span><span>Com IVA calculado <strong>${fmt(gross)} €</strong></span><span>% atual <strong>${pct(p)}%</strong></span>`;
}
function renderGroups(){const group={};for(const r of state.rows){const k=r.rate.toFixed(2);group[k]=(group[k]||0)+r.net}const locked=$('lockGroups').checked;
 $('groupsGrid').innerHTML=Object.entries(group).sort((a,b)=>Number(b[0])-Number(a[0])).map(([k,v])=>`<div class="group-field" aria-disabled="${!locked}"><label>Sem IVA · taxa ${rateFmt(Number(k))}%</label><input data-group="${k}" value="${fmt(v)}" ${!locked?'disabled':''} inputmode="decimal" aria-label="Subtotal IVA ${k}%"></div>`).join('');
}
function recalc(){const rows=state.rows;const groups={};for(const el of document.querySelectorAll('[data-group]'))groups[el.dataset.group]=cents(el.value);const result=SS.solve({rows,targetNet:cents($('targetNet').value),targetGross:cents($('targetGross').value),groupTargets:groups,lockGroups:$('lockGroups').checked,maxStep:Number($('maxStep').value)});
 state.results=result;$('resultPanel').hidden=false;if(result.error){$('statusPill').textContent='Verificar dados';$('statusPill').classList.add('error');$('resultsBody').innerHTML=`<div class="error-box"><strong>Não foi possível obter um ajuste exato.</strong><div>${esc(result.error)}</div></div>${result.currentNet!==undefined?`<p style="margin:14px 0">Valores atuais: ${fmt(result.currentNet)} € sem IVA e ${fmt(result.currentGross)} € com IVA.</p>`:''}`}
 else{$('statusPill').textContent='Cálculo validado';$('statusPill').classList.remove('error');renderResult(result)}$('resultPanel').scrollIntoView({behavior:'smooth',block:'start'});
}
function renderResult(r){const all=r.rows,changes=r.changes;
 let html=`<div class="stat-grid"><div class="stat"><small>Sem IVA (final)</small><b>${fmt(r.targetNet)} €</b><p>100,0000% de distribuição</p></div><div class="stat"><small>Com IVA (final)</small><b>${fmt(r.targetGross)} €</b><p>IVA de ${fmt(r.targetGross-r.targetNet)} €</p></div><div class="stat"><small>Linhas a modificar</small><b>${r.totalChanges} <span style="font-size:13px;color:#7ca18e">/ ${all.length}</span></b><p>Valor redistribuído: ${fmt(r.amountMoved/2)} €</p></div></div>`;
 if(!r.sourceMatchesBase)html+=`<div class="notice">⚠ Algumas percentagens atuais, aplicadas ao total sem IVA pretendido, não reproduzem os valores importados. O cálculo só é apresentado quando as linhas não alteradas continuam coerentes com a base indicada. Confirma os valores no SAP.</div>`;
 if(!changes.length)html+='<div class="empty-changes">✓ Os valores já estão corretos. Nenhuma alteração é necessária.</div>';
 else{html+=`<p class="result-intro">Altera <strong>apenas estas ${changes.length} ${changes.length===1?'linha':'linhas'}</strong>. Mantém as restantes inalteradas.</p><div class="table-scroll"><table class="result-table"><thead><tr><th>Linha</th><th>Descrição</th><th>IVA</th><th>% atual</th><th>% nova</th><th>Sem IVA anterior</th><th>Sem IVA novo</th><th>Com IVA novo</th></tr></thead><tbody>`;
 for(const line of changes){const i=all.indexOf(line);html+=`<tr><td><b>${i+1}</b></td><td>${esc(line.label)}</td><td>${rateFmt(line.rate)}%</td><td>${pct(line.units)}</td><td class="changed">${pct(line.newUnits)}</td><td>${fmt(line.net)} €</td><td class="changed">${fmt(line.newNet)} €</td><td>${fmt(line.newGross)} €</td></tr>`}
 html+='</tbody></table></div>'}
 html+='<div class="result-actions"><button class="btn primary" id="copyResult">Copiar alterações</button><button class="btn outline" id="exportCsv">Exportar CSV</button><button class="btn outline" id="exportXlsx">Exportar Excel</button><button class="btn subtle" id="showAll">Ver todas as linhas</button></div><div class="notice">Validação: os cálculos usam arredondamento comercial a 2 casas decimais, linha a linha, e percentagens de 4 casas. A configuração do SAP pode diferir; confirma sempre o total que o próprio SAP apresenta antes de guardar.</div><div id="allLines" hidden></div>';
 $('resultsBody').innerHTML=html;
 $('copyResult').onclick=()=>{const text='Ajustes SAP\n'+changes.map(x=>`Linha ${all.indexOf(x)+1} | IVA ${rateFmt(x.rate)}% | ${pct(x.units)} → ${pct(x.newUnits)} | sem IVA ${fmt(x.newNet)} € | com IVA ${fmt(x.newGross)} €`).join('\n')+`\nTotal sem IVA: ${fmt(r.targetNet)} €\nTotal com IVA: ${fmt(r.targetGross)} €`;navigator.clipboard?.writeText(text).then(()=>{$('copyResult').textContent='✓ Copiado'}).catch(()=>prompt('Copia as alterações:',text))};
 $('exportCsv').onclick=()=>exportResults(false);$('exportXlsx').onclick=()=>exportResults(true);$('showAll').onclick=()=>{const div=$('allLines');div.hidden=!div.hidden;if(!div.hidden){div.innerHTML='<h3 style="margin:22px 0 10px">Distribuição completa</h3><div class="table-scroll"><table><thead><tr><th>Linha</th><th>Descrição</th><th>IVA %</th><th>Percentagem anterior</th><th>Percentagem final</th><th>Sem IVA final</th><th>Com IVA final</th></tr></thead><tbody>'+all.map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.label)}</td><td>${rateFmt(x.rate)}</td><td>${pct(x.units)}</td><td class="${x.units!==x.newUnits?'changed':'unchanged'}">${pct(x.newUnits)}</td><td>${fmt(x.newNet)}</td><td>${fmt(x.newGross)}</td></tr>`).join('')+'</tbody></table></div>'}this.textContent=div.hidden?'Ver todas as linhas':'Ocultar linhas'};
}
function exportResults(xlsx){const r=state.results;if(!r||!r.rows)return;
 const data=[['Linha SAP','Descrição / Centro de custo','IVA %','% original','% corrigida','Sem IVA original','Sem IVA corrigido','Com IVA original','Com IVA corrigido','Alterado?']];
 r.rows.forEach((v,i)=>data.push([i+1,v.label,v.rate,Number(pct(v.units)),Number(pct(v.newUnits)),v.net/100,v.newNet/100,v.oldGross/100,v.newGross/100,v.units!==v.newUnits?'SIM':'NÃO']));data.push(['TOTAL','','',r.percentTotal/10000,r.newPercentTotal/10000,r.currentNet/100,r.targetNet/100,r.currentGross/100,r.targetGross/100,'']);
 if(xlsx&&window.XLSX){const wb=XLSX.utils.book_new();const ws=XLSX.utils.aoa_to_sheet(data);ws['!cols']=[{wch:11},{wch:45},{wch:9},{wch:14},{wch:16},{wch:20},{wch:20},{wch:20},{wch:20},{wch:12}];XLSX.utils.book_append_sheet(wb,ws,'Distribuição corrigida');XLSX.writeFile(wb,'sap_distribuicao_corrigida.xlsx');return}
 if(xlsx)alert('A biblioteca Excel não carregou. O ficheiro CSV será descarregado e pode ser aberto no Excel.');
 const csv='\uFEFF'+data.map(row=>row.map(v=>{let value=typeof v==='number'?String(v).replace('.',','):String(v??'');if(/^[=+@-]/.test(value)&&typeof v==='string')value="'"+value;return '"'+value.replace(/"/g,'""')+'"'}).join(';')).join('\r\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});download(blob,'sap_distribuicao_corrigida.csv');
}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000)}
async function handleFile(file){if(!file)return;try{
 const name=file.name,ext=name.split('.').at(-1).toLowerCase();let rows;
 if(['csv','tsv','txt'].includes(ext)){const text=await file.text();rows=csvParse(text)}
 else{const bytes=await file.arrayBuffer();if(window.XLSX){const wb=XLSX.read(bytes,{type:'array',cellDates:false});rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,raw:true,defval:''});}
 else{const text=new TextDecoder('windows-1252').decode(bytes);if(/<table\b/i.test(text)){const doc=new DOMParser().parseFromString(text,'text/html');rows=[...doc.querySelectorAll('tr')].map(tr=>[...tr.querySelectorAll('td,th')].map(el=>el.textContent.trim()));}else throw Error('A biblioteca para abrir XLS/XLSX não carregou. É necessária ligação à internet na primeira utilização. Podes exportar o ficheiro como CSV e importá-lo diretamente.')}}
 prepare(rows,name);
 }catch(e){notify('Erro ao ler ficheiro: '+e.message,'error');console.error(e)}}
function demo(){const input=[['%','Total S/IVA','IVA','Centro Custo','Total'],['2.0215','12.00','23','Pipo de carga','14.76'],['3.0322','18.00','23','Kit soldadura','22.14'],['4.3798','26.00','23','Filtro secador','31.98'],['17.0982','101.50','23','Gás','124.85'],['3.0322','18.00','23','Azoto','22.14'],['70.4361','418.13','23','Compressor','514.30']];prepare(input,'exemplo_UPK.csv');$('targetGross').value='730,16';notify('Exemplo carregado (593,63 € → 730,16 €). Clica em Calcular ajuste.');}
$('dropzone').addEventListener('click',()=>$('fileInput').click());$('dropzone').addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();$('fileInput').click()}});$('dropzone').addEventListener('dragover',e=>{e.preventDefault();$('dropzone').classList.add('over')});$('dropzone').addEventListener('dragleave',()=>$('dropzone').classList.remove('over'));$('dropzone').addEventListener('drop',e=>{e.preventDefault();$('dropzone').classList.remove('over');handleFile(e.dataTransfer.files[0])});$('fileInput').addEventListener('change',e=>handleFile(e.target.files[0]));$('demoBtn').addEventListener('click',demo);$('pasteBtn').addEventListener('click',()=>prepare(csvParse($('pasteArea').value),'dados_colados'));
$('mapApply').addEventListener('click',applyMapping);$('lockGroups').addEventListener('change',renderGroups);$('calculateBtn').addEventListener('click',recalc);
$('sourceTable').addEventListener('change',e=>{const inp=e.target,i=Number(inp.dataset.idx),key=inp.dataset.key;if(!key||!state.rows[i])return;let value=inp.value;
 if(key==='net')value=cents(value);else if(key==='units')value=units(value);else if(key==='rate')value=rate(value);
 if(key!=='label'&&!Number.isFinite(value)){alert('Valor inválido.');refreshRows();return}
 state.rows[i][key]=value;refreshRows();renderGroups();state.results=null;$('resultPanel').hidden=true;});
$('sourceTable').addEventListener('click',e=>{const el=e.target.closest('[data-remove]');if(!el)return;state.rows.splice(Number(el.dataset.remove),1);refreshRows();renderGroups();state.results=null;$('resultPanel').hidden=true});
$('addRow').addEventListener('click',()=>{state.rows.push({label:`Nova linha ${state.rows.length+1}`,net:0,rate:23,units:0});refreshRows();renderGroups()});
})();
