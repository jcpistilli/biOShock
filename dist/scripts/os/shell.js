/* ------------
Shell.ts
The OS Shell - The "command line interface" (CLI) for the console.
------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var biOShock;
(function (biOShock) {
    var Shell = (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc = null;

            //
            // Load the command list.
            // ver
            sc = new biOShock.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new biOShock.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new biOShock.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new biOShock.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new biOShock.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new biOShock.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new biOShock.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new biOShock.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new biOShock.ShellCommand(this.shellDate, "date", "- Displays the date");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new biOShock.ShellCommand(this.shellWhereAmI, "whereami", "- Displays current location");
            this.commandList[this.commandList.length] = sc;

            // BSOD
            sc = new biOShock.ShellCommand(this.shellBSOD, "bsod", "- Causes a BSOD message");
            this.commandList[this.commandList.length] = sc;

            //still hope you know about bioshock...
            sc = new biOShock.ShellCommand(this.shellMind, "mind", "- Think about it...");
            this.commandList[this.commandList.length] = sc;

            // status <string>
            sc = new biOShock.ShellCommand(this.shellStatus, "status", "<string> - Displays a status to the console and status bar.");
            this.commandList[this.commandList.length] = sc;

            //HexValidator
            sc = new biOShock.ShellCommand(this.shellLoad, "load", "- Validates Hex Codes");
            this.commandList[this.commandList.length] = sc;

            //Run <pid>
            sc = new biOShock.ShellCommand(this.shellRun, "run", "<PID> - Runs a program from memory");
            this.commandList[this.commandList.length] = sc;

            //Kill <pid>
            sc = new biOShock.ShellCommand(this.shellKill, "kill", "<PID> - Kills a program with the PID");
            this.commandList[this.commandList.length] = sc;

            //ClearMem
            sc = new biOShock.ShellCommand(this.shellClearMem, "clearmem", "- Clears Memory.");
            this.commandList[this.commandList.length] = sc;

            //ClearMem
            sc = new biOShock.ShellCommand(this.shellRunAll, "runall", "- Runs all programs in memory.");
            this.commandList[this.commandList.length] = sc;

            //Quantum
            sc = new biOShock.ShellCommand(this.shellQuantum, "quantum", "<INT> - Changes the value of the quantum.");
            this.commandList[this.commandList.length] = sc;

            //PS
            sc = new biOShock.ShellCommand(this.shellPS, "ps", "List of the running processes' PIDs.");
            this.commandList[this.commandList.length] = sc;

            //SetSchedule
            sc = new biOShock.ShellCommand(this.shellSetSchedule, "setschedule", "Set the CPU scheduling algorithm");
            this.commandList[this.commandList.length] = sc;

            //GetSchedule
            sc = new biOShock.ShellCommand(this.shellGetSchedule, "getschedule", "View the current CPU scheduling algorithm");
            this.commandList[this.commandList.length] = sc;

            // processes - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            //
            // Display the initial prompt.
            this.putPrompt();
        };

        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };

        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);

            //
            // Parse the input...
            //
            var userCommand = new biOShock.UserCommand();
            userCommand = this.parseInput(buffer);

            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;

            //
            // Determine the command and execute it.
            //
            // JavaScript may not support associative arrays in all browsers so we have to
            // iterate over the command list in attempt to find a match.  TODO: Is there a better way? Probably.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + biOShock.Utils.rot13(cmd) + "]") >= 0) {
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
                    this.execute(this.shellApology);
                } else {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };

        // args is an option parameter, ergo the ? which allows TypeScript to understand that
        Shell.prototype.execute = function (fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();

            // ... call the command function passing in the args...
            fn(args);

            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }

            // ... and finally write the prompt again.
            this.putPrompt();
        };

        Shell.prototype.parseInput = function (buffer) {
            var retVal = new biOShock.UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = biOShock.Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();

            // 4.1 Remove any left-over spaces.
            cmd = biOShock.Utils.trim(cmd);

            // 4.2 Record it in the return value.
            retVal.command = cmd;

            for (var i in tempList) {
                var arg = biOShock.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };

        //
        // Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Duh. Go back to your Speak & Spell.");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };

        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };

        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("Okay. I forgive you. This time.");
                _SarcasticMode = false;
            } else {
                _StdOut.putText("For what?");
            }
        };

        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };

        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };

        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");

            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };

        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };

        Shell.prototype.shellMan = function (args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };

        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, dumbass.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }

                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };

        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + biOShock.Utils.rot13(args.join(' ')) + "'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };

        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };

        Shell.prototype.shellDate = function () {
            _StdOut.putText(biOShock.Control.dateTime());
        };

        Shell.prototype.shellWhereAmI = function () {
            var loc = "Rapture.";
            _StdOut.putText(loc);
        };

        Shell.prototype.shellBSOD = function () {
            _StdOut.putText("WHAT HAPPENED");

            //kernel trap
            _Kernel.krnTrapError("i r dedz");
        };

        Shell.prototype.shellMind = function () {
            _StdOut.putText("The mind of the subject will desperately struggle to create memories where none exist...");
        };

        //after strong basic javascript research and though
        // i have come up with this
        //it seems to work
        Shell.prototype.shellStatus = function (args) {
            if (args.length > 0) {
                var status = " ";
                var i;

                for (i = 0; i < args.length; i++) {
                    status += args[i] + " "; //so there will be a space between the words
                }

                _StdOut.putText("Status: " + status);
                document.getElementById("message").innerHTML = status;
            } else {
                _StdOut.putText("Please supply a string.");
            }
        };

        Shell.prototype.shellLoad = function (args) {
            //obtain the hex codes from the user input
            var retrieveHex = document.getElementById("taProgramInput").value;

            //remove the spaces
            var removeSpace = retrieveHex.replace(/\s+/g, ' ').toUpperCase();

            //if there is nothing to load, output error
            if (removeSpace.length == 0) {
                _StdOut.putText("There is no input.");
                return;
            }

            for (var i = 0; i < removeSpace.length; i++) {
                if (!(removeSpace[i].match(/^[0-9A-F\s]/i))) {
                    _StdOut.putText("Please enter valid hex codes and an even ");
                    _StdOut.advanceLine();
                    _StdOut.putText("amount of characters.");
                    return;
                }
            }

            //default priority
            var priority = 10;

            //if a priority is input, make that the priority
            if (args.length > 0) {
                priority = parseInt(args[0]);
            }

            _StdOut.putText("Please be patient.");
            _StdOut.advanceLine();

            //load the program and output the pid
            var thisPID = _MemMan.loadProg(removeSpace, priority);
            if (thisPID !== null) {
                _StdOut.putText("PID: " + thisPID);
            }
        };

        //Run
        Shell.prototype.shellRun = function (args) {
            //if there are no pids input
            if (args.length <= 0) {
                _StdIn.putText("Usage: run <PID>  Please specify a valid PID.");
                _StdIn.advanceLine();
            } else if (!_ResidentList[args[0]]) {
                _StdIn.putText("Please enter a valid PID.");
                _StdIn.advanceLine();
            } else {
                //program specified
                var thisProgram = _ResidentList[args[0]];

                //if its not terminated, put it on the ready queue and run it
                if (thisProgram.state !== "Terminated.") {
                    _ReadyQueue.enqueue(thisProgram);
                    _KernelInterruptQueue.enqueue(new biOShock.Interrupt(EXECUTING_IRQ, args[0]));
                }
            }
        };

        //Kill
        Shell.prototype.shellKill = function (args) {
            if (args.length > 0) {
                var inputPID = parseInt(args[0]);
                var proc = null;

                //current program
                if (_currProgram && _currProgram.pcb.pid === inputPID) {
                    proc = _currProgram;

                    //terminate the program specified
                    _currProgram.state = "Terminated.";

                    //update the PCB
                    _CPU.updatePCB();

                    //print it in the host log
                    _Kernel.krnTrace("Killed process " + inputPID);

                    //remove it from the resident list
                    _MemMan.removeFromList(_currProgram.pcb.pid);

                    //switch
                    _CpuScheduler.contextSwitch();
                } else {
                    for (var i = 0; i < _ReadyQueue.length; i++) {
                        if (_ReadyQueue.q[i].pcb.pid === inputPID) {
                            proc = _ReadyQueue.q[i];

                            //terminate the program
                            _ReadyQueue.q[i].state = "Terminated.";

                            //update the PCB
                            _CPU.updatePCB();

                            //remove it from the ready queue
                            _ReadyQueue.q.splice(i, 1);

                            //remove it from the resident list
                            _MemMan.removeFromList(proc.pcb);

                            //print it in the host log
                            _Kernel.krnTrace("Killed process " + inputPID);
                            break;
                        }
                    }
                }

                //if the pid was not correct
                if (proc === null) {
                    _StdIn.putText("Please indicate a valid PID to kill.");
                }
            } else {
                _StdIn.putText("Please indicate a valid PID to kill.");
            }
        };

        //Clear Memory
        Shell.prototype.shellClearMem = function () {
            //erase the programs in memory
            _MemMan.resetMemory();
            _StdOut.putText("All memory locations cleared.");

            //for reprinting the 00s
            var mem = new biOShock.Memory(_MemMan.memory.bytes);
            mem.init();
        };

        //Run all
        Shell.prototype.shellRunAll = function (args) {
            for (var i = 0; i < _ResidentList.length; i++) {
                var thisProgram = _ResidentList[i];

                //for every program in the resident list that isn't terminated, add it to the ready queue
                if (thisProgram && thisProgram.state !== "Terminated.") {
                    _ReadyQueue.enqueue(thisProgram);
                }
            }

            //run all the processes, which will kick off the scheduler
            _KernelInterruptQueue.enqueue(new biOShock.Interrupt(EXECUTING_IRQ, args[0]));
        };

        //Quantum
        Shell.prototype.shellQuantum = function (args) {
            if (args.length > 0) {
                _Quantum = parseInt(args[0]);
            } else {
                _StdOut.putText("Please enter a valid integer.");
            }
        };

        //Lists the processes in the ready queue
        Shell.prototype.shellPS = function (args) {
            var PIDs = "";
            for (var i = 0; i < _ReadyQueue.getSize(); i++) {
                var theProcess = _ReadyQueue.q[i];

                if (theProcess.pcb.state !== "Terminated.") {
                    PIDs += ("PID: " + theProcess.pcb.pid + ", ");
                }
            }
            if (_currProgram !== null) {
                PIDs += ("PID: " + _currProgram.pcb.pid);
            }
            if (PIDs.length) {
                _StdIn.putText(PIDs);
            } else {
                _StdIn.putText("No running processes.");
            }
        };

        //set the scheduling algorithm
        Shell.prototype.shellSetSchedule = function (args) {
            if (args.length > 0) {
                var scheduler = -1;

                for (var i = 0; i < _CpuScheduler.options.length; i++) {
                    if (args[0] === _CpuScheduler.options[i]) {
                        scheduler = i;
                    }
                }

                if (scheduler === -1) {
                    _StdOut.putText("Please enter a valid scheduler.");
                } else {
                    _CpuScheduler.scheduleType = _CpuScheduler.options[scheduler];
                    _StdOut.putText("CPU scheduler is set to " + _CpuScheduler.options[scheduler]);
                }
            } else {
                _StdOut.putText("Please enter a valid scheduler");
            }
        };

        //returns the currently assigned scheduling algorithm
        Shell.prototype.shellGetSchedule = function () {
            _StdIn.putText(_CpuScheduler.scheduleType);
        };
        return Shell;
    })();
    biOShock.Shell = Shell;
})(biOShock || (biOShock = {}));
