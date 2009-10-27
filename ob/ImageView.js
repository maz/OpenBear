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