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
            this.accum = 0;
            this.xreg = 0;
            this.yreg = 0;
            this.zflag = 0;
        }
        return pcb;
    })();
    biOShock.pcb = pcb;
})(biOShock || (biOShock = {}));
