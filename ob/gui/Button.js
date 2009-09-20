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
OBThemeLoader.ButtonBezelCenter="button/button-bezel-center.png";
OBThemeLoader.ButtonBezelHighlightedCenter="button/button-bezel-highlighted-center.png";
OBThemeLoader.ButtonBezelRight="button/button-bezel-right.png";
OBThemeLoader.ButtonBezelHighlightedRight="button/button-bezel-highlighted-right.png";
OBThemeLoader.ButtonBezelLeft="button/button-bezel-left.png";
OBThemeLoader.ButtonBezelHighlightedLeft="button/button-bezel-highlighted-left.png";

OBThemeLoader.ButtonInfo="button.json";

window.OBButton=Class.create(OBView,{
	setup:function OBButton_setup(label){
		this.attr("label",label||"Untitled");
		this.acceptsFocus=false;
		this.mode=[OBThemeLoader.ButtonBezelLeft,OBThemeLoader.ButtonBezelCenter,OBThemeLoader.ButtonBezelRight];
	},
	setter_label:function OBButton_setter_label(l){
		this.label=l;
		this._applyStyle();
		var s=this.ctx.measureText(l);
		this.txtSize=s;
		this.osize=new OBSize(s.attr("width")+8,Math.max(s.attr("height"),24));
		this.attr("size", this.attr("size"));
	},
	setter_size:function OBButton_setter_size($super, size){
		var s=new OBSize(size.attr("width"),24);
		$super((size.attr("width")<this.osize.attr("width")?this.osize:s));
	},
	redraw:function OBButton_redraw(){
		var s=this.attr("size");
		this.ctx.drawSlicedImage(this.mode,0,0,s.attr("width"));
		//this.ctx.drawImage(OBThemeLoader.ButtonBezelLeft,0,0);
		this._applyStyle();
		this.ctx.fillText(this.label,(this.attr("width")/2)-(this.txtSize.attr("width")/2),this.txtSize.attr("height"));
	},
	mousedown:function OBButton_mousedown(evt){
		this.down=true;
		this.mode=[OBThemeLoader.ButtonBezelHighlightedLeft,OBThemeLoader.ButtonBezelHighlightedCenter,OBThemeLoader.ButtonBezelHighlightedRight];
		this.update();
	},
	mouseup:function OBButton_mouseup(evt){
		this.mode=[OBThemeLoader.ButtonBezelLeft,OBThemeLoader.ButtonBezelCenter,OBThemeLoader.ButtonBezelRight];
		this.fire("click");
		this.update();
		this.down=false;
	},
	mouseover:function OBButton_mouseover(){
		if(this.down){
			this.mode=[OBThemeLoader.ButtonBezelHighlightedLeft,OBThemeLoader.ButtonBezelHighlightedCenter,OBThemeLoader.ButtonBezelHighlightedRight];
		}
	},
	mouseout:function OBButon_mouseout(){
		this.mode=[OBThemeLoader.ButtonBezelLeft,OBThemeLoader.ButtonBezelCenter,OBThemeLoader.ButtonBezelRight];
	},
	sizeToFit:function OBButton_sizeToFit(){
		this.attr("size",this.osize);
	},
	_applyStyle:function OBButton__applyStyle(){
		this.ctx.fillStyle=OBThemeLoader.ButtonInfo.color;
		this.ctx.font=OBThemeLoader.ButtonInfo.font;
	}
});