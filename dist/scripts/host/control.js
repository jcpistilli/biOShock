/* ------------
Control.ts
Requires globals.ts.
Routines for the hardware simulation, NOT for our client OS itself.
These are static because we are never going to instantiate them, because they represent the hardware.
In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
is the "bare metal" (so to speak) for which we write code that hosts our client OS.
But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
in both the host and client environments.
This (and other host/simulation scripts) is the only place that we should see "web" code, such as
DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */
//
// Control Services
//
var biOShock;
(function (biOShock) {
    var Control = (function () {
        function Control() {
        }
        Control.hostInit = function () {
            // Get a global reference to the canvas.  TODO: Move this stuff into a Display Device Driver, maybe?
            _Canvas = document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext('2d');

            //changing the color so i can fillRect
            _DrawingContext.fillStyle = "#FFFFFF"; //grabbed this from the .css file. Color of the canvas

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            biOShock.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();

            // Check for our testing and enrichment core.
            if (typeof Glados === "function") {
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        };

        Control.hostLog = function (msg, source) {
            if (typeof source === "undefined") { source = "?"; }
            // Note the OS CLOCK.
            var clock = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();

            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";

            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // Optionally update a log database or some streaming service.
        };

        //
        // Host Events
        //
        Control.hostBtnStartOS_click = function (btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            document.getElementById("btnEnableStep").disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new biOShock.Cpu();
            _MemMan = new biOShock.memoryManager();

            //            _CPU.init();
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(biOShock.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);

            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new biOShock.Kernel();
            _Kernel.krnBootstrap();
            //Init mem man
            //            _MemMan.MemManInit();
            //            this.CPUtoHTML();
            //            this.memTable(1);
        };

        Control.hostBtnHaltOS_click = function (btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");

            // Call the OS shutdown routine.
            _Kernel.krnShutdown();

            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        };

        Control.hostBtnReset_click = function (btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        };

        Control.enableStep = function (btn) {
            document.getElementById("btnEnableStep").disabled = true;
            document.getElementById("btnOneStep").disabled = false;
            document.getElementById("btnDisableStep").disabled = false;
            _Step = true;
        };

        Control.oneStep = function (btn) {
            if (_CPU.isExecuting && _Step) {
                biOShock.Devices.hostClockPulse();
            } else {
                _hardwareClockID = setInterval(biOShock.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            }
        };

        Control.disableStep = function (btn) {
            document.getElementById("btnEnableStep").disabled = true;
            document.getElementById("btnOneStep").disabled = false;
            document.getElementById("btnDisableStep").disabled = false;
            _Step = false;
            _hardwareClockID = setInterval(biOShock.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
        };

        Control.scrollCanvas = function () {
            var canvasNow = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);

            _Canvas.height += _DefaultFontSize + _FontHeightMargin + 5;

            _DrawingContext.putImageData(canvasNow, 0, 0);

            var btmPos = document.getElementById("divConsole");
            btmPos.scrollTop = btmPos.scrollHeight;
        };

        /*public static grabInput(): string {
        var progIn = <HTMLInputElement> document.getElementById("taProgramInput");
        var progIn2 = progIn.value;
        return progIn2;
        }*/
        Control.dateTime = function () {
            var theDate = new Date();
            var month = (theDate.getMonth() + 1).toString();
            var day = theDate.getDay().toString();
            var year = theDate.getFullYear().toString();
            var hrs = theDate.getHours().toString();
            var min = theDate.getMinutes().toString();
            var sec = theDate.getSeconds().toString();

            if (month.length == 1) {
                month = '0' + month;
            }
            if (day.length == 1) {
                day = '0' + day;
            }
            if (hrs.length == 1) {
                hrs = '0' + hrs;
            }
            if (min.length == 1) {
                min = '0' + min;
            }
            if (sec.length == 1) {
                sec = '0' + sec;
            }

            return month + "/" + day + "/" + year + " " + hrs + ":" + min + ":" + sec;
        };

        Control.printReadyQueue = function () {
            //            var PCBs = "";
            //            for (var i = 0; i < _ReadyQueue.getSize(); i++)
            //            {
            //                PCBs += "pid: " + _currProgram.pid + " Base address: " + _currProgram.base + " PC: " + _currProgram.PC + /*" IR: " +  +*/ " Acc: " + _currProgram.Acc + " Xreg: " + _currProgram.Xreg + " Yreg: " + _currProgram.Yreg + " Z Flag: " + _currProgram.Zflag + "\n";
            //            }
            //            (<HTMLInputElement>document.getElementById("pcb")).value = PCBs;
            var PCBs = "";
            var active = new Array();

            if (_currProgram && _currProgram.state !== "Terminated.") {
                active[_currProgram.pcb.pid] = _currProgram;
            }

            for (var i = 0; i < _ReadyQueue.getSize(); i++) {
                active[_ReadyQueue.q[i].pcb.pid] = _ReadyQueue.q[i];
            }

            // Because this changes within for loop, keep the original here
            var length = active.length;

            for (var i = 0; i < length; i++) {
                var process = active.shift();
                if (process) {
                    PCBs += "PID: " + process.pcb.pid;
                    PCBs += " State: " + process.state;
                    PCBs += " PC: " + process.pcb.pc;
                    PCBs += " Acc: " + process.pcb.acc;
                    PCBs += " Xreg: " + process.pcb.xReg;
                    "<tr></tr>";
                    PCBs += " Yreg: " + process.pcb.yReg;
                    PCBs += " Zflag: " + process.pcb.zFlag;
                    PCBs += " Base: " + process.pcb.base;
                    PCBs += " Limit: " + process.pcb.limit;
                }
            }
            document.getElementById("pcb").innerHTML = PCBs;
        };
        return Control;
    })();
    biOShock.Control = Control;
})(biOShock || (biOShock = {}));
