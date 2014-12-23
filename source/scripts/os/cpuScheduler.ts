/*
 CPU Scheduler

 Jonathan Pistilli
 */


module biOShock
{
    export class cpuScheduler
    {
        public quantum = 6;
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
                _currProgram = this.nextProcess();
                _currProgram.state = "Running.";
                _CPU.setCPU(_currProgram);
            }
        }

        public nextProcess(): any
        {
            if( this.scheduleType = this.options[0])
            {
                return _ReadyQueue.shift();
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
            }
            return true;
        }

        public contextSwitch(): any
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
            }

            var lastProc = _currProgram;
            _currProgram = nextProc;

            _currProgram.state = "Running.";

            
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
            else if (_currProgram.state === "Terminated.") {
                _MemMan.removeThisFromList();//removeThisFromList is in MemMan
            }
        }
    }
}





