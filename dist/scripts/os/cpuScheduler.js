/*
CPU Scheduler
Jonathan Pistilli
*/
var biOShock;
(function (biOShock) {
    var CpuScheduler = (function () {
        function CpuScheduler() {
            this.options = ['rr', 'fcfs', 'priority'];
            this.scheduleType = this.options[0];
        }
        CpuScheduler.prototype.start = function () {
            if (_ReadyQueue.getSize() > 0) {
                //User mode
                _Mode = 1;
                _currProgram = this.nextProcess();

                //Set the state to Running
                _currProgram.state = "Running.";

                //Initialize the CPU
                _CPU.setCPU(_currProgram);
            }
        };

        CpuScheduler.prototype.nextProcess = function () {
            //Just need to take off the ready queue for rr and fcfs
            if (this.scheduleType === this.options[0] || this.scheduleType === this.options[1]) {
                return _ReadyQueue.dequeue();
            } else if (this.scheduleType === this.options[2]) {
                var lowest = 1000;
                var lowestIndex = -1;

                for (var i = 0; i < _ReadyQueue.getSize(); i++) {
                    if (_ReadyQueue.q[i].pcb.priority < lowest) {
                        lowest = _ReadyQueue.q[i].pcb.priority;
                        lowestIndex = i;
                    }
                }

                var nextProc = _ReadyQueue.q[lowestIndex];
                _ReadyQueue.q.splice(lowestIndex, 1);
                return nextProc;
            }

            return null;
        };

        CpuScheduler.prototype.needToContextSwitchIf = function () {
            //Switch if the cycle counter is higher than the quantum for round robin
            if (this.scheduleType === this.options[0]) {
                if (_cycleCounter >= _Quantum) {
                    return true;
                }
            } else if (this.scheduleType === this.options[1]) {
                if (_currProgram.state === "Terminated.") {
                    return true;
                }
            } else if (this.scheduleType === this.options[2]) {
                if (_currProgram.state === "Terminated.") {
                    return true;
                }
            }
            return false;
        };

        CpuScheduler.prototype.contextSwitch = function () {
            //If there is another process in the ready queue, initialize one of the scheduling alogrithms
            var nextProc = this.nextProcess();
            if (nextProc !== null && nextProc !== undefined) {
                if (this.scheduleType === this.options[0]) {
                    this.roundRobinSwitch(nextProc);
                } else if (this.scheduleType === this.options[1]) {
                    this.fcfsContextSwitch(nextProc);
                } else if (this.scheduleType === this.options[2]) {
                    this.priorityContextSwitch(nextProc);
                } else {
                    _Kernel.krnTrace("Unknown CPU scheduler.");
                }

                //Print that ready queue
                biOShock.Control.printReadyQueue();

                //the current process becomes the next process
                _currProgram = nextProc;

                //the process state becomes running
                _currProgram.state = "Running.";

                //initialize the CPU
                _CPU.setCPU(_currProgram);
            } else if (_currProgram.state === "Terminated.") {
                this.stop();
            }
            _cycleCounter = 0;
        };

        CpuScheduler.prototype.roundRobinSwitch = function (nextProc) {
            var thisPID = _currProgram.pcb.pid;
            _Kernel.krnTrace("Current cycle count > quantum of " + _Quantum + ". Switching context.");

            //update the PCB with the current running program
            _CPU.updatePCB();

            //if the program is not terminated, put it back in the queue
            if (_currProgram.state !== "Terminated.") {
                _currProgram.state = "Ready.";
                _ReadyQueue.enqueue(_currProgram);
            } else if (_currProgram.state === "Terminated.") {
                _MemMan.removeFromList(thisPID); //removeThisFromList is in MemMan
            }
        };

        //fcfs has the same workings as rr
        //the difference is defined in needToContextSwitchIf
        CpuScheduler.prototype.fcfsContextSwitch = function (nextProc) {
            this.roundRobinSwitch(nextProc);
        };

        //place the currently executing program in the pcb and remove the program when it's done
        CpuScheduler.prototype.priorityContextSwitch = function (nextProc) {
            _CPU.updatePCB(); //check this
            _MemMan.removeFromList(_currProgram.pcb.pid);
        };

        CpuScheduler.prototype.stop = function () {
            //remove the last process from the list
            _MemMan.removeFromList(_currProgram.pcb.pid);

            //set isExecuting to false
            _CPU.isExecuting = false;

            //kernel mode
            _Mode = 0;

            //update the pcb
            _CPU.updatePCB();

            //print the ready queue
            biOShock.Control.printReadyQueue();

            //no programs left
            _currProgram = null;
            _cycleCounter = 0;
        };
        return CpuScheduler;
    })();
    biOShock.CpuScheduler = CpuScheduler;
})(biOShock || (biOShock = {}));
