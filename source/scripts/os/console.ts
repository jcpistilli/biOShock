/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module biOShock {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    public cmdHist = [""],
                    public count = 0)
        {

        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }


        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).

                var histCount = this.count;
                var buffSize = this.cmdHist.length;

                if (chr === String.fromCharCode(13)) //enter key
                {
                    // The enter key marks the end of a console command, so ...

                    //storing command
                    if(this.buffer !== "")
                    {
                        this.cmdHist[this.cmdHist.length] = this.buffer;
                        this.count = this.cmdHist.length;
                    }
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                }

                //preparing for both up and down
                else if(chr === "upArrow" || chr === "downArrow")
                {

                    if (chr === "upArrow" && histCount >= 0)
                    {
                        //go back in the history by one
                        this.count -= 1;

                        //perpares fill the line with the history where the count is
                        this.buffer = this.cmdHist[this.count];

                        //erases the line if previously had been typed in or moving up or down
                        this.eraseLine();

                        this.putText("");

                        //outputs the text of where the count is
                        this.putText(this.buffer);
                    }

                    //thought this would stop it from going over the last history
                    else if (chr ==="upArrow" && histCount < 0 )
                    {
                        this.buffer = this.cmdHist[this.count];

                        this.putText("");

                        this.putText(this.buffer);

                    }

                    //recalls where the count is at and comes back towards most recent
                    else if (chr === "downArrow" && histCount < buffSize)
                    {
                        this.count += 1;

                        this.buffer = this.cmdHist[this.count];

                        this.eraseLine();

                        this.putText("");

                        this.putText(this.buffer);
                    }

                    //clears the line when coming back towards the most recent history and back to blank
                    else if (chr === "downArrow" && histCount > buffSize)
                    {
                        this.buffer = this.cmdHist[this.count];

                        this.eraseLine();

                        this.putText("");

                        this.putText(this.buffer);
                    }
                }



                else if (chr === String.fromCharCode(8)) //backspace
                {
                    this.erasePrevChar();
                }

                else if (chr === String.fromCharCode(9)) //tab completion
                {
                    //puts whats already in the type box into this variable
                    //for regex check
                    var typed = this.buffer;
                    var lettersNums = new RegExp("^" + typed + "[A-Za-z0-9]+"); //commands with nums and letter upper and lower
                    var list = _OsShell.commandList;
                    var i;
                    for (i in list)
                    {
                        var check = list[i].command;
                        if (lettersNums.test(check))
                        {
                            this.buffer = check;
                        }
                        this.eraseLine();
                        this.correctColor();
                        this.putText(this.buffer)
                    }
                }

                else
                {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
                }
            }

        public putText(text): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.

            if(_Canvas.height < this.currentYPosition)
            {
                Control.scrollCanvas();
            }

            if (text !== "")
            {
                for (var char in text)
                {
                    if (this.currentXPosition > 500)
                    {
                       this.advanceLine();
                    }
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text[char]);

                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text[char]);
                    this.currentXPosition = this.currentXPosition + offset;
                }
            }

         }

        public advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */

            this.currentYPosition += _DefaultFontSize +
                                     _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                                     _FontHeightMargin;

            // TODO: Handle scrolling. (Project 1)
        }


        public erasePrevChar(): void
        {
            //get to the most recent char... use charAt maybe... gonna be length of the buffer -1
            //remove from buffer
            //set offset from width of the last char.. look at offset up there ^
            //put current x pos in front of the last char... - the offset

            this.correctColor();
            var lastChar = this.buffer.charAt(this.buffer.length - 1);
            this.buffer = this.buffer.slice(0, -1);
            var offsetX = _DrawingContext.measureText(this.currentFont, this.currentFontSize, lastChar);
            this.currentXPosition = this.currentXPosition - offsetX;

            //create rectangle to erase from the canvas
            //fill a rect... pad      pad             width       height
                           //currx  ypos-fontsize      offx     fontsize

            _DrawingContext.fillRect(this.currentXPosition,this.currentYPosition - this.currentFontSize,
                                        offsetX,this.currentFontSize + 7);
        }

        public eraseLine(): void
        {
            //draw over the line from 0 of x to the end of the canvas width-wise
            //make the currx 0

            this.correctColor();
            _DrawingContext.fillRect(0, this.currentYPosition - this.currentFontSize,
                                                 _Canvas.width, this.currentFontSize + 7);
            this.currentXPosition = 0;
            _OsShell.putPrompt();

        }

        public correctColor()
        {
            _DrawingContext.fillStyle = "#FFFFFF";
        }


//        Handle the sysOpCodes
//        Software interrupt for FF during CPU exec
        public handleSysOp(): void
        {
            if (_CPU.Xreg === 1)
            {
                //convert to string and print
                var intParsed = parseInt(String(_CPU.Yreg)).toString();//maybe this will work?? with String()???
                this.putText(intParsed);
                this.advanceLine();
                _OsShell.putPrompt();
            }
            else if (_CPU.Xreg === 2)
            {
                var output = "";
                var currPointer = _CPU.Yreg;
                var currData = _MemMan.getMemFromLoc(currPointer);

                while (currData !== "00")
                {
                    output += String.fromCharCode(parseInt(currData, 16));
                    currData = _MemMan.getMemFromLoc(++currPointer);
                }

                this.putText(output);
                this.advanceLine();
                _OsShell.putPrompt();

            }
        }
    }
 }
