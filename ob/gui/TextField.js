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
/*OBThemeLoader.TextfieldBezelSquareFocused0="textfield/textfield-bezel-square-focused-0.png";
OBThemeLoader.TextfieldBezelSquareFocused1="textfield/textfield-bezel-square-focused-1.png";
OBThemeLoader.TextfieldBezelSquareFocused2="textfield/textfield-bezel-square-focused-2.png";
OBThemeLoader.TextfieldBezelSquareFocused3="textfield/textfield-bezel-square-focused-3.png";
OBThemeLoader.TextfieldBezelSquareFocused4="textfield/textfield-bezel-square-focused-4.png";
OBThemeLoader.TextfieldBezelSquareFocused5="textfield/textfield-bezel-square-focused-5.png";
OBThemeLoader.TextfieldBezelSquareFocused6="textfield/textfield-bezel-square-focused-6.png";
OBThemeLoader.TextfieldBezelSquareFocused7="textfield/textfield-bezel-square-focused-7.png";
OBThemeLoader.TextfieldBezelSquareFocused8="textfield/textfield-bezel-square-focused-8.png";*/
OBThemeLoader.Selection="selection.png";
OBThemeLoader.Search="search.png";
OBThemeLoader.TextFieldInfo="textfield.json";

window.OBTextField=Class.create(OBView,{
	setup:function OBTextField_setup(){
		this.parts=OBTextField.Regular;
		this.observe("got_focus",this.gotFocus.bind(this));
		this.observe("lost_focus",this.lostFocus.bind(this));
		this.text="";
		this.selection=$R(0,0);
		this.blink=false;
		this.attr("cursor", OBView.Cursors.Text);
		this._dstart=null;
		this._start=0;
		this.diff=2;
		this.mtxt=new OBSize(0,0);
		this.observe("changed",this.updateTextSize.bind(this));
		this.selpxpos=0;
		this._p=null;
		this._m=null;
	},
	updateTextSize:function OBTextField_updateTextSize(){
		this.mtxt=this.ctx.measureText(this.text);
	},
	redraw:function OBTextField_redraw(){
		this.ctx.drawSlicedImage(this.parts,0,0,this.attr("width"),this.attr("height"));
		this.ctx.font=OBThemeLoader.TextFieldInfo.font;
		if(this.selection.end==this.selection.start){
			this.ctx.fillStyle=OBThemeLoader.TextFieldInfo.regularColor;
			var txt=this.text.substring(this._start);
			var m=this.mtxt;
			this.ctx.fillText(txt,this.diff,m.attr("height"));
			if(this.blink){
				this.ctx.fillStyle=OBThemeLoader.TextFieldInfo.blinkerColor;
				this.ctx.fillRect(this.diff+this.selpxpos,0,1,this.attr("height"));
			}
		}else{
			var p=this._p;
			var m=this._m;
			if(p[0].length!=0){
				this.ctx.fillStyle=OBThemeLoader.TextFieldInfo.regularColor;
				this.ctx.fillText(p[0],this.diff,m[0].attr("height"));
			}
			this.ctx.drawImage(OBThemeLoader.Selection,this.diff+m[0].attr("width"),0,m[1].attr("width"),this.attr("height"));
			this.ctx.fillStyle=OBThemeLoader.TextFieldInfo.selectedColor;
			this.ctx.fillText(p[1],this.diff+m[0].attr("width"),m[1].attr("height"));
			if(p[1].length!=0){
				this.ctx.fillStyle=OBThemeLoader.TextFieldInfo.regularColor;
				this.ctx.fillText(p[2],m[1].attr("width")+m[0].attr("width")+this.diff,m[1].attr("height"));
			}
		}
	},
	gotFocus:function OBTextField_gotFocus(){
		ob._tbox.value=this.text;
		this._select();
		this.timer=setInterval(this.updateBlinker.bind(this),500);
	},
	updateBlinker:function OBTextField_updateBlinker(){
		if(this.selection.end==this.selection.start){
			this.blink=!this.blink;
			this.update();
		}
	},
	lostFocus:function OBTextField_lostFocus(){
		clearInterval(this.timer);
		this.blink=false;
		this.update();
	},
	keydown:function OBTextField_keydown(evt){
		//this._updateSelection();
		//this.update();
		if(evt.keyCode==Event.KEY_RETURN){
			this.fire("trigger");
			return false;
		}else{
			this._updateSelection();
			this.update();
			return true;
		}
	},
	keyup:function OBTextField_keyup(){
		if(ob._tbox.value!=this.text){
			this.text=ob._tbox.value;
			this._updateSizes();
			setTimeout(function OBTextField_keyup_sub(){
				this.fire("changed");
			}.bind(this),0);
		}
		this._updateSelection();
		this.update();
	},
	_updateSelection:function OBTextField__updateSelection(){
		var start=ob._tbox.selectionStart;
		var end=ob._tbox.selectionEnd;
		this.selection=$R(start,end);
		this._updateStart();
	},
	_updateSizes:function OBTextField__updateSizes(){
		this.ctx.font=OBTextField.font;
		var ch=null;
		var r=$R(this.selection.start,this.selection.end);
		r.start--;
		r.start=Math.max(0,r.start);
		r.end++;
		r.end=Math.min(this.text.length,r.end);
		for(var i=r.start;i<r.end;i++){
			ch=this.text[i];
			if(!OBTextField.CharacterSizeHash[ch]){
				OBTextField.CharacterSizeHash[ch]=this.ctx.measureTextWidth(ch);
			}
		}
	},
	setter_text:function OBTextField_setter_text(txt){
		this.text=txt;
		this._updateSizes();
		this.attr("selection",$R(0,0));
		if(this.attr("focused")){
			ob._tbox.value=txt;
		}
	},
	setter_selection:function OBTextField_setter_selection(sel){
		this.selection=sel;
		if(sel.start==sel.end){
			this._dstart=sel.start;
		}
		if(this.attr("focused")){
			this._select();
		}
		this._updateStart();
		this.update();
	},
	_updateStart:function OBTextField__updateStart(){
		this.ctx.font=OBThemeLoader.TextFieldInfo.font;
		var ch_idx=0;
		if(this.selection.start==this.selection.end){
			ch_idx=Math.max(this.selection.start-1,0);
			this.selpxpos=this.ctx.measureTextWidth(this.text.substr(0,this.selection.start));
		}else{
			var p=[
				this.text.substring(this._start,Math.max(this.selection.start,this._start)),
				this.text.substring(Math.max(this.selection.start,this._start),this.selection.end),
				this.text.substring(this.selection.end)
			];
			var m=[
				this.ctx.measureText(p[0]),
				this.ctx.measureText(p[1]),
				this.ctx.measureText(p[2]),
			];
			this._p=p;
			this._m=m;
			ch_idx=this.selection.end;
		}
		var txt=this.text.substring(Math.min(this._start,ch_idx),Math.max(this._start,ch_idx));
		this.ctx.font=OBThemeLoader.TextFieldInfo.font;
		var w=this.ctx.measureTextWidth(txt);
		if(w>(this.attr("width")-(2+this.diff))){
			this._start=ch_idx;
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
		}else if(Object.isNumber(ob._tbox.selectionStart)){
			ob._tbox.selectionStart=start;
			ob._tbox.selectionEnd=end;
		}else if(ob._tbox.setSelectionRange){
			ob._tbox.setSelectionRange(start,end-start);
		}
	},
	mousedown:function OBTextField_mousedown(evt){
		var px=evt.point.attr("x");
		var x=this.diff;
		if(px<=this.diff){
			this.attr("selection",$R(0,0));
			return;
		}
		for(var i=this._start;i<this.text.length;i++){
			var ch=this.text[i];
			var size=OBTextField.CharacterSizeHash[ch];
			if(px>=x && px<=x+size){
				i++;
				this._dstart=i;
				this.attr("selection",$R(i,i));
				return;
			}
			x+=size;
		}
		this.attr("selection",$R(this.text.length,this.text.length));
	},
	mousedrag:function OBTextField_mousedrag(evt){
		var px=evt.point.attr("x");
		var x=this.diff;
		if(px<=this.diff){
			var i=0;
			var s=this._dstart<i?this._dstart:i;
			var e=this._dstart<i?i:this._dstart;
			this.attr("selection",$R(s,e));
			return;
		}
		for(var i=this._start;i<this.text.length;i++){
			var ch=this.text[i];
			var size=OBTextField.CharacterSizeHash[ch];
			if(px>=x && px<=x+size){
				i++;
				var s=this._dstart<i?this._dstart:i;
				var e=this._dstart<i?i:this._dstart;
				this.attr("selection",$R(s,e));
				return;
			}
			x+=size;
		}
		this.attr("selection",$R(this._dstart,this.text.length));
	},
	setter_diff:function OBTextField_setter_diff(d){
		this.diff=d;
		this.update();
	}
});

