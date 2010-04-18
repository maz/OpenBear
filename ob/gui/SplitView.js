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

OBThemeLoader.SplitViewHorizontalTrack="splitview/HorizontalTrack.png";
OBThemeLoader.SplitViewVerticalTrack="splitview/VerticalTrack.png";
OBThemeLoader.SplitViewKnob="splitview/knob.png";

window.OBSplitView=Class.create(OBView,{
	acceptsFocus:false,
	setup:function OBSplitView_setup(vertical){
		this.vertical=vertical;
		this.observe("added_child",this._addedChild.bind(this));
		this.attr("cursor",OBView.Cursors.Resize[vertical?"Column":"Row"]);
		this._rect=new OBRect(0,0,0,0);
	},
	_addedChild:function OBSplitView__addedChild(v){
		if(this.children.length>2)
			throw new Error("OBSplitView does not currently support more than 2 views");
		v.attr(this.vertical?"height":"width",this.attr(this.vertical?"height":"width"));
		v.attr("autoresize",OBView.Autoresize[this.vertical?"height":"width"]);
		if(this.children.length==2){
			var p=new OBPoint(0,0);
			var val=((this.children[0].attr(this.vertical?"width":"height")+(this.vertical?OBThemeLoader.SplitViewVerticalTrack.width:OBThemeLoader.SplitViewHorizontalTrack.height)));
			p[this.vertical?"x":"y"]=val;
			v.attr("origin",p);
			v.attr(this.vertical?"width":"height",this.attr(this.vertical?"width":"height")-p.attr(this.vertical?"x":"y"));
		}else{
			v.attr("origin",new OBPoint(0,0));
		}
		this.update();
	},
	redraw:function OBSplitView_redraw(){
		if(this.children.length){
			var x=this.vertical?this.children[0].attr("width"):0;
			var y=this.vertical?0:this.children[0].attr("height");
			this._rect.origin.x=x;
			this._rect.origin.y=y;
			this._rect.size.width=this.vertical?OBThemeLoader.SplitViewVerticalTrack.width:this.attr("width");
			this._rect.size.height=this.vertical?this.attr("height"):OBThemeLoader.SplitViewHorizontalTrack.height
			this.ctx.drawImage(this.vertical?OBThemeLoader.SplitViewVerticalTrack:OBThemeLoader.SplitViewHorizontalTrack,x,y,this.vertical?OBThemeLoader.SplitViewVerticalTrack.width:this.attr("width"),this.vertical?this.attr("height"):OBThemeLoader.SplitViewHorizontalTrack.height);
			this.ctx.drawImage(OBThemeLoader.SplitViewKnob,x+(this.vertical?(OBThemeLoader.SplitViewHorizontalTrack.width/2):(this.attr("width")/2)),y+(this.vertical?(this.attr("height")/2):(OBThemeLoader.SplitViewVerticalTrack.height/2)));
		}
	},
	mousedown:function OBSplitView_mousedown(evt){
		this._go=this._rect.intersects(evt.point);
		this._offset=evt.point[this.vertical?"x":"y"]-this.children[0].attr(this.vertical?"width":"height");
		this.mousedrag(evt);
	},
	mousedrag:function OBSplitView_mousedrag(evt){
		if(!this._go)
			return;
		var c=evt.point[this.vertical?"x":"y"]-this._offset;
		this.children[0].attr((this.vertical?"width":"height"),c-(this.vertical?(OBThemeLoader.SplitViewVerticalTrack.width/2):(OBThemeLoader.SplitViewHorizontalTrack.height/2)));
		c+=(this.vertical?OBThemeLoader.SplitViewVerticalTrack.width:OBThemeLoader.SplitViewHorizontalTrack.height);
		this.children[1].buffer();
		this.children[1].attr(this.vertical?"x":"y",c);
		this.children[1].attr(this.vertical?"width":"height",this.attr(this.vertical?"width":"height")-c);
		this.children[1].commit();
		this.update();
	}
});