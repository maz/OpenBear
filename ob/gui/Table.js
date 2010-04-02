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

ob.load("ob.gui.ScrollBar");
ob.load("ob.TextView");

OBThemeLoader.TableInfo="table/info.json";
OBThemeLoader.TableHeader="table/Header.png";
OBThemeLoader.Selection="selection.png";

var DrawStyledLine=function OBTableUtility_DrawStyledLine(ctx,x,y,length,vertical,hash){
	if(!hash.size)
		return;
	ctx.save();
	ctx.translate(x,y);
	ctx.fillStyle=hash.color;
	if(hash.style=="dotted"){
		for(var i=0;i<length;i+=(hash.size*2)){
			ctx.fillRect(vertical?0:i,vertical?i:0,hash.size,hash.size);
		}
	}else{//assume solid
		ctx.fillRect(0,0,vertical?hash.size:length,vertical?length:hash.size);
	}
	ctx.restore();
};

window.OBTableColumn=Class.create(OBAttr,{
	initialize:function OBTableColumn_constructor(identifier,name,width,editable,cell){
		this.identifier=identifier;
		this.name=name?name:identififer;
		this.editable=!!editable;
		if(cell){
			this.cell=cell;
		}else{
			this.cell=OBTableColumn.BasicTextCell;
		}
		this._cells=[];
		this.width=width?width:0;
	},
	draw:function OBTableColumn_draw(table,verticalDelta,x,y,rows,selected){
		var i=0;
		for(i=0;i<rows.length;i++){
			var row=rows[i];
			if(!this._cells[i]){
				this._cells[i]=this.cell(table,0,0,5,5).attr("acceptsFocus",false);
			}
			this._cells[i].buffer();
			this._cells[i].attr("visible",true);
			this._cells[i].attr("x",x).attr("y",y).attr("width",this.width).attr("height",table.rowHeight);
			if(this._cells[i].setData)
				this._cells[i].setData(row[this.identifier]);
			if(this._cells[i].setSelected)
				this._cells[i].setSelected(i==selected);
			this._cells[i].commit();
			y+=verticalDelta;
		}
		for(i=i;i<this._cells.length;i++){
			this._cells[i].attr("visible",false);
		}
	}
});

OBTableColumn.BasicTextCell=function OBTableColumn_BasicTextCell(v,x,y,w,h){
	var cell=new OBTextView(v,new OBRect(x,y,w,h));
	cell.setData=function OBTableColumn_BasicTextCell_setData(z){
		cell.attr("text",z);
	};
	cell.setSelected=function OBTableColumn_BasicTextCell_setSelected(flag){
		cell.attr('color',flag?OBColor.White:OBColor.Black);
	};
	return cell;
};

