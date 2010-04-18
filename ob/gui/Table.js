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
OBThemeLoader.ArrowUp="ArrowUp.png";
OBThemeLoader.ArrowDown="ArrowDown.png";

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
	initialize:function OBTableColumn_constructor(identifier,name,width,editable,cell,sort){
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
		this.sort=sort?sort:OBTableColumn.DefaultSortFunction;
	},
	_sort:0,
	name:"",
	identifier:"",
	width:0,
	editable:false,
	cell:null,
	sort:null,
	sortable:true,
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
	},
	setter_width:function OBTableColumn_setter_width(w){
		this.width=w;
		for(var i=0;i<this._cells.length;i++){
			this._cells[i].attr("width",this.width);
		}
	}
});

OBTableColumn.DefaultSortFunction=function OBTableColumn_DefaultSortFunction(a,b){
	if(a==b)
		return 0;
	if(Object.isString(a)){//assume b is also
		var arr=[a,b];
		arr.sort();
		return (arr[0]==a)?-1:1;
	}else if(a<b){
		return -1;
	}else{
		return 1;
	}
};

OBTableColumn.BasicTextCell=function OBTableColumn_BasicTextCell(v,x,y,w,h){
	var cell=new OBTextView(v,new OBRect(x,y,w,h));
	cell.buffer();
	cell.attr("font",OBThemeLoader.TableInfo.TextCell.Font);
	cell.attr("color",OBThemeLoader.TableInfo.TextCell.DefaultColor);
	cell.commit(true);
	cell.setData=function OBTableColumn_BasicTextCell_setData(z){
		cell.attr("text",""+z/*convert to string*/);
	};
	cell.setSelected=function OBTableColumn_BasicTextCell_setSelected(flag){
		cell.attr('color',flag?new OBColor(OBThemeLoader.TableInfo.TextCell.HighlightedColor):new OBColor(OBThemeLoader.TableInfo.TextCell.DefaultColor));
	};
	return cell;
};

window.OBTableHeader=Class.create(OBView,{
	acceptsFocus:false,
	setup:function OBTableHeader_setup(t){
		this.table=t;
	},
	redraw:function OBTableHeader_redraw(){
		this.ctx.font=OBThemeLoader.TableInfo.Header.Font;
		this.ctx.fillStyle=OBThemeLoader.TableInfo.Header.TextColor;
		this.ctx.drawImage(OBThemeLoader.TableHeader,0,0,this.attr("width"),OBThemeLoader.TableHeader.height);
		x=0;
		this.table.columns.each(function OBTableHeader_redraw_sub(col){
			this.ctx.fillText(col.name,x,OBThemeLoader.TableHeader.height-OBThemeLoader.TableInfo.Header.TextOffset);
			if(col._sort!=0){
				var s=this.ctx.measureText(col.name);
				var img=(col._sort<0)?OBThemeLoader.ArrowDown:OBThemeLoader.ArrowUp;
				this.ctx.drawImage(img,x+s.width,2);
			}
			x+=col.width;
			x+=OBThemeLoader.TableInfo.VSeperator.size;
		},this);
	}
});

