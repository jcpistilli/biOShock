/*
 CPU Scheduler

 Jonathan Pistilli
 */


module biOShock
{
    export class CpuScheduler
    {
//        public quantum = 6;
        public options = ['rr', 'fcfs', 'priority'];
        public scheduleType = this.options[0]; //default to rr
        /*
        I know that for project 4 i need to implement fcfs and non preemptive priority
         */
        constructor()
        {

        }

        public start(): void
        {
            if (_ReadyQueue.length > 1)
            {
                _Mode = 1;
                _currProgram = _ReadyQueue.dequeue();
//                _currProgram = this.nextProcess();
                _currProgram.state = "Running.";
                var executing = !_Step;
                _CPU.init(_currProgram, executing);
            }
        }

        public nextProcess(): any
        {
//            if( this.scheduleType = this.options[0])
//            {
                return _ReadyQueue.dequeue();
//            }
//            else
//            {
//                return null;
//            }
        }

        public needToContextSwitchIf(): any
        {
//            debugger;
            if (_ReadyQueue.length > 1)
            {
                if (this.scheduleType === this.options[0])
                {
                    if (_cycleCounter >= _Quantum)
                    {
                        return true;
                    }
                }
            }
            else
            {
                return false;
            }
        }

        public contextSwitch(): void
        {
//            debugger;
            var nextProc = this.nextProcess();
            if (nextProc !== null && nextProc !== undefined)
            {
                if (this.scheduleType === this.options[0])
                {
                    this.roundRobinSwitch(nextProc);
                }
                else
                {
                    _Kernel.krnTrace("Unknown CPU scheduler.");
                }
//                var lastProc = _currProgram;
//                _currProgram = nextProc;
//
//                _currProgram.state = "Running.";
//                var executing = !_Step;
//                _CPU.init(_currProgram, executing);
            }
            else if(_currProgram.state === "Terminated.")
            {
                debugger;
                this.stop();
            }

            _cycleCounter = 0;
        }

        public roundRobinSwitch(nextProc): any
        {
//            debugger;
            var thisPID = _currProgram.pcb.pid;
            _Kernel.krnTrace("Current cycle count > quantum of " + _Quantum + ". Switching context.");
            debugger;
            if (_currProgram.state !== "Terminated.")
            {
                _currProgram.state = "Ready.";
                _ReadyQueue.enqueue(_currProgram)
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
        }

        public stop(): any
        {
            _MemMan.removeCurrProgram();
            _CPU.isExecuting = false;
            _Mode = 0;
            _CPU.updatePCB();
            _currProgram = null;
            _cycleCounter = 0;
        }

//        public setQuantum(quantum): any
//        {
//            this.quantum = quantum;
//        }
    }
}





