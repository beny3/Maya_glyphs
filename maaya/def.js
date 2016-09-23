"use strict";

function obj(vert, norm , uv2, faces , uv, img) {
	this.name="";
	this.id=0;
    this.vertices = vert;
    this.normals = norm;
	this.uvs2=uv2;
    this.faces = faces;
    this.uvs = uv;
	this.ids=[];
    this.img = img;
	this.imgP = img;
	this.imgG = img;
	this.imgObjet=null;
    this.pos=[0,0,0];
    this.rot=[0,0,0];
	this.speed=[0,0,0];
    this.fils=[];
	this.onload=false
    this.vBuffer=0;
    this.nBuffer=0;
    this.fBuffer=0;
    this.uvBuffer=0;
	this.uvBuffer2=0;
    this.tex=0;
	this.texFond=null;
	this.currentTex=0;
}



function objL(geom) {
	this.geom=geom
	this.id=0;
    this.pos=[0,0,0];
    this.rot=[0,0,0];
	this.fils=[];
}

var pile={
	pile:[],
	full:0,
	head:0,
	max:64,
	open:true,
	init: function(){
		for (var i=0; i < this.max; i++){
			this.pile[i]=false;
		}
	},
	add: function(a){
   		this.full=Math.min(this.full+1,this.max);
		//if(this.pile[this.head])this.pile[this.head].onload=0;
		this.pile[this.head]=a;
		this.head=(this.head+1)%this.max;
		}
		,
	pop: function(a){
		if (this.full > 0){
			this.full--;
			this.head=(this.max+this.head-1)%this.max;
			this.open=false;
			return this.pile[this.head];
		}else{
			return false;
		}}
}


var world={
	id:0,
	objets:[],
	glyphs:[],
	vertices:[],
	nbClusters:0,
	uvs:[],
	uvs2:[],
	faces:[],
	ids:[],
	dbId:[],
	bounds:[],
	pile:pile,
	velocity:[0,0,0],
	shade:null,
	imgShadow:{tex:0,img:"image_static/shade.png",imgObjet:null},
	imgFond:{tex:0,img:"image_static/fond.png",imgObjet:null},
	imgBlanc:{tex:0,img:"image_static/blanc.png",imgObjet:null},
 	imgGrille:{tex:0, img:"image_static/grille.png",imgObjet:null},
	blanc:null,
	grid:null,
	uvBuffer:0,
	fz:1
}


var rectV=[
	0,0,0,
	1,0,0,
	1,1,0,
	0,1,0
]

var rectV2=[
	-200,-200,-1,
	 200,-200,-1,
	 200, 200,-1,
	-200, 200,-1
]

var rectUv2=[
	0.375,0,
	0.75,0,
	0.75,1,
	0.375,1,
]

var rectUv=[
	0,0,
	0.375,0,
	0.375,1,
	0,1,
]

var rectUv4=[
	0.75,0.01,
	0.99,0.01,
	0.99,0.99,
	0.75,0.99,
]

var uvFond=[
	0  , 0,
	100, 0,
	100, 100,
	0  , 100
]

var rectUv3=[
	0,0,
	1,0,
	1,1,
	0,1,
]


var rectF=[
	0,1,2,
	0,2,3
]

var rectN=[
	0,0,-1,
	0,0,-1,
	0,0,-1,
	0,0,-1
]

