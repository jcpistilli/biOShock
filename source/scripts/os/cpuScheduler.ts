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


    }
}





