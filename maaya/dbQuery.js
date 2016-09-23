"use strict";

///////////////////////
//
// request objet: cache and calculate the query
//
///////////////////////
var requete={
	nb:0,
	displayFunction:null,
	branches:[],
	tree:['codex',false, -1],
	pere:[],
	crit:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	arg:[],
	elementI:{},
	addCrit: function(critIndex, op, crit, arg){
		this.crit[critIndex]=[op,crit, arg];
	},
	deletCrit: function(critIndex, crit){
		this.crit[critIndex]=0;
	},
	mkReq: function(){
		var r = new req();
		var table=[0,0,0,0];

		//make json using the binary tree, this is a deep first search 
		function dfs(tree,op){

			//the tree is not a leaf
			if(tree[0]=="and" ||  tree[0] == "or" || tree[0] == "in"){
				//recursives calls
				var g = dfs(tree[1],tree[0]);
				var d = dfs(tree[2],tree[0]);
				// we have to recursively reverberate the neutral bit of the logic expression so it stay neutral
				// this is because we allow the user to "unfiliter" i.e make some part of the expression neutral
				if ((g[0]==6 && d[0]==6) || (g[0]==7 && d[0]==7)){
					if (op=="and" || op == "in"){ 
						return [ 6, '' ];
					}else{
						return [ 7, '' ];
						}						
				}else{
					return [tree[0], g,  d];
				}

			//the tree is a leaf		
			}else{
				//the leaf is of form criter=value
				if (tree[1]){
					var t =Math.floor(codeCrit[tree[0]]/100);

					var c =codeCrit[tree[0]]%100;
  					if (table[t] == 0){
						table[t]=1;
						r.table.push(t);	
					}	
					return [ c , tree[1]];

				// the user choosed to "unfilter" means the leaf as to be neutral to the logic expression
				// i.e (and = true) or (or = false)
				}else{
					if (op=="and" || op == "in"){ 
						return [ 6, '' ];
					}else{
						return [ 7, '' ];
					}
				}
			}
		}
		r.tree = dfs(this.tree,"and");
		if ( table[0]==0){
			r.table.push(0);
		}
		console.log( drawTree(r.tree) );
		return r;
	}

};

function req(){
	this.table = [];
	this.tree = [];
}

var codeCrit={"thompson":100, "mv":104, "page":2, "tols":1,"true":6,"false":7,"codex":8,"t_string":9,"count":10};

////////////////////////////
//
//  make the sql query binary tree into a string, only for debugging
//
////////////////////////////
function drawTree(tree){
	var str= "(";
	if(tree[0]=="and" ||  tree[0] == "or" || tree[0] == "in"){
			str+= drawTree(tree[1]);
			str+= " " + tree[0] + " ";
			str+= drawTree(tree[2]);
	}else{
		return tree[0]+ "= "+ tree[1];
	}
	return str + ")";
}

////////////////////////////
//
//  draw the user interface according to the query binary tree, is called each time the user add a criterion to the query
//
////////////////////////////
function mkTree(tree, obj, pere){
	var grandPere;

	function addNode(opA,critA, finA, branche,kA){	
		requete.branches[requete.nb]= branche;
		var li = dataToDom( {op: opA, crit:critA, id: requete.nb,fin: finA, k:kA},requete.elementI ,'block');
		var select=dataToDom( {id:requete.nb}, document.getElementById(critA +"L"),"inline");
		select.id="select"+requete.nb;
		select.setAttribute('data',requete.nb);
		select.onchange=function(){change(this)};

		if ( finA == 2){
			select.selectedIndex = branche[1][1][2];
		}else if ( finA == 0){
			select.selectedIndex = branche[1][2];
		}else if (finA == 1 ) {
			select.selectedIndex = branche[2][2];
		}else{
			select.selectedIndex = branche[2];
		}
		if ( select.selectedIndex > -1 ){
			var listE = li.getElementsByTagName("button");
			for (var i =0; i<listE.length; i++){
				if ( listE[i].id == "uf"+ requete.nb )listE[i].style.display="inline";
				if  (listE[i].id == "f"+ requete.nb )listE[i].style.display="none";
			}
		}
		li.getElementsByTagName("span")[0].appendChild(select);
		obj.appendChild(li);
		requete.nb++;
	}

	if ( requete.nb==0  &&  tree[0]!="and" && tree[0]!="or" && tree[0]!="in" ){
		addNode("",tree[0], 3, pere);
		return;
	}

	var k = 0;
	//slide down the right branch of the tree
	while( tree[0]=="and" ||  tree[0] == "or" || tree[0] == "in"){
		//make a recursive call if the left branch is not a leaf
		if ( tree[1][0] == "and" ||   tree[1][0] == "or" ||   tree[1][0] == "in"){
			//leaf
			addNode(pere[0],tree[1][1][0], 2, tree, k);
			requete.pere[requete.nb] = pere;
			var ul = document.createElement("UL");
			obj.appendChild(ul);
			//recusrive call
			mkTree(tree[1][2], ul, tree[1]);
			k=-1;
		}else{
			//left leaf
			addNode(pere[0],tree[1][0], 0, tree, k);
			requete.pere[requete.nb] = pere;
			k+=2;
		}
		grandPere=pere;
		pere=tree;
		tree = tree[2];
	}
	//last right leaf
	addNode(pere[0],tree[0], 1, pere, k);
}

