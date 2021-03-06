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
module biOShock {

    export class Control {

        public static hostInit(): void {
            // Get a global reference to the canvas.  TODO: Move this stuff into a Display Device Driver, maybe?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext('2d');

            //changing the color so i can fillRect
            _DrawingContext.fillStyle = "#FFFFFF"; //grabbed this from the .css file. Color of the canvas

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core.
            if (typeof Glados === "function") {
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // Optionally update a log database or some streaming service.
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            document.getElementById("btnEnableStep").disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();
            _MemMan = new biOShock.memoryManager();

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");

            // Call the OS shutdown routine.
            _Kernel.krnShutdown();

            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }

        //Single-Step execution
        public static enableStep(btn): void
        {
            document.getElementById("btnEnableStep").disabled = true;
            document.getElementById("btnOneStep").disabled = false;
            document.getElementById("btnDisableStep").disabled = false;
            _Step = true;
        }

        public static oneStep(btn): void {
            if (_CPU.isExecuting && _Step)
            {
                Devices.hostClockPulse();
            }
            else
            {
                _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            }
        }

        public static disableStep(btn): void {
            document.getElementById("btnEnableStep").disabled = true;
            document.getElementById("btnOneStep").disabled = false;
            document.getElementById("btnDisableStep").disabled = false;
            _Step = false;
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
        }

        public static scrollCanvas(): void {
            var canvasNow = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);

            _Canvas.height += _DefaultFontSize + _FontHeightMargin + 5;

            _DrawingContext.putImageData(canvasNow, 0, 0);


            var btmPos = document.getElementById("divConsole");
            btmPos.scrollTop = btmPos.scrollHeight;
        }

        public static dateTime(): string
        {
            var theDate = new Date();
            var month   = (theDate.getMonth() + 1).toString(); //plus 1 to the month cause it returns 0-11
            var day     = theDate.getDay().toString();
            var year    = theDate.getFullYear().toString();
            var hrs     = theDate.getHours().toString();
            var min     = theDate.getMinutes().toString();
            var sec     = theDate.getSeconds().toString();


            if(month.length == 1)
            {
                month = '0' + month;
            }
            if(day.length == 1)
            {
                day = '0' + day;
            }
            if(hrs.length == 1)
            {
                hrs = '0' + hrs;
            }
            if(min.length == 1)
            {
                min = '0' + min;
            }
            if(sec.length == 1)
            {
                sec = '0' + sec;
            }

            return month + "/" + day + "/" + year + " " + hrs + ":" + min + ":" + sec;
        }


        //Printing for the Ready Queue
        public static printReadyQueue()
        {
            var PCBs = "";              //ready to print the PCBs
            var active = new Array();   //list of active processes

            if (_currProgram && _currProgram.state !== "Terminated.")
            {
                active[_currProgram.pcb.pid] = _currProgram;
            }

            for (var i = 0; i < _ReadyQueue.getSize(); i++)
            {
                active[_ReadyQueue.q[i].pcb.pid] = _ReadyQueue.q[i];
            }

            var length = active.length;

            //change when the process is active
            for (var i = 0; i < length; i++) {
                var process = active.shift();
                if (process)
                {
                    PCBs += "PID: "      + process.pcb.pid;
                    PCBs += " State: "   + process.state;
                    PCBs += " PC: "      + process.pcb.pc;
                    PCBs += " Acc: "     + process.pcb.acc;
                    PCBs += " Xreg: "    + process.pcb.xReg;
                    PCBs += " Yreg: "    + process.pcb.yReg;
                    PCBs += " Zflag: "   + process.pcb.zFlag;
                    PCBs += " Base: "    + process.pcb.base;
                    PCBs += " Limit: "   + process.pcb.limit + " ";
                }
            }
            document.getElementById("pcb").innerHTML = PCBs;
        }

    }
}