window.OBTable=Class.create(OBView,{
	acceptsFocus:false,
	data:null,//[{with <columnIdentifier>:<value>}]
	showHeader:true,
	setup:function OBTable_setup(columns){
		this.data=[];
		this.rowHeight=OBThemeLoader.TableInfo.RowHeight;
		this.columns=columns;
		var p=new OBPoint(this.attr("width")-17,0);
		p.rotate((-90).toRadians(),new OBPoint(this.attr("width")-8.5,(this.attr("height")-17)/2));
		p.y=((this.attr("height")-17)/2)-16.5;
		this.vbar=new OBScrollBar(this,new OBRect(p,new OBSize(this.attr("height")-17,17)));
		this.vbar.attr("autoresize",OBView.Autoresize.Width);
		this.vbar.attr("rotation",(90).toRadians());
		this.hbar=new OBScrollBar(this,new OBRect(0,this.attr("height")-17,this.attr("width"),17));
		this.hbar.attr("autoresize",OBView.Autoresize.Width);
		this.vbar.attr("max",0);
		this.hbar.attr("max",0);
		var w=this.attr("width")-17;
		var i;
		var x=this.columns.length;
		for(i=0;i<this.columns.length;i++){
			if(this.columns[i].width){
				w-=this.columns[i].width;
				x--;
			}
		}
		x=w/x;
		for(i=0;i<this.columns.length;i++){
			if(!this.columns[i].width){
				this.columns[i].width=x;
			}
		}
	},
	selectedRow:-1,
	setter_rowHeight:function OBTable_setter_rowHeight(rh){
		this.rowHeight=rh;
		this.update();
	},
	redraw:function OBTable_redraw(){
		var dlrh=this.data.length*this.rowHeight;
		var aheight=this.attr("height")-((this.showHeader?OBThemeLoader.TableHeader.height:0)+17);//availableHeight
		var maxDisp=Math.floor(aheight/this.rowHeight);
		this.vbar.attr("max",((dlrh>aheight)?(dlrh-maxDisp):0));
		var row=Math.floor(this.vbar.attr("value")/this.rowHeight);
		var x=0;
		var rowSelection=this.data.slice(row,row+maxDisp);
		var vd=this.rowHeight+OBThemeLoader.TableInfo.HSeperator.size;
		var y=(this.showHeader?OBThemeLoader.TableHeader.height:0);
		var i=0;
		var smr=Math.max(this.selected-row,-1);
		for(i=0;i<maxDisp;i++){
			this.ctx.fillStyle=(i==smr)?this.ctx.createPattern(OBThemeLoader.Selection,'repeat'):((i%2)?OBThemeLoader.TableInfo.RowBackground:OBThemeLoader.TableInfo.AlternateRowBackground);
			this.ctx.fillRect(0,y,this.attr("width"),this.rowHeight);
			y+=vd;
		}
		this.columns.each(function OBTable_redraw_sub(col){
			col.draw(this,vd,x,(this.showHeader?OBThemeLoader.TableHeader.height:0),rowSelection,smr);
			x+=col.width;
			DrawStyledLine(this.ctx,x,(this.showHeader?OBThemeLoader.TableHeader.height:0),aheight,true,OBThemeLoader.TableInfo.VSeperator);
			x+=OBThemeLoader.TableInfo.VSeperator.size;
		},this);
		y=(this.showHeader?OBThemeLoader.TableHeader.height:0);
		for(i=0;i<rowSelection.length;i++){
			DrawStyledLine(this.ctx,0,y,this.attr("width"),false,OBThemeLoader.TableInfo.HSeperator);
			y+=vd;
		}
		
	},
	setter_data:function OBTable_setter_data(data){
		/**
		DON'T OVERUSE THIS: remember that arrays are represented by pointers.
		This means that one can set an array to the data of a table and then perform operations on it.
		If update() is then called on the table, then the new data will be properly displayed, eliminating the need to set the data attribute again
		**/
		this.data=data;
		this.update();
	},
	mousedown:function OBTable_mousedown(evt){
		this.attr('selected',this.rowFromPoint(evt.point));
	},
	setter_selected:function OBTable_selected(x){
		if(this.selected!=x){
			this.selected=x;
			this.update();
		}
	},
	rowFromPoint:function OBTable_rowFromPoint(p){
		var aheight=this.attr("height")-((this.showHeader?OBThemeLoader.TableHeader.height:0)+17);//availableHeight
		var maxDisp=Math.floor(aheight/this.rowHeight);
		p=p.clone();
		if(p.y<=(this.showHeader?OBThemeLoader.TableHeader.height:0)||p.y>=Math.min(Math.min(maxDisp*this.rowHeight,aheight),this.data.length*this.rowHeight)){
			return -1;
		}
		p.y-=(this.showHeader?OBThemeLoader.TableHeader.height:0);
		for(var i=0;i<maxDisp;i++){
			if(p.y<=((i+1)*this.rowHeight)){
				return i+Math.floor(this.vbar.attr("value")/this.rowHeight);
			}
		}
		return -1;
	}
});