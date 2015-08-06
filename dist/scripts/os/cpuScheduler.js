/*
CPU Scheduler
Jonathan Pistilli
*/
var biOShock;
(function (biOShock) {
    var CpuScheduler = (function () {
        /*
        I know that for project 4 i need to implement fcfs and non preemptive priority
        */
        function CpuScheduler() {
            //        public quantum = 6;
            this.options = ['rr', 'fcfs', 'priority'];
            this.scheduleType = this.options[0];
        }
        CpuScheduler.prototype.start = function () {
            if (_ReadyQueue.length > 0) {
                _Mode = 1;

                //                _currProgram = _ReadyQueue.dequeue();
                _currProgram = this.nextProcess();
                _currProgram.state = "Running.";
                var executing = !_Step;
                _CPU.init(_currProgram, executing);
            }
        };

        CpuScheduler.prototype.nextProcess = function () {
            if (this.scheduleType === this.options[0] || this.scheduleType === this.options[1]) {
                return _ReadyQueue.dequeue();
            } else if (this.scheduleType === this.options[2]) {
                var lowest = Infinity;
                var lowestIndex = -1;

                for (var i = 0; i < _ReadyQueue.length; i++) {
                    if (_ReadyQueue[i].priority < lowest) {
                        lowest = _ReadyQueue[i].priority;
                        lowestIndex = i;
                    }
                }

                return _ReadyQueue.splice(lowestIndex, 1)[0];
            }

            return null;
        };

        CpuScheduler.prototype.needToContextSwitchIf = function () {
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
            //            debugger;
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
                _CPU.updatePCB();

                var lastProc = _currProgram;
                _currProgram = nextProc;

                _currProgram.state = "Running.";
                var executing = !_Step;
                _CPU.init(_currProgram, executing);
            } else if (_currProgram.state === "Terminated.") {
                debugger;
                this.stop();
            }

            _cycleCounter = 0;
        };

        CpuScheduler.prototype.roundRobinSwitch = function (nextProc) {
            //            debugger;
            var thisPID = _currProgram.pcb.pid;
            _Kernel.krnTrace("Current cycle count > quantum of " + _Quantum + ". Switching context.");

            _currProgram.updatePCB(); //this is IMPORTANT

            if (_currProgram.state !== "Terminated.") {
                _currProgram.state = "Ready.";
                _ReadyQueue.enqueue(_currProgram);
            } else if (_currProgram.state === "Terminated.") {
                _MemMan.removeFromList(thisPID); //removeThisFromList is in MemMan
            }
            var prevProcess = _currProgram;
            _currProgram = nextProc;
            _currProgram.state = "Running.";
            var shouldBeExecuting = !_Step;
            _CPU.init(_currProgram, shouldBeExecuting);
        };

        CpuScheduler.prototype.fcfsContextSwitch = function (nextProc) {
            this.roundRobinSwitch(nextProc);
        };

        CpuScheduler.prototype.priorityContextSwitch = function (nextProc) {
            //            _currProgram.updateCpu(); //check this
            _MemMan.removeFromList(_currProgram.pcb.pid);
        };

        CpuScheduler.prototype.stop = function () {
            debugger;
            _MemMan.removeFromList(_currProgram.pcb.pid);
            _CPU.isExecuting = false;
            _Mode = 0;
            _CPU.updatePCB();
            _currProgram = null;
            _cycleCounter = 0;
        };
        return CpuScheduler;
    })();
    biOShock.CpuScheduler = CpuScheduler;
})(biOShock || (biOShock = {}));
