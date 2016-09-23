"use strict";

/////////////////////////////////
//	
//  some vectors and matrix manipulation functions (I don't use most of them, but I prefer to keep them anyways)
//
/////////////////////////////////


	Array.prototype.max = function() {
 		 return Math.max.apply(null, this);
	};

	Array.prototype.min = function() {
  		return Math.min.apply(null, this);
	};
	
	var getDim=(a,dim)=>(a.filter((x,i)=>(i%3==dim?true:false)))

	Array.prototype.dx = function() {
		return getDim(this,0);
	};

	Array.prototype.dy = function() {
  		return getDim(this,1);
	};

	Array.prototype.dz = function() {
  		return getDim(this,2);
	};
	
	Array.prototype.moyenne = function() {
  		return this.reduce((p,e)=>p+e)/this.length;
	};

	Array.prototype.mult = function(i) {
  		return this.map((x)=>x*i);
	};

	function Getcentre(v){
		return [v.dx().moyenne(), v.dy().moyenne(), v.dz().moyenne()];
	}

	function distanceS(a,b){
		return ((b[0]-a[0])*(b[0]-a[0]) + (b[1]-a[1])*(b[1]-a[1]) + (b[2]-a[2])*(b[2]-a[2]))
	}
	function multM( M, array,lim){
		var res=[0,0,0];
		for (var j=0; j<lim; j+=3){
			for (var i=0; i<3; i++){
		 	res[i]=M[0+i*4]*array[j] + M[1+i*4]*array[j+1] +M[2+i*4]*array[j+2]+ M[3+i*4];
			} 
		}	
		
	}

	function flaten(element){
		if (Math.abs(element) < 0.000001){
			return 0;
		}else{
			return element;
		}
	}

	function trie(element, i){
		if(i%3==0){
	  	 	return true;
		}else{
	  	 	return false;
		}
  	  }

	function trans(a){
	var b = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,1];
	for (var i=0; i<3; i++){
		for (var j=0;  j<3; j++){
			b[j*4+i]=a[i*4 + j];
		}
	}
	return b;
	}
	
	function inv(a){
		var b=trans(a);
		mat4.translate(b,[-a[12],-a[13],-a[14],-a[15]]);
		return b;
	}


 	function shiftArrayV(ar, v){
    var tp=ar.slice(0);
    	for (var i=0; i< ar.length; i +=3){
     		tp[i]=ar[i]+v[0];
     		tp[i+1]=ar[i+1]+v[1];
      		tp[i+2]=ar[i+2]+v[2];
    	}
   		return tp;
    }

	function shiftArray(ar, a){
 		return ar.map(function(x){ return x + a })
	}

	function add(a,b){
		return [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
	}

	
	function sub(a,b){
		return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
	}

	function dot(a, b){
		return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
	}

	
	function cross(a,b){
		var n=[0,0,0];
		n[0] = a[1]*b[2] - a[2]*b[1];
		n[1] = a[2]*b[0] - a[0]*b[2];
		n[2] = a[0]*b[1] - a[1]*b[0];
		return n;
	}

/////////////////////////////////
//	
//  generate a bound objet according to vertices v: the limits of the 3d coords along x y z
//
/////////////////////////////////


	function bound(v){
		
		var xv=v.dx();
		var yv=v.dy();
		var zv=v.dz();
		var obj={x:[xv.min(), xv.max()],y:[yv.min(), yv.max()],z:[zv.min(), zv.max()],sx:0,sy:0,yz:0};
		

		obj.sx = (obj.x[1] - obj.x[0])*1.01;
		obj.sy = (obj.y[1] - obj.y[0])*1.01;
		obj.sz = (obj.z[1] - obj.z[0])*1.01;
		
		return obj;
	}



/////////////////////////////////
//
//	transforme coord: generate matrix for all objet according to their positions and rotations
//  also stake the textures to be loaded while close enough to the camera
//
/////////////////////////////////

	function transforme(objet,matrix,world,fz){

		var v=world.velocity;
		objet.matrix=matrix.slice(0);

		mat4.translate(objet.matrix, objet.pos);
		//rotations are not use here but might be

		//alert(objet.matrix[12]+ " " + objet.matrix[13] + objet.matrix[14] );
		//mat4.rotate(objet.matrix, objet.rot[2], [0, 0, 1]);
		//mat4.rotate(objet.matrix, objet.rot[1], [0, 1, 0]);
		//mat4.rotate(objet.matrix, objet.rot[0], [1, 0, 0]);
		//var d = (objet.matrix[12])*(objet.matrix[12]) + (objet.matrix[13])*(objet.matrix[13]) + (objet.matrix[14])*(objet.matrix[14]);
		
		var d = (objet.matrix[12]-v[0])*(objet.matrix[12]-v[0])*fz + (objet.matrix[13]-v[1])*(objet.matrix[13]-v[1])*fz + (objet.matrix[14]-v[2])*(objet.matrix[14]-v[2])/fz;
		var d2 = (objet.matrix[12]+v[0])*(objet.matrix[12]+v[0])*fz + (objet.matrix[13]+v[1])*(objet.matrix[13]+v[1])*fz + (objet.matrix[14]+v[2])*(objet.matrix[14]+v[2])/fz;
		
		var bound2=300;
		var bound=4096;
		
		if (d2 < bound2 && objet.onload < 2 ){
			objet.onload = 2;
			objet.img=objet.imgG;
			pileTex(world, objet);
		}
		
		if (d2 < bound && !objet.onload || (d > 2*bound2 && objet.onload > 1) ){
			objet.onload = 1;
			objet.img=objet.imgP;
			pileTex(world, objet);
		}

		
		if (d2 > 2*bound && objet.onload && objet.tex !=world.imgBlanc.tex){
			objet.onload = 0;
		}
		
		
		for(var j=0; j<objet.fils.length; j++){
			transforme(objet.fils[j],objet.matrix,world,fz);
		}
		
	}


/////////////////////////////////
//
//	make normals from vertices v and faces e, ( not use here but we never know )
//
/////////////////////////////////

	
	function mkNormal(v,e){
		var n = [];
		for (var i=0; i< e.length; i+=3){
			var a = [ v[3*e[i+1]]-v[3*e[i]], v[3*e[i+1]+1]-v[3*e[i]+1], v[3*e[i+1]+2]-v[3*e[i]+2]  ];
			var b = [ v[3*e[i+2]]-v[3*e[i]], v[3*e[i+2]+1]-v[3*e[i]+1], v[3*e[i+2]+2]-v[3*e[i]+2]  ];
			//alert(a);
			
			n[i] = a[1]*b[2] - a[2]*b[1];
			n[i+1] = a[2]*b[0] - a[0]*b[2];
			n[i+2] = a[0]*b[1] - a[1]*b[0];
			var norm= Math.sqrt(n[i]*n[i] + n[i+1]*n[i+1] + n[i+2]*n[i+2]);
			n[i]/=norm;
			n[i+1]/=norm;
			n[i+2]/=norm;
		}
		var nV=v.slice(0);
		
		for (i=0; i< nV.length; i++){
			//nV[i]=0;
		}

		for (i=0; i< e.length; i+=3){
			nV[3*e[i]]+=n[i];
			nV[3*e[i]+1]+=n[i+1];
			nV[3*e[i]+2]+=n[i+2];
		}
		
		return {v:nV,f:n};
	
	}

/////////////////////////////////
//
//	Find the closest glyph of the mouse cursor when the  user click to select one
//
/////////////////////////////////

	function getCloser(world, pos){
		var start = new Date().getTime();
		var d=[];
		var p=[];
		var x;
		var y;
	
		for (var i=1; i<= world.nbClusters; i++){
				p =  world.objets[i].matrix.slice(12,14);
				d = [pos[0]-p[0],pos[1]-p[1] ];
				x= Math.floor( (d[0]-world.bounds[i-1].x[0])/world.bounds[i-1].sx );
				y= Math.floor( (d[1]-world.bounds[i-1].y[0])/world.bounds[i-1].sy );

				if (x == 0 && y == 0){
					var r = onImage(world.objets[i],d);
					if ( r!=-1) return [i, r];
				}
				
		}
		return [-1, -1];
		
	}

	function onImage(objet,  pos){
		var x;
		var y;
		
		for (var i = 0; i < objet.vertices.length; i+=12){
			x = Math.floor((pos[0] - objet.vertices[i])/(objet.vertices[i+3]-objet.vertices[i]));
			y = Math.floor((pos[1] - objet.vertices[i+1])/(objet.vertices[i+7]-objet.vertices[i+1]));
			if ( x==0 && y==0 && objet.vertices[i+2]==0){
				
				return i;
			}
			
		}
		return -1;
	}
////////////////////////////////////////////////////////
//
// Best fits the pictures left after filtering: return 3d coords for the camera
//
//////////////////////////////////////////////////////

	function bestFit(world){
			var maxx = -9999;
			var minx = 9999;
			var maxy = -9999;
			var miny = 9999;
			var k=0;

			for (var i=1; i<= world.nbClusters; i++){
				if( world.objets[i].vertices.length > 0){
					k++;
					var b = bound(world.objets[i].vertices);

					if ( b.x[0] + world.objets[i].pos[0] < minx) minx = b.x[0] + world.objets[i].pos[0];
					if ( b.x[1] + world.objets[i].pos[0] > maxx) maxx = b.x[1] + world.objets[i].pos[0];

					if ( b.y[0] + world.objets[i].pos[1] < miny) miny = b.y[0] + world.objets[i].pos[1];
					if ( b.y[1] + world.objets[i].pos[1] > maxy) maxy = b.y[1] + world.objets[i].pos[1];
				}							
		}
		if ( k == 0){
			world.objets[0].pos = [0, 0, -50]
		}
		var zx = (maxx-minx)/pMatrix[14]/4;
		var zy =  (maxy-miny)/pMatrix[14]/4;

		world.objets[0].pos = [-(maxx + minx)/2, -(maxy + miny)/2, Math.min(zx,zy,-2) ];
	}


