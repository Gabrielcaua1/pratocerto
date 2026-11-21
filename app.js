(function(){
var CAP={cozinha:100,embalagem:80,entrega:50}; // por hora
var LIMITE=24; // pedidos em andamento aceitos (limite de fila)
var BASE=18; // minutos de preparo e rota sem fila
var MENU0=[
{id:1,nome:"Frango grelhado com arroz e legumes",preco:28.9,est:12},
{id:2,nome:"Feijoada leve (sem glúten)",preco:32.5,est:10},
{id:3,nome:"Macarrão integral ao pesto",preco:26.0,est:8},
{id:4,nome:"Salada proteica vegana",preco:24.9,est:6},
{id:5,nome:"Tilápia com purê de batata-doce",preco:34.9,est:9}];
var S;
function init(){S={menu:MENU0.map(function(i){return Object.assign({},i)}),cart:{},t:0,orders:[],seq:0,acc:{cozinha:0,embalagem:0,entrega:0},fail:0,over:0,paying:false,logs:[],hist:[],tk:[],sel:0,acompTab:"preparo"};if($("stressPercent")){$("stressPercent").value=50;$("stressValue").textContent="50%";$("stressResult").textContent=""}render()}
function $(i){return document.getElementById(i)}
function brl(v){return "R$ "+v.toFixed(2).replace(".",",")}
function emAnd(){return S.orders.filter(function(o){return o.st!=="concluido"}).length}
function fila(){return S.orders.filter(function(o){return o.st==="cozinha"||o.st==="embalagem"||o.st==="entrega"}).length}
function prazo(){var f=emAnd();return Math.round(BASE+f/(CAP.entrega/60))}
function log(t){S.logs.unshift("Min "+S.t+": "+t);S.logs=S.logs.slice(0,30)}
function add(id,d){var it=S.menu.find(function(x){return x.id===id});var q=(S.cart[id]||0)+d;if(q<0)q=0;if(q>it.est)q=it.est;if(q===0)delete S.cart[id];else S.cart[id]=q;render()}
function cartCount(){return Object.keys(S.cart).reduce(function(a,k){return a+S.cart[k]},0)}
function cartTotal(){return S.menu.reduce(function(a,i){return a+(S.cart[i.id]||0)*i.preco},0)*(S.cup?0.9:1)}
function aberto(){return emAnd()+1<=LIMITE}
function criar(itens,origem){
 // pagamento e pedido são uma única etapa: só vira pedido se o pagamento for confirmado
 S.seq++;var o={id:S.seq,st:"cozinha",ini:S.t,prom:prazo(),itens:itens,bairro:(origem==="pico"?BAIR[Math.floor(Math.random()*BAIR.length)]:P.bairro)};S.orders.push(o);S.hist.push(S.t);return o}
function pagar(){
 if(S.paying||cartCount()===0)return;
 if(!aberto()){$("msg").textContent="Limite da hora atingido. Tente de novo em alguns minutos.";return}
 var ok=true;S.menu.forEach(function(i){if((S.cart[i.id]||0)>i.est)ok=false});
 if(!ok){$("msg").textContent="Um item acabou. Atualizamos o seu pedido.";render();return}
 S.paying=true;$("pay").disabled=true;$("pay").textContent="Processando "+$("forma").value+"...";
 setTimeout(function(){
  if(Math.random()<0.1){S.paying=false;$("msg").innerHTML="<b>Pagamento não confirmado. Você não foi cobrado.</b> Tente novamente.";log("Pagamento recusado, sem cobrança");S.fail+=0;render();return}
  var itens=Object.assign({},S.cart);
  S.menu.forEach(function(i){i.est-=(itens[i.id]||0)});
  var o=criar(itens);
  S.cart={};S.sel=o.id;S.paying=false;
  $("msg").innerHTML="<b>Pedido #"+o.id+" confirmado.</b> Entrega prevista em "+o.prom+" min. Veja a etapa na aba Acompanhar.";
  log("Pedido #"+o.id+" confirmado");render()},900)}
function pico(N,aumento){if(N===undefined)N=30;
 var aceitos=0,barrados=0;
 for(var k=0;k<N;k++){
  var disp=S.menu.filter(function(i){return i.est>0});
  if(!disp.length){barrados+=N-k;break}
  if(!aberto()){barrados+=N-k;break}
  var it=disp[Math.floor(Math.random()*disp.length)];it.est--;
  var itens={};itens[it.id]=1;criar(itens,"pico");aceitos++}
 log("Pico"+(aumento===undefined?"":" (+"+aumento+"%)")+": "+aceitos+" aceitos, "+barrados+" aguardam nova janela");
 $("msg").innerHTML="Pico"+(aumento===undefined?" simulado":" simulado (+"+aumento+"%, "+N+" pedidos na demanda)")+": <b>"+aceitos+" pedidos aceitos</b> e "+barrados+" fora do limite, com aviso de prazo.";
 if(aumento!==undefined)$("stressResult").textContent="Resultado: "+N+" pedidos na demanda; "+aceitos+" aceitos e "+barrados+" barrados pelo limite ou estoque.";
 render()}
function tick(){
 S.t++;
 var cheg={cozinha:"embalagem",embalagem:"entrega",entrega:"concluido"};
 ["entrega","embalagem","cozinha"].forEach(function(st){
  S.acc[st]+=CAP[st]/60;
  var n=Math.floor(S.acc[st]);S.acc[st]-=n;
  var q=S.orders.filter(function(o){return o.st===st});
  for(var i=0;i<n&&i<q.length;i++){q[i].st=cheg[st];if(cheg[st]==="concluido"){q[i].fim=S.t}}});
 render()}
function render(){
 // cardápio
 $("menu").innerHTML=S.menu.map(function(i){
  var tag=i.est===0?'<span class="tag out">Esgotado</span>':i.est<=3?'<span class="tag low">Restam '+i.est+'</span>':'<span class="tag">'+i.est+' disponíveis</span>';
  var q=S.cart[i.id]||0;
  return '<div class="item"><div class="n"><b>'+i.nome+'</b><small>'+brl(i.preco)+' '+tag.replace(/^/,'')+'</small></div>'+
  '<div class="q"><button aria-label="Remover" data-a="-" data-i="'+i.id+'"'+(q===0?' disabled':'')+'>-</button><span>'+q+'</span><button aria-label="Adicionar" data-a="+" data-i="'+i.id+'"'+(i.est===0||q>=i.est?' disabled':'')+'>+</button></div></div>'}).join("");
 // carrinho
 var n=cartCount();
 $("cart").innerHTML=n?S.menu.filter(function(i){return S.cart[i.id]}).map(function(i){return S.cart[i.id]+" x "+i.nome}).join("<br>"):"Escolha uma refeição para começar.";
 $("total").textContent=brl(cartTotal());
 // banner de capacidade
 var a=emAnd(),pz=prazo();
 var cls=a>=LIMITE?"bad":a>=LIMITE*0.6?"warn":"ok";
 $("banner").innerHTML='<div class="banner '+cls+'">'+(a>=LIMITE?"Alta demanda: novos pedidos pausados por alguns minutos. Estimativa para liberar: "+Math.max(1,Math.round((a-LIMITE+1)/(CAP.entrega/60)))+" min.":"Prazo real de entrega hoje: <b>"+pz+" min</b> ("+a+" pedidos em andamento de "+LIMITE+" aceitos por vez).")+'</div>';
 $("pay").disabled=S.paying||n===0||a>=LIMITE;
 if(!S.paying)$("pay").textContent="Pagar e confirmar";
 // etapas
 var st=[["Cozinha","cozinha",CAP.cozinha],["Embalagem","embalagem",CAP.embalagem],["Entrega","entrega",CAP.entrega]];
 $("stages").innerHTML=st.map(function(x){
  var q=S.orders.filter(function(o){return o.st===x[1]}).length;
  var p=Math.min(100,q/LIMITE*100);var c=p>=80?"d":p>=50?"w":"";
  var gar=x[1]==="entrega"?" (gargalo)":"";
  return '<div class="stage"><div class="t"><span>'+x[0]+gar+'</span><span>'+q+' na fila, '+x[2]+'/h</span></div><div class="bar"><i class="'+c+'" style="width:'+p+'%"></i></div></div>'}).join("");
 // métricas
 var hr=S.hist.filter(function(t){return t>S.t-60}).length;
 $("m1").textContent=hr;
 $("m2").textContent=0;
 $("m3").textContent=S.over;
 var d=S.orders.filter(function(o){return o.st==="concluido"});
 if(d.length){var avg=d.reduce(function(s,o){return s+(o.fim-o.ini+BASE)},0)/d.length;$("m4").textContent=Math.round(avg)+" min";
  var np=d.filter(function(o){return (o.fim-o.ini+BASE)<=o.prom+5}).length;$("m5").textContent=Math.round(np/d.length*100)+"% ("+np+" de "+d.length+")"}
 else{$("m4").textContent="-";$("m5").textContent="-"}
 $("log").innerHTML=S.logs.map(function(l){return "<li>"+l+"</li>"}).join("");renderExtra()}
document.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;
 if(b.dataset.a){add(+b.dataset.i,b.dataset.a==="+"?1:-1)}
 else if(b.id==="pay")pagar();else if(b.id==="reset"){init();$("msg").textContent=""}});