window.OBSearchField=Class.create(OBTextField,{
	setup:function OBSearchField_setup($super){
		$super();
		this.diff=OBThemeLoader.Search.width;
	},
	redraw:function OBSearchField_redraw($super){
		$super();
		this.ctx.drawImage(OBThemeLoader.Search,0,0);
	}
});

OBTextField.CharacterSizeHash={};


function ch_measurer_0(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["`"]){OBTextField.CharacterSizeHash["`"]=ob.body.ctx.measureTextWidth("`");}setTimeout(function ch_measurer_1(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["1"]){OBTextField.CharacterSizeHash["1"]=ob.body.ctx.measureTextWidth("1");}setTimeout(function ch_measurer_2(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["2"]){OBTextField.CharacterSizeHash["2"]=ob.body.ctx.measureTextWidth("2");}setTimeout(function ch_measurer_3(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["3"]){OBTextField.CharacterSizeHash["3"]=ob.body.ctx.measureTextWidth("3");}setTimeout(function ch_measurer_4(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["4"]){OBTextField.CharacterSizeHash["4"]=ob.body.ctx.measureTextWidth("4");}setTimeout(function ch_measurer_5(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["5"]){OBTextField.CharacterSizeHash["5"]=ob.body.ctx.measureTextWidth("5");}setTimeout(function ch_measurer_6(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["6"]){OBTextField.CharacterSizeHash["6"]=ob.body.ctx.measureTextWidth("6");}setTimeout(function ch_measurer_7(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["7"]){OBTextField.CharacterSizeHash["7"]=ob.body.ctx.measureTextWidth("7");}setTimeout(function ch_measurer_8(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["8"]){OBTextField.CharacterSizeHash["8"]=ob.body.ctx.measureTextWidth("8");}setTimeout(function ch_measurer_9(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["9"]){OBTextField.CharacterSizeHash["9"]=ob.body.ctx.measureTextWidth("9");}setTimeout(function ch_measurer_10(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["0"]){OBTextField.CharacterSizeHash["0"]=ob.body.ctx.measureTextWidth("0");}setTimeout(function ch_measurer_11(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["-"]){OBTextField.CharacterSizeHash["-"]=ob.body.ctx.measureTextWidth("-");}setTimeout(function ch_measurer_12(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["="]){OBTextField.CharacterSizeHash["="]=ob.body.ctx.measureTextWidth("=");}setTimeout(function ch_measurer_13(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["\t"]){OBTextField.CharacterSizeHash["\t"]=ob.body.ctx.measureTextWidth("\t");}setTimeout(function ch_measurer_14(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["q"]){OBTextField.CharacterSizeHash["q"]=ob.body.ctx.measureTextWidth("q");}setTimeout(function ch_measurer_15(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["w"]){OBTextField.CharacterSizeHash["w"]=ob.body.ctx.measureTextWidth("w");}setTimeout(function ch_measurer_16(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["e"]){OBTextField.CharacterSizeHash["e"]=ob.body.ctx.measureTextWidth("e");}setTimeout(function ch_measurer_17(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["r"]){OBTextField.CharacterSizeHash["r"]=ob.body.ctx.measureTextWidth("r");}setTimeout(function ch_measurer_18(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["t"]){OBTextField.CharacterSizeHash["t"]=ob.body.ctx.measureTextWidth("t");}setTimeout(function ch_measurer_19(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["y"]){OBTextField.CharacterSizeHash["y"]=ob.body.ctx.measureTextWidth("y");}setTimeout(function ch_measurer_20(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["u"]){OBTextField.CharacterSizeHash["u"]=ob.body.ctx.measureTextWidth("u");}setTimeout(function ch_measurer_21(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["i"]){OBTextField.CharacterSizeHash["i"]=ob.body.ctx.measureTextWidth("i");}setTimeout(function ch_measurer_22(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["o"]){OBTextField.CharacterSizeHash["o"]=ob.body.ctx.measureTextWidth("o");}setTimeout(function ch_measurer_23(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["p"]){OBTextField.CharacterSizeHash["p"]=ob.body.ctx.measureTextWidth("p");}setTimeout(function ch_measurer_24(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["["]){OBTextField.CharacterSizeHash["["]=ob.body.ctx.measureTextWidth("[");}setTimeout(function ch_measurer_25(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["]"]){OBTextField.CharacterSizeHash["]"]=ob.body.ctx.measureTextWidth("]");}setTimeout(function ch_measurer_26(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["\u0007"]){OBTextField.CharacterSizeHash["\u0007"]=ob.body.ctx.measureTextWidth("\u0007");}setTimeout(function ch_measurer_27(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["s"]){OBTextField.CharacterSizeHash["s"]=ob.body.ctx.measureTextWidth("s");}setTimeout(function ch_measurer_28(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["d"]){OBTextField.CharacterSizeHash["d"]=ob.body.ctx.measureTextWidth("d");}setTimeout(function ch_measurer_29(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["f"]){OBTextField.CharacterSizeHash["f"]=ob.body.ctx.measureTextWidth("f");}setTimeout(function ch_measurer_30(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["g"]){OBTextField.CharacterSizeHash["g"]=ob.body.ctx.measureTextWidth("g");}setTimeout(function ch_measurer_31(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["h"]){OBTextField.CharacterSizeHash["h"]=ob.body.ctx.measureTextWidth("h");}setTimeout(function ch_measurer_32(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["j"]){OBTextField.CharacterSizeHash["j"]=ob.body.ctx.measureTextWidth("j");}setTimeout(function ch_measurer_33(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["k"]){OBTextField.CharacterSizeHash["k"]=ob.body.ctx.measureTextWidth("k");}setTimeout(function ch_measurer_34(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["l"]){OBTextField.CharacterSizeHash["l"]=ob.body.ctx.measureTextWidth("l");}setTimeout(function ch_measurer_35(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash[";\n"]){OBTextField.CharacterSizeHash[";\n"]=ob.body.ctx.measureTextWidth(";\n");}setTimeout(function ch_measurer_36(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["'"]){OBTextField.CharacterSizeHash["'"]=ob.body.ctx.measureTextWidth("'");}setTimeout(function ch_measurer_37(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["z"]){OBTextField.CharacterSizeHash["z"]=ob.body.ctx.measureTextWidth("z");}setTimeout(function ch_measurer_38(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["x"]){OBTextField.CharacterSizeHash["x"]=ob.body.ctx.measureTextWidth("x");}setTimeout(function ch_measurer_39(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["c"]){OBTextField.CharacterSizeHash["c"]=ob.body.ctx.measureTextWidth("c");}setTimeout(function ch_measurer_40(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["v"]){OBTextField.CharacterSizeHash["v"]=ob.body.ctx.measureTextWidth("v");}setTimeout(function ch_measurer_41(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["b"]){OBTextField.CharacterSizeHash["b"]=ob.body.ctx.measureTextWidth("b");}setTimeout(function ch_measurer_42(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["n"]){OBTextField.CharacterSizeHash["n"]=ob.body.ctx.measureTextWidth("n");}setTimeout(function ch_measurer_43(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["m"]){OBTextField.CharacterSizeHash["m"]=ob.body.ctx.measureTextWidth("m");}setTimeout(function ch_measurer_44(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash[","]){OBTextField.CharacterSizeHash[","]=ob.body.ctx.measureTextWidth(",");}setTimeout(function ch_measurer_45(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["."]){OBTextField.CharacterSizeHash["."]=ob.body.ctx.measureTextWidth(".");}setTimeout(function ch_measurer_46(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["/"]){OBTextField.CharacterSizeHash["/"]=ob.body.ctx.measureTextWidth("/");}setTimeout(function ch_measurer_47(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash[" "]){OBTextField.CharacterSizeHash[" "]=ob.body.ctx.measureTextWidth(" ");}setTimeout(function ch_measurer_48(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["~"]){OBTextField.CharacterSizeHash["~"]=ob.body.ctx.measureTextWidth("~");}setTimeout(function ch_measurer_49(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["!"]){OBTextField.CharacterSizeHash["!"]=ob.body.ctx.measureTextWidth("!");}setTimeout(function ch_measurer_50(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["@"]){OBTextField.CharacterSizeHash["@"]=ob.body.ctx.measureTextWidth("@");}setTimeout(function ch_measurer_51(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["#"]){OBTextField.CharacterSizeHash["#"]=ob.body.ctx.measureTextWidth("#");}setTimeout(function ch_measurer_52(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["$"]){OBTextField.CharacterSizeHash["$"]=ob.body.ctx.measureTextWidth("$");}setTimeout(function ch_measurer_53(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["%"]){OBTextField.CharacterSizeHash["%"]=ob.body.ctx.measureTextWidth("%");}setTimeout(function ch_measurer_54(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["^"]){OBTextField.CharacterSizeHash["^"]=ob.body.ctx.measureTextWidth("^");}setTimeout(function ch_measurer_55(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["&"]){OBTextField.CharacterSizeHash["&"]=ob.body.ctx.measureTextWidth("&");}setTimeout(function ch_measurer_56(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["*"]){OBTextField.CharacterSizeHash["*"]=ob.body.ctx.measureTextWidth("*");}setTimeout(function ch_measurer_57(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["("]){OBTextField.CharacterSizeHash["("]=ob.body.ctx.measureTextWidth("(");}setTimeout(function ch_measurer_58(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash[")"]){OBTextField.CharacterSizeHash[")"]=ob.body.ctx.measureTextWidth(")");}setTimeout(function ch_measurer_59(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["_"]){OBTextField.CharacterSizeHash["_"]=ob.body.ctx.measureTextWidth("_");}setTimeout(function ch_measurer_60(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["+"]){OBTextField.CharacterSizeHash["+"]=ob.body.ctx.measureTextWidth("+");}setTimeout(function ch_measurer_61(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["Q"]){OBTextField.CharacterSizeHash["Q"]=ob.body.ctx.measureTextWidth("Q");}setTimeout(function ch_measurer_62(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["W"]){OBTextField.CharacterSizeHash["W"]=ob.body.ctx.measureTextWidth("W");}setTimeout(function ch_measurer_63(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["E"]){OBTextField.CharacterSizeHash["E"]=ob.body.ctx.measureTextWidth("E");}setTimeout(function ch_measurer_64(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["R"]){OBTextField.CharacterSizeHash["R"]=ob.body.ctx.measureTextWidth("R");}setTimeout(function ch_measurer_65(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["T"]){OBTextField.CharacterSizeHash["T"]=ob.body.ctx.measureTextWidth("T");}setTimeout(function ch_measurer_66(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["Y"]){OBTextField.CharacterSizeHash["Y"]=ob.body.ctx.measureTextWidth("Y");}setTimeout(function ch_measurer_67(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["U"]){OBTextField.CharacterSizeHash["U"]=ob.body.ctx.measureTextWidth("U");}setTimeout(function ch_measurer_68(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["I"]){OBTextField.CharacterSizeHash["I"]=ob.body.ctx.measureTextWidth("I");}setTimeout(function ch_measurer_69(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["O"]){OBTextField.CharacterSizeHash["O"]=ob.body.ctx.measureTextWidth("O");}setTimeout(function ch_measurer_70(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["P"]){OBTextField.CharacterSizeHash["P"]=ob.body.ctx.measureTextWidth("P");}setTimeout(function ch_measurer_71(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["{"]){OBTextField.CharacterSizeHash["{"]=ob.body.ctx.measureTextWidth("{");}setTimeout(function ch_measurer_72(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["}"]){OBTextField.CharacterSizeHash["}"]=ob.body.ctx.measureTextWidth("}");}setTimeout(function ch_measurer_73(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["|"]){OBTextField.CharacterSizeHash["|"]=ob.body.ctx.measureTextWidth("|");}setTimeout(function ch_measurer_74(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["A"]){OBTextField.CharacterSizeHash["A"]=ob.body.ctx.measureTextWidth("A");}setTimeout(function ch_measurer_75(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["S"]){OBTextField.CharacterSizeHash["S"]=ob.body.ctx.measureTextWidth("S");}setTimeout(function ch_measurer_76(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["D"]){OBTextField.CharacterSizeHash["D"]=ob.body.ctx.measureTextWidth("D");}setTimeout(function ch_measurer_77(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["F"]){OBTextField.CharacterSizeHash["F"]=ob.body.ctx.measureTextWidth("F");}setTimeout(function ch_measurer_78(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["G"]){OBTextField.CharacterSizeHash["G"]=ob.body.ctx.measureTextWidth("G");}setTimeout(function ch_measurer_79(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["H"]){OBTextField.CharacterSizeHash["H"]=ob.body.ctx.measureTextWidth("H");}setTimeout(function ch_measurer_80(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["J"]){OBTextField.CharacterSizeHash["J"]=ob.body.ctx.measureTextWidth("J");}setTimeout(function ch_measurer_81(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["K"]){OBTextField.CharacterSizeHash["K"]=ob.body.ctx.measureTextWidth("K");}setTimeout(function ch_measurer_82(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["L"]){OBTextField.CharacterSizeHash["L"]=ob.body.ctx.measureTextWidth("L");}setTimeout(function ch_measurer_83(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash[":"]){OBTextField.CharacterSizeHash[":"]=ob.body.ctx.measureTextWidth(":");}setTimeout(function ch_measurer_84(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["\""]){OBTextField.CharacterSizeHash["\""]=ob.body.ctx.measureTextWidth("\"");}setTimeout(function ch_measurer_85(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["Z"]){OBTextField.CharacterSizeHash["Z"]=ob.body.ctx.measureTextWidth("Z");}setTimeout(function ch_measurer_86(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["X"]){OBTextField.CharacterSizeHash["X"]=ob.body.ctx.measureTextWidth("X");}setTimeout(function ch_measurer_87(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["C"]){OBTextField.CharacterSizeHash["C"]=ob.body.ctx.measureTextWidth("C");}setTimeout(function ch_measurer_88(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["V"]){OBTextField.CharacterSizeHash["V"]=ob.body.ctx.measureTextWidth("V");}setTimeout(function ch_measurer_89(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["B"]){OBTextField.CharacterSizeHash["B"]=ob.body.ctx.measureTextWidth("B");}setTimeout(function ch_measurer_90(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["N"]){OBTextField.CharacterSizeHash["N"]=ob.body.ctx.measureTextWidth("N");}setTimeout(function ch_measurer_91(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["M"]){OBTextField.CharacterSizeHash["M"]=ob.body.ctx.measureTextWidth("M");}setTimeout(function ch_measurer_92(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["<"]){OBTextField.CharacterSizeHash["<"]=ob.body.ctx.measureTextWidth("<");}setTimeout(function ch_measurer_93(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash[">"]){OBTextField.CharacterSizeHash[">"]=ob.body.ctx.measureTextWidth(">");}setTimeout(function ch_measurer_94(){ob.body.ctx.font=OBThemeLoader.TextFieldInfo.font;if(!OBTextField.CharacterSizeHash["?"]){OBTextField.CharacterSizeHash["?"]=ob.body.ctx.measureTextWidth("?");}},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);},100);}

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
	ch_measurer_0();
	/*OBTextField.Focused=[
		OBThemeLoader.TextfieldBezelSquareFocused0,
		OBThemeLoader.TextfieldBezelSquareFocused1,
		OBThemeLoader.TextfieldBezelSquareFocused2,
		OBThemeLoader.TextfieldBezelSquareFocused3,
		OBThemeLoader.TextfieldBezelSquareFocused4,
		OBThemeLoader.TextfieldBezelSquareFocused5,
		OBThemeLoader.TextfieldBezelSquareFocused6,
		OBThemeLoader.TextfieldBezelSquareFocused7,
		OBThemeLoader.TextfieldBezelSquareFocused8,
	];*/
});