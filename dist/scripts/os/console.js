///<reference path="../globals.ts" />
/* ------------
Console.ts
Requires globals.ts
The OS Console - stdIn and stdOut by default.
Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
------------ */
var biOShock;
(function (biOShock) {
    var Console = (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer, cmdHist, count) {
            if (typeof currentFont === "undefined") { currentFont = _DefaultFontFamily; }
            if (typeof currentFontSize === "undefined") { currentFontSize = _DefaultFontSize; }
            if (typeof currentXPosition === "undefined") { currentXPosition = 0; }
            if (typeof currentYPosition === "undefined") { currentYPosition = _DefaultFontSize; }
            if (typeof buffer === "undefined") { buffer = ""; }
            if (typeof cmdHist === "undefined") { cmdHist = [""]; }
            if (typeof count === "undefined") { count = 0; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.cmdHist = cmdHist;
            this.count = count;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };

        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };

        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };

        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();

                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                var histCount = this.count;
                var buffSize = this.cmdHist.length;

                if (chr === String.fromCharCode(13)) {
                    // The enter key marks the end of a console command, so ...
                    //storing command
                    if (this.buffer !== "") {
                        this.cmdHist[this.cmdHist.length] = this.buffer;
                        this.count = this.cmdHist.length;
                    }

                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);

                    // ... and reset our buffer.
                    this.buffer = "";
                } else if (chr === "upArrow" || chr === "downArrow") {
                    if (chr === "upArrow" && histCount >= 0) {
                        //go back in the history by one
                        this.count -= 1;

                        //perpares fill the line with the history where the count is
                        this.buffer = this.cmdHist[this.count];

                        //erases the line if previously had been typed in or moving up or down
                        this.eraseLine();

                        this.putText("");

                        //outputs the text of where the count is
                        this.putText(this.buffer);
                    } else if (chr === "upArrow" && histCount < 0) {
                        this.buffer = this.cmdHist[this.count];

                        this.putText("");

                        this.putText(this.buffer);
                    } else if (chr === "downArrow" && histCount < buffSize) {
                        this.count += 1;

                        this.buffer = this.cmdHist[this.count];

                        this.eraseLine();

                        this.putText("");

                        this.putText(this.buffer);
                    } else if (chr === "downArrow" && histCount > buffSize) {
                        this.buffer = this.cmdHist[this.count];

                        this.eraseLine();

                        this.putText("");

                        this.putText(this.buffer);
                    }
                } else if (chr === String.fromCharCode(8)) {
                    this.erasePrevChar();
                } else if (chr === String.fromCharCode(9)) {
                    //puts whats already in the type box into this variable
                    //for regex check
                    var typed = this.buffer;
                    var lettersNums = new RegExp("^" + typed + "[A-Za-z0-9]+");
                    var list = _OsShell.commandList;
                    var i;
                    for (i in list) {
                        var check = list[i].command;
                        if (lettersNums.test(check)) {
                            this.buffer = check;
                        }
                        this.eraseLine();
                        _DrawingContext.fillStyle = "#DFDBC3"; //this lets me delete cleanly down at the bottom
                        this.putText(this.buffer);
                    }
                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);

                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        };

        Console.prototype.putText = function (text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            if (_Canvas.height < this.currentYPosition) {
                biOShock.Control.scrollCanvas();
            }

            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);

                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        };

        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;

            /*
            * Font size measures from the baseline to the highest point in the font.
            * Font descent measures from the baseline to the lowest point in the font.
            * Font height margin is extra spacing between the lines.
            */
            this.currentYPosition += _DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + _FontHeightMargin;
            // TODO: Handle scrolling. (Project 1)
        };

        Console.prototype.erasePrevChar = function () {
            //get to the most recent char... use charAt maybe... gonna be length of the buffer -1
            //remove from buffer
            //set offset from width of the last char.. look at offset up there ^
            //put current x pos in front of the last char... - the offset
            _DrawingContext.fillStyle = "#DFDBC3"; //this lets me delete cleanly down at the bottom
            var lastChar = this.buffer.charAt(this.buffer.length - 1);
            this.buffer = this.buffer.slice(0, -1);
            var offsetX = _DrawingContext.measureText(this.currentFont, this.currentFontSize, lastChar);
            this.currentXPosition = this.currentXPosition - offsetX;

            //create rectangle to erase from the canvas
            //fill a rect... pad      pad             width       height
            //currx  ypos-fontsize      offx     fontsize
            _DrawingContext.fillRect(this.currentXPosition, this.currentYPosition - this.currentFontSize, offsetX, this.currentFontSize + 7);
        };

        Console.prototype.eraseLine = function () {
            //draw over the line from 0 of x to the end of the canvas width-wise
            //make the currx 0
            _DrawingContext.fillRect(0, this.currentYPosition - this.currentFontSize, _Canvas.width, this.currentFontSize + 7);
            this.currentXPosition = 0;
            _OsShell.putPrompt();
        };
        return Console;
    })();
    biOShock.Console = Console;
})(biOShock || (biOShock = {}));
