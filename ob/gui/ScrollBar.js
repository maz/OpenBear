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
OBThemeLoader.ScrollerDownArrowHighlighted="scrollbar/scroller-down-arrow-highlighted.png";
OBThemeLoader.ScrollerDownArrow="scrollbar/scroller-down-arrow.png";
OBThemeLoader.ScrollerHorizontalKnobCenter="scrollbar/scroller-horizontal-knob-center.png";
OBThemeLoader.ScrollerHorizontalKnobLeft="scrollbar/scroller-horizontal-knob-left.png";
OBThemeLoader.ScrollerHorizontalKnobRight="scrollbar/scroller-horizontal-knob-right.png";
OBThemeLoader.ScrollerHorizontalTrack="scrollbar/scroller-horizontal-track.png";
OBThemeLoader.ScrollerLeftArrowHighlighted="scrollbar/scroller-left-arrow-highlighted.png";
OBThemeLoader.ScrollerLeftArrow="scrollbar/scroller-left-arrow.png";
OBThemeLoader.ScrollerRightArrowHighlighted="scrollbar/scroller-right-arrow-highlighted.png";
OBThemeLoader.ScrollerRightArrow="scrollbar/scroller-right-arrow.png";
OBThemeLoader.ScrollerUpArrowHighlighted="scrollbar/scroller-up-arrow-highlighted.png";
OBThemeLoader.ScrollerUpArrow="scrollbar/scroller-up-arrow.png";
OBThemeLoader.ScrollerVerticalKnobBottom="scrollbar/scroller-vertical-knob-bottom.png";
OBThemeLoader.ScrollerVerticalKnobCenter="scrollbar/scroller-vertical-knob-center.png";
OBThemeLoader.ScrollerVerticalKnobTop="scrollbar/scroller-vertical-knob-top.png";
OBThemeLoader.ScrollerVerticalTrack="scrollbar/scroller-vertical-track.png";
OBThemeLoader.ScrollBarInfo="scrollbar/info.json";

window.OBScrollBar=Class.create(OBView,{
	max:10,
	value:0,
	selected:-1,
	buttonScrollInterval:250,
	buttonScrollDelta:1,
	setup:function OBScrollBar_setup(max,value){
		if(max){
			this.attr("max",max||10);
		}
		if(value){
			this.attr("value",value||0);
		}
		var s=this.attr("size").clone();
		s.height=17;
		this.observe("size_changed",this._size_changed.bind(this));
		this.attr("size",s);
	},
	_size_changed:function OBScrollBar__size_changed(){
		this.leftRect=new OBRect(0,0,OBThemeLoader.ScrollerLeftArrow.width,17);
		this.rightRect=new OBRect(this.attr("width")-OBThemeLoader.ScrollerRightArrow.width,0,OBThemeLoader.ScrollerRightArrow.width,17);
		this._recalcUnit();
	},
	setter_max:function OBScrollBar_setter_max(max){
		this.max=max;
		this.value=Math.min(this.value,this.max);
		this._recalcUnit();
		this.update();
	},
	_recalcUnit:function OBScrollBar__recalcUnit(){
		this.unit=(this.attr("width")-(OBThemeLoader.ScrollerRightArrow.width*2))/this.max;
	},
	redraw:function OBScrollBar_redraw(){
		this.ctx.drawImage(OBThemeLoader.ScrollerHorizontalTrack,0,0,this.attr('width'),OBThemeLoader.ScrollerHorizontalTrack.height);
		if(this.max){
			this.knobWidth=Math.max(this.unit,18);
			this.knobX=((this.unit*this.value)-(this.knobWidth*(this.value/this.max)))+OBThemeLoader.ScrollerLeftArrow.width;
			this.ctx.drawSlicedImage([
				this.selected==0?OBThemeLoader.ScrollerLeftArrowHighlighted:OBThemeLoader.ScrollerLeftArrow,
				OBThemeLoader.ScrollerHorizontalTrack,
				this.selected==2?OBThemeLoader.ScrollerRightArrowHighlighted:OBThemeLoader.ScrollerRightArrow
			],0,0,this.attr("width"));
			this.ctx.drawSlicedImage([
				OBThemeLoader.ScrollerHorizontalKnobLeft,
				OBThemeLoader.ScrollerHorizontalKnobCenter,
				OBThemeLoader.ScrollerHorizontalKnobRight
			],this.knobX,OBThemeLoader.ScrollBarInfo.KnobY,this.knobWidth);
		}
	},
	mousedown:function OBScrollBar_mousedown(evt){
		if(this.leftRect.intersects(evt.point)){
			this.selected=0;
			var self=this;
			self.attr("value",self.attr("value")-self.buttonScrollDelta);
			this.timer=window.setInterval(function OBScrollBar_mousedown_left(){
				self.attr("value",self.attr("value")-self.buttonScrollDelta);
			},this.buttonScrollInterval);
		}else if(this.rightRect.intersects(evt.point)){
			this.selected=2;
			var self=this;
			self.attr("value",self.attr("value")+self.buttonScrollDelta);
			this.timer=window.setInterval(function OBScrollBar_mousedown_right(){
				self.attr("value",self.attr("value")+self.buttonScrollDelta);
			},this.buttonScrollInterval);
		}else if(evt.point.x<=(this.knobX+this.knobWidth) && evt.point.x>=this.knobX){
			this.selected=1;
			this._setValueToPoint(evt.point.x);
		}else{
			this.selected=-1;
			this._setValueToPoint(evt.point.x);
		}
		this.update();
	},
	_setValueToPoint:function OBScrollBar__setValueToPoint(x){
		var z=Math.round((x-OBThemeLoader.ScrollerLeftArrow.width)/this.unit);
		if(!isNaN(z))
			this.attr("value",z);
	},
	mousedrag:function OBScrollBar_mousedrag(evt){
		if(this.selected==1 && !this.leftRect.intersects(evt.point) && !this.rightRect.intersects(evt.point)){
			this._setValueToPoint(evt.point.x);
		}
	},
	mouseup:function OBScrollBar_mouseup(evt){
		this.selected=-1;
		if(this.timer){
			window.clearInterval(this.timer);
			this.timer=null;
		}
		this.update();
	},
	setter_value:function OBScrollBar_setter_value(val){
		val=Math.max(Math.min(this.max,val),0);
		if(val!=this.value){
			this.value=val;
			this.fire("changed");
			this.update();
		}
	},
	acceptsFocus:false
});