function Canvas2D(canvas_obj, canvas_id) {
	if (canvas_obj != null) {
		this.canvas = canvas_obj;
	} else {
		this.canvas = document.getElementById(canvas_id);
	}

	this.ctx = this.canvas.getContext('2d');
	this.ctx.textBaseline = 'middle';
	//this.ctx.textAlign = 'center';
	this.ctx.font = '15px Verdana';
	this.arrow = {width: 10, height:10};
	this.textColor = null;
	this.region_id = 0;
	this.click_cbs = [];
}

Canvas2D.prototype.getCanvasObj = function() {
	return this.canvas;
}

Canvas2D.prototype.changeColor = function(color) {
	this.ctx.fillStyle = color;
}

Canvas2D.prototype.changeText = function(font, color) {
	if (font != null) {
		this.ctx.font = font;
	}
	
	if (color != null) {
		this.textColor = color;
	}
}

Canvas2D.prototype.__handleClick = function(){
	var c2d = this;
	this.canvas.addEventListener('click', function(event){
		// FIXME
		//if (event.region) {
		//	this.click_cbs[parseInt(event.region)]();
		//}
		for (cbi in c2d.click_cbs) {
			var cb = c2d.click_cbs[cbi];
			if (event.clientX > cb.topl.x && event.clientX < cb.bottomr.x
				&& event.clientY > cb.topl.y && event.clientY < cb.bottomr.y) {
				if (cb.click)
					cb.click();
				return;
			}
		}
	});
}

Canvas2D.prototype.__handleMouseOver = function(){
	var c2d = this;
	this.canvas.addEventListener('mousemove', function(event){
		// FIXME 
		//if (event.region) {
		//	this.over_cbs[parseInt(event.region)]();
		//}
		//console.log('over event.x:' + event.clientX + ' y:' + event.clientY);
		for (cbi in c2d.click_cbs) {
			var cb = c2d.click_cbs[cbi];
			if (event.clientX > cb.topl.x && event.clientX < cb.bottomr.x
				&& event.clientY > cb.topl.y && event.clientY < cb.bottomr.y) {
				if (cb.over)
					cb.over();
				return;
			}
		}
	});
}

Canvas2D.prototype.drawHArrow = function(start, end, y, onclick, onmouseover, color) {
	if (color != null) {
		this.ctx.fillStyle = color;
	}

	this.ctx.beginPath();
	this.ctx.moveTo(start, y);
	this.ctx.lineTo(end, y);
	this.ctx.stroke();

	var half_height = this.arrow.height / 2;
	if (end - start > this.arrow.width * 2 && y > half_height) {
		this.ctx.lineTo(end - this.arrow.width, y - half_height);
		this.ctx.lineTo(end - this.arrow.width, y + half_height);
		this.ctx.lineTo(end, y);
		this.ctx.fill();
	}

	if (onclick || onmouseover) {
		// FIXME for new API addHitRegion, and also the region id
		// this.ctx.addHitRegion({id: this.region_id.toString()});
		this.click_cbs[this.region_id] = {topl: {x: start, y: y - half_height},
			bottomr: {x: end, y: y + half_height}, click: onclick, over: onmouseover};
		this.region_id += 1;
		if (onclick) this.__handleClick();
		if (onmouseover) this.__handleMouseOver();
	}
}

Canvas2D.prototype.drawVArrow = function(start, end, x, onclick, onmouseover, color) {
	if (color != null) {
		this.ctx.fillStyle = color;
	}

	this.ctx.beginPath();
	this.ctx.moveTo(x, start);
	this.ctx.lineTo(x, end);
	this.ctx.stroke();

	var half_height = this.arrow.height / 2;
	if (end - start > this.arrow.width * 2 && x > half_height) {
		this.ctx.lineTo(x - half_height, end - this.arrow.width);
		this.ctx.lineTo(x + half_height, end - this.arrow.width);
		this.ctx.lineTo(x, end);
		this.ctx.fill();
	}

	if (onclick || onmouseover) {
		// FIXME for new API addHitRegion, and also the region id
		// this.ctx.addHitRegion({id: this.region_id.toString()});
		this.click_cbs[this.region_id] = {topl: {x: x - half_height, y: start},
			bottomr: {x: x + half_height, y: end}, click: onclick, over: onmouseover};
		this.region_id += 1;
		if (onclick) this.__handleClick();
		if (onmouseover) this.__handleMouseOver();
	}
}

Canvas2D.prototype.drawRec = function(x, y, width, height, text, onclick, onmouseover, color) {
	if (color != null) {
		this.ctx.fillStyle = color;
	}

	var text_width = 0;
	if (text != null) {
		var text_metrics = this.ctx.measureText(text);
		text_width = text_metrics.width;
	}

	if (width < text_width + 20)
		width = text_width + 20;

	this.ctx.fillRect(x, y, width, height);

	if (text != null) {
		this.ctx.save();
		if (this.textColor) {
			this.changeColor('black');
		}
		
		this.ctx.fillText(text, x + (width - text_width) / 2, y + height / 2);
		this.ctx.restore();
	}

	if (onclick || onmouseover) {
		// FIXME for new API addHitRegion, and also the region id
		// this.ctx.addHitRegion({id: this.region_id.toString()});
		this.click_cbs[this.region_id] = {topl: {x: x, y: y}, bottomr: {x: x + width, y: y + height},
			click: onclick, over: onmouseover};
		this.region_id += 1;
		if (onclick) this.__handleClick();
		if (onmouseover) this.__handleMouseOver();
	}

	return width;
}