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
window.OBImageView=Class.create(OBView,{
	setup:function OBImageView_setup(img){
		this.buffer_can=this._can;
		this.attr("image",img?img:null);
	},
	setter_image:function OBImageView_setter_image(img){
		this.image=img;
		if(img){
			this._can=this.image;//rather than adding unnecessary draw calls, we can just have the image drawn into _bigCan->_ctx
		}else{
			this._can=this.buffer_can;
		}
		this.update();
	}
});