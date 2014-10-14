/*
Process Control Block
Jonathan Pistilli
*/
var biOShock;
(function (biOShock) {
    var pcb = (function () {
        function pcb() {
            this.pid = _GlobPid++;
            this.pc = 0;
            this.ir = 0;
            this.acc = 0;
            this.xReg = 0;
            this.yReg = 0;
            this.zFlag = 0;

            //start and finish of memory
            this.base = 0;
            this.limit = 0;
        }
        //to print what is put on the PCB
        pcb.prototype.printPCB = function () {
            _StdOut.putText("PCB");
            _StdOut.advanceLine();
            _StdOut.putText("PID = " + this.pid);
            _StdOut.advanceLine();
            _StdOut.putText("PC = " + this.pc);
            _StdOut.advanceLine();
            _StdOut.putText("Accum = " + this.acc);
            _StdOut.advanceLine();
            _StdOut.putText("X-Reg = " + this.xReg);
            _StdOut.advanceLine();
            _StdOut.putText("Y-Reg = " + this.yReg);
            _StdOut.advanceLine();
            _StdOut.putText("Z-Flag = " + this.zFlag);
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        };
        return pcb;
    })();
    biOShock.pcb = pcb;
})(biOShock || (biOShock = {}));