var TAGS={1:["gluten"],2:["gluten"],3:["vegano","lactose"],4:["vegano","gluten","lactose"],5:["gluten","lactose"]};
var RN={gluten:"sem glúten",vegano:"vegano",lactose:"sem lactose"};
var ETAPA={cozinha:"na cozinha",embalagem:"sendo embalado",entrega:"com o entregador",concluido:"entregue"};
var PASSOS=["Refeição escolhida","Disponibilidade verificada","Pagamento confirmado","Preparando na cozinha","Embalando o pedido","Entregador recebeu a rota","A caminho: acompanhe por aqui","Entrega concluída"];
var CUR={cozinha:3,embalagem:4,entrega:6,concluido:8};
var P={nome:"",rest:[],bairro:"Boa Viagem"};
var BAIR=["Boa Viagem","Pina","Imbiribeira","Setúbal"];
function okR(i){return P.rest.every(function(r){return (TAGS[i.id]||[]).indexOf(r)>-1})}
function cur(){return S.orders.find(function(x){return x.id===S.sel})||S.orders[S.orders.length-1]}
function show(v){["pedir","acomp","sup","perfil","op"].forEach(function(k){$("v-"+k).hidden=(k!==v)});document.querySelectorAll("nav button").forEach(function(b){if(b.dataset.v===v)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")})}
function renderExtra(){
 S.menu.forEach(function(i){if(!okR(i)){var b=document.querySelector('button[data-a="+"][data-i="'+i.id+'"]');if(b){b.disabled=true;b.closest(".item").querySelector("small").insertAdjacentHTML("beforeend",' <span class="tag out">Não atende sua restrição</span>')}}});
 var sug=S.menu.find(function(i){return i.est>0&&okR(i)});
 $("restinfo").textContent=(P.nome?"Olá, "+P.nome+". ":"")+(P.rest.length?"Filtro ativo: "+P.rest.map(function(r){return RN[r]}).join(", ")+". ":"")+(sug?"Sugestão do dia: "+sug.nome+".":"Nenhum prato disponível para suas restrições agora.");
 var tabs=[
  {id:"preparo",label:"Em preparo",match:function(o){return o.st==="cozinha"||o.st==="embalagem"}},
  {id:"rota",label:"A caminho",match:function(o){return o.st==="entrega"}},
  {id:"finalizados",label:"Finalizados",match:function(o){return o.st==="concluido"}}
 ];
 var aba=tabs.find(function(x){return x.id===S.acompTab})||tabs[0];
 var pedidos=S.orders.filter(aba.match).slice().reverse();
 var o=pedidos.find(function(x){return x.id===S.sel})||pedidos[0],h;
 if(o)S.sel=o.id;
 h='<div class="order-tabs" role="tablist" aria-label="Pedidos">'+tabs.map(function(x){
  var count=S.orders.filter(x.match).length;
  return '<button role="tab" data-acomp-tab="'+x.id+'" aria-selected="'+(x.id===aba.id)+'">'+x.label+' ('+count+')</button>'
 }).join("")+'</div>';
 if(!o){h+='<p class="hint">Nenhum pedido nesta aba.</p>'}
 else{
  var c=CUR[o.st],tot=S.t-o.ini+18,resta=Math.max(0,o.prom-tot);
  var escolhas=pedidos.map(function(x){return '<button class="order-choice" data-sel="'+x.id+'" aria-pressed="'+(x.id===o.id)+'">Pedido #'+x.id+' <span>'+ETAPA[x.st]+'</span></button>'}).join("");
  var itens=S.menu.filter(function(i){return o.itens[i.id]}).map(function(i){return o.itens[i.id]+" x "+i.nome}).join(", ");
  var st=PASSOS.map(function(p,k){return '<li class="'+(k<c?"d":k===c?"a":"")+'">'+(k<c?"Feito: ":k===c?"Agora: ":"")+p+'</li>'}).join("");
  var info=o.st==="concluido"?"Entregue em "+(o.fim-o.ini+18)+" min (previsto "+o.prom+").":(tot>o.prom?'<span style="color:var(--rd)">Atrasado. Sentimos muito. Seu pedido está '+ETAPA[o.st]+'.</span>':"Previsão: cerca de "+resta+" min. Pedido "+ETAPA[o.st]+".");
  var nota=o.st!=="concluido"?"":(o.nota?'<p>Sua nota: <b>'+o.nota+' de 5</b>. Obrigado!</p>':'<p>Avalie a entrega:</p><div class="chips">'+[1,2,3,4,5].map(function(n){return '<button data-nota="'+n+'">'+n+'</button>'}).join("")+'</div>');
  h+='<div role="tabpanel"><div class="order-list">'+escolhas+'</div><p><b>Pedido #'+o.id+'</b><br><span class="hint">'+(itens||"Pedido do pico simulado")+'</span></p><div class="banner '+(o.st==="concluido"?"ok":tot>o.prom?"bad":"warn")+'">'+info+'</div><ol class="steps" style="list-style:none">'+st+'</ol>'+nota+(o.st==="concluido"&&Object.keys(o.itens).length?'<div class="row"><button data-act="again">Pedir de novo</button></div>':"")+'</div>'}
 $("acomp").innerHTML=h;
 var co=S.orders.filter(function(x){return x.st==="cozinha"}),em=S.orders.filter(function(x){return x.st==="embalagem"}),en=S.orders.filter(function(x){return x.st==="entrega"});
 var rt={};en.forEach(function(x){rt[x.bairro]=(rt[x.bairro]||0)+1});
 function ds(x){return S.menu.filter(function(i){return x.itens[i.id]}).map(function(i){return x.itens[i.id]+"x "+i.nome}).join(", ")}
 var opc='<p><b>Limite de pedidos em andamento: '+LIMITE+'</b> <button data-act="lim" data-d="-4">-4</button> <button data-act="lim" data-d="4">+4</button></p><p class="hint">Limite maior aceita mais pedidos, mas aumenta o prazo. A entrega faz 50 por hora.</p>';
 opc+='<h2 style="margin-top:16px">Estoque</h2>'+S.menu.map(function(i){return '<div class="item"><div class="n"><b>'+i.nome+'</b></div><span style="min-width:28px;text-align:center"><b>'+i.est+'</b></span><button data-rep="'+i.id+'" data-d="-10">-10</button><button data-rep="'+i.id+'" data-d="-1">-1</button><button data-rep="'+i.id+'" data-d="1">+1</button><button data-rep="'+i.id+'" data-d="10">+10</button></div>'}).join("");
 opc+='<h2 style="margin-top:16px">Fila da cozinha ('+co.length+')</h2><p class="hint">Somente pedidos pagos, em ordem de chegada.</p>'+(co.length?co.slice(0,6).map(function(x){return '<p style="margin:4px 0">#'+x.id+' '+(ds(x)||"1 prato")+' <span class="hint">('+x.bairro+')</span></p>'}).join("")+(co.length>6?'<p class="hint">e mais '+(co.length-6)+' pedidos</p>':""):'<p class="hint">Fila vazia.</p>');
 opc+='<h2 style="margin-top:16px">Embalagem ('+em.length+') e rotas de entrega ('+en.length+')</h2><p class="hint">Pedidos agrupados por bairro para o entregador fazer menos viagens.</p>'+(Object.keys(rt).length?Object.keys(rt).map(function(k){return '<p style="margin:4px 0"><b>'+k+':</b> '+rt[k]+' pedido(s) na rota</p>'}).join(""):'<p class="hint">Nenhuma rota aberta agora.</p>');
 $("opc").innerHTML=opc;
 var ab=S.tk.length;
 $("supst").textContent="Atendimento humano: "+ab+" chamados na fila, resposta em cerca de "+(ab+1)*2+" min. Veja as respostas rápidas antes de enviar.";
 $("tks").innerHTML=ab?S.tk.map(function(t){return "<p><b>"+t.p+"</b> ("+t.m+")<br><span class='hint'>"+t.r+"</span></p>"}).join(""):"Nenhum chamado aberto."}
document.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;
 if(b.dataset.v)show(b.dataset.v);
 else if(b.dataset.acompTab){S.acompTab=b.dataset.acompTab;renderExtra()}
 else if(b.dataset.sel){S.sel=+b.dataset.sel;renderExtra()}
 else if(b.dataset.nota){var o=cur();if(o){o.nota=+b.dataset.nota;log("Avaliação "+o.nota+"/5 no pedido #"+o.id);renderExtra()}}
 else if(b.dataset.act==="lim"){LIMITE=Math.max(8,Math.min(60,LIMITE+(+b.dataset.d)));log("Limite de pedidos ajustado para "+LIMITE);render()}
 else if(b.dataset.rep){var it=S.menu.find(function(x){return x.id===+b.dataset.rep});var d=+b.dataset.d;it.est=Math.max(0,it.est+d);if(S.cart[it.id]>it.est){if(it.est===0)delete S.cart[it.id];else S.cart[it.id]=it.est}log("Estoque ajustado ("+(d>0?"+":"")+d+"): "+it.nome);render()}
 else if(b.dataset.act==="stress"){var pct=+$("stressPercent").value;pico(Math.round(30*(1+pct/100)),pct)}
 else if(b.dataset.act==="cupom"){S.cup=$("cup").value.trim().toUpperCase()==="PRATO10";$("msg").textContent=S.cup?"Cupom aplicado: 10% de desconto.":"Cupom inválido.";render()}
 else if(b.dataset.act==="again"){var oo=cur();Object.keys(oo.itens).forEach(function(id){var x=S.menu.find(function(m){return m.id===+id});var q=Math.min(oo.itens[id],x.est);if(q>0&&okR(x))S.cart[id]=q});show("pedir");$("msg").textContent="Itens do pedido #"+oo.id+" adicionados, conforme o estoque atual.";render()}
 else if(b.dataset.act==="perfil"){
  P.nome=$("nome").value.trim();P.bairro=$("bairro").value;
  P.rest=[].slice.call(document.querySelectorAll('input[name="rest"]:checked')).map(function(x){return x.value});
  Object.keys(S.cart).forEach(function(id){var it=S.menu.find(function(x){return x.id===+id});if(it&&!okR(it))delete S.cart[id]});
  $("permsg").textContent="Preferências salvas. Entrega em "+$("bairro").value+", horário: "+$("hora").value+"."+($("bairro").value==="Outro bairro"?" Atenção: esse bairro fica fora da área de entrega do lançamento.":"");
  render()}
 else if(b.dataset.act==="chamado"){
  var m=$("mot"),o2=cur(),r="Recebemos seu chamado e vamos responder em breve.";
  if(m.value==="atraso"&&o2)r="Seu pedido #"+o2.id+" está "+ETAPA[o2.st]+". Já avisamos a operação.";
  if(m.value==="cobranca")r="Vamos conferir o pagamento. Se não houver pedido, o valor será devolvido.";
  var p="PC-"+(1000+S.tk.length+1);
  S.tk.push({p:p,m:m.options[m.selectedIndex].text,r:r});
  $("det").value="";$("supmsg").textContent="Chamado "+p+" aberto.";log("Chamado "+p+" aberto");renderExtra()}
});
document.addEventListener("input",function(e){if(e.target.id==="stressPercent")$("stressValue").textContent=e.target.value+"%"});
init();setInterval(tick,1000);
})();
