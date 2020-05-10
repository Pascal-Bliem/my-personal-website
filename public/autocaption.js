// This script finds all image elements in the container and
// inserts them in a figure element with caption generated 
// from the alt attribute of the image

var images= document.querySelectorAll( ".container img" );
var L = images.length; 
var fig = document.createElement('figure');
var which; 
var temp;

while(L) {
	temp = fig.cloneNode(false);
	which = images[--L];
	caption = which.getAttribute("alt");
	which.parentNode.insertBefore(temp, which);
	content = document.createElement( 'figcaption' );
	content.innerHTML = caption;
	temp.appendChild(which);
	temp.appendChild(content);
};