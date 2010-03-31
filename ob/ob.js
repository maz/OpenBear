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
	throw new Error("You need to include prototype (http://www.prototypejs.org/).");
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
	alert("This web page does not work in Internet Explorer. You might want to try using Mozilla Firefox (http://www.firefox.com/) instead.");
	throw new Error("Although this page has ExCanvas, ExCanvas (currently) does not support using canvas tags as quasy images.");
}
if(!window.ob){
	/** @id Number_toRadians */
	Number.prototype.toRadians=function Number_toRadians(){
		return this*ob._trconst;
	};
	/** @id Number_toDegrees */
	Number.prototype.toDegrees=function Number_toRadians(){
		return this*ob._tdconst;
	};
	window.ob={
		_trconst:Math.PI/180,
		_tdconst:180/Math.PI,
		_loadedPkgs:[],
		/** @id ob_load */
		load:function ob_load(p){
			var pkg=p;
			if(ob._loadedPkgs.indexOf(pkg)!=-1){
				return;
			}
			var arr=pkg.split('.');
			var file=arr.pop();
			var op=Ajax.getTransport();
			op.open('get',ob.moduleUrl(arr.join("."),file+".js"),false);
			op.send(null);
			if(op.status==404){
				throw new Error("The package, \""+pkg+",\" could not be found by ob.load()");
			}else{
				var x=new Function(op.responseText);
				x.apply(window,[]);
				ob._loadedPkgs.push(pkg);
			}
		},
		// ====================================================================================================
		// = Thanks to Objetive-J/Cappuccino (www.cappuccino.org) for providing a basis of the below function =
		// ====================================================================================================
		getFrameWindow:function ob_getFrameWindow(f){
			return (f.contentDocument && f.contentDocument.defaultView) || f.contentWindow;
		},
		/** @id ob_moduleUrl */
		moduleUrl:function ob_moduleUrl(pkg, file){
			var arr=pkg.split(".");
			var base=window.OBDirectoryPrefix?window.OBDirectoryPrefix:"";
			var x=base+arr.join("/");
			if(x[x.length-1]!='/'){
				x+='/';
			}
			return x+file;
		},
		/** @id ob_setObject */
		setObject:function ob_setObject(path,value){
			var obj=window;
			var arr=path.split(".");
			var name=arr.pop();
			arr.each(function(part){
				if(!obj[part]){
					obj[part]={};
				}
				obj=obj[part];
			});
			obj[name]=value;
		},
		body:null,
		Body:null,
		_tbox:null,
		_ctrl:false,
		_over:[],
		/** @id ob_createCanvas*/
		createCanvas:function ob_createCanvas(size){
			var elem=document.createElement('canvas');
			elem.width=size.attr('width');
			elem.height=size.attr('height');
			if(Prototype.Browser.IE){
				G_vmlCanvasManager.initElement(elem);
			}
			var ctx=elem.getContext('2d');
			if(ctx.mozDrawText){
				ctx.fillText=function ob_createCanvas_fillText(txt,x,y){
					ctx.save();
					ctx.translate(x,y);
					ctx.mozTextStyle=ctx.font;
					ctx.mozDrawText(txt);
					ctx.restore();
				};
			}
			if(!ctx.arcTo){
				ctx.arcTo=ctx.arc;
			}
			ctx.drawSlicedImage=function ob_createCanvas_drawSlicedImage(slices,x,y,wid,hei){
				if(slices.length==3){
					ctx.save();
						ctx.translate(x,y);
						ctx.drawImage(slices[0],0,0);
						ctx.drawImage(slices[1],slices[0].width,0,wid-(slices[0].width+slices[2].width),slices[1].height);
						ctx.drawImage(slices[2],wid-slices[2].width,0);
					ctx.restore();
				}else if(slices.length==9){
					ctx.save();
						ctx.translate(x,y);
						ctx.drawImage(slices[0],0,0);
						ctx.drawImage(slices[1],slices[0].width,0,wid-(slices[0].width+slices[2].width),slices[1].height);
						ctx.drawImage(slices[2],wid-slices[2].width,0);
						ctx.drawImage(slices[3],0,slices[0].height,slices[3].width,hei-(slices[0].height+slices[6].height));
						ctx.drawImage(slices[4],slices[3].width,slices[1].height,wid-(slices[3].width+slices[5].width),hei-(slices[1].height+slices[7].height));
						ctx.drawImage(slices[5],wid-slices[5].width,slices[2].height,slices[5].width,hei-(slices[2].height+slices[8].height));
						ctx.drawImage(slices[6],0,hei-slices[6].height);
						ctx.drawImage(slices[7],slices[6].width,hei-slices[7].height,wid-(slices[6].width+slices[8].width),slices[7].height);
						ctx.drawImage(slices[8],wid-slices[8].width,hei-slices[8].height);
					ctx.restore();
				}
			};
			ctx._mtxt=ctx.measureText?ctx.measureText:ctx.mozMeasureText;
			ctx.measureText=function ob_createCanvas_measureText(txt){
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
				var w=ctx.measureTextWidth(txt);
				if(ob._mspan.firstChild){
					ob._mspan.firstChild.data=txt;
				}else{
					ob._mspan.appendChild(document.createTextNode(txt));
				}
				return new OBSize(w,ob._mspan.offsetHeight);
			};
			ctx.measureTextWidth=function ob_createCanvas_measureTextWidth(txt){
				ctx.mozTextStyle=ctx.font;
				var w=ctx._mtxt(txt);
				if(!Object.isNumber(w)){
					w=w.width;
				}
				return w;
			};
			return [elem,ctx];
		},
		mouseHandlers:[]
	};
	/** @id OBAttr */
	window.OBAttr={
		/** @id OBAttr_attr */
		attr:function OBAttr_attr(name,val){
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
				return this;
			}
		}
	};
	window.OBPoint=Class.create(OBAttr,{
		/** @id OPPoint */
		initialize:function OBPoint_constructor(x,y){
			if(x){
				this.x=x;
			}
			if(y){
				this.y=y;
			}
		},
		x:0,
		y:0,
		toString:function OBPoint_toString(){
			return this.inspect();
		},
		inspect:function OBPoint_inspect(){
			return "#<OBPoint:["+this.attr('x')+","+this.attr('y')+"]>";
		},
		rotate:function OBPoint_rotate(rad,around){
			this.subtract(around);
			this.x=(this.x*Math.cos(rad))-(this.y*Math.sin(rad));
			this.y=(this.x*Math.sin(rad))+(this.y*Math.cos(rad));
			this.add(around);
		},
		clone:function OBPoint_clone(){
			return new OBPoint(this.x,this.y);
		},
		add:function OBPoint_add(p){
			this.x+=p.x;
			this.y+=p.y;
		},
		subtract:function OBPoint_subtract(p){
			this.x-=p.x;
			this.y-=p.y;
		},
		multiply:function OBPoint_multiply(p){
			this.x*=p.x;
			this.y*=p.y;
		},
		divide:function OBPoint_divide(p){
			this.x/=p.x;
			this.y/=p.y;
		}
	});
	window.OBSize=Class.create(OBAttr,{
		width:0,
		height:0,
		initialize:function OBSize_constrcutor(w,h){
			if(w){
				this.width=w;
			}
			if(h){
				this.height=h;
			}
		},
		toString:function OBSize_toString(){
			return this.inspect();
		},
		inspect:function OBSize_inspect(){
			return "#<OBSize:["+this.attr('width')+","+this.attr('height')+"]>";
		},
		clone:function OBSize_clone(){
			return new OBSize(this.width,this.height);
		},
		setter_h:function OBSize_setter_h(h){
			this.height=h;
		},
		getter_h:function OBSize_getter_h(){
			return this.height;
		},
		setter_w:function OBSize_setter_w(h){
			this.width=h;
		},
		getter_w:function OBSize_getter_w(){
			return this.width;
		},
		add:function OBSize_add(s){
			this.width+=s.width;
			this.height+=s.height;
		},
		subtract:function OBSize_subtract(s){
			this.width-=s.width;
			this.height-=s.height;
		},
		multislheight:function OBSize_multislheight(s){
			this.width*=s.width;
			this.height*=s.height;
		},
		divide:function OBSize_divide(s){
			this.width/=s.width;
			this.height/=s.height;
		}
	});
	window.OBRect=Class.create(OBAttr,{
		origin:null,
		size:null,
		initialize:function OBRect_constructor(x,y,w,h){
			if(x===undefined || x===null){//assume no arguments
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
		add:function OBRect_add(r){
			this.origin.add(r.origin);
			this.size.add(r.size);
		},
		subtract:function OBRect_subtract(r){
			this.origin.subtract(r.origin);
			this.size.subtract(r.size);
		},
		multiply:function OBRect_multiply(r){
			this.origin.multiply(r.origin);
			this.size.multiply(r.size);
		},
		divide:function OBRect_divide(r){
			this.origin.divide(r.origin);
			this.size.divide(r.size);
		},
		setter_x:function OBRect_setter_x(v){
			this.origin.x=v;
		},
		getter_x:function OBRect_getter_x(){
			return this.origin.x;
		},
		setter_y:function OBRect_setter_y(v){
			this.origin.y=v;
		},
		getter_y:function OBRect_setter_y(){
			return this.origin.y;
		},
		setter_width:function OBRect_setter_width(v){
			this.size.width=v;
		},
		getter_width:function OBRect_getter_width(){
			return this.size.width;
		},
		setter_height:function OBRect_setter_height(v){
			this.size.height=v;
		},
		getter_height:function OBRect_getter_height(){
			return this.size.height;
		},
		getter_w:function OBRect_getter_w(){
			return this.getter_width();
		},
		getter_h:function OBRect_getter_h(){
			return this.getter_height();
		},
		setter_w:function OBRect_setter_w(v){
			this.setter_width(v);
		},
		setter_h:function OBRect_setter_h(v){
			this.setter_height(v);
		},
		inspect:function OBRect_inspect(){
			return this.toString();
		},
		toString:function OBRect_toString(){
			return "#<OBRect:["+this.origin.inspect()+","+this.size.inspect()+"]>";
		},
		toArray:function OBRect_toArray(){
			return [this.attr('x'),this.attr('y'),this.attr('width'),this.attr('height')];
		},
		intersects:function OBRect_intersects(val,radians){
			if(val instanceof OBPoint){
				if(radians){
					
				}else{
					return val.attr('x')>=this.attr('x') && val.attr("x")<=this.attr('x')+this.attr("width") && val.attr('y')>=this.attr('y') && val.attr("y")<=this.attr('y')+this.attr("height");
				}
			}else if(val instanceof OBRect){
				throw new Error("OBRect.intersects(OBRect) is not implemented");
			}else{
				return false;
			}
		},
		clone:function OBRect_clone(){
			return new OBRect(this.origin.clone(),this.size.clone());
		}
	});
	window.OBColor=Class.create(OBAttr,{
		red:0,
		green:0,
		blue:0,
		alpha:0,
		initialize:function OBColor_constructor(r,g,b,a){
			if(Object.isArray(r)){
				this.intiailize.apply(this,r);
			}else if(r instanceof OBColor){
				return this.initialize(r.attr("r"),r.attr("g"),r.attr("b"),g);
			}else{
				this.red=(r<1 && r!=0)?r*255:r;
				this.green=(g<1 && g!=0)?g*255:g;
				this.blue=(b<1 && b!=0)?b*255:b;
				if(Object.isNumber(a)){
					this.alpha=a;
				}else{
					this.alpha=1.0;
				}
			}
		},
		toString:function OBColor_toString(){
			return "rgba("+this.red+","+this.green+","+this.blue+","+this.alpha+")";
		},
		clone:function OBColor_clone(){
			return new OBColor(this.red,this.green,this.blue);
		},
		setter_r:function OBColor_setetr_r(v){
			this.red=v;
		},
		getter_r:function OBColor_getter_r(){
			return this.red;
		},
		setter_g:function OBColor_setter_g(v){
			this.green=v;
		},
		getter_g:function OBColor_getter_g(){
			return this.green;
		},
		setter_b:function OBColor_setter_b(v){
			this.blue=v;
		},
		getter_b:function OBColor_getter_b(){
			return this.blue;
		},
		inspect:function(){
			return this.toString();
		}
	});
	OBColor.IndianRed=new OBColor(205,92,92);
	OBColor.LightCoral=new OBColor(240,128,128);
	OBColor.Salmon=new OBColor(250,128,114);
	OBColor.DarkSalmon=new OBColor(233,150,122);
	OBColor.LightSalmon=new OBColor(255,160,122);
	OBColor.Crimson=new OBColor(220,20,60);
	OBColor.Red=new OBColor(255,0,0);
	OBColor.FireBrick=new OBColor(178,34,34);
	OBColor.DarkRed=new OBColor(139,0,0);
	OBColor.Pink=new OBColor(255,192,203);
	OBColor.LightPink=new OBColor(255,182,193);
	OBColor.HotPink=new OBColor(255,105,180);
	OBColor.DeepPink=new OBColor(255,20,147);
	OBColor.MediumVioletRed=new OBColor(199,21,133);
	OBColor.PaleVioletRed=new OBColor(219,112,147);
	OBColor.LightSalmon=new OBColor(255,160,122);
	OBColor.Coral=new OBColor(255,127,80);
	OBColor.Tomato=new OBColor(255,99,71);
	OBColor.OrangeRed=new OBColor(255,69,0);
	OBColor.DarkOrange=new OBColor(255,140,0);
	OBColor.Orange=new OBColor(255,165,0);
	OBColor.Gold=new OBColor(255,215,0);
	OBColor.Yellow=new OBColor(255,255,0);
	OBColor.LightYellow=new OBColor(255,255,224);
	OBColor.LemonChiffon=new OBColor(255,250,205);
	OBColor.LightGoldenrodYellow=new OBColor(250,250,210);
	OBColor.PapayaWhip=new OBColor(255,239,213);
	OBColor.Moccasin=new OBColor(255,228,181);
	OBColor.PeachPuff=new OBColor(255,218,185);
	OBColor.PaleGoldenrod=new OBColor(238,232,170);
	OBColor.Khaki=new OBColor(240,230,140);
	OBColor.DarkKhaki=new OBColor(189,183,107);
	OBColor.Lavender=new OBColor(230,230,250);
	OBColor.Thistle=new OBColor(216,191,216);
	OBColor.Plum=new OBColor(221,160,221);
	OBColor.Violet=new OBColor(238,130,238);
	OBColor.Orchid=new OBColor(218,112,214);
	OBColor.Fuchsia=new OBColor(255,0,255);
	OBColor.Magenta=new OBColor(255,0,255);
	OBColor.MediumOrchid=new OBColor(186,85,211);
	OBColor.MediumPurple=new OBColor(147,112,219);
	OBColor.Amethyst=new OBColor(153,102,204);
	OBColor.BlueViolet=new OBColor(138,43,226);
	OBColor.DarkViolet=new OBColor(148,0,211);
	OBColor.DarkOrchid=new OBColor(153,50,204);
	OBColor.DarkMagenta=new OBColor(139,0,139);
	OBColor.Purple=new OBColor(128,0,128);
	OBColor.Indigo=new OBColor(75,0,130);
	OBColor.SlateBlue=new OBColor(106,90,205);
	OBColor.DarkSlateBlue=new OBColor(72,61,139);
	OBColor.MediumSlateBlue=new OBColor(123,104,238);
	OBColor.GreenYellow=new OBColor(173,255,47);
	OBColor.Chartreuse=new OBColor(127,255,0);
	OBColor.LawnGreen=new OBColor(124,252,0);
	OBColor.Lime=new OBColor(0,255,0);
	OBColor.LimeGreen=new OBColor(50,205,50);
	OBColor.PaleGreen=new OBColor(152,251,152);
	OBColor.LightGreen=new OBColor(144,238,144);
	OBColor.MediumSpringGreen=new OBColor(0,250,154);
	OBColor.SpringGreen=new OBColor(0,255,127);
	OBColor.MediumSeaGreen=new OBColor(60,179,113);
	OBColor.SeaGreen=new OBColor(46,139,87);
	OBColor.ForestGreen=new OBColor(34,139,34);
	OBColor.Green=new OBColor(0,128,0);
	OBColor.DarkGreen=new OBColor(0,100,0);
	OBColor.YellowGreen=new OBColor(154,205,50);
	OBColor.OliveDrab=new OBColor(107,142,35);
	OBColor.Olive=new OBColor(128,128,0);
	OBColor.DarkOliveGreen=new OBColor(85,107,47);
	OBColor.MediumAquamarine=new OBColor(102,205,170);
	OBColor.DarkSeaGreen=new OBColor(143,188,143);
	OBColor.LightSeaGreen=new OBColor(32,178,170);
	OBColor.DarkCyan=new OBColor(0,139,139);
	OBColor.Teal=new OBColor(0,128,128);
	OBColor.Aqua=new OBColor(0,255,255);
	OBColor.Cyan=new OBColor(0,255,255);
	OBColor.LightCyan=new OBColor(224,255,255);
	OBColor.PaleTurquoise=new OBColor(175,238,238);
	OBColor.Aquamarine=new OBColor(127,255,212);
	OBColor.Turquoise=new OBColor(64,224,208);
	OBColor.MediumTurquoise=new OBColor(72,209,204);
	OBColor.DarkTurquoise=new OBColor(0,206,209);
	OBColor.CadetBlue=new OBColor(95,158,160);
	OBColor.SteelBlue=new OBColor(70,130,180);
	OBColor.LightSteelBlue=new OBColor(176,196,222);
	OBColor.PowderBlue=new OBColor(176,224,230);
	OBColor.LightBlue=new OBColor(173,216,230);
	OBColor.SkyBlue=new OBColor(135,206,235);
	OBColor.LightSkyBlue=new OBColor(135,206,250);
	OBColor.DeepSkyBlue=new OBColor(0,191,255);
	OBColor.DodgerBlue=new OBColor(30,144,255);
	OBColor.CornflowerBlue=new OBColor(100,149,237);
	OBColor.MediumSlateBlue=new OBColor(123,104,238);
	OBColor.RoyalBlue=new OBColor(65,105,225);
	OBColor.Blue=new OBColor(0,0,255);
	OBColor.MediumBlue=new OBColor(0,0,205);
	OBColor.DarkBlue=new OBColor(0,0,139);
	OBColor.Navy=new OBColor(0,0,128);
	OBColor.MidnightBlue=new OBColor(25,25,112);
	OBColor.Cornsilk=new OBColor(255,248,220);
	OBColor.BlanchedAlmond=new OBColor(255,235,205);
	OBColor.Bisque=new OBColor(255,228,196);
	OBColor.NavajoWhite=new OBColor(255,222,173);
	OBColor.Wheat=new OBColor(245,222,179);
	OBColor.BurlyWood=new OBColor(222,184,135);
	OBColor.Tan=new OBColor(210,180,140);
	OBColor.RosyBrown=new OBColor(188,143,143);
	OBColor.SandyBrown=new OBColor(244,164,96);
	OBColor.Goldenrod=new OBColor(218,165,32);
	OBColor.DarkGoldenrod=new OBColor(184,134,11);
	OBColor.Peru=new OBColor(205,133,63);
	OBColor.Chocolate=new OBColor(210,105,30);
	OBColor.SaddleBrown=new OBColor(139,69,19);
	OBColor.Sienna=new OBColor(160,82,45);
	OBColor.Brown=new OBColor(165,42,42);
	OBColor.Maroon=new OBColor(128,0,0);
	OBColor.White=new OBColor(255,255,255);
	OBColor.Snow=new OBColor(255,250,250);
	OBColor.Honeydew=new OBColor(240,255,240);
	OBColor.MintCream=new OBColor(245,255,250);
	OBColor.Azure=new OBColor(240,255,255);
	OBColor.AliceBlue=new OBColor(240,248,255);
	OBColor.GhostWhite=new OBColor(248,248,255);
	OBColor.WhiteSmoke=new OBColor(245,245,245);
	OBColor.Seashell=new OBColor(255,245,238);
	OBColor.Beige=new OBColor(245,245,220);
	OBColor.OldLace=new OBColor(253,245,230);
	OBColor.FloralWhite=new OBColor(255,250,240);
	OBColor.Ivory=new OBColor(255,255,240);
	OBColor.AntiqueWhite=new OBColor(250,235,215);
	OBColor.Linen=new OBColor(250,240,230);
	OBColor.LavenderBlush=new OBColor(255,240,245);
	OBColor.MistyRose=new OBColor(255,228,225);
	OBColor.Gainsboro=new OBColor(220,220,220);
	OBColor.LightGrey=new OBColor(211,211,211);
	OBColor.Silver=new OBColor(192,192,192);
	OBColor.DarkGray=new OBColor(169,169,169);
	OBColor.Gray=new OBColor(128,128,128);
	OBColor.DimGray=new OBColor(105,105,105);
	OBColor.LightSlateGray=new OBColor(119,136,153);
	OBColor.SlateGray=new OBColor(112,128,144);
	OBColor.DarkSlateGray=new OBColor(47,79,79);
	OBColor.Black=new OBColor(0,0,0);
	window.OBResponder={
		observe:function OBResponder_observe(name,handler){
			if(!this._evts){
				this._evts={};
			}
			if(this._evts[name]===undefined){
				this._evts[name]=[];
			}
			if(this._evts[name].indexOf(handler)==-1){
				this._evts[name].push(handler);
			}
		},
		fire:function OBResponder_fire(name,evt){
			if(!this._evts){
				this._evts={};
			}
			if(this._evts[name]){
				this._evts[name].each(function(f){
					f(evt);
				});
			}
		},
		stopObserving:function OBResponder_stopObserving(name,handler){
			if(!this._evts){
				this._evts={};
			}
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
		visible:true,
		opacity:1.0,
		rotation:0,//radians
		_buffer:false,
		initialize:function OBView_constructor(parent,frame){
			this.autoresize=0;
			this.children=[];
			this.parent=parent?parent:ob.body;//ob.body will be null until it is created therefore, when we make the ob.body view, it will be null
			if(this.parent){
				this.parent.children.push(this);
			}
			this.frame=frame;
			this._rcenter=new OBPoint((this.attr('width')/2)+this.attr('x'),(this.attr('height')/2)+this.attr('y'));
			var arr=ob.createCanvas(this.frame.attr('size'));
			this._bigcan=arr[0];
			this._ctx=arr[1];
			arr=ob.createCanvas(this.frame.attr('size'));
			this._can=arr[0];
			this.ctx=arr[1];
			arr=$A(arguments);
			arr.splice(0,2);//remove parent,frame
			this.buffer();
			this.setup.apply(this,arr);
			if(this.parent){
				this.parent.fire("added_child",this);
			}
			this.commit();
		},
		setup:function OBView_setup(){},
		update:function OBView_update(){
			if(this._buffer){
				return;
			}
			this.ctx.clearRect(0,0,this.attr("width"),this.attr("height"));
			this.redraw();
			this.updateBig();
		},
		updateBig:function OBView_updateBig(){
			if(this._buffer){
				return;
			}
			this._ctx.clearRect(0,0,this.attr("width"),this.attr("height"));
			this._ctx.drawImage(this._can,0,0);
			this.children.each(function(chld){
				chld._drawIntoParent();
			});
			if(this.attr('focused')){
				this.drawFocusRing();
			}
			if(this.parent){
				this.parent.updateBig();
			}
		},
		buffer:function OBView_buffer(){
			this._buffer=true;
		},
		commit:function OBView_commit(){
			this._buffer=false;
			this.update();
		},
		drawFocusRing:function OBView_drawFocusRing(){
			this._ctx.strokeStyle=OBView.FocusColor.toString();
			this._ctx.lineWidth=OBView.FocusWidth;
			this._ctx.strokeRect.apply(this._ctx,this.attr('clip').toArray());
		},
		_drawIntoParent:function OBView__drawIntoParent(){
			var clip=this.attr('clip');
			if(this.parent && this.attr('visible')){
				this.parent._ctx.save();
				if(this.attr("rotation")){
					this.parent._ctx.translate(this._rcenter.x,this._rcenter.y);
					this.parent._ctx.rotate(this.rotation);
					this.parent._ctx.translate(-1*this._rcenter.x,-1*this._rcenter.y);
				}
				this.parent._ctx.globalAlpha=this.attr('opacity');
				this.parent._ctx.drawImage(this._bigcan,clip.origin.x,clip.origin.y,clip.size.width,clip.size.height,this.frame.origin.x,this.frame.origin.y,clip.size.width,clip.size.height);
				this.parent._ctx.restore();
			}
		},
		setter_rotation:function OBView_setter_rotation(v){
			this.rotation=v;
			this.updateBig();
		},
		getter_clip:function OBView_getter_clip(){
			if(this._clip){
				return this._clip;
			}else{
				return new OBRect(0,0,this.attr("width"),this.attr("height"));
			}
		},
		setter_clip:function OBView_setter_clip(clip){
			this._clip=clip;
			this.fire("clip_changed");
			this.update();
		},
		setter_opacity:function OBView_setter_opacity(v){
			this.opacity=v;
			this.updateBig();
		},
		setter_visible:function OBView_setter_visible(v){
			this.visible=v;
			this.updateBig();
		},
		getter_origin:function OBView_getter_origin(){
			return this.frame.origin;
		},
		getter_size:function OBView_getter_size(){
			return this.frame.size;
		},
		setter_origin:function OBView_setter_origin(v){
			this.attr('frame').attr('origin',v);
			this._rcenter=new OBPoint((this.attr('width')/2)+this.attr('x'),(this.attr('height')/2)+this.attr('y'));
			if(this.parent){
				this.parent.updateBig();
			}
			this.fire("origin_changed");
		},
		setter_size:function OBView_setter_size(v){
			var diff=this.attr("size").clone();
			v=v.clone();
			v.attr('width',Math.max(1,Math.round(v.attr('width'))));
			v.attr('height',Math.max(1,Math.round(v.attr('height'))));
			diff.attr("width",v.attr("width")-diff.attr("width"));
			diff.attr("height",v.attr("height")-diff.attr("height"));
			this._rcenter=new OBPoint((this.attr('width')/2)+this.attr('x'),(this.attr('height')/2)+this.attr('y'));
			this.attr('frame').attr('size',v);
			this._bigcan.width=this.attr('width');
			this._bigcan.height=this.attr('height');
			this._can.width=this.attr('width');
			this._can.height=this.attr('height');
			for(var i=0;i<this.children.length;i++){
				this.children[i]._applyAutoresize(diff);
			}
			this.fire("size_changed");
			this.update();
		},
		toDataURL:function OBView_toDataURL(){
			return this._bigcan.toDataURL.apply(this._bigcan,$A(arguments));
		},
		// ==========================================================================================================
		// = Thanks to Cappuccino (http://www.cappuccino.org/) for providing info that I based this function off of =
		// ==========================================================================================================
		_applyAutoresize:function OBView__applyAutoresize(delta){
			var a=this.attr("autoresize");
			var nsize=this.attr("size");
			var norigin=this.attr("origin");
			var s=this.attr("size");
			var o=this.attr("origin");
			if(a & OBView.Autoresize.Width){
				if(nsize==s){
					nsize=nsize.clone();
				}
				nsize.width+=delta.width;
			}
			if(a & OBView.Autoresize.Height){
				if(nsize==s){
					nsize=nsize.clone();
				}
				nsize.height+=delta.height;
			}
			var d=new OBSize(a&OBView.Autoresize.Width?0:delta.width,a&OBView.Autoresize.Height?0:delta.height);
			if(a & OBView.Autoresize.LockTopLeft){
				//Do Nothing
			}else if(a & OBView.Autoresize.LockTopRight){
				if(norigin==o){
					norigin=norigin.clone();
				}
				norigin.x+=d.width;
			}else if(a & OBView.Autoresize.LockBottomLeft){
				if(norigin==o){
					norigin=norigin.clone();
				}
				norigin.y+=d.height;
			}else if(a & OBView.Autoresize.LockBottomRight){
				if(norigin==o){
					norigin=norigin.clone();
				}
				norigin.x+=d.width;
				norigin.y+=d.height;
			}
			if(norigin!=o){
				this.attr("origin",norigin);
			}
			if(nsize!=s){
				this.attr("size",nsize);
			}
		},
		getter_x:function OBView_getter_x(){
			return this.attr('origin').attr('x');
		},
		getter_y:function OBView_getter_y(){
			return this.attr('origin').attr('y');
		},
		getter_width:function OBView_getter_width(){
			return this.attr('size').attr('width');
		},
		getter_height:function OBView_getter_height(){
			return this.attr('size').attr('height');
		},
		setter_x:function OBView_setter_x(v){
			this.attr('origin',new OBPoint(v,this.attr('y')));
		},
		setter_y:function OBView_setter_y(v){
			this.attr('origin',new OBPoint(this.attr('x'),v));
		},
		setter_width:function OBView_setter_width(v){
			this.attr('size',new OBSize(v,this.attr('height')));
		},
		setter_height:function sOBView_etter_height(v){
			this.attr('size',new OBSize(this.attr('width'),v));
		},
		getter_center:function OBView_getter_center(){
			var c=this._rcenter.clone();
			c.add(this.attr("origin"));
			return c;
		},
		setter_center:function OBView_setter_center(c){
			c=c.clone();
			c.subtract(new OBPoint(this.attr("width")/2,this.attr("height")/2));
			this.attr("origin",c);
		},
		getter_w:function OBView_getter_w(){
			return this.getter_width();
		},
		getter_h:function OBView_getter_h(){
			return this.getter_height();
		},
		setter_w:function OBView_setter_w(v){
			this.setter_width(v);
		},
		setter_h:function OBView_setter_h(v){
			this.setter_height(v);
		},
		redraw:function OBView_redraw(){},
		acceptsFocus:true,
		nextKeyView:null,
		acceptsEvents:true,
		getter_focused:function OBView_getter_focused(){
			return OBView.focused==this;
		},
		setter_focused:function OBView_setter_focused(v){
			if(v){
				this.focus();
			}else{
				this.blur();
			}
		},
		focus:function OBView_focus(){
			if(this.attr('focused') && this.acceptsFocus){
				return;
			}
			if(OBView.focused){
				OBView.focused.blur();
			}
			OBView.focused=this;
			this.fire('got_focus');
			this.update();
		},
		blur:function OBView_blur(){
			if(this.attr('focused')){
				OBView.focused=null;
				this.fire('lost_focus');
				this.updateBig();
			}
		},
		setter_dispRect:function OBView_setter_dispRect(){
			throw new Error("OBView.attr('dispRect') is a read-only property");
		},
		getter_dispRect:function OBView_getter_dispRect(){
			return new OBRect(this.attr('frame').attr('origin'),this.attr('clip').attr('size'));
		},
		_mousedown:function OBView__mousedown(evt){
			if(this.acceptsFocus && (!ob._onRun || this._children.length===0)){
				if(this.attr('focused')){
					return this.mousedown(evt);
				}else{
					this.focus();
				}
			}else{
				return this.mousedown(evt);
			}
		},
		mousedown:function OBView_mousedown(evt){},
		mouseup:function OBView_mouseup(evt){},
		mousemove:function OBView_mousemove(evt){},
		mouseover:function OBView_mouseover(){},
		mouseout:function OBView_mouseout(){},
		_mousemove:function OBView__mousemove(evt){
			var x=this.mousemove(evt);
			var y=false;
			if(this._md){
				y=this.mousedrag(evt);
			}
			return x||y;
		},
		mousedrag:function OBView_mousedrag(evt){},
		_keydown:function OBView__keydown(evt){
			if(evt.keyCode==Event.KEY_TAB && this.nextKeyView){
				this.nextKeyView.focus();
			}else{
				return this.keydown(evt);
			}
		},
		keydown:function OBView_keydown(evt){},
		keyup:function OBView_keyup(evt){},
		mousewheel:function OBView_mousewheel(evt){},
		remove:function OBView_remove(){
			if(this.parent){
				var i=this.parent.children.indexOf(this);
				if(i!=-1){
					this.parent.children.splice(i,1);
					this.parent.updateBig();
					this.fire("removed");
					this.parent.fire("child_removed",this);
				}
				this.parent=null;
			}
		},
		setter_parent:function OBView_setter_parent(par){
			this.remove();
			this.parent=par;
			this.parent.children.push(this);
			this.parent.fire("added_child",this);
			this.parent.updateBig();
		},
		adjustParentPoint:function OBView_adjustParentPoint(point){
			var clip=this.attr('clip');
			point=point.clone();
			point.attr('x',(point.attr('x')-this.attr('x'))+clip.attr('x'));
			point.attr('y',(point.attr('y')-this.attr('y'))+clip.attr('y'));
			if(this.rotation){
				point.rotate(this.rotation,this._rcenter);
			}
			return point;
		},
		getGlobalOrigin:function OBView_getGlobalOrigin(){
			var point=new OBPoint(0,0);
			var obj=this;
			while(obj && obj.parent){
				point.attr("x",point.attr("x")+(obj.attr("x")-obj.attr("clip").attr("x")));
				point.attr("y",point.attr("y")+(obj.attr("y")-obj.attr("clip").attr("y")));
				obj=obj.parent;
			}
			return point;
		},
		_handleEvt:function OBView__handleEvt(name,e){
			ob._over.push(this);
			var evt=e;
			if(this.acceptsEvents){
				evt.point=this.adjustParentPoint(evt.point);
				var c=null;
				this._children=[];
				this.children.each(function(chld){
					if(chld.attr('dispRect').intersects(evt.point,chld.rotation) && chld.attr("visible")){
						c=chld;
						this._children.push(chld);
					}
				},this);
				if(name=='_mousedown'){
					this._md=true;
				}else if(name=='mouseup'){
					this._md=false;
				}
				if((c && !c._handleEvt(name,evt)) || !c){
					return this[name](evt);
				}else{
					return true;
				}
			}
		},
		cursor:"default",
		dblclick:function OBView_dblclick(){}
	});
	
	OBView.focused=null;
	OBView.FocusColor=OBColor.Orange;
	OBView.FocusWidth=5;
	
	OBView.Autoresize={
		LockTopLeft:0,
		LockTopRight:1,
		LockBottomLeft:2,
		LockBottomRight:4,
		Width:8,
		Height:16
	};
	
	OBView.print=function OBView_print(arr,title,cb){
		var t=title;
		var callb=cb;
		var buffer=document.title;
		document.title=t;
		var i=0;
		var can=new Array(arr.length);
		for(i=0;i<arr.length;i++){
			arr[i].remove();
			can[i]=arr[i]._bigcan;
			can[i].style.display="block";
		}
		var frame=Element.extend(document.createElement("iframe"));
		frame.style.position="absolute";
		frame.style.top="-100px";
		frame.style.left="-100px";
		frame.style.width="10px";
		frame.style.height="10px";
		document.body.appendChild(frame);
		frame.onload=function OBView_print_sub1(){
			var win=ob.getFrameWindow(frame);
			win.document.title=t;
			for(var i=0;i<can.length-1;i++){
				can[i].style.pageBreakAfter="always";
				win.document.body.appendChild(can[i]);
			}
			win.document.body.appendChild(can[can.length-1]);
			win.print();
			setTimeout(function OBView_print_sub2(){
				document.body.removeChild(frame);
				document.title=buffer;
				if(callb){
					callb();
				}
			},100);
		};
		frame.src=ob.moduleUrl("ob","printing.html");
	};
	
	OBView.Cursors={
		"Resize":{
			"Row":"row-resize",
			"Column":"col-resize",
			"N":"N-resize",
			"NE":"NE-resize",
			"E":"E-resize",
			"SE":"SE-resize",
			"S":"S-resize",
			"SW":"SW-resize",
			"W":"W-resize",
			"NW":"NW-resize"
		},
		"Crosshair":"crosshair",
		"Pointer":"default",
		"Link":"pointer",
		"Help":"Help",
		"Move":"move",
		"NoDrop":"no-drop",
		"Disallowed":"not-allowed",
		"Progress":"progress",
		"Text":"text",
		"Wait":"wait"
	};
	
window.I18n={
	language:"en",
	load:function I18n_load(bundle){
		if(I18n._mods.indexOf(bundle)!=-1)
			return;
		var op=Ajax.getTransport();
		var parts=bundle.split(".");
		var name=parts.pop();
		parts.push(I18n.language);
		var url=ob.moduleUrl(parts.join("."),name+".json");
		I18n._mods.push(bundle);
		op.open('get',url,false);
		op.send(null);
		if(!I18n._hash[I18n.language]){
			I18n._hash[I18n.language]={};
		}
		Object.extend(I18n._hash[I18n.language],op.responseText.evalJSON(true)||{});
	},
	_hash:{en:{}},
	get:function I18n_get(name){
		return Object.isUndefined(I18n._hash[I18n.language][name])?name:I18n._hash[I18n.language][name];
	},
	getLanguage:function I18n_getLanguage(){
		return I18n.language;
	},
	setLanguage:function I18n_setLanguage(lang){
		if(lang!="" && lang){
			I18n.language=lang;
			if(!I18n._hash[lang]){
				I18n._hash[lang]={};
			}
			I18n._mods.each(function I18n_setLanguage_sub(x){
				I18n.load(x);
			});
			document.fire("i18n:lang_change");
		}
	},
	_mods:[]
};
	window.tr=I18n.get;
	
	window.OBViewAnimation=Class.create(OBResponder,{
		buffer:null,
		duration:1,//(seconds)
		smoothing:100,//lower the smoother - milliseconds between upates
		initialize:function OBViewAnimation_constructor(view){
			this.view=view;
			this.buffer=$H();
		},
		attr:function OBViewAnimation_attr(name,value){
			if(arguments.length==1){
				return this.view.attr(name);
			}else{
				if(Object.isNumber(value)){
					this.buffer.set(name,value);
				}else if(window.console){
					console.warn("OBViewAnimation can only animate numerical properties, unlike the value that you have provided for "+name);
				}else{
					var nom=name;
					setTimeout(function OBViewAnimation_attr_errorThrower(){
						throw new Error("OBViewAnimation can only animate numerical properties, unlike the value that you have provided for "+nom);
					},0);
				}
				return this;
			}
		},
		start:function OBViewAnimation_start(){
			if(this.duration==0){
				this.view.buffer();
				this.buffer.each(function(pair){
					this.view.attr(pair.key,pair.value);
				},this);
				this.view.commit();
				this.fire("finished");
			}else{
				var dur=this.duration*1000;
				var othis=this;
				var arr=[];
				this.buffer.each(function(pair){
					var key=pair.key;
					var d=((pair.value-this.view.attr(key))/(dur/this.smoothing));
					arr.push({
						key:pair.key,
						d:d
					});
					/*var i=0;
					var buf={};
					var z=setInterval(function(){
						if(i>=dur){
							clearInterval(buf.z);//because we call setInterval to get the value we need
						}
						othis.view.attr(key,othis.view.attr(key)+d);
						i+=othis.smoothing;
						if(i>=dur){
							clearInterval(buf.z);//because we call setInterval to get the value we need
						}
					},this.smoothing);
					arr.push(z);
					buf.z=z;*/
				},this);
				var timer=setInterval(function(){
					this.view.buffer();
					arr.each(function(pair){
						this.view.attr(pair.key,this.view.attr(pair.key)+pair.d);
					},this);
					this.view.commit();
				}.bind(this),this.smoothing);
				setTimeout(function(){
					othis.duration=0;
					clearInterval(timer);
					othis.start();//just to ensure that everything is properly set
				},dur);
			}
		}
	});
	
	OBViewAnimation.FadeOut=function OBViewAnimation_FadeOut(view,options){
		var opts={
			callback:Prototype.emptyFunction,
			smoothing:0,
			duration:1.0//seconds
		};
		Object.extend(opts,options);
		view.buffer();
		view.attr("opacity",1.0);
		view.attr("visible",true);
		view.commit();
		var a=new OBViewAnimation(view);
		a.attr("opacity",0.0);
		a.duration=opts.duration;
		if(opts.smoothing>0){
			a.smoothing=opts.smoothing;
		}
		a.observe("finished",function(){
			a.view.attr("visible",false);
			opts.callback();
		});
		a.start();
	};
	
	OBViewAnimation.FadeIn=function OBViewAnimation_FadeIn(view,options){
		var opts={
			callback:Prototype.emptyFunction,
			smoothing:0,
			duration:1.0//seconds
		};
		Object.extend(opts,options);
		view.buffer();
		view.attr("opacity",0.0);
		view.attr("visible",true);
		view.commit();
		var a=new OBViewAnimation(view);
		a.attr("opacity",1.0);
		a.duration=opts.duration;
		if(opts.smoothing>0){
			a.smoothing=opts.smoothing;
		}
		a.observe("finished",function(){
			a.view.attr("visible",true);
			opts.callback();
		});
		a.start();
	};
	
	window.OBThemeLoader={};
	
	window.OBCurrentTheme=window.OBCurrentTheme||"Default";
	
	Array.prototype.complement=function OpenBear_Array_Complement(arr){
		var a=[];
		this.each(function OpenBear_Array_Complement_sub1(elem){
			if(arr.indexOf(elem)!=-1){
				a.push(elem);
			}
		});
		return a;
	};
	
	document.observe("theme:loaded", function OBEvntHandler_HideLoadingBox(){
		document.body.removeChild($("LoadingBox"));
	});
	
	//FIXME: When (in safari at least) you click the search box, you can't click back into the web page
	
	document.observe("dom:loaded",function OBEvntHandler_DomLoaded(){
		document.body.innerHTML="<div id=\"LoadingBox\" style=\"text-align:center;\"><img src=\""+ob.moduleUrl("ob.themes."+OBCurrentTheme,"loading.gif")+"\"/></div>";
		document.body.style.overflow="hidden";
		var demin=document.viewport.getDimensions();
		ob.body=new OBView(null,new OBRect(0,0,demin.width,demin.height));
		ob.Body=ob.body;
		ob.body._bigcan.style.position="absolute";
		ob.body._bigcan.style.top="0px";
		ob.body._bigcan.style.left="0px";
		ob.body._bigcan.style.zIndex=50;
		ob.body.drawFocusRing=Prototype.emptyFunction;
		ob.body.focus();
		document.body.appendChild(ob.body._bigcan);
		ob.mouseHandlers.push(ob.body._handleEvt.bind(ob.body));
		document.observe('resize',function OBEvntHandler_Resize(){
			var d=document.viewport.getDimensions();
			ob.body.attr('size',new OBSize(d.width,d.height));
		});
		document.body.observe('resize',function OBEvntHandler_Resize(){
			var d=document.viewport.getDimensions();
			ob.body.attr('size',new OBSize(d.width,d.height));
		});
		window.onresize=function OBEvntHandler_Resize(){
			var d=document.viewport.getDimensions();
			ob.body.attr('size',new OBSize(d.width,d.height));
		};
		ob._tbox=Element.extend(document.createElement("textarea"));
		ob._tbox.style.position="absolute";
		ob._tbox.style.top="-100px";
		ob._tbox.style.left="-100px";
		ob._tbox.style.width="300px";
		ob._tbox.style.height="300px";
		ob._tbox.style.opacity="0";
		ob._tbox.style.filter="alpha(opacity=0)";
		ob._tbox.style.zIndex=1;
		document.body.appendChild(ob._tbox);
		ob._tbox.focus();
		ob._tbox.observe("blur",function OBEvntHandler_blur(){
			ob._tbox.focus();
		});
		ob._tbox.observe("keydown",function OBEvntHandler_keydown(evt){
			evt=Event.extend(evt);
			var can=true;
			if((navigator.platform.indexOf("Mac")!=-1)){
				can=evt.metaKey;
			}else{
				can=evt.ctrlKey;
			}
			if(OBView.focused){
				var val=OBView.focused._keydown(evt);
				if(val==false){//we don't want undefined triggering allows
					can=false;
				}else if(val==true){
					can=true;
				}
			}
			ob.ctrl=evt.ctrlKey;
			if(!can){
				evt.stop();
			}
		}.bindAsEventListener(window));
		ob._tbox.observe("keyup",function OBEvntHandler_keyup(evt){
			evt=Event.extend(evt);
			if(OBView.focused){
				OBView.focused.keyup(evt);
			}
			ob.ctrl=evt.ctrlKey;
		}.bindAsEventListener(window));
		document.observe("mousedown",function OBEvntHandler_mousedown(evt){
			evt=Event.extend(evt);
			var left=evt.isLeftClick();
			var right=(!left || (navigator.platform.indexOf("Mac")!=-1 && ob.ctrl));
			ob._onRun=true;
			ob.mouseHandlers[ob.mouseHandlers.length-1]('_mousedown',{
				point:new OBPoint(evt.pointerX(),evt.pointerY()),
				right:right,
				left:left
			});
			ob._onRun=false;
			evt.stop();
		}.bindAsEventListener(window));
		document.observe("dblclick",function OBEvntHandler_dblclick(evt){
			evt=Event.extend(evt);
			var left=evt.isLeftClick();
			var right=(!left || (navigator.platform.indexOf("Mac")!=-1 && ob.ctrl));
			ob.mouseHandlers[ob.mouseHandlers.length-1]('dblclick',{
				point:new OBPoint(evt.pointerX(),evt.pointerY()),
				right:right,
				left:left
			});
		}.bindAsEventListener(window));
		document.observe("mouseup",function OBEvntHandler_mouseup(evt){
			evt=Event.extend(evt);
			var left=evt.isLeftClick();
			var right=(!left || (navigator.platform.indexOf("Mac")!=-1 && ob.ctrl));
			ob.mouseHandlers[ob.mouseHandlers.length-1]('mouseup',{
				point:new OBPoint(evt.pointerX(),evt.pointerY()),
				right:right,
				left:left
			});
		}.bindAsEventListener(window));
		document.observe("mousemove",function OBEvntHandler_mousemove(evt){
			evt=Event.extend(evt);
			var old=$A(ob._over);
			ob._over=[];
			var left=evt.isLeftClick();
			var right=(!left || (navigator.platform.indexOf("Mac")!=-1 && ob.ctrl));
			ob.mouseHandlers[ob.mouseHandlers.length-1]('_mousemove',{
				point:new OBPoint(evt.pointerX(),evt.pointerY()),
				right:right,
				left:left
			});
			document.body.style.cursor=ob._over[ob._over.length-1].cursor;
			//TODO: implement accurate mouseover, mouseout
			/*
			var a=$A(old);
			a=a.complement(ob._over);
			a.each(function OBEvntHandler_mousemove_mouseout(view){
				view.mouseout();
			});
			//console.info("out",a);
			a=$A(ob._over);
			a=a.complement(old);
			a.each(function OBEvntHandler_mousemove_mouseover(v){
				v.mouseover();
			});
			//console.info("over",a);
			*/
		}.bindAsEventListener(window));
		
		var scrollName="mousewheel";//(document.addEventListener?"DOMMouseScroll":"mousewheel");
		// ==============================================================================================================================================
		// = Thanks to http://www.switchonthecode.com/tutorials/javascript-tutorial-the-scroll-wheel for providing info on scroll wheels and javascript =
		// ==============================================================================================================================================
		document.observe(scrollName,function OBEvntHandler_mousewheel(evt){
			var normal=evt.detail?evt.detail*-1:evt.wheelDelta/40;
			var raw=evt.detail?evt.detail:evt.wheelDelta;
			
			if(OBView.focused){
				OBView.focused.mousewheel({
					normal:normal,
					raw:raw
				});
			}
		}.bindAsEventListener(window));
		
		document.body.oncontextmenu=function OBEvntHandler_ctxmenu(evt){
			evt=evt?evt:window.event;
			if(evt.preventDefault){
				evt.preventDefault();
			}
			return false;
		};
		
		var totalImgs=0;
		var loadedImgs=0;
		var x=null;
		for(x in OBThemeLoader){
			totalImgs++;
		}
		window._OBThemeLoader=Object.toJSON(OBThemeLoader).evalJSON(false);
		for(x in OBThemeLoader){
			var file=OBThemeLoader[x];
			if(file.indexOf(".json")==file.length-5){
				var op=new Ajax.Request(ob.moduleUrl("ob.themes."+OBCurrentTheme,file),{
					method:"get",
					evalJS:false,
					onFailure:function OBThemeLoader_json_failure(){
						throw new Error("Error loading json file "+file);
					}
				});
				op.key=x;
				op.options.onSuccess=function OBThemeLoader_json_success(trans){
					var data=trans.responseText.evalJSON(true);
					OBThemeLoader[this.key]=data;
					loadedImgs++;
					if(loadedImgs==totalImgs){
						document.fire("theme:loaded");
					}
				}.bind(op);
			}else{
				var img=new Image();
				img.onload=function OBThemeLoader_image_onload(){
					loadedImgs++;
					if(loadedImgs==totalImgs){
						document.fire("theme:loaded");
					}
				};
				img.onerror=function OBThemeLoader_image_onerror(){
					throw new Error("Error loading image "+this.src);
				};
				img.src=ob.moduleUrl("ob.themes."+OBCurrentTheme,file);
				OBThemeLoader[x]=img;
			}
		}
		if(!totalImgs){
			document.fire("theme:loaded");
		}
	});
}