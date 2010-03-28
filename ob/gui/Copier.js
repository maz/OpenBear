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
I18n.load("ob.gui.i18n.copier");
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
		var size=this.ctx.measureText(OBCopierView.message);
		this.ctx.fillText(OBCopierView.message,(this.attr('width')/2)-(size.attr('width')/2),(this.attr('height')/2)-(size.attr('height')/2));
	},
	drawFocusRing:Prototype.emptyFunction
});

OBCopierView.message=tr("Please Press")+" "+((navigator.platform.indexOf("Mac")==-1)?"Ctrl-C":"Command-C")+" "+tr("to Copy");
document.observe("i18n:lang_change",function OBCopierView_i18nSwitcher(){
	OBCopierView.message=tr("Please Press")+" "+((navigator.platform.indexOf("Mac")==-1)?"Ctrl-C":"Command-C")+" "+tr("to Copy");
});

window.OBCopy=function OBCopy(txt){
	var view=new OBCopierView(null,ob.body.attr('frame'),txt);
}