OBThemeLoader.CopierInfo="copierinfo.json";

window.OBCopierView=Class.create(OBView,{
	setup:function OBCopierView_setup(txt){
		this.txt=txt;
		this.buffer=OBView.focused;
		this.focus();
		ob._tbox.value=txt;
		ob._tbox.select();
	},
	keyup:function OBCopierView_keyup(evt){
		if(this.good){
			this.remove();
		}else{
			ob._tbox.value=this.txt;
			ob._tbox.select();
		}
	},
	keydown:function OBCopierView_keydown(evt){
		if(((navigator.platform.indexOf("Mac")==-1)?evt.ctrlKey:evt.metaKey) && String.fromCharCode(evt.keyCode).toLowerCase()=="c"){
			this.good=true;
		}
	},
	redraw:function OBCopierView_redraw(){
		this.ctx.fillStyle=OBThemeLoader.CopierInfo.backdrop;
		this.ctx.fillRect(0,0,this.attr('width'),this.attr('height'));
		this.ctx.fillStyle=OBThemeLoader.CopierInfo.foreground;
		this.ctx.font=OBThemeLoader.CopierInfo.instructionsFont;
		var size=this.ctx.measureText(I18n.message);
		this.ctx.fillText(I18n.message,(this.attr('width')/2)-(size.attr('width')/2),(this.attr('height')/2)-(size.attr('height')/2));
	},
	drawFocusRing:Prototype.emptyFunction
});

I18n.message=tr("Please Press")+" "+((navigator.platform.indexOf("Mac")==-1)?"Ctrl-C":"Command-C")+" "+tr("to Copy");
document.observe("i18n:lang_change",function OBCopierView_i18nSwitcher(){
	I18n.message=tr("Please Press")+" "+((navigator.platform.indexOf("Mac")==-1)?"Ctrl-C":"Command-C")+" "+tr("to Copy");
});

window.OBCopy=function OBCopy(txt){
	var view=new OBCopierView(null,ob.body.attr('frame'),txt);
}