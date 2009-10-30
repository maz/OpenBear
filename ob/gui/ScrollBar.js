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

window.OBScrollBar=Class.create(OBView,{
	max:10,
	value:0,
	selected:-1,
	setup:function OBScrollBar_setup(orientation, max,value){
		this.orientation=!!orientation;
		if(max){
			this.attr("max",max);
		}
		if(value){
			this.attr("value",value);
		}
		var s=this.attr("size").clone();
		s[this.orientation?"width":"height"]=30;
		this.attr("size",s);
	},
	setter_max:function OBScrollBar_setter_max(max){
		this.max=max;
		this.update();
	},
	setter_value:function OBScrollBar_setter_value(value){
		this.value=value;
		this.update();
	},
	redraw:function OBScrollBar_redraw(){
		if(this.orientation){//vertical
			this.ctx.save();
			this.ctx.translate(this._rcenter.y,this._rcenter.x);
			this.ctx.rotate(-1.57079633);//90 degrees
			this.ctx.translate(-1*this._rcenter.y,-1*this._rcenter.x);
		}
		this.ctx.drawSlicedImage([
			this.selected==0?OBThemeLoader.ScrollerLeftArrowHighlighted:OBThemeLoader.ScrollerLeftArrow,
			OBThemeLoader.ScrollerHorizontalTrack,
			this.selcted==2?OBThemeLoader.ScrollerRightArrowHighlighted:OBThemeLoader.ScrollerRightArrow
		],0,0,this.attr("size")[this.orientation?"height":"width"]);
		if(this.orientation){
			this.ctx.restore();
		}
	}
});

OBScrollBar.Vertical=true
OBScrollBar.Horizontal=false;