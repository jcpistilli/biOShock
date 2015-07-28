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
            if (_ReadyQueue.length > 1) {
                _Mode = 1;
                _currProgram = _ReadyQueue.dequeue();

                //                _currProgram = this.nextProcess();
                _currProgram.state = "Running.";
                var executing = !_Step;
                _CPU.init(_currProgram, executing);
            }
        };

        CpuScheduler.prototype.nextProcess = function () {
            //            if( this.scheduleType = this.options[0])
            //            {
            return _ReadyQueue.dequeue();
            //            }
            //            else
            //            {
            //                return null;
            //            }
        };

        CpuScheduler.prototype.needToContextSwitchIf = function () {
            //            debugger;
            if (_ReadyQueue.length > 1) {
                if (this.scheduleType === this.options[0]) {
                    if (_cycleCounter >= _Quantum) {
                        return true;
                    }
                }
            } else {
                return false;
            }
        };

        CpuScheduler.prototype.contextSwitch = function () {
            //            debugger;
            var nextProc = this.nextProcess();
            if (nextProc !== null && nextProc !== undefined) {
                if (this.scheduleType === this.options[0]) {
                    this.roundRobinSwitch(nextProc);
                } else {
                    _Kernel.krnTrace("Unknown CPU scheduler.");
                }
                //                var lastProc = _currProgram;
                //                _currProgram = nextProc;
                //
                //                _currProgram.state = "Running.";
                //                var executing = !_Step;
                //                _CPU.init(_currProgram, executing);
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
            debugger;
            if (_currProgram.state !== "Terminated.") {
                _currProgram.state = "Ready.";
                _ReadyQueue.enqueue(_currProgram);
            }

            //            else if (_currProgram.state === "Terminated.")
            //            {
            //                _MemMan.removeFromList(thisPID);//removeThisFromList is in MemMan
            //            }
            var prevProcess = _currProgram;
            _currProgram = nextProc;
            _currProgram.state = "Running.";
            var shouldBeExecuting = !_Step;
            _CPU.init(_currProgram, shouldBeExecuting);
        };

        CpuScheduler.prototype.stop = function () {
            _MemMan.removeCurrProgram();
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
