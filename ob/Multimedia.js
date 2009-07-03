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

window.OBVideo=Class.create(OBAttr,OBResponder,{
	initialize:function OBVideo_constructor(src){
		this.src=src;
		this.elem=document.createElement("video");
		this.elem.setAttribute("autoplay",false);
		this.elem.setAttribute("autobuffer",true);
		this.loaded=false;
		this.elem.onload=(function(){
			this.size=new OBSize(parseInt(this.elem.width),parseInt(this.elem.height));
			this.fire("loaded");
			this.loaded=true;
		}).bind(this);
		this.elem.style.top="-10000px";
		this.elem.style.left="-10000px";
		document.body.appendChild(this.elem);
		this.elem.src=this.src;
	},
	remove:function OBVideo_remove(){
		document.body.removeChild(this.elem);
	}
});

window.OBVideoView=Class.create(OBView,{
	setup:function OBVideoView_setup(video,controls){
		this.video=video;
		this.controls=controls;
		this.observe("removed",function(){
			this.video.remove();
		}.bind(this));
	}
});
