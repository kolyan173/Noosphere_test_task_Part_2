window.onload = function() {
	(function($, tracking){
		Number.prototype.inRange = function() {
			var args = arguments;
			var min = args[0];
			var max = args[1];
			if (arguments.length === 1) {
				return this <= args[0];
			}

			return this >= min && this <= max;
		};

		function Coloring() {
			this.options = {
				usedColors: [],
				similarColorTolerance: null,
				blackColorTolerance: null,
				width: null,
				height: null,
				frameWidthTolerance: null,
				frameHeightTolerance: null
			};
			this.init = function(canvas, image, params) {
				this.options = $.extend(this.options, params);
				if (!this.options.similarColorTolerance.inRange(100)) {
					console.warn(['Warning: similarColorTolerance parameter',
						'should to be less then 100'].join(' '));
				}
				this.image = image;
				this.canvas = canvas;
				this.ctxCanvas = this.canvas.getContext('2d');
				this.options.height =  this.options.height || image.offsetHeight;
				
				this.drawingImage();
			};
			this.drawingImage = function() {
				var canvas = this.canvas;
		      	var ctx = this.ctxCanvas;
				var img = this.image;
				var imageId = img.id;
				var tracker;
				var width = this.options.width;
				var height = this.options.height;
				
				ctx.canvas.width  = width;
		 		ctx.canvas.height = height;

		        tracking.ColorTracker.registerColor('black', function(r, g, b){
					var blackClrTlrnc = this.options.blackColorTolerance;
					var args = Array.prototype.slice.call(arguments);
					var specArgs = args.slice(0, 2);

					return specArgs.every(function(item) {
						return item.inRange(blackClrTlrnc);
					});
				}.bind(this));
				tracker = new tracking.ColorTracker('black');
		        
		        ctx.drawImage(img, 0, 0, width, height);
				
				tracker.on('track', function(event) {
					var bottomFrame_y = 0;
					var bottomFrameHeight = height - bottomFrame_y;
					var frameWidthTlrnc = this.options.frameWidthTolerance;
					var frameHeightTlrnc = this.options.frameHeightTolerance;

					event.data.forEach(function(rect) {
						var x = rect.x;
						var y = rect.y;
						if (y > bottomFrame_y) {
							bottomFrame_y = y;
						}
						var width = rect.width + frameWidthTlrnc;
						var height = rect.height + frameHeightTlrnc;
						
						this.frameColoring(x, y, width, height);
						
						x += rect.width;
						y += rect.height;
					}.bind(this));
					// bottom frame
					this.frameColoring(0, bottomFrame_y, width, bottomFrameHeight);
				}.bind(this));
				
				tracking.track('#' + imageId, tracker);
			};
		    this.frameColoring = function(x, y, width, height) {
				var ctx = this.ctxCanvas;
				var imageData = ctx.getImageData(x, y, width, height);
				var data = imageData.data;
				var usedColors = this.options.usedColors;
				var smlrColorTlrnc = this.options.similarColorTolerance;

				function isSameColors(color, to) {
					return color.every(function(item, num) {
						var min = item - smlrColorTlrnc/2;
						var max = item + smlrColorTlrnc/2;

						return to[num].inRange(min, max);
					});
				}
				function isUsedColor(color) {
					return usedColors.some(function(item, num) {
						return isSameColors(color, item);
					});
				}
				function getRandomColor(callback) {
					randomColorGen(function(color) {
						if (color) {
							callback(color);
							return;
						}
					});
				}
				function isNotBlacky(color) {
					return color.every(function(item) {
						return item > 60;
					});
				}
				function randomColorGen(done) {
					var shadows = [255, 255, 255];

					shadows = shadows.map(function(i) {
						return Math.abs(255-Math.round(Math.random()*255));
					});
					
					if (isUsedColor(shadows) || isNotBlacky(shadows)) {
						randomColorGen(done);
						return;
					}
					usedColors.push(shadows);
					
					done(shadows);
				}

				getRandomColor(function(newColor) {
					var color;
					
					function isBlack() {
						return color.every(function(item) {
							return item < 10;
						});
					}
					
				    for(var i = 0; i < data.length; i += 4) {
						color = [data[i], data[i + 1], data[i + 2]];
				    	
				    	if( isBlack() ) {
							newColor.forEach(function(item, num) {
								data[i + num] = item;
							})
				    	}
				    }

					ctx.putImageData(imageData, x, y);
				});
			};
		}

		$.fn.coloring = function(image, params) {
			this.each(function(item) {
				var element = this;
				(new Coloring).init(element, image, params);
				return;
			});
		};

		function handleFileSelect(evt, callback) {
			var files = evt.target.files;
			if (!files.length) {
				alert('Choose a file');
				return;
			}
			var f = files[0];
			var reader;
			if (!f.type.match('image.*')) {
				alert('File has to be in image format');
				return;
			}
			
			reader = new FileReader();
			
			reader.onload = (function(theFile) {
				return function(e) {
					var $span = $('<span></span>');
					var imageId = 'original';
					var $img = $('<img />');
					var image;
					
					$img.attr({
						id: imageId,
						src: e.target.result,
						title: escape(theFile.name)
					});
					
					$span.html($img);
					
					$('#container').html($span);
					
					image = $('#' + imageId)[0];
					
					callback(image);
				};
			})(f);

			reader.readAsDataURL(f);	
		}

		$('#file').on('change', function(e) {
			handleFileSelect(e, function(image) {
				var params = {
					usedColors: [ [255,255,255], [0,0,0] ],
					similarColorTolerance: 100,
					blackColorTolerance: 250,
					width: window.innerWidth/2,
					height: null,
					frameWidthTolerance: 5,
					frameHeightTolerance: null
				};
				
				$('canvas').coloring(image, params);
			});
		});
	})(jQuery, tracking);
};