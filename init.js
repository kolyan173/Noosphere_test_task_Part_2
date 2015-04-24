window.onload = function() {
	function handleFileSelect(evt) {
		var files = evt.target.files;
		var f = files[0];
		// for (var i = 0, f; f = files[i]; i++) {
			if (!f.type.match('image.*')) {
				return;
				// continue;
			}
			var reader = new FileReader();
			// Closure to capture the file information.
			reader.onload = (function(theFile) {
				return function(e) {
				  // Render thumbnail.
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

					drawing(image, imageId);
					// drawImage(image);
				};
			})(f);

			// Read in the image file as a data URL.
			reader.readAsDataURL(f);
		// }
	}

	document.getElementById('files').addEventListener('change', handleFileSelect, false);

	function drawing(element, id) {
		var canvas = document.getElementById('canvas');
      	var ctx = canvas.getContext('2d');
		// var img = document.getElementById('img');
		var img = element;
		var demoContainer = document.querySelector('#container');
		tracking.ColorTracker.registerColor('black', function(r,g,b){return r<=1&&g<=1&&b<=1 });
		var tracker = new tracking.ColorTracker('black');
        
        ctx.drawImage(img, 0, 0);
		
		tracker.on('track', function(event) {
	     	var widthImage = 900;
	      	var heightImage = 450;

	      	var x = 0;
	      	var y = 0;
			event.data.forEach(function(rect) {
				var width = rect.width;
				var height = rect.height;

				x += rect.width;
				y += rect.height;

				changeFrameColor(element, x, y, width, height);
				// tracking.Fast.THRESHOLD = 10;
				// ctx.changeFrameColor(img, 0, 0, widthImage, heightImage);
        		// var imageData = ctx.getImageData(0, 0, width, height);
        		// var gray = tracking.Image.grayscale(imageData.data, width, height);
        		// var corners = tracking.Fast.findCorners(gray, width, height);
        // 		for (var i = 0; i < corners.length; i += 2) {
        // // debugger;
		      //    	ctx.fillStyle = '#f00';
		      //   	ctx.fillRect(corners[i], corners[i + 1], 3, 3);
		      //   }
				// window.plot(rect.x, rect.y, rect.width, rect.height, rect.color);
			});
			// debugger;
		});
		tracking.track('#'+id, tracker);
	}
    
    function changeFrameColor(imageObj, x, y, width, height) {
        var canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');
        var startAt_x = x - width;
        var startAt_y = /*y - height*/0;
        var imageData = context.getImageData(x, y, width, height);
        
        var randomColor = +(Math.random()*255-Math.random()*255/10).toFixed();
        
  //       var gray = tracking.Image.grayscale(imageData.data, width, height);
		// var corners = tracking.Fast.findCorners(gray, width, height);
		debugger;
        var data = imageData.data;
        
        for(var i = 0; i < data.length; i += 4) {
          // red
          data[i] = randomColor - data[i];
          // green
          data[i + 1] = randomColor - data[i + 1];
          // blue
          data[i + 2] = randomColor - data[i + 2];
        }

        // overwrite original image
        context.putImageData(imageData, x, y);
      }
};
