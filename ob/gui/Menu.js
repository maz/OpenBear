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
OBThemeLoader.Selection="selection.png";
OBThemeLoader.ArrowUp="ArrowUp.png";
OBThemeLoader.ArrowDown="ArrowDown.png";
OBThemeLoader.MenuInfo="menu.json";

window.OBMenuView=Class.create(OBView,{
	setup:function OBMenuView_setup(items,menu){
		this.items=[];
		this.menu=menu;
		this.selected=-1;
		this.applyFontParams();
		var h=0;
		var w=0;
		items.each(function(itm){
			var m=this.ctx.measureText(itm);
			h=Math.max(h,m.attr("height"));
			w=Math.max(w,m.attr("width"));
		}.bind(this));
		if(!this.attr("width")){
			this.attr("width",w+4);
		}
		h+=4;
		this.z=h;
		var y=2;
		items.each(function(itm){
			var label=itm;
			var s=this.ctx.measureText(label);
			if(s.attr("width")>this.attr("width")-4){
				label+="...";
				s=this.ctx.measureText(label);
				while(s.attr("width")>this.attr("width")-4){
					label=label.substr(0,label.length-4)+"..."
					s=this.ctx.measureText(label);
				}
			}
			this.items.push({
				label:label,
				data:itm,
				size:s,
				rect:new OBRect(0,y,this.attr("width"),h-2)
			});
			y+=h;
		}.bind(this));
		
		this.start=0;
		this.end=this.items.length;
		//FIXME: Menu Scrolling
		if(h*this.items.length+2>this.attr("height")){
			
		}
	},
	applyFontParams:function OBMenuView_applyFontParams(){
		this.ctx.font=OBThemeLoader.MenuInfo.font;
	},
	redraw:function OBMenuView_redraw(){
		this.ctx.fillStyle=OBThemeLoader.MenuInfo.backgroundColor;
		this.ctx.fillRect(0,0,this.attr("width"),this.attr("height"));
		this.applyFontParams();
		var y=2;
		for(var i=this.start;i<this.end;i++){
			var itm=this.items[i];
			if(i==this.selected){
				this.ctx.fillStyle=OBThemeLoader.MenuInfo.selectedColor;
				this.ctx.drawImage(OBThemeLoader.Selection,0,y,this.attr("width"),this.z);
			}else{
				this.ctx.fillStyle=OBThemeLoader.MenuInfo.regularColor;
			}
			var old=y;
			this.ctx.fillText(itm.label,2,y+itm.size.attr("height")+2);
			y+=this.z;
		}
	},
	mousemove:function OBMenuView_mousemove(evt){
		var p=evt.point;
		for(var i=0;i<this.items.length;i++){
			if(this.items[i].rect.intersects(p)){
				this.selected=i;
				setTimeout(this.update.bind(this),0);
				break;
			}
		}
	},
	mousedown:function OBMenuView_mousedown(evt){
		var p=evt.point;
		for(var i=0;i<this.items.length;i++){
			if(this.items[i].rect.intersects(p)){
				this.menu.hide();
				this.menu.fire("selected",this.items[i].data);
				return;
			}
		}
		this.menu.hide();
	},
	keydown:function OBMenuView_keydown(evt){
		if(evt.keyCode==Event.KEY_DOWN){
			this.selected++;
			if(this.selected>=this.items.length){
				this.selected=this.items.length-1;
			}
			this.update();
		}else if(evt.keyCode==Event.KEY_UP){
			this.selected--;
			if(this.selected<0){
				this.selected=0;
			}
			this.update();
		}else if(evt.keyCode==Event.KEY_RETURN && this.selected>-1 && this.selected<this.items.length){
			this.menu.hide();
			this.menu.fire("selected",this.items[this.selected].data);
		}else if(evt.keyCode==Event.KEY_ESC){
			this.menu.hide();
		}
	},
	drawFocusRing:Prototype.emptyFunction
});

window.OBMenu=Class.create(OBAttr,OBResponder,{
	initialize:function OBMenu_constructor(items){
		this.items=items||[];
	},
	show:function(frame){
		if(!this.view){
			this.view=new OBMenuView(null,frame,this.items,this);
			ob.mouseHandlers.push(this.handleEvent.bind(this));
			this.buffer=OBView.focused;
			this.view.focus();
		}
	},
	hide:function(){
		ob.mouseHandlers.pop();
		this.view.remove();
		this.view=null;//dealloc
		this.next=false;
		if(this.buffer)
			this.buffer.focus();
	},
	handleEvent:function(name, e){
		ob._over.push({cursor:"default"});
		var evt=e;
		var chld=this.view;
		if(chld.attr('dispRect').intersects(evt.point) && chld.attr("visible")){
			this.view._handleEvt(name,e);
		}else if(name=="_mousedown"){
			this.next=true;
		}else if(this.next){
			this.hide();
		}
	}
});