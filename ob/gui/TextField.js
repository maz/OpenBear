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

window.OBTextField=Class.create(OBView,{
	setup:function OBTextField_setup(){
		this.parts=OBTextField.Regular;
		this.observe("got_focus",this.gotFocus.bind(this));
		this.observe("lost_focus",this.lostFocus.bind(this));
		this.text="";
		this.selection=$R(0,0);
		this.blink=false;
		this.multiline=false;
		this.attr("cursor", OBView.Cursors.Text);
		this._dstart=null;
		this.diff=2;
	},
	redraw:function OBTextField_redraw(){
		this.ctx.drawSlicedImage(this.parts,0,0,this.attr("width"),this.attr("height"));
		this.ctx.font=OBTextField.font;
		if(this.selection.end==this.selection.start){
			this.ctx.fillStyle="black";
			var m=this.ctx.measureText(this.text);
			this.ctx.fillText(this.text,this.diff,m.attr("height"));
			if(this.blink){
				this.ctx.fillStyle="black";
				this.ctx.fillRect(this.diff+this.ctx.measureText(this.text.substr(0,this.selection.start)).attr("width"),0,1,this.attr("height"));
			}
		}else{
			//FIXME: this will likely, under multiline, yield a bad effect.
			var p=[
				this.text.substr(0,this.selection.start),
				this.text.substr(this.selection.start,this.selection.end-this.selection.start),
				this.text.substring(this.selection.end)
			];
			var m=[
				this.ctx.measureText(p[0]),
				this.ctx.measureText(p[1]),
				this.ctx.measureText(p[2]),
			];
			if(p[0].length!=0){
				this.ctx.fillStyle="black";
				this.ctx.fillText(p[0],this.diff,m[0].attr("height"));
			}
			this.ctx.drawImage(OBThemeLoader.Selection,this.diff+m[0].attr("width"),0,m[1].attr("width"),this.attr("height"));
			this.ctx.fillStyle="white";
			this.ctx.fillText(p[1],this.diff+m[0].attr("width"),m[1].attr("height"));
			if(p[1].length!=0){
				this.ctx.fillStyle="black";
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
		//return this.multiline?true:evt.keyCode!=Event.KEY_RETURN;
		if(this.multiline){
			return true;
		}else if(evt.keyCode==Event.KEY_RETURN){
			this.fire("trigger");
			return false;
		}else{
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
	},
	_updateSizes:function OBTextField__updateSizes(){
		this.ctx.font=OBTextField.font;
		var ch=null;
		for(var i=0;i<this.text.length;i++){
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
		this.update();
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
		for(var i=0;i<this.text.length;i++){
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
		for(var i=0;i<this.text.length;i++){
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
	setup:function($super){
		$super();
		this.diff=OBThemeLoader.Search.width;
	},
	redraw:function($super){
		$super();
		this.ctx.drawImage(OBThemeLoader.Search,0,0);
	}
});

OBTextField.CharacterSizeHash={};
OBTextField.font="10pt Arial";

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