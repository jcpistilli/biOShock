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
//            console.debug(_ReadyQueue.getSize());
            debugger;
            if (_ReadyQueue.getSize() > 0)
            {
                debugger;
                _Mode = 1;
//                _currProgram = _ReadyQueue.dequeue();
                _currProgram = this.nextProcess();
                _currProgram.state = "Running.";
                _CPU.setCPU(_currProgram);
            }
        }

        public nextProcess(): any
        {
            debugger;
            if( this.scheduleType === this.options[0] || this.scheduleType === this.options[1])
            {
                return _ReadyQueue.dequeue();
            }
            else if (this.scheduleType === this.options[2])
            {
                var lowest = Infinity;
                var lowestIndex =  -1;

                for (var i = 0; i < _ReadyQueue.length; i++)
                {
                    if (_ReadyQueue[i].priority < lowest)
                    {
                        lowest = _ReadyQueue[i].priority;
                        lowestIndex = i;
                    }
                }

                return _ReadyQueue.splice(lowestIndex, 1)[0];
            }

            return null;
        }

        public needToContextSwitchIf(): any
        {
            debugger;
            if (this.scheduleType === this.options[0])
            {
                if(_cycleCounter >= _Quantum)
                {
                    return true;
                }
            }
            else if (this.scheduleType === this.options[1])
            {
                if(_currProgram.state === "Terminated.")
                {
                    return true;
                }
            }
            else if (this.scheduleType === this.options[2])
            {
                if (_currProgram.state === "Terminated.")
                {
                    return true;
                }
            }

            return false;
        }

        public contextSwitch(): void
        {
            debugger;
            var nextProc = this.nextProcess();
            if (nextProc !== null && nextProc !== undefined)
            {
                if (this.scheduleType === this.options[0])
                {
                    this.roundRobinSwitch(nextProc);
                }
                else if (this.scheduleType === this.options[1])
                {
                    this.fcfsContextSwitch(nextProc);
                }
                else if (this.scheduleType === this.options[2])
                {
                    this.priorityContextSwitch(nextProc);
                }
                else
                {
                    _Kernel.krnTrace("Unknown CPU scheduler.");
                }
//                _CPU.updatePCB();

                var lastProc = _currProgram;
                _currProgram = nextProc;

                _currProgram.state = "Running.";

                _CPU.setCPU(_currProgram)
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
            debugger;
            var thisPID = _currProgram.pcb.pid;
            _Kernel.krnTrace("Current cycle count > quantum of " + _Quantum + ". Switching context.");

            debugger;
            _CPU.updatePCB(); //this is IMPORTANT
//            console.debug(_currProgram);
//            _currProgram.pcb.pc     = _CPU.PC;
//            _currProgram.pcb.acc    = _CPU.Acc;
//            _currProgram.pcb.xReg   = _CPU.Xreg;
//            _currProgram.pcb.yReg   = _CPU.Yreg;
//            _currProgram.pcb.pc     = _CPU.Zflag;


            if (_currProgram.state !== "Terminated.")
            {
                _currProgram.state = "Ready.";
                _ReadyQueue.enqueue(_currProgram)
            }
            else if (_currProgram.state === "Terminated.")
            {
                _MemMan.removeFromList(thisPID);//removeThisFromList is in MemMan
            }
//            var prevProcess = _currProgram;
//            _currProgram = nextProc;
//            _currProgram.state = "Running.";
//            var shouldBeExecuting = !_Step;
//            _CPU.init(_currProgram, shouldBeExecuting);
        }

        public fcfsContextSwitch(nextProc)
        {
            this.roundRobinSwitch(nextProc);
        }

        public priorityContextSwitch(nextProc)
        {
//            _currProgram.updateCpu(); //check this
            _MemMan.removeFromList(_currProgram.pcb.pid);
        }

        public stop(): any
        {
            debugger;
            _MemMan.removeFromList(_currProgram.pcb.pid);
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