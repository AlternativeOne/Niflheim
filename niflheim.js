/*
* Name: niflheim.js
* Author: AlternativeOne
* Version: 4
*/

var name_='Niflheim';
var author_='AlternativeOne';
var ver_=4;

var game_name_='TCOAAL';
var game_ver_=undefined;

setTimeout(function(){
  var scripts=document.getElementsByTagName('script');
  for (var s of scripts){
    var t=s.innerText;

    if (!t.includes('VERSION')){
      continue;
    }

    var i1=t.indexOf('VERSION');
    var i2=t.indexOf('=', i1);
    var i3=t.indexOf('\'', i2+3);
    var i4=t.indexOf('"', i2+3);
    if (i3<0 || (i4>=0 && i4<i3)){
      i3=i4;
    }

    var v=t.substring(i2, i3);
    game_ver_=v.substring(2, v.length);
    if (game_ver_.length>9){
      game_ver_=undefined;
    }
  }
}, 5);

fetch("/languages/dialogue.csv")
  .then((res) => res.text())
  .then((content) => {
    var lines=content.split('\n');
    Window_Message.prototype.loc_lines=lines;
    Bitmap.prototype.loc_lines=lines;
    Window_Base.prototype.loc_lines=lines;
   });

fetch("/languages/english/dialogue.loc")
  .then((res) => res.text())
  .then((content) => {
    try{
      content=content.substring(content.indexOf('{'));
      var json=JSON.parse(content);
      Window_Message.prototype.loc_json=json;
      Bitmap.prototype.loc_json=json;
      Window_Base.prototype.loc_json=json;
    } catch (error){}
   });

Window_Message.prototype.updateMessage = function() {
    if (this._textState) {

        var text=this._textState.text+'';

        if (text.includes('[') && text.includes('(lines)')){
          prefix=text.substring(0, text.indexOf('('));
          text=text.substring(text.indexOf('(lines)'), text.length-1);

          var newText='';

          if (text.includes(']')){
            id=text.substring(text.indexOf('[')+1, text.indexOf(']'));
          } else {
            id=text.substring(text.indexOf('[')+1);
          }

          try{
            var json=this.loc_json;
            var lines=json['linesLUT'];
            var line=lines[id];
            if (line.constructor === Array){
              line=line.join('\n');
            }
            newText='\n'+prefix+line;
          } catch(error){
          for (var line of this.loc_lines){
            if (!line.startsWith(id)){
              continue;
            }

            line=line.trim();

            line=line.substring(line.indexOf(',')+1);
            line=line.substring(line.indexOf(',')+1);

            var i=line.indexOf(',');
            while (true){
              if (i<0){
                break;
              }

              var qc=0;
              for (var a=0; a<i; a++){
                if (line[a]=='"'){
                  qc+=1;
                }
              }

              if (qc%2!=0){
                i=line.indexOf(',', i+1);
              } else {
                break;
              }
            }
            line=line.substring(0, i);

            if (line.startsWith('"')){
              line=line.substring(1);
            }

            if (line.endsWith('"')){
              line=line.substring(0, line.length-1);
            }

            line=line.replace(/""/g, '"');

            if (newText==''){
              newText='\n'+prefix+line;
            } else {
              newText=newText+'\n'+line;
            }
          }
          }

          if (newText!=''){
            newText=Window_Base.prototype.convertEscapeCharacters(newText);
            this._textState.text=newText;
          }
        }

        while (!this.isEndOfText(this._textState)) {
            if (this.needsNewPage(this._textState)) {
                this.newPage(this._textState);
            }
            this.updateShowFast();
            this.processCharacter(this._textState);
            if (!this._showFast && !this._lineShowFast) {
                break;
            }
            if (this.pause || this._waitCount > 0) {
                break;
            }
        }
        if (this.isEndOfText(this._textState)) {
            this.onEndOfText();
        }
        return true;
    } else {
        return false;
    }
};

Bitmap.prototype.curText='';

