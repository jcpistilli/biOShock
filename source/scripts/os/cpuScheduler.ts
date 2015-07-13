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
            if (_ReadyQueue.length > 0)
            {
                _Mode = 1;
//                _currProgram = _ReadyQueue.dequeue();
                _currProgram = this.nextProcess();
                _currProgram.state = "Running.";
                _CPU.setCPU(_currProgram);
            }
        }

        public nextProcess(): any
        {
            if( this.scheduleType = this.options[0])
            {
                return _ReadyQueue.dequeue();
            }
        }

        public needToContextSwitchIf(): any
        {
            if (this.scheduleType === this.options[0])
            {
                if (_cycleCounter >= this.quantum)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }

        public contextSwitch(): void
        {
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
                var lastProc = _currProgram;
                _currProgram = nextProc;

                _currProgram.state = "Running.";
                _CPU.setCPU(_currProgram);
            }
            else if(_currProgram.state === "Terminated.")
            {
                this.stop();
            }

            _cycleCounter = 0;
        }

        public roundRobinSwitch(nextProc): any
        {
            _Kernel.krnTrace("Current cycle count > quantum of " + this.quantum + ". Switching context.");
            _CPU.updatePCB();
            if (_currProgram.state !== "Terminated.")
            {
                _currProgram.state = "Ready.";
                _ReadyQueue.enqueue(_currProgram)
            }
            else if (_currProgram.state === "Terminated.")
            {
                _MemMan.removeCurrProgram();//removeThisFromList is in MemMan
            }
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

        public setQuantum(quantum): any
        {
            this.quantum = quantum;
        }
    }
}





