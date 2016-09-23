function handleLoadedTexture(objet, image) {
	objet.tex.image = image;
    gl.bindTexture(gl.TEXTURE_2D, objet.tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

	//var start = new Date().getTime();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	//var end = new Date().getTime();

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
}


function LoadMip(objet){
	var image = new Image();
	image.onload = function(){
		objet.tex.image = image;
        gl.bindTexture(gl.TEXTURE_2D, objet.tex);
       	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
       	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);		
	}			
	image.src =  objet.img;
}

function initTexture(world,i) {

	world.imgBlanc.tex = gl.createTexture();
	handleLoadedTexture(world.imgBlanc, world.blanc);

	world.imgFond.tex = gl.createTexture();
	handleLoadedTexture(world.imgFond, world.blanc);

	world.imgShadow.tex = gl.createTexture();
	handleLoadedTexture(world.imgShadow, world.blanc);

	world.imgGrille.tex = gl.createTexture();
	handleLoadedTexture( world.imgGrille, world.blanc);

	for (var i=0; i< world.objets.length; i++){
		world.objets[i].tex = gl.createTexture();
		handleLoadedTexture(world.objets[i], world.blanc);
	}   
}


function changeTex(world){
	var objet=world.pile.pop();

	if (objet){	
		if (objet.img!=null){
			var image = new Image();

			image.onload = function(){
     			handleLoadedTexture(objet, image);
				world.pile.open=true;
       		}
			image.onerror= function(){
				world.pile.open=true;
       		}
	 		image.src =  objet.img;

		}else{
			world.pile.open=true;
		}
	}
}

function popTex(world){
	var objet=world.pile.pop();
	if (objet){	
		//console.log("pop");
		handleLoadedTexture(objet, objet.imgObjet);
	}	
}

function pileTex(world, objet){
	
	objet.imgObjet = new Image();
	objet.imgObjet.onload = function(){
		world.pile.add(objet);			
	};
	objet.imgObjet.src=objet.img;
}




