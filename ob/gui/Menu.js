OBThemeLoader.Selection="selection.png";

window.OBMenuView=Class.create(OBView,{
	setup:function(items){
		this.items=items;
	},
	redraw:function(){
		this.ctx.fillStyle="black";
		this.ctx.fillRect(0,0,this.attr("width"),this.attr("height"));
	}
});

window.OBMenu=Class.create(OBAttr,OBResponder,{
	initialize:function OBMenu_constructor(items){
		this.items=items||[];
	},
	show:function(frame){
		if(this.view){
			this.view=new OBMenuView(null,frame,items);
			ob.mouseHandlers.push(this.handleEvent.bind(this));
		}
	},
	hide:function(){
		ob.mouseHandlers.pop();
		this.view.remove();
		this.view=null;//dealloc
	},
	handleEvent:function(name, e){
		var evt=e;
		var chld=this.view;
		if(chld.attr('dispRect').intersects(evt.point) && chld.attr("visible")){
			this.view._handleEvt(name,e);
		}else{
			this.hide();
		}
	}
});