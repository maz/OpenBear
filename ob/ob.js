/*
This file is part of OpenBear.

	OpenBear is free software: you can redistribute it and/or modify
	it under the terms of the GNU Lesser General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	OpenBear is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Lesser General Public License for more details.

	You should have received a copy of the GNU Lesser General Public License
	along with OpenBear.  If not, see <http://www.gnu.org/licenses/>.

*/

if(!window.Prototype){
	throw new Error("You need to include prototype.");
}
if(Prototype.Browser.IE){
	(function(){
		var head=document.getElementsByTagName("head")[0];
		var script=document.createElement("script");
		var base=window.OBDirectoryPrefix?window.OBDirectoryPrefix:"";
		script.setAttribute("type","text/javascript");
		script.setAttribute("src",base+"ob/excanvas/excanvas.compiled.js");
		head.appendChild(script);
	})();
}
if(!window.ob){
	window.ob={
		_loadedPkgs:[],
		load:function(p){
			var pkg=p;
			ob._loadedPkgs.each(function(elem){
				if(elem==pkg){
					pkg=null;
					throw $break;
				}
			});
			if(!pkg)
				return;
			var arr=pkg.split('.');
			var file=arr.pop();
			var op=Ajax.getTransport();
			op.open('get',ob.moduleUrl(arr.join("."),file),false);
			op.send(null);
			if(op.status==404){
				throw new Error("The package, \""+pkg+",\" could not be found by ob.load()");
			}else{
				var x=new Function(op.responseText);
				x.apply(window,[]);
			}
		},
		moduleUrl:function(pkg, file){
			var arr=pkg.split(".");
			var base=window.OBDirectoryPrefix?window.OBDirectoryPrefix:"";
			var x=base+arr.join("/");
			if(x[x.length-1]!='/'){
				x+='/';
			}
			return x+file;
		},
		setObject:function(path,value){
			var obj=window;
			var arr=path.split(".");
			var name=arr.pop();
			arr.each(function(part){
				if(!obj[part])
					obj[part]={}
				obj=obj[part];
			});
			obj[name]=value;
		},
		body:null,
		Body:null,
		createCanvas:function(size){
			var elem=document.createElement('canvas');
			elem.width=size.attr('width');
			elem.height=size.attr('height');
			if(Prototype.Browser.IE){
				G_vmlCanvasManager.initElement(elem);
			}
			var ctx=elem.getContext('2d');
			if(ctx.mozDrawText){
				ctx.fillText=function(txt,x,y){
					ctx.save();
					ctx.translate(x,y);
					ctx.mozTextStyle=ctx.font;
					ctx.mozDrawText(txt);
					ctx.revert();
				};
			}
			ctx._mtxt=ctx.measureText?ctx.measureText:ctx.mozMeasureText;
			ctx.measureText=function(txt){
				if(!ob._mspan){
					var mspan=document.createElement("span");
					mspan.style.position="absolute";
					mspan.style.top="-100000px";
					mspan.style.left="-100000px";
					mspan.style.visibility="hidden";
					mspan.style.zIndex="1";
					document.body.appendChild(mspan);
					ob._mspan=mspan;
				}
				ob._mspan.style.font=ctx.font;
				var w=ctx._mtxt(txt);
				if(!Object.isNumber(w)){
					w=w.width;
				}
				ob._mspan.innerHTML=txt.escapeHTML();
				return new OBSize(w,ob._mspan.offsetHeight);
			};
			//START OF BORROWED CODE FROM http://webreflection.blogspot.com/2009/01/ellipse-and-circle-for-canvas-2d.html
			ctx.circle=function(aX, aY, aDiameter){
				ctx.ellipse(aX, aY, aDiameter, aDiameter);
			},
			ctx.fillCircle=function(aX, aY, aDiameter){
				ctx.beginPath();
				ctx.circle(aX, aY, aDiameter);
				ctx.fill();
			},
			ctx.strokeCircle=function(aX, aY, aDiameter){
				ctx.beginPath();
				ctx.circle(aX, aY, aDiameter);
				ctx.stroke();
			},
			// Ellipse methods
			ctx.ellipse=function(aX, aY, aWidth, aHeight){
				var hB = (aWidth / 2) * .5522848,
					vB = (aHeight / 2) * .5522848,
					eX = aX + aWidth,
					eY = aY + aHeight,
					mX = aX + aWidth / 2,
					mY = aY + aHeight / 2;
				ctx.moveTo(aX, mY);
				ctx.bezierCurveTo(aX, mY - vB, mX - hB, aY, mX, aY);
				ctx.bezierCurveTo(mX + hB, aY, eX, mY - vB, eX, mY);
				ctx.bezierCurveTo(eX, mY + vB, mX + hB, eY, mX, eY);
				ctx.bezierCurveTo(mX - hB, eY, aX, mY + vB, aX, mY);
				ctx.closePath();
			};
			ctx.fillEllipse=function(aX, aY, aWidth, aHeight){
				ctx.beginPath();
				ctx.ellipse(aX, aY, aWidth, aHeight);
				ctx.fill();
			};
			ctx.strokeEllipse=function(aX, aY, aWidth, aHeight){
				ctx.beginPath();
				ctx.ellipse(aX, aY, aWidth, aHeight);
				ctx.stroke();
			};
			//END OF BORROWED CODE
			return [elem,ctx];
		}
	};
	window.OBAttr={
		attr:function(name,val){
			if(arguments.length==1){//if only one argument
				if(this["getter_"+name]){
					return this["getter_"+name]();
				}else{
					return this[name];
				}
			}else{
				if(this["setter_"+name]){
					this["setter_"+name](val);
				}else{
					this[name]=val;
				}
			}
		}
	};
	window.OBPoint=Class.create(OBAttr,{
		initialize:function(x,y){
			if(x)
				this.x=x;
			if(y)
				this.y=y;
		},
		x:0,
		y:0,
		toString:function(){
			return this.inspect();
		},
		inspect:function(){
			return "#<OBPoint:["+this.attr('x')+","+this.attr('y')+"]>";
		}
	});
	window.OBSize=Class.create(OBAttr,{
		width:0,
		height:0,
		initialize:function(w,h){
			if(w)
				this.width=w;
			if(h)
				this.height=h;
		},
		toString:function(){
			return this.inspect();
		},
		inspect:function(){
			return "#<OBSize:["+this.attr('width')+","+this.attr('height')+"]>";
		}
	});
	window.OBRect=Class.create(OBAttr,{
		origin:null,
		size:null,
		initialize:function(x,y,w,h){
			if(x==undefined ||  x==null){//assume no arguments
				this.origin=new OBPoint(0,0);
				this.size=new OBSize(0,0);
			}else if(x instanceof OBPoint){
				this.origin=x;
				this.size=y;
			}else{
				this.origin=new OBPoint(parseFloat(x),parseFloat(y));
				this.size=new OBSize(parseFloat(w),parseFloat(h));
			}
		},
		setter_x:function(v){
			this.origin.x=v;
		},
		getter_x:function(){
			return this.origin.x;
		},
		setter_y:function(v){
			this.origin.y=v;
		},
		getter_y:function(){
			return this.origin.y;
		},
		setter_width:function(v){
			this.size.width=v;
		},
		getter_width:function(){
			return this.size.width;
		},
		setter_height:function(v){
			this.size.height=v;
		},
		getter_height:function(){
			return this.size.height;
		},
		inspect:function(){
			return this.toString();
		},
		toString:function(){
			return "#<OBRect:["+this.origin.inspect()+","+this.size.inspect()+"]>";
		}
	});
	window.OBResponder={
		observe:function(name,handler){
			if(!this._evts)
				this._evts={};
			if(this._evts[name]===undefined){
				this._evts[name]=[];
			}
			if(this._evts[name].indexOf(handler)==-1)
				this._evts[name].push(handler);
		},
		fire:function(name,evt){
			if(!this._evts)
				this._evts={};
			if(this._evts[name]){
				this._evts[name].each(function(f){
					f(evt);
				});
			}
		},
		stopObserving:function(name,handler){
			if(!this._evts)
				this._evts={};
			this._evts[name].splice($A(this._evts[name]).indexOf(handler));
		}
	};
	window.OBView=Class.create(OBAttr,OBResponder,{
		_clip:null,
		frame:null,
		_bigcan:null,
		_ctx:null,
		_can:null,
		ctx:null,
		parent:null,
		childern:null,
		initialize:function(parent,frame){
			this.children=[];
			this.parent=parent?parent:ob.body;//ob.body will be null until it is created therefore, when we make the ob.body view, it will be null
			if(this.parent)
				this.parent.children.push(this);
			this.frame=frame;
			var arr=ob.createCanvas(this.frame.attr('size'));
			this._bigcan=arr[0];
			this._ctx=arr[1];
			arr=ob.createCanvas(this.frame.attr('size'));
			this._can=arr[0];
			this.ctx=arr[1];
			this.setup();
			this.update();
		},
		setup:function(){},
		update:function(){
			this.ctx.clearRect(0,0,this.attr("width"),this.attr("height"));
			this.redraw();
			this.updateBig();
		},
		updateBig:function(){
			this._ctx.clearRect(0,0,this.attr("width"),this.attr("height"));
			this._ctx.drawImage(this._can,0,0);
			this.children.each(function(chld){
				chld._drawIntoParent();
			});
			if(this.parent)
				this.parent.updateBig();
		},
		_drawIntoParent:function(){
			var clip=this.attr('clip');
			if(this.parent)
				this.parent._ctx.drawImage(this._bigcan,clip.attr('x'),clip.attr('y'),clip.attr('width'),clip.attr('height'),this.attr('x'),this.attr('y'),clip.attr('width'),clip.attr('height'));
		},
		getter_clip:function(){
			if(this._clip){
				return this._clip;
			}else{
				return new OBRect(0,0,this.attr("width"),this.attr("height"));
			}
		},
		setter_clip:function(clip){
			this._clip=clip;
			this.fire("clip_changed");
			this.update();
		},
		getter_origin:function(){
			return this.attr('frame').attr('origin');
		},
		getter_size:function(){
			return this.attr('frame').attr('size');
		},
		setter_origin:function(v){
			this.attr('frame').attr('origin',v);
			if(this.parent)
				this.parent.updateBig();
			this.fire("origin_changed");
		},
		setter_size:function(v){
			this.attr('frame').attr('size',v);
			this._bigcan.width=this.attr('width');
			this._bigcan.height=this.attr('height');
			this._can.width=this.attr('width');
			this._can.height=this.attr('height');
			this.fire("size_changed");
			this.update();
		},
		getter_x:function(){
			return this.attr('origin').attr('x');
		},
		getter_y:function(){
			return this.attr('origin').attr('y');
		},
		getter_width:function(){
			return this.attr('size').attr('width');
		},
		getter_height:function(){
			return this.attr('size').attr('height');
		},
		setter_x:function(v){
			this.attr('origin',new OBPoint(v,this.attr('y')));
		},
		setter_y:function(v){
			this.attr('origin',new OBPoint(this.attr('x'),v));
		},
		setter_width:function(v){
			this.attr('size',new OBSize(v,this.attr('h')));
		},
		setter_height:function(v){
			this.attr('size',new OBSize(this.attr('w'),v));
		},
		redraw:function(){}
	});
	
	document.observe("dom:loaded",function(){
		document.body.innerHTML="";
		document.body.style.overflow="hidden";
		var demin=document.viewport.getDimensions();
		ob.body=new OBView(null,new OBRect(0,0,demin.width,demin.height));
		ob.Body=ob.body;
		ob.body._bigcan.style.position="absolute";
		ob.body._bigcan.style.top="0px";
		ob.body._bigcan.style.left="0px";
		document.body.appendChild(ob.body._bigcan);
		document.observe('resize',function(){
			var d=document.viewport.getDemensions();
			ob.body.attr('size',new OBSize(d.width,d.height));
		});
	});
}