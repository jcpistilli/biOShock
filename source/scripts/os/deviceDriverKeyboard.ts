///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module biOShock {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.
            super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.    TODO: Check that they are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
                ((keyCode >= 97) && (keyCode <= 123))) {  // a..z {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            }
            else if (((keyCode >= 48) && (keyCode <= 57)) ||    // digits
                        (keyCode == 32)                   ||    // space
                        (keyCode == 13)                         // enter
            {
                chr = String.fromCharCode(keyCode);
                if (isShifted && ((keyCode >= 48) && (keyCode <= 57))) {
                    switch (keyCode) {
                        // 0 -> )
                        case 48:
                            chr = ")";
                            break;

                        // 1 -> !
                        case 49:
                            chr = "!";
                            break;

                        // 2 -> @
                        case 50:
                            chr = "@";
                            break;

                        // 3 -> #
                        case 51:
                            chr = "#";
                            break;

                        // 4 -> $
                        case 52:
                            chr = "$";
                            break;

                        // 5 -> %
                        case 53:
                            chr = "%";
                            break;

                        // 6 -> ^
                        case 54:
                            chr = "^";
                            break;

                        // 7 -> &
                        case 55:
                            chr = "&";
                            break;

                        // 8 -> *
                        case 56:
                            chr = "*";
                            break;

                        //  9 -> (
                        case 57:
                            chr = "(";
                            break;
                    }
                }
                _KernelInputQueue.enqueue(chr);
            }


            else if ((keyCode >= 186) && (keyCode <= 192) ||
                    ((keyCode >= 219) && (keyCode <= 222)))
            {
                if(isShifted && ((keyCode >= 186) && (keyCode <= 222)))
                {
                    switch(keyCode)
                    {
                        case 186:
                            chr = ":";
                            break;

                        case 187:
                            chr = "+";
                            break;

                        case 188:
                            chr = "<";
                            break;

                        case 189:
                            chr = "_";
                            break;

                        case 190:
                            chr = ">";
                            break;

                        case 191:
                            chr = "?";
                            break;

                        case 192:
                            chr = "~";
                            break;

                        case 219:
                            chr = "{";
                            break;

                        case 220:
                            chr = "|";
                            break;

                        case 221:
                            chr = "}";
                            break;

                        case 222:
                            chr = "\"";
                            break;
                    }
                }
                else
                {
                    switch(keyCode)
                    {
                        case 186:
                            chr = ";";
                            break;

                        case 187:
                            chr = "=";
                            break;

                        case 188:
                            chr = ",";
                            break;

                        case 189:
                            chr = "-";
                            break;

                        case 190:
                            chr = ".";
                            break;

                        case 191:
                            chr = "/";
                            break;

                        case 192:
                            chr = "`";
                            break;

                        case 219:
                            chr = "[";
                            break;

                        case 220:
                            chr = "\\";
                            break;

                        case 221:
                            chr = "]";
                            break;

                        case 222:
                            chr = "'";
                            break;
                    }
                }
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode == 38) && !isShifted)
            {
                chr = "upArrow";
                _KernelInputQueue.enqueue(chr);
            }

            else if ((keyCode == 40) && !isShifted)
            {
                chr = "downArrow";
                _KernelInputQueue.enqueue(chr);
            }
            //tab
            else if (keyCode == 9)
            {
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
            //backspace
            else if (keyCode == 8)
            {
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
        }
    }
}
