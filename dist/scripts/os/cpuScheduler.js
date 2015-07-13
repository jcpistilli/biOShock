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
                _CPU.setCPU(_currProgram);
            }
        };

        CpuScheduler.prototype.nextProcess = function () {
            if (this.scheduleType = this.options[0]) {
                return _ReadyQueue.dequeue();
            }
        };

        CpuScheduler.prototype.needToContextSwitchIf = function () {
            if (this.scheduleType === this.options[0]) {
                if (_cycleCounter >= this.quantum) {
                    return true;
                } else {
                    return false;
                }
            }
        };

        CpuScheduler.prototype.contextSwitch = function () {
            var nextProc = this.nextProcess();
            if (nextProc !== null && nextProc !== undefined) {
                if (this.scheduleType === this.options[0]) {
                    this.roundRobinSwitch(nextProc);
                } else {
                    _Kernel.krnTrace("Unknown CPU scheduler.");
                }
                var lastProc = _currProgram;
                _currProgram = nextProc;

                _currProgram.state = "Running.";
                _CPU.setCPU(_currProgram);
            } else if (_currProgram.state === "Terminated.") {
                this.stop();
            }

            _cycleCounter = 0;
        };

        CpuScheduler.prototype.roundRobinSwitch = function (nextProc) {
            _Kernel.krnTrace("Current cycle count > quantum of " + this.quantum + ". Switching context.");
            _CPU.updatePCB();
            if (_currProgram.state !== "Terminated.") {
                _currProgram.state = "Ready.";
                _ReadyQueue.enqueue(_currProgram);
            } else if (_currProgram.state === "Terminated.") {
                _MemMan.removeCurrProgram(); //removeThisFromList is in MemMan
            }
        };

        CpuScheduler.prototype.stop = function () {
            _MemMan.removeCurrProgram();
            _CPU.isExecuting = false;

            _Mode = 0;
            _CPU.updatePCB();
            _currProgram = null;
            _cycleCounter = 0;
        };

        CpuScheduler.prototype.setQuantum = function (quantum) {
            this.quantum = quantum;
        };
        return CpuScheduler;
    })();
    biOShock.CpuScheduler = CpuScheduler;
})(biOShock || (biOShock = {}));
