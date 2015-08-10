/*
 CPU Scheduler
 Jonathan Pistilli
 */


module biOShock
{
    export class CpuScheduler
    {
        public options = ['rr', 'fcfs', 'priority'];
        public scheduleType = this.options[0]; //default to rr

        constructor()
        {

        }

        public start(): void
        {
//            console.debug(_ReadyQueue.getSize());
            if (_ReadyQueue.getSize() > 0)
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

            if( this.scheduleType === this.options[0] || this.scheduleType === this.options[1])
            {
                return _ReadyQueue.dequeue();
            }
            else if (this.scheduleType === this.options[2])
            {

                var lowest = 999;
                var lowestIndex =  -1;

                for (var i = 0; i < _ReadyQueue.getSize(); i++)
                {
                    if (_ReadyQueue.q[i].pcb.priority < lowest)
                    {
                        lowest = _ReadyQueue.q[i].pcb.priority;
                        lowestIndex = i;
                    }
                }
                var nextProc = _ReadyQueue.q[lowestIndex];
                _ReadyQueue.q.splice(lowestIndex, 1);
                return nextProc;
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

                biOShock.Control.printReadyQueue();

                var lastProc = _currProgram;
                _currProgram = nextProc;

                _currProgram.state = "Running.";

                _CPU.setCPU(_currProgram)
            }
            else if(_currProgram.state === "Terminated.")
            {

                this.stop();
            }

            _cycleCounter = 0;
        }

        public roundRobinSwitch(nextProc): any
        {

            var thisPID = _currProgram.pcb.pid;
            _Kernel.krnTrace("Current cycle count > quantum of " + _Quantum + ". Switching context.");


            _CPU.updatePCB();


            if (_currProgram.state !== "Terminated.")
            {
                _currProgram.state = "Ready.";
                _ReadyQueue.enqueue(_currProgram)
            }
            else if (_currProgram.state === "Terminated.")
            {
                _MemMan.removeFromList(thisPID);//removeThisFromList is in MemMan
            }

        }

        public fcfsContextSwitch(nextProc)
        {
            this.roundRobinSwitch(nextProc);
        }

        public priorityContextSwitch(nextProc)
        {
            _CPU.updatePCB(); //check this
            _MemMan.removeFromList(_currProgram.pcb.pid);
        }

        public stop(): any
        {

            _MemMan.removeFromList(_currProgram.pcb.pid);
            _CPU.isExecuting = false;
            _Mode = 0;
            _CPU.updatePCB();
            biOShock.Control.printReadyQueue();
            _currProgram = null;
            _cycleCounter = 0;
        }

//        public setQuantum(quantum): any
//        {
//            this.quantum = quantum;
//        }
    }
}