///////////////////////////////////////
//
// generic function to catch asynchronous calls to the server
//
///////////////////////////////////////

function getJson(url, f){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
  		if (xhttp.readyState == 4 && xhttp.status == 200) {
		
				f(JSON.parse(xhttp.responseText));
				
		}
 	};
	xhttp.open("GET", url, true);
  	xhttp.send();

}

//////////////////////////////////////////////////////////
//
// call once at initialisation, generate some UI elements according to sql query
//
//////////////////////////////////////////////////////////
function initMenu(){

	function mkSelect(crit){
		var url ="http://demomaaya.unige.ch/maayajoel/query.php?q="+crit;
		function f( code ){
			 var lu = document.createElement("SELECT");

			 for (var i=0; i< code.length; i++){

				var l = document.createElement("OPTION");
				l.innerHTML="\"" + code[i] + "\"";
		 		lu.appendChild(l);

			 }

	 		lu.id=crit+"L";
	 	 	lu.style.display="none";
			lu.className = "choice";
			document.body.appendChild(lu);
		}
		getJson(url, f);
	}

	function mkSelect2(crit,n){
		var lu = document.createElement("SELECT");

		for (var i=0; i< n; i++){

			var l = document.createElement("OPTION");
			l.innerHTML=i;
		 	lu.appendChild(l);

		}

	 	lu.id=crit+"L";
		lu.style.display="none";
		lu.className = "choice";
		document.body.appendChild(lu);
	}
	var data=[[0,0,0,"No Glyphblock selected"]];
	data[0][33]="-";
	data[0][48]="-";
	data[0][10]="-";
	data[0][26]="-";
	displayDetail( data );
	mkSelect('thompson');
	mkSelect('mv');
	mkSelect('t_string');
	mkSelect2('page',200);
	mkSelect2('tols',600);
	requete.displayFunction = filterGlyphs;
	requete.elementI = document.getElementById('rInterface');
	mkTree(requete.tree, document.getElementById("tree"), requete.tree);
	
}

function change(t){
		var id=t.getAttribute("data");
		document.getElementById("uf"+id).style.display="none";
		document.getElementById("f"+id).style.display="inline";
}

////////////////////////////////////////
//
//  makes the sql query and displays the result
//
////////////////////////////////////////
function filter(requete, id, fin, filter, t,fg){
	var b = requete.branches[id];
	var codes=document.getElementById("select"+id);
	var code;
	var i;
	if (filter){
		document.getElementById("f"+id).style.display="none";
		document.getElementById("uf"+id).style.display="inline";
		code= codes.options[codes.selectedIndex].text;
		i = codes.selectedIndex;
	}else{
		document.getElementById("uf"+id).style.display="none";
		document.getElementById("f"+id).style.display="inline";
		i=-1;
		code= false;
	}
	
	if (fin == 2){
		b[1][1] = [b[1][1][0], code, i];
	}else if ( fin == 0){
		b[1]=[b[1][0], code, i];
	}else if (fin == 1) {
		b[2]=[b[2][0], code, i];
	}else{
		b[1]=code; b[2]=i;
	}
	senQuery(requete, world);
	
}

////////////////////////////////////////
//
//  sends the query to the server application
//
////////////////////////////////////////
function senQuery(requete, world){
	var url= "http://demomaaya.unige.ch/maayajoel/query2.php?j=" + JSON.stringify(requete.mkReq()) ;	
	function f( res ){
		requete.displayFunction(world, res);
		mkId( res );
	}
	console.log(url);
	getJson(url, f);
}

function viewFiltredOn(requete, world){
 requete.displayFunction = shadeGlyphs;
 senQuery(requete, world);
}

function viewFiltredOff(requete, world){
 requete.displayFunction = filterGlyphs;
 senQuery(requete, world);
}

/////////////////////////////////////////////////////////////
//
// generate a select list of ids according to the currently displayed glyphblocs, so the user can zoom to each glyphblocs
//
/////////////////////////////////////////////////////////////
function mkId( ids ){
	var lu = document.createElement("SELECT");
	lu.onchange =  centerGlypheId;

	for (var i=0; i< ids.length; i++){
		var l = document.createElement("OPTION");
		l.innerHTML= ids[i];
		lu.appendChild(l);

	}
	lu.id="ids";
	var el = document.getElementById("ids");
	el.parentNode.replaceChild(lu,el);
}