Bitmap.prototype.drawText = function(text, x, y, maxWidth, lineHeight, align) {
    if (text !== undefined) {
        if (typeof text === 'string' && text.length==1){
          if (text=='(' || this.curText!=''){
            this.curText=this.curText+text;
            if (text!=']'){
              return;
            }
          }

          if (text==']' && this.curText!=''){
            if (this.curText.startsWith('(label)') || this.curText.startsWith('(lines)')){
              id=this.curText.substring(this.curText.indexOf('[')+1, this.curText.indexOf(']'));
              try{
                var json=this.loc_json;
                var lines=json['labelLUT'];
                if (this.curText.startsWith('(lines)')){
                  lines=json['linesLUT'];
                }
                var line=lines[id];
                text=line;
              } catch(error){
              for (var line of this.loc_lines){
                if (!line.startsWith(id)){
                  continue;
                }

                line=line.trim();

                while (line.endsWith(',')){
                  line=line.substring(0, line.length-1);
                }

                line=line.substring(line.indexOf(',')+1);

                text=line;

                break;
              }
              }
            } else {
              //
            }

            x=(45*(text.length)/4);
            if (text.length<6){
              x+=((6-text.length)*maxWidth)/1.5;
            } else if (text.length>6){
              x-=((text.length-6)*maxWidth)/1.5;
            }
            maxWidth*=this.curText.length;

            this.curText='';
          }
        }

        if (text && text.replaceAll){
          text=text.replaceAll('﹝', '(').replaceAll('﹞', ')');
        }

        var tx = x;
        var ty = y + lineHeight - (lineHeight - this.fontSize * 0.7) / 2;
        var context = this._context;
        var alpha = context.globalAlpha;
        maxWidth = maxWidth || 0xffffffff;
        if (align === 'center') {
            tx += maxWidth / 2;
        }
        if (align === 'right') {
            tx += maxWidth;
        }
        context.save();
        context.font = this._makeFontNameText();

        context.textAlign = align;
        context.textBaseline = 'alphabetic';
        context.globalAlpha = 1;
        this._drawTextOutline(text, tx, ty, maxWidth);
        context.globalAlpha = alpha;
        this._drawTextBody(text, tx, ty, maxWidth);
        context.restore();
        this._setDirty();
    }
};

Window_Base.prototype.drawText = function(text, x, y, maxWidth, align) {
  if (typeof text === 'string' && (text.startsWith('(label)') || text.startsWith('(lines)'))){
    id=text.substring(text.indexOf('[')+1, text.indexOf(']'));

    try{
      var json=this.loc_json;
      var lines=json['labelLUT'];
      if (text.startsWith('(lines)')){
        lines=json['linesLUT'];
      }
      var line=lines[id];
      text=line;
    } catch(error){
    for (var line of this.loc_lines){
      if (!line.startsWith(id)){
        continue;
      }

      line=line.trim();

      while (line.endsWith(',')){
        line=line.substring(0, line.length-1);
      }

      line=line.substring(line.indexOf(',')+1);

      text=line;

      break;
    }
    }
  } else {
    //
  }

  if (maxWidth<=0){
    maxWidth=45*text.length;
  }

  this.contents.drawText(text, x, y, maxWidth, this.lineHeight(), align);
};

TouchInput.update = function() {};

Scene_Title.prototype.createForeground = function() {
    this._gameTitleSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));

    this._gameTitleSprite.bitmap.drawText(name_+' v'+ver_, 10, Graphics.height-25, Graphics.width, 12, 'left');

    if (game_ver_ !== undefined){
      this._gameTitleSprite.bitmap.drawText(game_name_+' v'+game_ver_, 10, Graphics.height-25, Graphics.width-20, 12, 'right');
    } else {
      this._gameTitleSprite.bitmap.drawText(game_name_, 10, Graphics.height-25, Graphics.width-20, 12, 'right');
    }

    this.addChild(this._gameTitleSprite);
    if ($dataSystem.optDrawTitle) {
        this.drawGameTitle();
    }
};

var accessor = Object.getOwnPropertyDescriptor(
  XMLHttpRequest.prototype,
  'responseText'
);

Object.defineProperty(
  XMLHttpRequest.prototype,
  "responseText",
  {
    get: function(){
      var rr=accessor.get.apply(this, arguments);

      if (this.responseURL.endsWith('Credits.txt')){
        var i=rr.lastIndexOf('<block');
        rr=rr.substring(0, i)+'\n\n<block:-1,0,10,10,100,center,black>\n\\c[2]'+name_+'\n\n'+author_+'\n\n</block>\n\n'+rr.substring(i);
        rr=rr.replaceAll('(', '﹝').replaceAll(')', '﹞');
      }

      return rr;
    }
  }
);

const orig_alert=window.alert;
window.alert = function() {
  if (arguments[0] && typeof arguments[0] === 'string' && (arguments[0].includes('Language data not accessible') || arguments[0].includes('Language data missing'))){
    return;
  }

  return orig_alert.apply(this, arguments);
};
