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
	setup:function OBScrollBar_setup(max,value){
		if(max){
			this.attr("max",max);
		}
		if(value){
			this.attr("value",value);
		}
		var s=this.attr("size").clone();
		s.height=17;
		this.observe("size_changed",this._size_changed.bind(this));
		this.attr("size",s);
	},
	_size_changed:function OBScrollBar__size_changed(){
		this.leftRect=new OBRect(0,0,OBThemeLoader.ScrollerLeftArrow.width,17);
		this.rightRect=new OBRect(this.attr("width")-OBThemeLoader.ScrollerRightArrow.width,0,OBThemeLoader.ScrollerRightArrow.width,17);
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
		this.ctx.drawSlicedImage([
			this.selected==0?OBThemeLoader.ScrollerLeftArrowHighlighted:OBThemeLoader.ScrollerLeftArrow,
			OBThemeLoader.ScrollerHorizontalTrack,
			this.selected==2?OBThemeLoader.ScrollerRightArrowHighlighted:OBThemeLoader.ScrollerRightArrow
		],0,0,this.attr("size")[this.orientation?"height":"width"]);
	},
	mousedown:function OBScrollBar_mousedown(evt){
		if(this.leftRect.intersects(evt.point)){
			this.selected=0;
		}else if(this.rightRect.intersects(evt.point)){
			this.selected=2;
		}else{
			this.selected=-1;
		}
		this.update();
	},
	mouseup:function OBScrollBar_mouseup(evt){
		this.selected=-1;
		this.update();
	},
	acceptsFocus:false
});