window.OBTable=Class.create(OBView,{
	acceptsFocus:false,
	data:null,//[{with <columnIdentifier>:<value>}]
	showHeader:true,
	_header:null,
	setup:function OBTable_setup(columns){
		this.data=[];
		this.rowHeight=OBThemeLoader.TableInfo.RowHeight;
		this.columns=columns;
		this.vbar=new OBScrollBar(this,new OBRect(this.attr("width")-17,(this.showHeader?OBThemeLoader.TableHeader.height:0),17,this.attr("height")-(this.showHeader?OBThemeLoader.TableHeader.height:0)/*-17*/),0,0,true);
		this.vbar.attr("autoresize",OBView.Autoresize.LockTopRight|OBView.Autoresize.Height);
		this.vbar.buttonScrollDelta=Math.round(this.rowHeight/3);
		this.vbar.observe("changed",this.update.bind(this));
		//this.hbar=new OBScrollBar(this,new OBRect(0,this.attr("height")-17,this.attr("width")-17,17),0,0);
		//this.hbar.attr("autoresize",OBView.Autoresize.Width);
		var w=this.attr("width")-17;
		var i;
		var x=this.columns.length;
		for(i=0;i<this.columns.length;i++){
			if(this.columns[i].width){
				w-=this.columns[i].width;
				x--;
			}
		}
		x=Math.max(w/x,OBThemeLoader.TableInfo.MinimumColumnWidth);
		for(i=0;i<this.columns.length;i++){
			if(!this.columns[i].width){
				this.columns[i].width=x;
			}
		}
		this._header=new OBTableHeader(this,new OBRect(0,0,this.attr("width"),OBThemeLoader.TableHeader.height),this);
		this._header.attr("autoresize",OBView.Autoresize.Width);
		this.observe("size_changed",function OBTable_setup_sizeChanged(){
			if(this.columns.length==1){
				this.columns[0].attr("width",this.attr("width")-17);
			}
		}.bind(this));
	},
	setter_showHeader:function OBTable_setter_showHeader(flag){
		this.showHeader=flag;
		this.buffer();
		this._header.attr("visible",flag);
		this.vbar.attr("y",(this.showHeader?OBThemeLoader.TableHeader.height:0));
		this.vbar.attr("height",this.attr("height")-(this.showHeader?OBThemeLoader.TableHeader.height:0));
		this.commit();
	},
	selectedRow:-1,
	setter_rowHeight:function OBTable_setter_rowHeight(rh){
		this.rowHeight=rh;
		this.update();
	},
	redraw:function OBTable_redraw(){
		if(this.children[this.children.length-1]!=this._header){
			this.children[this.children.indexOf(this._header)]=this.children[this.children.length-1];
			this.children[this.children.length-1]=this._header;
		}
		var dlrh=this.data.length*this.rowHeight;
		var aheight=this.attr("height")-((this.showHeader?OBThemeLoader.TableHeader.height:0)/*+17*/);//availableHeight
		var maxDisp=Math.ceil(aheight/this.rowHeight);
		this.vbar.attr("max",Math.max(this.rowHeight*(this.data.length-maxDisp),0));
		var i=this.vbar.attr("value")/this.rowHeight;
		var row=Math.floor(i);
		var x=0;
		var rowSelection=this.data.slice(row,row+maxDisp);
		var vd=this.rowHeight+OBThemeLoader.TableInfo.HSeperator.size;
		var initialY=(this.showHeader?OBThemeLoader.TableHeader.height:0)+((this.vbar.attr("value")%this.rowHeight)*-1);
		var y=initialY;
		i=0;
		var smr=Math.max(this.selected-row,-1);
		var flag=false;
		for(i=0;i<maxDisp;i++){
			if(i==smr){
				this.ctx.drawImage(OBThemeLoader.Selection,0,y,this.attr("width"),this.rowHeight);
			}else{
				flag=(i%2);
				if(row%2)
					flag=!flag;
				this.ctx.fillStyle=(flag?OBThemeLoader.TableInfo.RowBackground:OBThemeLoader.TableInfo.AlternateRowBackground);
				this.ctx.fillRect(0,y,this.attr("width"),this.rowHeight);
			}
			y+=vd;
		}
		this.columns.each(function OBTable_redraw_sub1(col){
			col.draw(this,vd,x,initialY,rowSelection,smr);
			x+=col.width;
			DrawStyledLine(this.ctx,x,(this.showHeader?OBThemeLoader.TableHeader.height:0),aheight,true,OBThemeLoader.TableInfo.VSeperator);
			x+=OBThemeLoader.TableInfo.VSeperator.size;
		},this);
		y=initialY;
		for(i=0;i<rowSelection.length;i++){
			DrawStyledLine(this.ctx,0,y,this.attr("width"),false,OBThemeLoader.TableInfo.HSeperator);
			y+=vd;
		}
	},
	setter_data:function OBTable_setter_data(data){
		/**
		DON'T OVERUSE THIS: remember that arrays are represented by pointers.
		This means that one can set an array to the data of a table and then perform operations on it.
		If resort() and then update() are called on the table, then the new data will be properly displayed, eliminating the need to set the data attribute again
		**/
		this.data=data;
		this.resort();
		this.update();
	},
	mousedown:function OBTable_mousedown(evt){
		if(this.showHeader && evt.point.y<=OBThemeLoader.TableHeader.height){
			var x=0;
			var i=0;
			for(i=0;i<this.columns.length;i++){
				x+=this.columns[i].width;
				if(evt.point.x<=x){
					if(!this.columns[i].sortable)
						return;
					for(var a=0;a<this.columns.length;a++){
						if(a!=i)
							this.columns[a]._sort=0;
					}
					if(this.columns[i]._sort==1){
						this.columns[i]._sort=-1;
					}else{
						this.columns[i]._sort=1;
					}
					this._sortDataByColumn(i);
					this._header.update();
					this.update();
					return;
				}
			}
		}else if(evt.point.x>=(this.attr("width")-17)){
			return;
		}
		this.attr('selected',this.rowFromPoint(evt.point));
	},
	_sortDataByColumn:function OBTable__sortDataByColumn(i){
		var col=this.columns[i];
		this.data.sort(function OBTable__sortDataByColumn_sub(a,b){
			return col._sort*col.sort(a[col.identifier],b[col.identifier]);
			//we can do this because col._sort is either 1 or -1 with the latter meaning the reverse
		});
	},
	resort:function OBTable_resort(){
		for(var i=0;i<this.columns.length;i++){
			if(this.columns[i]._sort!=0){
				this._sortDataByColumn(i);
				return;
			}
		}
	},
	setter_selected:function OBTable_selected(x){
		if(this.selected!=x){
			this.selected=x;
			this.fire("selection_changed");
			this.update();
		}
	},
	rowFromPoint:function OBTable_rowFromPoint(p){
		var aheight=this.attr("height")-((this.showHeader?OBThemeLoader.TableHeader.height:0)/*+17*/);//availableHeight
		var maxDisp=Math.ceil(aheight/this.rowHeight);
		var i=this.vbar.attr("value")/this.rowHeight;
		var row=Math.floor(i);
		var i=0;
		var smr=Math.max(this.selected-row,-1);
		var max=Math.min(this.data.length,maxDisp);
		var vd=this.rowHeight+OBThemeLoader.TableInfo.HSeperator.size;
		var initialY=(this.showHeader?OBThemeLoader.TableHeader.height:0)+((this.vbar.attr("value")%this.rowHeight)*-1);
		var y=initialY+vd;
		for(i=0;i<max;i++){
			if(p.y<=y){
				return i+row;
			}
			y+=vd;
		}
		return -1;
	}
});