////////////////////////////////////////////////////////////////////////////////////////
//
// take an HTML element and replace text reference by field values of the object object, like a mini angular parser, return an HTML element
//
///////////////////////////////////////////////////////////////////////////////////////
function dataToDom(object, element, display){
	var tp = element.cloneNode(true);
    tp.style.display = display;
	var idStr = tp.id;
	var str = tp.innerHTML;

	for (var x in object){
		idStr=idStr.replace(new RegExp("\\{"+x+"\\}",'g'), object[x]);
		str =str.replace(new RegExp("\\{"+x+"\\}",'g'), object[x]);
	}
	str =str.replace(new RegExp("{ ",'g'), "{");
	str =str.replace(new RegExp(" }",'g'), "}");
	tp.id = idStr;
	tp.innerHTML=str;

	return tp;
		
}

function deletDom(id){
	var node = document.getElementById(id);
	var cNode = node.cloneNode(false);
    node.parentNode.replaceChild(cNode ,node);
	return cNode;
}

///////////////////////////////////////////////
//
// add a leaf to the tree (the tree is the logic expression used as a query)
// aka add an expression to the query ex ( and thompson code = ... )
// 
///////////////////////////////////////////////
function growTree(id,requete, fin, select){
	var b = requete.branches[id];
	var op = document.getElementById("op_" + id);

	if (fin == 1){
		b[2] = [op.value, b[2], [select.value, false, -1]];
	}else if( fin == 0 ){
		b[1] = [op.value, b[1], [select.value, false, -1]];
	}else if( fin == 3 ){
		requete.tree = [op.value,requete.tree, [select.value, false, -1]];
	}
	requete.nb = 0;
	var el = deletDom("tree");
	mkTree(requete.tree, el ,requete.tree);
}

///////////////////////////////////////////////
//
// remove a branch of the tree (the tree is the logic expression used as a query)
// there a lot a case and subcase if the leaf is a left leaf or right leaf, if it s the last leaf etc..
//
///////////////////////////////////////////////
function removeBranche(id,fin,requete, k){
	var c = requete.branches[id];
	var b = requete.pere[id];

	if ( id==1 ){
		if ( k ==0){
			if (fin == 1){
				b[1] = b[1][1];
			}else{
				b[1][2] = b[1][2][2];
				
			}
		}else{
			if (requete.nb==2){
				b[0]=b[1][0];
				b[2]=b[1][2];
				b[1]=b[1][1];
			}else{
				b[2]=b[2][2];			
			}
		}
	}else{
		if (k==0){
			b[2][1]=b[2][1][2];
		}else if (k!=-1){
			if (fin == 1 ){	
				b[2] = b[2][1];
			}else{
				b[2][2]=b[2][2][2];
			}
		}
	}

	requete.nb = 0;
	var el = deletDom("tree");
	mkTree(requete.tree, el,requete.tree);
}

///////////////////////////////////////////////
//
// Display detail of Glyphblocks when selected
//
///////////////////////////////////////////////
function displayDetail(data){
	var table = document.getElementById("detailD");
	var glyphsR = document.getElementById("glyphs");
	var tp =dataToDom( data[0], table, "table");	
		
	for (var i=0; i<data.length; i++){
		tp.appendChild( dataToDom( data[i], glyphsR,  "table-row") );
	}

	var el = deletDom("detail");
	el.appendChild(tp);
}

function getDetail(id){
	function f(data){
		displayDetail(data);		
	}
	getJson("http://demomaaya.unige.ch/maayajoel/detail.php?id="+id, f);
}

function centerGlypheId(){
	var id =world.dbId[this.value];

	if ( id > -1){
		var clusterI=Math.floor(world.glyphs[id]/64);

		for (var i=0; i< world.objets[ clusterI+1].ids.length; i++){
			if (  world.objets[ clusterI+1].ids[i]==this.value )break;
		}
		centerGlyphe(world, clusterI+1, i*12);
	}
}

///////////////////////////////////////////////
//
// switchs glyphblocks coordinate at runtime
//
///////////////////////////////////////////////
function loadCoord(world,requete){
	function f ( res ){	
		world.glyphs = res[0].glyphsId;
		world.dbId = res[0].id;

		for ( var i=1; i < world.nbClusters+1; i++){
			world.objets[i].vertices=res[i].vertices;
			world.vertices[i-1]=res[i].vertices.slice(0);
			world.objets[i].pos[0]=res[i].pos[0];
			world.objets[i].pos[1]=res[i].pos[1];
		}
		cacheId( world );
		senQuery(requete, world);	
	}
var name=document.getElementById("coord").value;
getJson("objets/"+name, f);
}


