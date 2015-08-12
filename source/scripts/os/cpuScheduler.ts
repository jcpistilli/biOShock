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
            if (_ReadyQueue.getSize() > 0)
            {
                //User mode
                _Mode = 1;
                _currProgram = this.nextProcess();
                //Set the state to Running
                _currProgram.state = "Running.";
                //Initialize the CPU
                _CPU.setCPU(_currProgram);
            }
        }

        public nextProcess(): any
        {
            //Just need to take off the ready queue for rr and fcfs
            if( this.scheduleType === this.options[0] || this.scheduleType === this.options[1])
            {
                return _ReadyQueue.dequeue();
            }

            //If it's priority, we need the one with the lowest priority
            else if (this.scheduleType === this.options[2])
            {

                var lowest = 1000;
                var lowestIndex =  -1;

                //here is where the lowest priority is found
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
            //Switch if the cycle counter is higher than the quantum for round robin
            if (this.scheduleType === this.options[0])
            {
                if(_cycleCounter >= _Quantum)
                {
                    return true;
                }
            }

            //Switch when the process is finished executing
            else if (this.scheduleType === this.options[1])
            {
                if(_currProgram.state === "Terminated.")
                {
                    return true;
                }
            }

            //also, switch when the lower priority process is finished executing
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
            //If there is another process in the ready queue, initialize one of the scheduling alogrithms
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

                //Print that ready queue
                biOShock.Control.printReadyQueue();

                //the current process becomes the next process
                _currProgram = nextProc;

                //the process state becomes running
                _currProgram.state = "Running.";

                //initialize the CPU
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

            //update the PCB with the current running program
            _CPU.updatePCB();

            //if the program is not terminated, put it back in the queue
            if (_currProgram.state !== "Terminated.")
            {
                _currProgram.state = "Ready.";
                _ReadyQueue.enqueue(_currProgram)
            }

            //if the program is terminated, take it off the queue
            else if (_currProgram.state === "Terminated.")
            {
                _MemMan.removeFromList(thisPID);//removeThisFromList is in MemMan
            }

        }

        //fcfs has the same workings as rr
        //the difference is defined in needToContextSwitchIf
        public fcfsContextSwitch(nextProc)
        {
            this.roundRobinSwitch(nextProc);
        }

        //place the currently executing program in the pcb and remove the program when it's done
        public priorityContextSwitch(nextProc)
        {
            _CPU.updatePCB(); //check this
            _MemMan.removeFromList(_currProgram.pcb.pid);
        }

        public stop(): any
        {
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
        }
    }
}