"use strict";

// make an unique id for each glyphblock;
function cacheId( world ){
// ajouter un identifiant pour chaque glyphsbloc;
	for (var j = 0; j < world.glyphs.length; j++){
			var id = Math.max(world.dbId[j],0);
			var clusterI=Math.floor(world.glyphs[ id ]/64);
			var imageI= world.glyphs[ id ]%64;
			world.objets[clusterI+1].ids[ imageI ]= j;
		}
	for (var j = 0; j < world.nbClusters; j++){
			world.ids[j]=world.objets[j+1].ids.slice(0);
	}

}

// load the json object that content the coordinates of the pictures to display, the json object that content the texture coordinates, few static images (images that are not load on the fly like the shadow, the grid and the background color)
// this function is called at the by body onload
function loadDoc( world ){
	world.objets.push(new obj(null, null, null, null,null, null));
	world.objets[0].pos=[0,0,-7];
	var uv2=[];

	for (var i=0; i<512; i++){
		uv2[i]=rectUv[i%8];
	}

	//load uv coordinates (a json file called uv.json)
	function loadUv(){
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
  			if (xhttp.readyState == 4 && xhttp.status == 200) {

				world.uvs = JSON.parse(xhttp.responseText);
				for (var i=1; i< world.uvs.length;i+=2){
					world.uvs[i]=1-world.uvs[i];
				}
				//when the uv object is loaded we start the loading of texture data
				loadTexture();
				
			}
 		};
  		xhttp.open("GET", "objets/uv.json", true);
  		xhttp.send();
	}

	//load texture data (a png file called blanc.png)
	function loadTexture(){
		world.blanc=new Image();
		world.blanc.onload = function(){
			//when the textures data are loaded we start to load the object data (the geometry data)
     		loadObject();
        }
		world.blanc.src =  "image_static/blanc.png";	
	}

	//load geometry data (a json file called o.json)
	function loadObject(){
	var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
  			if (xhttp.readyState == 4 && xhttp.status == 200) {		
				var tp = JSON.parse(xhttp.responseText);
				world.glyphs = tp[0].glyphsId;
				world.dbId = tp[0].id;
				world.nbClusters=tp.length-1;

				for (var k=1; k< tp.length; k++){
					var norm=[];
					var face=[];
					
					for (var i=0;  i< tp[k].vertices.length; i++){
						norm[i] = rectN[i%rectN.length];
					}
					for (i=0;  i< tp[k].vertices.length/2; i++){
						face[i]= rectF[i%rectF.length] + Math.floor(i/rectF.length)*4;
					}
					var id=k;
					var nbUV=tp[k].vertices.length/3*2;
					
					//initialize the  3d object corresponding to a cluster
					var tpO=	new obj(tp[k].vertices, norm, uv2.slice(0,nbUV), face, world.uvs.slice(0,nbUV), "img/im"+ id +".png");
					tpO.id=id;
					tpO.imgP = "imgP/im"+ id +".png";
					tpO.texFond = world.imgFond;
					tpO.pos = [tp[k].pos[0],tp[k].pos[1],0];

					//add object to a global array of objects
					world.objets.push( tpO );
					world.objets[0].fils.push( tpO );
					world.objets[0].pos=[-tp[k].pos[0],-tp[k].pos[1], -7];

					//save a copy the object geometry data, so it can be restored to its initial state
					world.uvs2.push(uv2.slice(0,nbUV));
					world.vertices.push(tp[k].vertices.slice(0));
					world.faces.push(face.slice(0));
					world.bounds.push( bound(tp[k].vertices) );
				}
				// make an unique id for each glyphblock;
				cacheId( world );

				//adding the shade object, the grid, the background texture to the world, (world is singleton that hold the global data)
				world.shade = new obj(rectV.mult(1.3), rectN , rectUv3, rectF , rectUv, 'image_static/blanc.png');
				world.shade.texFond = world.imgShadow;
				world.objets[0].fils.push( world.shade );
				world.objets.push( world.shade );
				world.grid = new obj(rectV2, rectN , uvFond, rectF , rectUv, 'image_static/blanc.png');
				world.grid.texFond = world.imgGrille;
				world.objets[0].fils.push( world.grid );
				world.objets.push( world.grid );
				//start the visualization programme itself when the loading is completed, this function is in the index.html file
				webGLStart( world );
			}
 		};
  		xhttp.open("GET", "objets/o.json", true);
  		xhttp.send();
	}
	loadUv();
}




