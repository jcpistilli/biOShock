/*
 Process Control Block

 Jonathan Pistilli
 */


module biOShock {
    export class pcb {
        pid: number;
        pc: number;
        ir: number;
        accum: number;
        xreg: number;
        yreg: number;
        zflag: number;


        constructor() {
            this.pid   = _GlobPid++;
            this.pc    = 0;
            this.ir    = 0;
            this.accum = 0;
            this.xreg  = 0;
            this.yreg  = 0;
            this.zflag = 0;

        }
    }
}
