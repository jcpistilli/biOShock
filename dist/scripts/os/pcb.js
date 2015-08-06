/*
Process Control Block
Jonathan Pistilli
*/
var biOShock;
(function (biOShock) {
    var pcb = (function () {
        //state: number;
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

            this.loc = 0;
            //this.state = 0;
        }
        return pcb;
    })();
    biOShock.pcb = pcb;
})(biOShock || (biOShock = {}));
