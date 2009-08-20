OBThemeLoader.Selection="selection.png";

window.OBMenuView=Class.create(OBView,{
	setup:function OBMenuView_setup(items,menu){
		this.items=[];
		this.menu=menu;
		this.selected=-1;
		this.applyFontParams();
		var h=0;
		items.each(function(itm){
			h=Math.max(h,this.ctx.measureText(itm).attr("height"));
		}.bind(this));
		h+=2;
		this.z=h;
		var y=2;
		items.each(function(itm){
			console.info(y);
			this.items.push({
				label:itm,
				size:this.ctx.measureText(itm),
				rect:new OBRect(0,y,this.attr("width"),h-2)
			});
			y+=h;
		}.bind(this));
		this.acceptsFocus=false;
	},
	applyFontParams:function OBMenuView_applyFontParams(){
		this.ctx.font="12pt Arial";
	},
	redraw:function OBMenuView_redraw(){
		this.ctx.fillStyle=new OBColor(200,200,200).toString();
		this.ctx.fillRect(0,0,this.attr("width"),this.attr("height"));
		this.applyFontParams();
		var y=2;
		for(var i=0;i<this.items.length;i++){
			var itm=this.items[i];
			if(i==this.selected){
				this.ctx.fillStyle="white";
				this.ctx.drawImage(OBThemeLoader.Selection,0,y,this.attr("width"),this.z);
			}else{
				this.ctx.fillStyle="black";
			}
			var old=y;
			this.ctx.fillText(itm.label,2,y+itm.size.attr("height"));
			y+=this.diff+2;
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
				this.menu.fire("selected",this.items[i].label);
				setTimeout(this.menu.hide.bind(this.menu),0);
			}
		}
	}
});

window.OBMenu=Class.create(OBAttr,OBResponder,{
	initialize:function OBMenu_constructor(items){
		this.items=items||[];
	},
	show:function(frame){
		if(!this.view){
			this.view=new OBMenuView(null,frame,this.items,this);
			ob.mouseHandlers.push(this.handleEvent.bind(this));
		}
	},
	hide:function(){
		ob.mouseHandlers.pop();
		this.view.remove();
		this.view=null;//dealloc
		this.next=false;
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