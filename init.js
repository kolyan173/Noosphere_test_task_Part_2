window.onload = function() {
	var usedColors = [ [255,255,255], [0,0,0] ];

	function handleFileSelect(callback, evt) {
		var files = evt.target.files;
		var f = files[0];
		if (!f.type.match('image.*')) {
			return;
		}

		var reader = new FileReader();
		
		reader.onload = (function(theFile) {
			return function(e) {
				var span = document.createElement('span');
				var imageId = 'original';
				var image;

				span.innerHTML = [
					'<img id="', imageId, '" src="', e.target.result,
					'" title="', escape(theFile.name), 
					'"/>'
				].join('');
				
				document.getElementById('container').insertBefore(span, null);
				image = document.getElementById(imageId);
				
				callback(image, imageId);
			};
		})(f);

		reader.readAsDataURL(f);
	}

	document.getElementById('files')
		.addEventListener('change', handleFileSelect.bind(this, drawingImage), false);

	function drawingImage(element, imageId) {
		var canvas = document.getElementById('canvas');
      	var ctx = canvas.getContext('2d');
		var img = element;
		var tracker;
		
		
        tracking.ColorTracker.registerColor('black', function(r, g, b){
			return r <= 100 && g <= 100 && b <= 100;
		});
		tracker = new tracking.ColorTracker('black');
        
        ctx.drawImage(img, 0, 0/*, 900, 450*/);
        // var width = 900;
        // var height = 450;
        // var imageData = ctx.getImageData(0, 0, width, height);
        // var gray = tracking.Image.grayscale(imageData.data, width, height);
        // var corners = tracking.Fast.findCorners(gray, width, height);
        // debugger;
		
		tracker.on('track', function(event) {
			var lowestFramePoint = 0;
			event.data.forEach(function(rect) {
				var x = rect.x;
				var y = rect.y;
				// if (y > lowestFramePoint) {
				// 	lowestFramePoint = y;
				// }
				var width = rect.width;
				var height = rect.height;
				// debugger;
				changeFrameColor(ctx, element, x, y, width, height);
				
				x += rect.width;
				y += rect.height;

			});
		});
		tracking.track('#' + imageId, tracker);
	}
    
    function changeFrameColor(ctx, imageObj, x, y, width, height) {
        var imageData = ctx.getImageData(x, y, width, height);
        var data = imageData.data;

        function isSameColors(color, to) {
        	return color.every(function(item, num) {
        		return ( to[num] > (item - 60) )
        			&& ( to[num] < (item + 60) );
        	})
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
        function isNotBlack(color) {
        	return color.every(function(item) {
        		return item > 60;
        	});
        }
		function randomColorGen(done) {
			var shadows = [255, 255, 255];
			// var randomDef = Math.round(Math.random()*255);
			// var randomShadow = Math.round(Math.random()*2);
			
			// shadows[randomShadow] = randomDef;
			shadows = shadows.map(function(i) {
				return Math.abs(255-Math.round(Math.random()*255));
			});
			
			if (isUsedColor(shadows) || isNotBlack(shadows)) {
				randomColorGen(done);
				return;
			}
			usedColors.push(shadows);
			done(shadows);
		}
        
        
		getRandomColor(function(newColor) {
			function isBlack() {
				return color.every(function(item) {
					return item === 0;
				});
			}
	        for(var i = 0; i < data.length; i += 4) {
	        	var color = [data[i], data[i + 1], data[i + 2]];

	        	if( isBlack() ) {
					newColor.forEach(function(item, num) {
						data[i + num] = item;
					})
	        	}
	        }

        	console.log(usedColors);
        	ctx.putImageData(imageData, x, y);
		});
    }
};
