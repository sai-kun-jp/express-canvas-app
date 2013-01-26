(function(){

 var Paint = function(id) {
   this.id = id;
   this.canvas = document.getElementById(id);
   this.context = this.canvas.getContext('2d');

   this.init();
   this.setEvents();
 };

 Paint.prototype.init = function() {
   this.beforeX = null;
   this.beforeY = null;
   this.isDrawing = false;

   this.strokeStyle = this.getRandomColor();
   this.lineWidth = 10;
 };

 Paint.prototype.getRandomColor = function() {
   var r = Math.floor(Math.random() * 255);
   var g = Math.floor(Math.random() * 255);
   var b = Math.floor(Math.random() * 255);
   return 'rgb(' + r + ',' + g + ',' + b + ')';
 };

 Paint.prototype.setEvents = function() {
   var self = this;

   this.canvas.addEventListener('mousedown', function(event) {
     self.down(event)
   }, false);

   this.canvas.addEventListener('mouseup', function(event) {
     self.up(event);
   }, false);

   this.canvas.addEventListener('mousemove', function(event) {
     self.move(event);
   }, false);

   this.canvas.addEventListener('mouseout', function(event) {
     self.up(event)
   }, false);

 };

 Paint.prototype.down = function(event) {
   this.isDrawing = true;
   this.beforeX = event.offsetX - 10;
   this.beforeY = event.offsetY - 10;
 };

 Paint.prototype.up = function(event) {
   this.isDrawing = false;
 };

 Paint.prototype.drawLine = function(points) {
   this.context.beginPath();
   this.context.strokeStyle = points.c;
   this.context.lineWidth = this.lineWidth;
   this.context.lineCap = 'round';
   this.context.lineJoin = 'round';
   this.context.moveTo(points.bx, points.by);
   this.context.lineTo(points.ax, points.ay);
   this.context.stroke();
   this.context.closePath();
 };

 Paint.prototype.clearCanvas = function(connection) {
   this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
 };

 Paint.prototype.move = function(event) {
   if (!this.isDrawing) {
     return;
   }

   var points = {
     bx: this.beforeX,
     by: this.beforeY,
     ax: event.offsetX - 10,
     ay: event.offsetY - 10,
     c: this.strokeStyle
   };

   if (this.connection) {
     this.connection.send(JSON.stringify(points));
   } else {
     this.drawLine(points);
   }

   this.beforeX = points.ax;
   this.beforeY = points.ay;
 };

 Paint.prototype.clear = function(connection) {
   if (this.connection) {
     this.connection.send('@CLEAR');
   } else {
     this.clearCanvas();
   }
 };

 Paint.prototype.setConnection = function(connection) {
   this.connection = connection;

   this.connection.onclose = function() {console.log('Close');};
   this.connection.onopen = function(){console.log('Connected');}

   var self = this;

   this.connection.onmessage = function(event) {
     if (event.data.indexOf('@') > -1) {
       if (event.data.indexOf('@CLEAR') > -1) {
         self.clearCanvas();
       }
     } else {
       var d = JSON.parse(event.data);
       self.drawLine(d);
     }
   };
 };

 window.Paint = Paint;

})();
