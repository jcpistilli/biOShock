/*
CPU Scheduler
Jonathan Pistilli
*/
var biOShock;
(function (biOShock) {
    var cpuScheduler = (function () {
        /*
        I know that for project 4 i need to implement fcfs and non preemptive priority
        */
        function cpuScheduler() {
            this.quantum = 6;
            this.options = ['rr', 'fcfs', 'priority'];
            this.scheduleType = this.options[0];
        }
        cpuScheduler.prototype.start = function () {
            if (_ReadyQueue.length > 0) {
                _Mode = 1;
                _currProgram = this.nextProcess();
                _currProgram.state = "Running.";
                _CPU.setCPU(_currProgram);
            }
        };

        cpuScheduler.prototype.nextProcess = function () {
            if (this.scheduleType = this.options[0]) {
                return _ReadyQueue.shift();
            }
        };
        return cpuScheduler;
    })();
    biOShock.cpuScheduler = cpuScheduler;
})(biOShock || (biOShock = {}));
