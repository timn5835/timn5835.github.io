$(document).ready(function() {
  var board = {
  size         : 9,
  coords       : {},//values initialized in init() below
  cells        : {
      width: $('section#cells div').width()+4,
      bindEvents: function() {
        var self = this;
        $('section#cells div').on('click', function() {
          self.move(self.parent.coords[$('section#cells div').index(this) + ''], self.animate);
        });
      },
      move: function(cell, callback) {
        var diffR = this.emptyCell.r - cell.r;
        var diffC = this.emptyCell.c - cell.c;

          if(this.emptyCell.isNeighbor(diffR, diffC)) {
            cell.top += diffR;
            cell.left += diffC;
            this.emptyCell.top += diffR*-1;
            this.emptyCell.left += diffC*-1;
    
            //swapping coordinates
            var tempR = this.emptyCell.r;
            var tempC = this.emptyCell.c;
            this.emptyCell.r = cell.r;
            this.emptyCell.c = cell.c;
            cell.r = tempR;
            cell.c = tempC;
    
            //update the coords value for the emptyCell for sake of checkWin
            this.emptyCell.updateCoords();        

            if(typeof callback !== 'undefined') {
              callback.call(this,cell);
            }  
          }
          else {
            this.emptyCell.findNeighbors('color');
          }
      },
      animate: function(cell) {
        //actually move the cells visually by setting the css properties to stored values
        if(typeof cell !== 'undefined') {
          $('section#cells div:not(:last-of-type)').css('border-color','white');
          //cell.cell.css({'top':cell.top, 'left':cell.left});  
          cell.cell.css('transform', 'translate('+(cell.left*100)+'%,'+(cell.top*100)+'%)');
          this.emptyCell.cell.css('transform', 'translate('+(this.emptyCell.left*100)+'%,'+(this.emptyCell.top*100)+'%)');
        }
        else {
          for (var div in this.parent.coords) {
            //this.parent.coords[''+div].cell.css({'top': this.parent.coords[''+div].top, 'left': this.parent.coords[''+div].left});
            this.parent.coords[''+div].cell.css('transform', 'translate('+(this.parent.coords[''+div].left*100)+'%,'+(this.parent.coords[''+div].top*100)+'%)');
          }
        }
        if(this.parent.checkWin()) {
          this.parent.displayWin();
        }
      },
      canMove      : [],
      emptyCell    : {
          top : 0,
          left: 0,
          hasNeighbors: false, //for after user clicks incorrect choice and valid options are hightlight, then we don't have to check if they are valid on next click
          updateCoords: function() {
            this.grandParent.coords['8'].r = this.r;
            this.grandParent.coords['8'].c = this.c;
            this.grandParent.coords['8'].top = this.top;
            this.grandParent.coords['8'].left = this.left;
          },
          findNeighbors: function(color) {
            var i, diffR, diffC;
            for (i = 0; i<this.grandParent.size-1; i++) {
              diffR = Math.abs(this.r - this.grandParent.coords[''+i].r);
              diffC = Math.abs(this.c - this.grandParent.coords[''+i].c);
              if(this.isNeighbor(diffR, diffC)) {
                if(typeof color !== 'undefined')
                this.grandParent.coords[''+i].cell.css('border-color','lime');
                this.parent.canMove.push(this.grandParent.coords[''+i]);
              }
            }
            this.hasNeighbors = true;
          },
          isNeighbor: function(diffR, diffC) {
            return (Math.abs(diffR) === 0  && Math.abs(diffC) === 1) || (Math.abs(diffC) === 0  && Math.abs(diffR) === 1);
          }
      }
  },
  shuffleModule   : {
      bindEvents : function() {
          $('#shuffle').on('click', this.shuffle.bind(this));
      },
      shuffle : function () {
        var i;
        for(i=0; i<100; i++) {
          this.cells.canMove = [];
          this.cells.emptyCell.findNeighbors();

          var chosenCell = this.cells.canMove[Math.floor(Math.random() * this.cells.canMove.length)];

          this.cells.move(chosenCell);
        }

        this.cells.animate();
      }
  },
  cropImgModule: {
    bindEvents: function() {
      $('#saveImg').on('click', this.cropImg.bind(this));
    },
    cropImg: function() {
      var canvas = $('#image').cropper('getCroppedCanvas');
      this.image.src = canvas.toDataURL('image/jpg');
      this.setBg();
      this.nextModule();
      this.parent.shuffleModule.shuffle();
    },
    image: new Image(),
    setBg: function() {
      $('section#cells div').css('background-image','url('+this.image.src+')')
      $('body > img').attr('src',this.image.src);
    },
    nextModule: function() {
      $('aside:first-of-type').css('opacity','0');
      $('aside:first-of-type').css('z-index','0');
      $('main').css('opacity','1');
      $('main').css('z-index','1');
    }
  },
  upload_img_module: {
    bindEvents: function() {
      $('#my_img_upload_input').on('change', this.handleFileSelect.bind(this));
      $('aside#file button').on('click', this.nextModule.bind(this));
    },
    handleFileSelect: function(evt) {
      console.log('in handleFileSelect');
      var self = this;
      var files = evt.target.files;
      f = files[0];
      var reader = new FileReader();
      reader.onload = (function(theFile) {
      return function(e) {
        var filePath = escape(theFile.name).toLowerCase();
        if (typeof filePath != 'undefined' && !filePath.match('.jpg$') && !filePath.match('.jpeg$') && !filePath.match('.png$') && !filePath.match('.gif$')) {
              $('aside#file').attr('data-error','Please enter a .jpeg, .jpg, .png, or .gif file.');
        } else {
          $('#image').attr('src',e.target.result+'');
          self.nextModule();
        }
      };
    })(f);
    reader.readAsDataURL(f);
    },
    nextModule: function() {
      $('#image').cropper({
        aspectRatio: 1,
        zoomable: false
      });
      $('aside#file').css('opacity','0');
      $('aside#file').css('z-index','0');
      $('aside:first-of-type').css('opacity','1');
      $('aside:first-of-type').css('z-index','1');
    }
  },
  checkWin  : function() {
    var i,count=-1,
    sqr = Math.sqrt(this.size);
    for(i = 0; i<=this.size-sqr; i+=sqr) {
      var j, sumR = 0, sumC = 0;
      for (j=0; j<sqr; j++) {
        sumR += this.coords[(i+j)+''].r;
        sumC += this.coords[((i/sqr)+(sqr*j))+''].c;
      } 
      count++;
      if(sumR !== i || sumC !== i) {
        return false;
      }
    }
    return true;
  },
  displayWin: function() {
    window.setTimeout(function() {
      $('section#cells>div').css('border','0');
      $('section#cells').css('border','2px solid lime');
    }, 800);
  },
  init      : function() {
      var i, key,
      cellsPerRow = Math.sqrt(this.size);
      for (i=0; i<this.size; i++) {
        this.coords[''+i] = {};
        key      = this.coords[''+i];
        key.r    = Math.floor(i/cellsPerRow);
        key.c    = i % cellsPerRow;
        key.cell = $('section#cells > div:nth-of-type('+(i+1)+')');
        key.top  = 0;
        key.left = 0;
      }

      this.cells.emptyCell.r = this.coords['' + (this.size-1)].r;
      this.cells.emptyCell.c = this.coords['' + (this.size-1)].c;
      this.cells.emptyCell.cell = this.coords['' + (this.size-1)].cell;

      //for emptyCell to be able to use board's and cell's variables
      this.cells.emptyCell.grandParent = this;
      this.cells.emptyCell.parent = this.cells;
      //so cells can see coords
      this.cells.parent = this;
      this.shuffleModule.parent = this;
      this.shuffleModule.cells = this.cells;

      this.shuffleModule.bindEvents();
      this.cropImgModule.bindEvents();
      this.cropImgModule.parent = this;
      this.upload_img_module.bindEvents();
      this.cells.bindEvents();
  }
};

  board.init();
});