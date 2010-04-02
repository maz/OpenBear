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

window.OBTextView=Class.create(OBView,{
	setup:function OBTextView_setup(txt){
		this.attr("text",txt?txt:"");
		this.font="12pt Arial";
		this.color=OBColor.Black;
	},
	redraw:function OBTextView_redraw(){
		this.ctx.font=this.font;
		this.ctx.fillStyle=this.color.toString();
		this.ctx.fillText(this.text,0,this.txtSize.height);
	},
	setter_text:function OBTextView_setter_text(txt){
		this.text=txt;
		this.ctx.font=this.font;
		this.txtSize=this.ctx.measureText(this.text);
		this.update();
	},
	setter_font:function OBTextView_setter_font(f){
		this.font=f;
		this.setter_text(this.text);
	},
	setter_color:function OBTextView_setter_color(c){
		this.color=c;
		this.update();
	}
});