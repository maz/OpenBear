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
OBThemeLoader.TextfieldBezelSquare0="textfield/textfield-bezel-square-0.png";
OBThemeLoader.TextfieldBezelSquare1="textfield/textfield-bezel-square-1.png";
OBThemeLoader.TextfieldBezelSquare2="textfield/textfield-bezel-square-2.png";
OBThemeLoader.TextfieldBezelSquare3="textfield/textfield-bezel-square-3.png";
OBThemeLoader.TextfieldBezelSquare4="textfield/textfield-bezel-square-4.png";
OBThemeLoader.TextfieldBezelSquare5="textfield/textfield-bezel-square-5.png";
OBThemeLoader.TextfieldBezelSquare6="textfield/textfield-bezel-square-6.png";
OBThemeLoader.TextfieldBezelSquare7="textfield/textfield-bezel-square-7.png";
OBThemeLoader.TextfieldBezelSquare8="textfield/textfield-bezel-square-8.png";
OBThemeLoader.TextfieldBezelSquareFocused0="textfield/textfield-bezel-square-focused-0.png";
OBThemeLoader.TextfieldBezelSquareFocused1="textfield/textfield-bezel-square-focused-1.png";
OBThemeLoader.TextfieldBezelSquareFocused2="textfield/textfield-bezel-square-focused-2.png";
OBThemeLoader.TextfieldBezelSquareFocused3="textfield/textfield-bezel-square-focused-3.png";
OBThemeLoader.TextfieldBezelSquareFocused4="textfield/textfield-bezel-square-focused-4.png";
OBThemeLoader.TextfieldBezelSquareFocused5="textfield/textfield-bezel-square-focused-5.png";
OBThemeLoader.TextfieldBezelSquareFocused6="textfield/textfield-bezel-square-focused-6.png";
OBThemeLoader.TextfieldBezelSquareFocused7="textfield/textfield-bezel-square-focused-7.png";
OBThemeLoader.TextfieldBezelSquareFocused8="textfield/textfield-bezel-square-focused-8.png";

window.OBTextField=Class.create(OBView,{
	setup:function OBTextField_setup(){
		this.parts=OBTextField.Regular;
		this.observe("got_focus",this.gotFocus.bind(this));
		this.observe("changed",this.update.bind(this));
		this.text="";
		this.selection=$R(0,0);
	},
	redraw:function OBTextField_redraw(){
		this.ctx.drawSlicedImage(this.parts,0,0,this.attr("width"),this.attr("height"));
	},
	gotFocus:function OBTextField_gotFocus(){
		ob._tbox.value=this.text;
		this._select();
	},
	keydown:function OBTextField_keydown(evt){
		return evt.keyCode!=Event.KEY_RETURN;
	},
	keyup:function OBTextField_keyup(){
		if(ob._tbox.value!=this.text){
			this.text=ob.tbox.value;
			this.fire("changed");
		}
	},
	setter_text:function OBTextField_setter_text(txt){
		this.text=txt;
		if(this.attr("focused")){
			ob._tbox.value=txt;
		}
	},
	_select:function OBTextField__select(){
		var start=this.selection.start;
		var end=this.selection.end;
		if(ob._tbox.createTextRange){
			var r=ob._tbox.createTextRange();
			r.moveStart("character",start);
			r.moveEnd("character",end);
			r.select();
		}else if(ob._tbox.setSelectionRange){
			ob._tbox.setSelectionRange(start,end-start);
		}
	}
});

document.observe("theme:loaded",function OBTextFieldThemeLoaded(){
	OBTextField.Regular=[
		OBThemeLoader.TextfieldBezelSquare0,
		OBThemeLoader.TextfieldBezelSquare1,
		OBThemeLoader.TextfieldBezelSquare2,
		OBThemeLoader.TextfieldBezelSquare3,
		OBThemeLoader.TextfieldBezelSquare4,
		OBThemeLoader.TextfieldBezelSquare5,
		OBThemeLoader.TextfieldBezelSquare6,
		OBThemeLoader.TextfieldBezelSquare7,
		OBThemeLoader.TextfieldBezelSquare8,
	];
	OBTextField.Focused=[
		OBThemeLoader.TextfieldBezelSquareFocused0,
		OBThemeLoader.TextfieldBezelSquareFocused1,
		OBThemeLoader.TextfieldBezelSquareFocused2,
		OBThemeLoader.TextfieldBezelSquareFocused3,
		OBThemeLoader.TextfieldBezelSquareFocused4,
		OBThemeLoader.TextfieldBezelSquareFocused5,
		OBThemeLoader.TextfieldBezelSquareFocused6,
		OBThemeLoader.TextfieldBezelSquareFocused7,
		OBThemeLoader.TextfieldBezelSquareFocused8,
	];
});