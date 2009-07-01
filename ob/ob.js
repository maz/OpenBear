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
		_tbox:null,
		_ctrl:false,
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
		},
		clone:function(){
			return new OBPoint(this.x,this.y);
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
		},
		clone:function(){
			return new OBSize(this.width,this.height);
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
		},
		toArray:function(){
			return [this.attr('x'),this.attr('y'),this.attr('width'),this.attr('height')];
		},
		intersects:function(val){
			if(val instanceof OBPoint){
				return val.attr('x')>=this.attr('x') && val.attr("x")<=this.attr('x')+this.attr("width") && val.attr('y')>=this.attr('y') && val.attr("y")<=this.attr('y')+this.attr("height");
			}else if(val instanceof OBRect){
				throw new Error("OBRect.intersects(OBRect) is not implemented");
			}else{
				return false;
			}
		},
		clone:function(){
			return new OBRect(this.origin.clone(),this.size.clone());
		}
	});
	window.OBColor=Class.create(OBAttr,{
		red:0,
		green:0,
		blue:0,
		alpha:0,
		initialize:function(r,g,b,a){
			if(Object.isArray(r)){
				this.intiailize.apply(this,r);
			}else{
				this.red=r;
				this.green=g;
				this.blue=b;
				if(Object.isNumber(a)){
					this.alpha=a;
				}else{
					this.alpha=1.0;
				}
			}
		},
		toString:function(){
			return "rgba("+this.red+","+this.green+","+this.blue+","+this.alpha+")";
		},
		clone:function(){
			return new OBColor(this.red,this.green,this.blue);
		}
	});
	OBColor.IndianRed=new OBColor(205,92,92)
	OBColor.LightCoral=new OBColor(240,128,128)
	OBColor.Salmon=new OBColor(250,128,114)
	OBColor.DarkSalmon=new OBColor(233,150,122)
	OBColor.LightSalmon=new OBColor(255,160,122)
	OBColor.Crimson=new OBColor(220,20,60)
	OBColor.Red=new OBColor(255,0,0)
	OBColor.FireBrick=new OBColor(178,34,34)
	OBColor.DarkRed=new OBColor(139,0,0)
	OBColor.Pink=new OBColor(255,192,203)
	OBColor.LightPink=new OBColor(255,182,193)
	OBColor.HotPink=new OBColor(255,105,180)
	OBColor.DeepPink=new OBColor(255,20,147)
	OBColor.MediumVioletRed=new OBColor(199,21,133)
	OBColor.PaleVioletRed=new OBColor(219,112,147)
	OBColor.LightSalmon=new OBColor(255,160,122)
	OBColor.Coral=new OBColor(255,127,80)
	OBColor.Tomato=new OBColor(255,99,71)
	OBColor.OrangeRed=new OBColor(255,69,0)
	OBColor.DarkOrange=new OBColor(255,140,0)
	OBColor.Orange=new OBColor(255,165,0)
	OBColor.Gold=new OBColor(255,215,0)
	OBColor.Yellow=new OBColor(255,255,0)
	OBColor.LightYellow=new OBColor(255,255,224)
	OBColor.LemonChiffon=new OBColor(255,250,205)
	OBColor.LightGoldenrodYellow=new OBColor(250,250,210)
	OBColor.PapayaWhip=new OBColor(255,239,213)
	OBColor.Moccasin=new OBColor(255,228,181)
	OBColor.PeachPuff=new OBColor(255,218,185)
	OBColor.PaleGoldenrod=new OBColor(238,232,170)
	OBColor.Khaki=new OBColor(240,230,140)
	OBColor.DarkKhaki=new OBColor(189,183,107)
	OBColor.Lavender=new OBColor(230,230,250)
	OBColor.Thistle=new OBColor(216,191,216)
	OBColor.Plum=new OBColor(221,160,221)
	OBColor.Violet=new OBColor(238,130,238)
	OBColor.Orchid=new OBColor(218,112,214)
	OBColor.Fuchsia=new OBColor(255,0,255)
	OBColor.Magenta=new OBColor(255,0,255)
	OBColor.MediumOrchid=new OBColor(186,85,211)
	OBColor.MediumPurple=new OBColor(147,112,219)
	OBColor.Amethyst=new OBColor(153,102,204)
	OBColor.BlueViolet=new OBColor(138,43,226)
	OBColor.DarkViolet=new OBColor(148,0,211)
	OBColor.DarkOrchid=new OBColor(153,50,204)
	OBColor.DarkMagenta=new OBColor(139,0,139)
	OBColor.Purple=new OBColor(128,0,128)
	OBColor.Indigo=new OBColor(75,0,130)
	OBColor.SlateBlue=new OBColor(106,90,205)
	OBColor.DarkSlateBlue=new OBColor(72,61,139)
	OBColor.MediumSlateBlue=new OBColor(123,104,238)
	OBColor.GreenYellow=new OBColor(173,255,47)
	OBColor.Chartreuse=new OBColor(127,255,0)
	OBColor.LawnGreen=new OBColor(124,252,0)
	OBColor.Lime=new OBColor(0,255,0)
	OBColor.LimeGreen=new OBColor(50,205,50)
	OBColor.PaleGreen=new OBColor(152,251,152)
	OBColor.LightGreen=new OBColor(144,238,144)
	OBColor.MediumSpringGreen=new OBColor(0,250,154)
	OBColor.SpringGreen=new OBColor(0,255,127)
	OBColor.MediumSeaGreen=new OBColor(60,179,113)
	OBColor.SeaGreen=new OBColor(46,139,87)
	OBColor.ForestGreen=new OBColor(34,139,34)
	OBColor.Green=new OBColor(0,128,0)
	OBColor.DarkGreen=new OBColor(0,100,0)
	OBColor.YellowGreen=new OBColor(154,205,50)
	OBColor.OliveDrab=new OBColor(107,142,35)
	OBColor.Olive=new OBColor(128,128,0)
	OBColor.DarkOliveGreen=new OBColor(85,107,47)
	OBColor.MediumAquamarine=new OBColor(102,205,170)
	OBColor.DarkSeaGreen=new OBColor(143,188,143)
	OBColor.LightSeaGreen=new OBColor(32,178,170)
	OBColor.DarkCyan=new OBColor(0,139,139)
	OBColor.Teal=new OBColor(0,128,128)
	OBColor.Aqua=new OBColor(0,255,255)
	OBColor.Cyan=new OBColor(0,255,255)
	OBColor.LightCyan=new OBColor(224,255,255)
	OBColor.PaleTurquoise=new OBColor(175,238,238)
	OBColor.Aquamarine=new OBColor(127,255,212)
	OBColor.Turquoise=new OBColor(64,224,208)
	OBColor.MediumTurquoise=new OBColor(72,209,204)
	OBColor.DarkTurquoise=new OBColor(0,206,209)
	OBColor.CadetBlue=new OBColor(95,158,160)
	OBColor.SteelBlue=new OBColor(70,130,180)
	OBColor.LightSteelBlue=new OBColor(176,196,222)
	OBColor.PowderBlue=new OBColor(176,224,230)
	OBColor.LightBlue=new OBColor(173,216,230)
	OBColor.SkyBlue=new OBColor(135,206,235)
	OBColor.LightSkyBlue=new OBColor(135,206,250)
	OBColor.DeepSkyBlue=new OBColor(0,191,255)
	OBColor.DodgerBlue=new OBColor(30,144,255)
	OBColor.CornflowerBlue=new OBColor(100,149,237)
	OBColor.MediumSlateBlue=new OBColor(123,104,238)
	OBColor.RoyalBlue=new OBColor(65,105,225)
	OBColor.Blue=new OBColor(0,0,255)
	OBColor.MediumBlue=new OBColor(0,0,205)
	OBColor.DarkBlue=new OBColor(0,0,139)
	OBColor.Navy=new OBColor(0,0,128)
	OBColor.MidnightBlue=new OBColor(25,25,112)
	OBColor.Cornsilk=new OBColor(255,248,220)
	OBColor.BlanchedAlmond=new OBColor(255,235,205)
	OBColor.Bisque=new OBColor(255,228,196)
	OBColor.NavajoWhite=new OBColor(255,222,173)
	OBColor.Wheat=new OBColor(245,222,179)
	OBColor.BurlyWood=new OBColor(222,184,135)
	OBColor.Tan=new OBColor(210,180,140)
	OBColor.RosyBrown=new OBColor(188,143,143)
	OBColor.SandyBrown=new OBColor(244,164,96)
	OBColor.Goldenrod=new OBColor(218,165,32)
	OBColor.DarkGoldenrod=new OBColor(184,134,11)
	OBColor.Peru=new OBColor(205,133,63)
	OBColor.Chocolate=new OBColor(210,105,30)
	OBColor.SaddleBrown=new OBColor(139,69,19)
	OBColor.Sienna=new OBColor(160,82,45)
	OBColor.Brown=new OBColor(165,42,42)
	OBColor.Maroon=new OBColor(128,0,0)
	OBColor.White=new OBColor(255,255,255)
	OBColor.Snow=new OBColor(255,250,250)
	OBColor.Honeydew=new OBColor(240,255,240)
	OBColor.MintCream=new OBColor(245,255,250)
	OBColor.Azure=new OBColor(240,255,255)
	OBColor.AliceBlue=new OBColor(240,248,255)
	OBColor.GhostWhite=new OBColor(248,248,255)
	OBColor.WhiteSmoke=new OBColor(245,245,245)
	OBColor.Seashell=new OBColor(255,245,238)
	OBColor.Beige=new OBColor(245,245,220)
	OBColor.OldLace=new OBColor(253,245,230)
	OBColor.FloralWhite=new OBColor(255,250,240)
	OBColor.Ivory=new OBColor(255,255,240)
	OBColor.AntiqueWhite=new OBColor(250,235,215)
	OBColor.Linen=new OBColor(250,240,230)
	OBColor.LavenderBlush=new OBColor(255,240,245)
	OBColor.MistyRose=new OBColor(255,228,225)
	OBColor.Gainsboro=new OBColor(220,220,220)
	OBColor.LightGrey=new OBColor(211,211,211)
	OBColor.Silver=new OBColor(192,192,192)
	OBColor.DarkGray=new OBColor(169,169,169)
	OBColor.Gray=new OBColor(128,128,128)
	OBColor.DimGray=new OBColor(105,105,105)
	OBColor.LightSlateGray=new OBColor(119,136,153)
	OBColor.SlateGray=new OBColor(112,128,144)
	OBColor.DarkSlateGray=new OBColor(47,79,79)
	OBColor.Black=new OBColor(0,0,0)
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
			if(this.attr('focused')){
				this._ctx.strokeStyle=OBView.FocusColor.toString();
				this._ctx.lineWidth=OBView.FocusWidth;
				this._ctx.strokeRect.apply(this._ctx,this.attr('clip').toArray());
			}
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
		redraw:function(){},
		acceptsFocus:true,
		nextKeyView:null,
		getter_focused:function(){
			return OBView.focused==this;
		},
		setter_focused:function(v){
			if(v){
				this.focus();
			}else{
				this.blur();
			}
		},
		focus:function(){
			if(this.attr('focused') && this.acceptsFocus)
				return;
			if(OBView.focused)
				OBView.focused.blur();
			OBView.focused=this;
			this.fire('got_focus');
			this.update();
		},
		blur:function(){
			if(this.attr('focused')){
				OBView.focused=null;
				this.fire('lost_focus');
				this.updateBig();
			}
		},
		setter_dispRect:function(){
			throw new Error("OBView.attr('dispRect') is a read-only property");
		},
		getter_dispRect:function(){
			return new OBRect(this.attr('frame').attr('origin'),this.attr('clip').attr('size'));
		},
		_mousedown:function(evt){
			if(this.acceptsFocus && (!ob._onRun || this._children.length==0)){
				if(this.attr('focused')){
					return this.mousedown(evt);
				}else{
					this.focus();
				}
			}else{
				return this.mousedown(evt);
			}
		},
		mousedown:function(evt){},
		mouseup:function(evt){},
		mousemove:function(evt){},
		_keydown:function(evt){
			if(evt.keyCode==Event.KEY_TAB && this.nextKeyView){
				this.nextKeyView.focus();
			}else{
				this.keydown(evt);
			}
		},
		keydown:function(evt){},
		keyup:function(evt){},
		_handleEvt:function(name,e){
			var evt=e;
			var clip=this.attr('clip');
			evt.point=evt.point.clone();
			evt.point.attr('x',(evt.point.attr('x')-this.attr('x'))+clip.attr('x'));
			evt.point.attr('y',(evt.point.attr('y')-this.attr('y'))+clip.attr('y'));
			var c=null;
			this._children=[];
			this.children.each(function(chld){
				if(chld.attr('dispRect').intersects(evt.point)){
					c=chld;
					this._children.push(chld);
				}
			},this);
			if((c && !c._handleEvt(name,evt)) || !c){
				return this[name](evt);
			}else{
				return true;
			}
		}
	});
	
	OBView.focused=null;
	OBView.FocusColor=OBColor.Orange;
	OBView.FocusWidth=5;
	
	document.observe("dom:loaded",function(){
		document.body.innerHTML="";
		document.body.style.overflow="hidden";
		var demin=document.viewport.getDimensions();
		ob.body=new OBView(null,new OBRect(0,0,demin.width,demin.height));
		ob.Body=ob.body;
		ob.body._bigcan.style.position="absolute";
		ob.body._bigcan.style.top="0px";
		ob.body._bigcan.style.left="0px";
		ob.body._bigcan.style.zIndex=50;
		ob.body.acceptsFocus=false;
		document.body.appendChild(ob.body._bigcan);
		document.observe('resize',function(){
			var d=document.viewport.getDemensions();
			ob.body.attr('size',new OBSize(d.width,d.height));
		});
		ob._tbox=Element.extend(document.createElement("input"));
		ob._tbox.type="text";
		ob._tbox.style.position="absolute";
		ob._tbox.style.top="-100px";
		ob._tbox.style.left="-100px";
		ob._tbox.style.zIndex=1;
		document.body.appendChild(ob._tbox);
		ob._tbox.focus();
		ob._tbox.observe("blur",function(){
			ob._tbox.focus();
		});
		ob._tbox.observe("keydown",function(evt){
			evt=Event.extend(evt);
			if(OBView.focused){
				OBView.focused._keydown(evt);
			}
			ob.ctrl=evt.ctrlKey;
		}.bindAsEventListener(window));
		ob._tbox.observe("keyup",function(evt){
			evt=Event.extend(evt);
			if(OBView.focused){
				OBView.focused.keyup(evt);
			}
			ob.ctrl=evt.ctrlKey;
		}.bindAsEventListener(window));
		document.observe("mousedown",function(evt){
			evt=Event.extend(evt);
			var right=(!evt.isLeftClick() || (navigator.platform.indexOf("Mac")!=-1 && ob.ctrl));
			ob._onRun=true;
			ob.body._handleEvt('_mousedown',{
				point:new OBPoint(evt.pointerX(),evt.pointerY()),
				right:right,
				left:!right
			});
			ob._onRun=false;
		}.bindAsEventListener(window));
		document.observe("mouseup",function(evt){
			evt=Event.extend(evt);
			var right=(!evt.isLeftClick() || (navigator.platform.indexOf("Mac")!=-1 && ob.ctrl));
			ob.body._handleEvt('mouseup',{
				point:new OBPoint(evt.pointerX(),evt.pointerY()),
				right:right,
				left:!right
			});
		}.bindAsEventListener(window));
		document.observe("mousemove",function(evt){
			//TODO: mouse over, mouse out, mouse move
		}.bindAsEventListener(window));
		document.body.oncontextmenu=function(evt){
			evt=evt?evt:window.event;
			if(evt.preventDefault)
				evt.preventDefault();
			return false;
		};
	});
}